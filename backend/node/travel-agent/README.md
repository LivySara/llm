# 旅行规划 Agent（Node.js + TypeScript 版）

把 `travel-agent`（Python）重写为 **Node.js + TypeScript**：用户输入自然语言需求
→ Agent 先用 **规划模块** 把需求拆成分层子目标 → 用 **Function Calling** 决定调哪个工具
→ 通过 **MCP** 连上 Python 版 `server.py` 执行 → 把结果喂回 LLM → 自检规划完成情况
→ 给出最终方案 → 把对话与规划 **持久化** 到磁盘。

> 复用已有的 Python MCP server（`../../mcp/universal-studios-price/server.py` 票价、
> `../../mcp/universal-studios-guide/server.py` 攻略），本服务以 stdio 子进程方式拉起它们。

## 架构

```
用户 -> Agent(ReAct 循环) -> DeepSeek(LLM 大脑)
        |  ├─ planner.decompose（需求 -> 多层子目标树，递归拆解）
        |  ├─ planner.reviewPlan（完成度自检）
        |  ├─ MCP Client ─┬─ server① 票价工具  -> prices.json
        |  │             └─ server② 攻略工具  -> 内置静态数据
        |  └─ Memory(对话历史 + 分层规划 + 早期对话摘要，可存盘恢复)
                └─ compress()：超窗口时把早期对话 LLM 摘要化，替代硬截断
```

## 目录

- `src/index.ts`     CLI 入口 + 主循环（连接 server / 恢复记忆 / 交互）
- `src/agent.ts`     ReAct 主循环（感知→规划→行动→再感知）
- `src/planner.ts`   规划模块：拆步骤、分层递归、完成度自检、对话摘要
- `src/mcpClient.ts` 工具 schema 转换 / 多 server 连接与路由 / 工具调用
- `src/memory.ts`    对话历史与工具上下文（含上下文长度保护 + 存盘/恢复）
- `src/config.ts`    读取 `.env`（支持 `SERVER_PATHS` 多 server）
- `src/types.ts`     共享类型定义

## 运行

```bash
cd backend/node/travel-agent
npm install

# 编辑 .env：填好真实 DEEPSEEK_API_KEY，并在 SERVER_PATHS 列出要连接的 server（逗号分隔）
cp .env.example .env
npm run dev
```

> `SERVER_COMMAND` 默认为 `python`；若系统用 `python3` 启动子进程，请在 `.env` 中设置。

## 命令

| 命令 | 作用 |
|------|------|
| `/plan` | 重新查看当前规划步骤 |
| `/new`  | 清空会话，开始新规划 |
| `exit` / `退出` | 结束对话（记忆已自动存盘） |

## 与 Python 版的差异

- 使用官方 `@modelcontextprotocol/sdk` 的 stdio 客户端连接 Python MCP server；
- 使用 `openai` 包（DeepSeek 兼容 OpenAI 接口）；
- 项目为纯 ESM（`"type": "module"`，`NodeNext`），用 `tsx` 运行 TS 源码。
