# 构建工具配置选择指南

## 📦 两种构建工具配置

本项目提供了两种现代化的构建工具配置，你可以选择任一种使用。

---

## 🚀 方案 1：Vite（推荐 ⭐）

### 优点
- ⚡ **超快启动** - 毫秒级启动
- 🔥 **极速热更新** - 修改代码立即看到效果
- 📦 **更小的打包体积** - 原生 ESM
- 🪶 **轻量级** - 零配置复杂性

### 快速开始

```bash
# 1. 使用 Vite 配置
cp package.vite.json package.json
rm package-lock.json  # 清除旧锁文件（可选）

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
# 访问 http://localhost:3000

# 4. 生产构建
npm run build
```

### 配置文件
- `vite.config.ts` - Vite 主配置
- `public/index.html` - 已有，无需修改

### 特点
- 自动代理 API 到 Django：`/api` → `http://localhost:8000`
- 支持路径别名：`@` → `./src`
- 内置 CSS 支持
- 自动按需加载

---

## 🏗️ 方案 2：Webpack

### 优点
- 🎛️ **完全可控** - 高度可配置
- 🔧 **生态完善** - 插件众多
- 📚 **文档充足** - 社区资源多
- 🏢 **企业级** - 大型项目首选

### 快速开始

```bash
# 1. 使用 Webpack 配置
cp package.webpack.json package.json
rm package-lock.json  # 清除旧锁文件（可选）

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
# 访问 http://localhost:3000

# 4. 生产构建
npm run build
```

### 配置文件
- `webpack.config.js` - Webpack 主配置
- `public/index.html` - 已有，无需修改

### 特点
- Babel 完整支持
- 自动代理 API 到 Django：`/api` → `http://localhost:8000`
- 代码分割优化（vendor 分离）
- Source Map 支持
- 自动清理输出目录

---

## 📊 对比表

| 特性 | Vite | Webpack |
|------|------|---------|
| 启动速度 | ⚡⚡⚡ 极快 | ⚡ 中等 |
| 热更新 | ⚡⚡⚡ 毫秒 | ⚡ 秒级 |
| 配置复杂度 | 🟢 简单 | 🟡 中等 |
| 学习曲线 | 🟢 平缓 | 🟡 陡峭 |
| 社区支持 | 🟢 完善 | 🟢 完善 |
| 适合项目 | 中小型 | 大型项目 |
| 兼容性 | 现代浏览器 | 所有浏览器 |

---

## ✅ 切换方法

如果想从 Vite 切换到 Webpack（或反之）：

```bash
# 1. 删除 node_modules 和 lock 文件
rm -r node_modules
rm package-lock.json  # 或 yarn.lock

# 2. 复制对应的 package.json
# 要用 Vite：
cp package.vite.json package.json

# 要用 Webpack：
cp package.webpack.json package.json

# 3. 重新安装
npm install

# 4. 启动开发服务器
npm run dev
```

---

## 🎯 我的建议

| 场景 | 推荐 | 原因 |
|------|------|------|
| **快速原型开发** | ✅ Vite | 启动快，迭代快 |
| **简单聊天应用** | ✅ Vite | 功能简单，无需 Webpack 复杂性 |
| **学习和实验** | ✅ Vite | 配置少，专注功能 |
| **大型企业应用** | ✅ Webpack | 需要高度定制 |
| **需要旧浏览器支持** | ✅ Webpack | Babel 转译完整 |

---

## 🔄 目录结构（两者通用）

```
chat-react/
├── src/
│   ├── index.tsx           # 入口点
│   ├── App.tsx             # 主组件
│   ├── components/         # 组件文件
│   └── services/           # API 服务
├── public/
│   └── index.html          # HTML 模板
├── vite.config.ts          # Vite 配置
├── webpack.config.js       # Webpack 配置
├── package.vite.json       # Vite package.json
├── package.webpack.json    # Webpack package.json
├── tsconfig.json           # TypeScript 配置
└── package.json            # 当前使用的配置
```

---

## 🚨 常见问题

### Q: 安装后仍有错误？
```bash
# 完全清除重新安装
rm -r node_modules package-lock.json
npm install --legacy-peer-deps
```

### Q: 端口被占用？
- **Vite**: 自动用下一个端口（如 3001）
- **Webpack**: 修改 `webpack.config.js` 中的 port

### Q: 如何修改 API 代理地址？
- **Vite**: 编辑 `vite.config.ts` 的 `proxy` 部分
- **Webpack**: 编辑 `webpack.config.js` 的 `devServer.proxy` 部分

---

## 🎉 现在选择并开始

**推荐：使用 Vite**

```bash
cp package.vite.json package.json
npm install
npm run dev
```

祝你开发愉快！✨
