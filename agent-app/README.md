# AI Agent 应用

基于 Next.js 和 LangChain 构建的 AI Agent 聊天应用，集成 DeepSeek API。

## 📁 项目结构

```
agent-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API 路由
│   │   ├── globals.css         # 全局样式
│   │   ├── layout.tsx         # 根布局组件
│   │   └── page.tsx           # 首页
│   ├── components/             # React 组件
│   │   ├── ChatInput.tsx       # 聊天输入组件
│   │   ├── ChatMessage.tsx     # 聊天消息组件
│   │   └── MessageList.tsx     # 消息列表组件
│   ├── lib/                    # 工具库
│   │   ├── agent.ts           # Agent 核心逻辑
│   │   └── tools.ts           # 工具函数定义
│   └── types/                  # TypeScript 类型定义
│       └── chat.ts             # 聊天相关类型
├── .env.local                  # 环境变量（不提交）
├── .env.local.example          # 环境变量示例
├── .gitignore                  # Git 忽略规则
├── next.config.js              # Next.js 配置
├── package.json                # 项目依赖
├── postcss.config.js           # PostCSS 配置
├── tailwind.config.js          # Tailwind CSS 配置
└── tsconfig.json               # TypeScript 配置
```

## 🚀 启动准备

### 1. 环境要求

- **Node.js**: >= 18.x
- **npm**: >= 9.x (或使用 yarn/pnpm)

### 2. 获取 DeepSeek API Key

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册并登录
3. 进入「API Keys」页面
4. 创建新的 API Key 并复制保存

### 3. 配置环境变量

复制环境变量示例文件并重命名为 `.env.local`：

```bash
# Windows PowerShell
Copy-Item .env.local.example .env.local

# 或手动复制文件，重命名为 .env.local
```

编辑 `.env.local`，填入你的 API Key：

```env
# DeepSeek API Configuration
DEEPSEEK_API_KEY=your_actual_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

# App Configuration
NEXT_PUBLIC_APP_NAME=AI Agent
```

> ⚠️ **重要**: `.env.local` 包含敏感信息，已被 `.gitignore` 忽略，请勿提交到 Git 仓库。

### 4. 安装依赖

```bash
npm install
```

## 📦 启动项目

### 开发模式（推荐）

```bash
npm run dev
```

启动后访问：http://localhost:3000

### 生产构建

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

### 其他命令

```bash
# 代码检查
npm run lint
```

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 13.5+ | React 框架 |
| React | 18.x | UI 库 |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 3.x | 样式框架 |
| LangChain | 1.4+ | AI Agent 框架 |
| DeepSeek API | - | LLM 服务 |

## 📝 脚本说明

```json
{
  "dev": "next dev",          // 启动开发服务器
  "build": "next build",      // 构建生产版本
  "start": "next start",      // 启动生产服务器
  "lint": "next lint"         // 代码检查
}
```

## 🔧 常见问题

### Q: 启动后报错 "DEEPSEEK_API_KEY is not defined"

**A**: 检查 `.env.local` 文件是否存在，并且 `DEEPSEEK_API_KEY` 已正确填写。修改环境变量后需要重启开发服务器。

### Q: npm install 安装缓慢或失败

**A**: 可以尝试使用国内镜像：

```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### Q: 端口 3000 已被占用

**A**: 修改启动端口：

```bash
# Windows PowerShell
$env:PORT=3001; npm run dev
```

## 📄 许可证

MIT License
