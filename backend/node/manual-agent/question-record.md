# 问题记录

## 问题

`Cannot find module 'node:readline' or its corresponding type declarations.`

## 原因

TypeScript 无法识别 Node.js 内置模块 `node:readline` 的类型声明。

## 解决方案

1. 安装 Node.js 类型定义：

   ```bash
   npm install -D @types/node
   ```

2. 在 `tsconfig.json` 中添加类型配置：

   ```json
   "types": ["node"]
   ```

---

## 问题

`node:internal/modules/esm/resolve:275` 报错 `ERR_MODULE_NOT_FOUND`：
找不到模块 `src/llm/index.js`（由 `src/index.ts` 中 `import { OpenaiClient } from './llm/index.js'` 引入）。

## 原因

`package.json` 设置了 `"type": "module"`，且 `tsconfig.json` 使用 `module/moduleResolution: NodeNext`。
这种组合下，源码里的 import 必须写成 `.js` 后缀（这是编译后产物的正确约定）。
但之前 `start` 脚本是 `node src/index.ts`：Node 的 type-stripping 直接运行 `.ts` 时，
**不会**把 `.js` 的导入说明符改写回 `.ts`，也**不会**先编译依赖，于是它去查找字面文件
`src/llm/index.js`，而该文件并不存在（只有 `src/llm/index.ts`），导致模块找不到。
本质：**直接跑 `.ts` 源码，但 import 是按编译后的 `.js` 产物写的**，路径对不上。

## 解决方案

采用 TS 感知的运行器 `tsx`，它能自动把 `.js` 导入说明符解析回对应的 `.ts` 源文件。

1. 安装 `tsx`：

   ```bash
   npm install -D tsx
   ```

2. 将 `package.json` 的 `start` 脚本改为：

   ```json
   "start": "tsx src/index.ts"
   ```

---

## 问题

`为什么 messages 必须先 push assistant 的 tool_call，再 push tool result？`

## 原因

个人理解：`第一次调用LLM获取信息，给下一次调用LLM，LLM本身无法获取到上一次它干了什么`
官方理解：`第一次调用 LLM 时，LLM 产生了 Tool Call；Node.js 执行 Tool。下一次调用 LLM 时，LLM 不会自动拥有上一次调用的上下文，所以 Agent 必须把“上一次 LLM 的 Tool Call + Tool 执行结果”一起放进 messages，让下一次 LLM 知道发生过什么`