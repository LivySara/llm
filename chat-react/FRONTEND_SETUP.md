# React 前端 - 构建工具配置完成

## 📁 项目结构

```
chat-react/
├── src/
│   ├── index.tsx                    # 入口点
│   ├── index.css                    # 全局样式
│   ├── App.tsx                      # 主组件
│   ├── App.css                      # 应用样式
│   ├── components/
│   │   ├── ChatWindow.tsx           # 聊天窗口组件
│   │   └── ChatWindow.css           # 聊天样式
│   └── services/
│       └── api.ts                   # Axios API 配置
│
├── public/
│   └── index.html                   # HTML 模板
│
├── 构建工具配置文件:
│   ├── vite.config.ts               # ✅ Vite 配置
│   ├── webpack.config.js            # ✅ Webpack 配置
│   ├── tsconfig.json                # TypeScript 配置
│   ├── .babelrc                     # Babel 配置 (Webpack 用)
│
├── package.json 选项:
│   ├── package.vite.json            # ✅ Vite 版本
│   ├── package.webpack.json         # ✅ Webpack 版本
│   └── package.json                 # 当前使用
│
├── 启动脚本:
│   ├── setup.bat                    # Windows 选择脚本
│   └── setup.sh                     # Linux/Mac 选择脚本
│
├── 文档:
│   ├── BUILD_SETUP.md               # 完整构建指南
│   ├── FRONTEND_SETUP.md            # 本文件
│   └── .env.example                 # 环境变量示例
```

---

## 🚀 快速开始

### 方式 1：使用启动脚本（最简单）

#### Windows:
```bash
cd chat-react
setup.bat
```
然后选择 1 (Vite) 或 2 (Webpack)

#### Linux / macOS:
```bash
cd chat-react
bash setup.sh
```

### 方式 2：手动选择

#### 使用 Vite（推荐）:
```bash
cd chat-react
cp package.vite.json package.json
npm install
npm run dev
```

#### 使用 Webpack:
```bash
cd chat-react
cp package.webpack.json package.json
npm install
npm run dev
```

---

## 🎯 两种方案对比

### ⚡ Vite 配置

**优点:**
- 启动速度极快（毫秒级）
- 热更新毫秒级响应
- 配置简洁，易于理解
- 完美适合这个简单聊天项目

**配置文件:** `vite.config.ts`

**启动命令:** `npm run dev`

**访问地址:** `http://localhost:3000`

### 🏗️ Webpack 配置

**优点:**
- 高度可定制化
- 生态完善，插件众多
- 适合大型复杂项目
- 兼容性更好

**配置文件:** `webpack.config.js` + `.babelrc`

**启动命令:** `npm run dev`

**访问地址:** `http://localhost:3000`

---

## ✅ 检查清单

- ✅ Vite 配置完成 (`vite.config.ts`)
- ✅ Webpack 配置完成 (`webpack.config.js`)
- ✅ TypeScript 配置 (`tsconfig.json`)
- ✅ Babel 配置 (`.babelrc`)
- ✅ 两个 package.json 版本 (`package.vite.json`, `package.webpack.json`)
- ✅ 启动脚本 (`setup.bat`, `setup.sh`)
- ✅ 环境变量示例 (`.env.example`)

---

## 🔄 切换构建工具

如果想从 Vite 切换到 Webpack（或反之）：

```bash
# 方法 1：使用脚本
cd chat-react
setup.bat    # Windows
# 或
bash setup.sh  # Linux/Mac

# 方法 2：手动切换
cd chat-react
rm -r node_modules package-lock.json
cp package.webpack.json package.json  # 或 package.vite.json
npm install
npm run dev
```

---

## 📝 环境变量

复制 `.env.example` 为 `.env`：
```bash
cp .env.example .env
```

然后编辑 `.env` 文件：
```env
VITE_API_URL=http://localhost:8000
VITE_API_BASE=/api
```

---

## 🎨 代理配置

**Vite** (`vite.config.ts`):
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    rewrite: (path) => path
  }
}
```

**Webpack** (`webpack.config.js`):
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: { '^/api': '/api' }
  }
}
```

都自动将 `/api` 请求转发到 Django 后端。

---

## 🛠️ 常用命令

### 开发
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview  # Vite
```

### 类型检查
```bash
npm run type-check
```

---

## 🐛 故障排除

### 问题 1：安装依赖失败
```bash
# 清除缓存后重试
rm -r node_modules package-lock.json
npm cache clean --force
npm install
```

### 问题 2：端口被占用
- **Vite**: 自动使用下一个可用端口（如 3001）
- **Webpack**: 修改 `webpack.config.js` 中的 `port: 3000`

### 问题 3：API 请求 404
检查：
1. Django 后端是否运行在 `http://localhost:8000`
2. Django CORS 配置是否包含 `http://localhost:3000`
3. 代理配置是否正确

### 问题 4：TypeScript 错误
```bash
npm run type-check
```

查看完整的类型错误列表，然后修复。

---

## 📚 进一步学习

- [Vite 官方文档](https://vitejs.dev/)
- [Webpack 官方文档](https://webpack.js.org/)
- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)

---

## 🎉 现在开始开发

1. **启动后端**:
```bash
cd ../chat-py
python manage.py migrate
python manage.py runserver
```

2. **启动前端**:
```bash
cd chat-react
npm run dev
```

3. **打开浏览器**: `http://localhost:3000`

祝你开发愉快！✨
