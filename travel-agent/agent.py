"""旅行规划 Agent（MVP）—— 手写 ReAct 循环 + DeepSeek + 票价 MCP。

运行方式：
    pip install -r requirements.txt
    # 在 .env 中填好 DEEPSEEK_API_KEY 与 SERVER_PATH
    python agent.py

主流程：
    user 提问
      -> 把 MCP 工具作为 functions 交给 DeepSeek
      -> LLM 决定是否需要调用工具（Function Calling）
      -> 通过 MCP 客户端连上 server.py 执行工具
      -> 把结果回填，LLM 继续决策，直到给出最终回答
"""
import asyncio

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from openai import OpenAI

from config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, MODEL, SERVER_PATH
from mcp_client import call_mcp_tool, to_openai_functions
from memory import Memory

SYSTEM_PROMPT = """你是一个北京环球影城旅行规划助手。
你可以调用工具查询门票价格（含按票种、按日期、按关键词检索）。
当用户询问票价、预算、行程时，请先用工具获取准确数据，再进行计算和回答。
请用简体中文、清晰分步地回答，必要时列出计算过程。"""

MAX_TOOL_TURNS = 6


async def react(client, session, functions, memory):
    """ReAct 主循环：LLM -> 决策 -> 调工具 -> 观察 -> 再决策。"""
    for _ in range(MAX_TOOL_TURNS):
        resp = client.chat.completions.create(
            model=MODEL,
            messages=memory.export(),
            tools=functions,
            tool_choice="auto",
        )
        msg = resp.choices[0].message

        # 没有工具调用 => 这是最终回答
        if not msg.tool_calls:
            memory.add("assistant", msg.content or "")
            print("\n助手：", msg.content or "")
            return

        # 记录带 tool_calls 的 assistant 消息，再逐个执行工具
        memory.add_assistant_toolcall(msg)
        for tc in msg.tool_calls:
            name = tc.function.name
            raw_args = tc.function.arguments
            print(f"  [调用工具] {name}({raw_args})")
            result = await call_mcp_tool(session, name, raw_args)
            print(f"  [工具返回] {result}")
            memory.add_tool_result(tc.id, result)
    print("\n助手：（已达到最大工具调用轮数，可能存在循环，请调整问题。）")


async def main():
    client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)
    memory = Memory(SYSTEM_PROMPT)
    params = StdioServerParameters(command="python", args=[SERVER_PATH])

    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tool_list = await session.list_tools()
            functions = to_openai_functions(tool_list.tools)

            print("=" * 50)
            print("北京环球影城旅行规划 Agent（MVP）")
            print("可用工具：", [t.name for t in tool_list.tools])
            print("输入 exit / 退出 结束对话")
            print("=" * 50)

            while True:
                try:
                    q = input("\n你：").strip()
                except (EOFError, KeyboardInterrupt):
                    break
                if q.lower() in ("exit", "quit", "q", "退出"):
                    break
                if not q:
                    continue
                memory.add("user", q)
                await react(client, session, functions, memory)

    print("\n再见！")


if __name__ == "__main__":
    asyncio.run(main())
