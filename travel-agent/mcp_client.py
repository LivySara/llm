"""MCP 客户端封装：把工具列表转成 OpenAI function 格式，并调用工具。"""
import json

from mcp import ClientSession


def to_openai_functions(tools):
    """把 MCP 工具列表转换成 OpenAI function calling 所需的 tools 结构。

    MCP 的 tool.inputSchema 本身就是一个 JSON Schema，
    与 OpenAI functions 的 parameters 字段格式一致，可直接复用。
    """
    functions = []
    for t in tools:
        schema = t.inputSchema or {"type": "object", "properties": {}}
        functions.append(
            {
                "type": "function",
                "function": {
                    "name": t.name,
                    "description": t.description or "",
                    "parameters": schema,
                },
            }
        )
    return functions


async def call_mcp_tool(session: ClientSession, name: str, arguments: str) -> str:
    """解析 LLM 给出的参数并调用 MCP 工具，返回文本结果。"""
    try:
        args = json.loads(arguments) if isinstance(arguments, str) else (arguments or {})
    except json.JSONDecodeError:
        print(f"  [警告] 工具参数不是合法 JSON：{arguments}")
        args = {}
    result = await session.call_tool(name, args)
    texts = []
    for item in result.content:
        text = getattr(item, "text", None)
        if text:
            texts.append(text)
    return "\n".join(texts) if texts else "(工具无返回文本)"
