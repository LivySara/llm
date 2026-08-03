# 旅行规划 Agent（MVP）

把已有的「北京环球影城票价 MCP server」升级为可对话的 **Agent**：
用户输入自然语言需求 → Agent 先用 **规划模块** 把需求拆成步骤清单 → 用 **Function Calling**
决定调哪个工具 → 通过 **MCP** 连上 `server.py` 执行 → 把结果喂回 LLM → 自检规划完成情况
→ 给出最终方案 → 把对话与规划 **持久化** 到磁盘。

> 这一步实证了：Agent（循环）= LLM + 规划 + 工具 + 记忆；工具接入 = MCP；
> 单步调用 = Function Calling；规划 = Plan-and-Execute；记忆 = 跨会话持久化。

## 架构（Phase 2）

```
用户 -> Agent(ReAct 循环) -> DeepSeek(LLM 大脑)
        |  ├─ planner（规划拆解 / 完成度自检）
        |  ├─ MCP Client -> server.py(票价工具) -> prices.json
        |  └─ Memory(对话历史 + 规划，可存盘恢复)
```

- `agent.py`      ReAct 主循环 + 规划/持久化编排 + CLI 入口
- `planner.py`    规划模块：把需求拆成步骤、自检完成度
- `mcp_client.py` 工具 schema 转换 / 工具调用
- `memory.py`     对话历史与工具上下文（含上下文长度保护 + 存盘/恢复）
- `config.py`     读取 `.env`
- `server.py`（外部复用）  你已有的 MCP server，不做改动
- `memory_store.json`（运行期生成）  跨会话持久化的记忆文件

## 运行

```bash
cd travel-agent
pip install -r requirements.txt

# 编辑 .env，填好真实 key 与 SERVER_PATH
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

## 下一步（Phase 3+）

- 接入第二个 MCP server（天气 / 攻略），让方案更真实
- 规划升级为「子目标递归拆解」（multi-agent / 分层规划）
- 上下文保护从「截断」升级为「LLM 摘要压缩」
