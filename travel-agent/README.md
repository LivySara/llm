# 旅行规划 Agent（MVP）

把已有的「北京环球影城票价 MCP server」升级为可对话的 **Agent**：
用户输入自然语言需求 → Agent 先用 **规划模块** 把需求拆成步骤清单 → 用 **Function Calling**
决定调哪个工具 → 通过 **MCP** 连上 `server.py` 执行 → 把结果喂回 LLM → 自检规划完成情况
→ 给出最终方案 → 把对话与规划 **持久化** 到磁盘。

> 这一步实证了：Agent（循环）= LLM + 规划 + 工具 + 记忆；工具接入 = MCP；
> 单步调用 = Function Calling；规划 = Plan-and-Execute；记忆 = 跨会话持久化；
> 多能力 = 同时挂载多个 MCP server（票价 + 攻略）。

## 架构（Phase 4 · 分层规划 + 摘要压缩）

```
用户 -> Agent(ReAct 循环) -> DeepSeek(LLM 大脑)
        |  ├─ planner.decompose（需求 -> 多层子目标树，递归拆解）
        |  ├─ planner.review_plan（完成度自检）
        |  ├─ MCP Client ─┬─ server① 票价工具  -> prices.json
        |  │             └─ server② 攻略工具  -> 内置静态数据
        |  └─ Memory(对话历史 + 分层规划 + 早期对话摘要，可存盘恢复)
                └─ compress()：超窗口时把早期对话 LLM 摘要化，替代硬截断
```

> - `agent.py` 用 `AsyncExitStack` 同时拉起多个 stdio server，把它们的工具合并成一个
>   `functions` 列表，并用 `tool_session_map`（工具名 → session）把每次调用路由到正确的 server。
> - Phase 4 起，规划从「扁平步骤」升级为「分层子目标树」：`decompose` 先用 `make_plan`
>   拆出顶层步骤，再对每个判定为「复合子目标」的步骤递归拆解（最多 `MAX_PLAN_DEPTH` 层）。
> - 上下文保护从「直接丢弃早期对话」升级为「`compress()` 用 LLM 把早期对话摘要化并保留」，
>   长对话下既不超窗口、也不丢关键信息。

- `agent.py`      ReAct 主循环 + 多 server 连接/路由 + 规划/持久化编排 + CLI 入口
- `planner.py`    规划模块：把需求拆成步骤、自检完成度
- `mcp_client.py` 工具 schema 转换 / 工具调用
- `memory.py`     对话历史与工具上下文（含上下文长度保护 + 存盘/恢复）
- `config.py`     读取 `.env`（支持 `SERVER_PATHS` 多 server）
- `../mcp/universal-studios-price/server.py`（外部复用）  票价 MCP server
- `../mcp/universal-studios-guide/server.py`（Phase 3 新增）  攻略 MCP server（贴士/必玩/餐饮/最佳日期/拥挤度）
- `memory_store.json`（运行期生成）  跨会话持久化的记忆文件

## 运行

```bash
cd travel-agent
pip install -r requirements.txt

# 编辑 .env：填好真实 key，并在 SERVER_PATHS 中列出所有要连接的 server（逗号分隔）
python agent.py
```

## 试一下

```
你：国庆去北京环球影城，2 大 1 小门票一共多少？
📋 规划：
  1. 查询国庆当日（2026-10-01）成人单日票价格
  2. 查询儿童票价格
  3. 计算 2 大 1 小合计金额
  [调用工具] get_price_by_date({"date":"2026-10-01"})
  [工具返回] 日期：2026-10-01 档位：premium 单日票价格：748 元 ...
助手：国庆（特定高峰日）单日票 748 元/人……2 大（748×2）+ 1 小（儿童票 315）= 1811 元。
✅ 已完成：['查询成人票价', '查询儿童票价', '计算合计']
🎉 规划已全部完成。
[记忆] 已保存到 memory_store.json
```

直接关掉终端再 `python agent.py`，会看到 `[记忆] 已恢复上次会话`，历史与规划都还在。

## 命令

| 命令 | 作用 |
|------|------|
| `/plan` | 重新查看当前规划步骤 |
| `/new`  | 清空会话，开始新规划 |
| `exit` / `退出` | 结束对话（记忆已自动存盘） |

## 下一步（Phase 5+）

- 接入真实天气 API（替换静态攻略数据中的拥挤度估算）—— 需要外部 API key / 网络
- 规划真正「落地执行」子目标：为每个子节点维护独立完成状态，而非整体扁平自检
- 多 Agent 协作：把不同子目标分派给专长不同的子 Agent（票价 / 攻略 / 行程编排）
