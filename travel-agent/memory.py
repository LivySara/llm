"""Agent 的记忆模块：维护 system + 对话历史 + 工具调用/结果。

MVP 阶段用内存 list 即可跑通；后续可在此扩展为文件/向量持久化。
"""


class Memory:
    def __init__(self, system_prompt=None):
        self.system_prompt = system_prompt
        self.messages = []

    def add(self, role, content):
        """追加一条普通消息（system / user / assistant）。"""
        self.messages.append({"role": role, "content": content})

    def add_assistant_toolcall(self, msg):
        """记录 LLM 返回、带 tool_calls 的 assistant 消息（OpenAI 格式）。"""
        self.messages.append(
            {
                "role": "assistant",
                "content": msg.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments,
                        },
                    }
                    for tc in msg.tool_calls
                ],
            }
        )

    def add_tool_result(self, tool_call_id, content):
        """记录某次工具调用的返回结果。"""
        self.messages.append(
            {"role": "tool", "tool_call_id": tool_call_id, "content": content}
        )

    def export(self):
        """导出可直接传给 LLM 的 messages 列表。"""
        out = []
        if self.system_prompt:
            out.append({"role": "system", "content": self.system_prompt})
        out.extend(self.messages)
        return out
