"""Agent 的记忆模块：维护 system + 对话历史 + 工具调用/结果 + 旅行规划。

Phase 2 增强：
  - 上下文长度保护：export() 只保留 system + 最近 N 条消息，避免超出 LLM 上下文窗口。
  - 持久化：save/load 把整个记忆（含规划）存成 JSON 文件，支持跨会话恢复。
"""

import json

from planner import summarize_dialogue

MAX_CONTEXT_MESSAGES = 20


class Memory:
    def __init__(self, system_prompt=None):
        self.system_prompt = system_prompt
        self.messages = []
        self.plan = []      # 规划步骤（Phase 4 起为分层节点树）
        self.summary = ""   # 已压缩丢弃的早期对话摘要（增量累积）

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
        """导出可直接传给 LLM 的 messages 列表，带上下文长度保护。

        Phase 4 起：被压缩丢弃的早期对话不会丢失，而是以「摘要」形式
        作为一条 system 消息前置注入；同时仍保留孤儿 tool 结果的安全修剪。
        """
        out = []
        if self.system_prompt:
            out.append({"role": "system", "content": self.system_prompt})

        # 前置早期对话摘要（Phase 4 新增，替代旧版的「已省略 N 条」硬截断）
        if self.summary:
            out.append({"role": "system", "content": "（以下是早期对话的摘要）\n" + self.summary})

        # 上下文保护：只保留最近 MAX_CONTEXT_MESSAGES 条
        recent = self.messages[-MAX_CONTEXT_MESSAGES:]
        # 安全修剪：若截断点恰好落在某次 tool 结果上（其父 tool_call 已被丢弃），
        # 直接丢掉这条孤立的 tool 结果，否则 OpenAI 会报「tool_call 与 tool 不配对」的错误。
        while recent and recent[0]["role"] == "tool":
            recent = recent[1:]

        out.extend(recent)
        return out

    def compress(self, client):
        """Phase 4 上下文压缩：当对话超过窗口时，把最早的一批摘要化并从 messages 移除。

        被压缩的部分不会丢信息，而是合并进 self.summary（增量累积，越压越精炼）。
        注意：调用前需保证不会切断 tool_call 对——若前缀末尾是带 tool_calls 的
        assistant，则把紧随其后的 tool 结果也一并纳入压缩前缀。
        """
        drop_n = len(self.messages) - MAX_CONTEXT_MESSAGES
        if drop_n <= 0:
            return
        # 不切断 tool_call 对：若前缀末条是带 tool_calls 的 assistant，扩展前缀包含其后 tool 结果
        while drop_n < len(self.messages):
            cand = self.messages[drop_n - 1]
            if cand.get("role") == "assistant" and cand.get("tool_calls"):
                drop_n += 1
            else:
                break
        prefix = self.messages[:drop_n]
        self.messages = self.messages[drop_n:]
        prefix_text = json.dumps(prefix, ensure_ascii=False)
        self.summary = summarize_dialogue(client, prefix_text, self.summary)

    def save(self, path):
        """把记忆序列化到 JSON 文件（含 system_prompt / 对话 / 规划）。"""
        with open(path, "w", encoding="utf-8") as f:
            json.dump(
                {
                    "system_prompt": self.system_prompt,
                    "messages": self.messages,
                    "plan": self.plan,
                    "summary": self.summary,
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
        m.summary = data.get("summary", "")
        return m

    def clear(self):
        """清空对话与规划，回到初始状态。"""
        self.messages = []
        self.plan = []
