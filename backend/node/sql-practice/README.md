# sql-practice

Node.js 后端学习项目，用于练习 **SQL + MySQL + Redis + 后端服务**。

技术栈：Express + TypeScript + mysql2（连接池）+ ioredis + docker-compose。

## 目录结构

```
sql-practice/
├─ docker-compose.yml     # 一键起 MySQL 8 + Redis 7
├─ src/
│  ├─ index.ts            # 入口：依赖检查 + 中间件装配
│  ├─ config/env.ts       # 集中读取环境变量
│  ├─ db/
│  │  ├─ mysql.ts         # MySQL 连接池
│  │  ├─ redis.ts         # Redis 客户端
│  │  └─ schema.sql       # 建表 SQL（用户 + 文章）
│  ├─ middleware/         # 错误处理、鉴权
│  ├─ services/          # 业务逻辑（SQL / Redis 操作都在这层）
│  ├─ controllers/        # 处理请求/响应
│  ├─ routes/            # 路由
│  ├─ utils/             # 响应封装、业务错误
│  └─ types/             # 类型扩展
```

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 准备 MySQL 与 Redis（需要 Docker）
docker compose up -d

# 3. 复制环境变量
cp .env.example .env

# 4. 启动开发服务（tsx watch 热重载）
npm run dev
```

> 不用 Docker 也行：本地装好 MySQL/Redis，并手动执行 `src/db/schema.sql` 建表，
> 再在 `.env` 里填上对应连接信息即可。

## 接口示例（curl）

```bash
# 健康检查
curl http://localhost:3000/api/health

# 注册
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"123456","email":"a@b.com"}'

# 登录（拿到 token）
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"123456"}'

# 携带 token 创建文章
curl -X POST http://localhost:3000/api/articles \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"title":"第一篇文章","content":"hello"}'

# 列表（首次走 MySQL，再次走 Redis 缓存）
curl http://localhost:3000/api/articles

# 详情
curl http://localhost:3000/api/articles/1
```

## 学习要点（代码里都标了注释）

- **连接池**：`db/mysql.ts` 用连接池复用连接，生产必备。
- **SQL 注入防护**：所有查询用 `?` 占位符的参数化查询。
- **Redis 读缓存**：`article.service.ts` 列表/详情先查缓存，未命中回源 MySQL 并回写，写操作后 `DEL` 失效。
- **Redis 会话**：登录写 `sess:<uuid> -> userId`，鉴权中间件解析 Bearer token。
- **事务**：更新接口用 `BEGIN / FOR UPDATE / COMMIT / ROLLBACK` 演示行锁与回滚。
- **密码安全**：bcrypt 哈希，绝不存明文。

## 常用命令

```bash
npm run dev        # 开发（热重载）
npm run build      # 编译到 dist/
npm start          # 运行编译产物
npm run typecheck  # 仅类型检查
```
