# 旅行规划 Agent（MVP）

把已有的「北京环球影城票价 MCP server」升级为可对话的 **Agent**：
用户输入自然语言需求 → Agent 用 **Function Calling** 决定调哪个工具 → 通过 **MCP**
连上 `server.py` 执行 → 把结果喂回 LLM → 给出最终方案。

> 这一步实证了：Agent（循环）= LLM + 规划 + 工具 + 记忆；工具接入 = MCP；
> 单步调用 = Function Calling。

## 架构

```
用户 -> Agent(ReAct 循环) -> DeepSeek(LLM 大脑)
                          -> MCP Client -> server.py(票价工具) -> prices.json
                          -> Memory(对话历史)
```

- `agent.py`      ReAct 主循环 + CLI 入口
- `mcp_client.py` 工具 schema 转换 / 工具调用
- `memory.py`     对话历史与工具上下文
- `config.py`     读取 `.env`
- `server.py`（外部复用）  你已有的 MCP server，不做改动

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
  [调用工具] get_price_by_date({"date":"2026-10-01"})
  [工具返回] 日期：2026-10-01 档位：premium 单日票价格：748 元 ...
助手：国庆（特定高峰日）单日票 748 元/人……2 大（748×2）+ 1 小（儿童票 315）= 1811 元。
```

## 下一步（Phase 2+）

- 加规划模块：把「2 日游 / 预算」拆成多步骤
- 记忆持久化：行程状态跨会话保存
- 接入第二个 MCP server（天气 / 攻略），让方案更真实
