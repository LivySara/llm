"""冒烟测试：验证 MCP 链路（无需 DeepSeek key）。

仅测试 travel-agent 与 mcp server.py 之间的连通性：
连接 -> 列出工具 -> 转 OpenAI functions -> 实际调用一次。
"""
import asyncio

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from mcp_client import call_mcp_tool, to_openai_functions

SERVER_PATH = "d:/out_of_work_arrange/practice-project/llm/mcp/universal-studios-price/server.py"


async def main():
    params = StdioServerParameters(command="python", args=[SERVER_PATH])
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tool_list = await session.list_tools()
            print("[1] 连接成功，工具数：", len(tool_list.tools))
            print("    工具名：", [t.name for t in tool_list.tools])

            functions = to_openai_functions(tool_list.tools)
            print("[2] 转 OpenAI functions 格式 OK，首条：")
            print("    ", functions[0]["function"]["name"], "->",
                  list(functions[0]["function"]["parameters"].get("properties", {}).keys()))

            print("[3] 实际调用 get_price_by_date(2026-10-01)：")
            r = await call_mcp_tool(session, "get_price_by_date", '{"date": "2026-10-01"}')
            print("    ", r.replace("\n", " | "))


if __name__ == "__main__":
    asyncio.run(main())
