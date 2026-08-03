"""Agent 的记忆模块：维护 system + 对话历史 + 工具调用/结果 + 旅行规划。

Phase 2 增强：
  - 上下文长度保护：export() 只保留 system + 最近 N 条消息，避免超出 LLM 上下文窗口。
  - 持久化：save/load 把整个记忆（含规划）存成 JSON 文件，支持跨会话恢复。
"""

import json

MAX_CONTEXT_MESSAGES = 20


class Memory:
    def __init__(self, system_prompt=None):
        self.system_prompt = system_prompt
        self.messages = []
        self.plan = []  # 规划步骤清单（字符串列表）

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

    def set_plan(self, steps):
        """设置/更新规划步骤清单。"""
        self.plan = list(steps)

    def export(self):
        """导出可直接传给 LLM 的 messages 列表，带上下文长度保护。"""
        out = []
        if self.system_prompt:
            out.append({"role": "system", "content": self.system_prompt})

        # 上下文保护：只保留最近 MAX_CONTEXT_MESSAGES 条
        recent = self.messages[-MAX_CONTEXT_MESSAGES:]
        # 安全修剪：若截断点恰好落在某次 tool 结果上（其父 tool_call 已被丢弃），
        # 直接丢掉这条孤立的 tool 结果，否则 OpenAI 会报「tool_call 与 tool 不配对」的错误。
        while recent and recent[0]["role"] == "tool":
            recent = recent[1:]

        if len(self.messages) > len(recent):
            dropped = len(self.messages) - len(recent)
            note = f"（已省略最早的 {dropped} 条对话以控制上下文长度）"
            out.append({"role": "system", "content": note})

        out.extend(recent)
        return out

    def save(self, path):
        """把记忆序列化到 JSON 文件（含 system_prompt / 对话 / 规划）。"""
        with open(path, "w", encoding="utf-8") as f:
            json.dump(
                {
                    "system_prompt": self.system_prompt,
                    "messages": self.messages,
                    "plan": self.plan,
                },
                f,
                ensure_ascii=False,
                indent=2,
            )

    @classmethod
    def load(cls, path):
        """从 JSON 文件恢复记忆；文件不存在或解析失败返回 None。"""
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return None
        m = cls(data.get("system_prompt"))
        m.messages = data.get("messages", [])
        m.plan = data.get("plan", [])
        return m

    def clear(self):
        """清空对话与规划，回到初始状态。"""
        self.messages = []
        self.plan = []
