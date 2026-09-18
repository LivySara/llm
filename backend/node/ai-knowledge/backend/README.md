# ai-knowledge-backend

AI 知识库后端登录模块：Express + TypeScript + MySQL + Redis。

## 目录结构

```
src/
├── index.ts                    # 入口：启动前检测 MySQL/Redis，挂载中间件与路由
├── config/env.ts               # 集中式配置（缺少必填变量直接启动失败）
├── db/
│   ├── mysql.ts                # MySQL 连接池
│   ├── redis.ts                # Redis 客户端（lazyConnect）
│   └── schema.sql              # users 表
├── middleware/
│   ├── auth.ts                 # Bearer token 鉴权 + 滑动续期
│   ├── errorHandler.ts         # 统一错误处理 + 404 兜底
│   └── rateLimit.ts            # 登录限流（防暴力破解）
├── services/
│   ├── auth.service.ts         # 注册 / 登录校验 / 用户信息
│   └── session.service.ts      # Redis 会话：创建 / 读取 / 续期 / 销毁
├── controllers/auth.controller.ts
├── routes/                     # /api/auth/*
├── utils/                      # 响应封装、HttpError、入参校验
└── types/express.d.ts          # 扩展 Request（userId / token）
```

## 快速开始

```bash
# 1. 启动依赖（MySQL + Redis）
docker compose up -d

# 2. 配置环境变量
cp .env.example .env

# 3. 安装依赖 & 启动
npm install
npm run dev
```

## 接口

统一响应格式：`{ code, message, data }`，`code = 0` 表示成功。

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | 否 | 注册 |
| POST | `/api/auth/login` | 否 | 登录，返回 `token` |
| POST | `/api/auth/logout` | 是 | 登出，销毁当前会话 |
| POST | `/api/auth/refresh` | 是 | 续期会话 |
| GET | `/api/auth/me` | 是 | 当前登录用户信息 |
| GET | `/api/health` | 否 | 健康检查 |

示例：

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"abc12345"}'

curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"abc12345"}'
# {"code":0,"message":"登录成功","data":{"token":"...","expiresIn":604800,"user":{...}}}

curl http://localhost:3000/api/auth/me -H 'Authorization: Bearer <token>'
```

## 登录设计要点

1. **密码存储**：bcrypt 加盐哈希（`BCRYPT_ROUNDS`），库里绝不存明文；校验用 `bcrypt.compare` 而非解密。
2. **参数化查询**：所有 SQL 用 `?` 占位符，杜绝 SQL 注入。
3. **防用户名枚举**：账号不存在与密码错误返回同一提示；用户不存在时仍执行一次 bcrypt 比对，抹平响应耗时差异（时序侧信道）。
4. **账号状态**：`users.status = 0` 时拒绝登录，且该判断放在密码校验之后，避免泄露账号存在性。
5. **暴力破解防护**：按 `IP + 用户名` 维度限流（默认 15 分钟 5 次），用 Lua 保证 `INCR + EXPIRE` 原子性；登录成功清零计数。
6. **会话**：token 为 `randomUUID()`，Redis `sess:<token> -> userId` 带 TTL；登出即删 key；请求携带 token 时剩余时间不足一半才续期（滑动过期，避免每请求都写 Redis）。
7. **传输与凭证**：token 通过 `Authorization: Bearer <token>` 传递，生产环境必须上 HTTPS。

## 待办 / 可扩展

- 敏感操作（改密码、改邮箱）二次验证
- 多端登录管理 / 强制踢下线（维护 `user:sess:<userId>` 集合）
- 记住我（更长 TTL）、验证码、IP 黑名单
