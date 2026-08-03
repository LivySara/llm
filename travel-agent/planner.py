"""规划模块（Plan-and-Execute）：把用户一次性需求，拆成可执行的步骤清单。

为什么需要它：
    Phase 1 的 ReAct 循环是「走一步看一步」——LLM 每轮只决定下一步调什么工具。
    当需求变复杂（如「2 日游、2 大 1 小、预算 3000」），走一步看一步容易遗漏。
    规划模块让 LLM 先「站在高处」把任务拆成步骤清单，Agent 再逐步执行并自检完成情况。

这是 Agent 里「规划(Planning)」能力的显式落地。
"""
import json

from config import MODEL

PLANNER_SYSTEM = """你是一个旅行规划拆解器。
给定用户的旅行需求，以及当前可用的工具列表，请把需求拆解成有序的、可执行的步骤清单（steps）。
每个步骤用一句话描述：要完成什么、可能需要调用哪个工具来获取信息。
只输出 JSON，不要任何解释。格式：{"steps": ["步骤1描述", "步骤2描述", ...]}"""

REVIEW_SYSTEM = """你是一个规划自检器。
下面是一份旅行规划步骤清单，以及到目前为止 Agent 的对话记录。
请判断哪些步骤已经完成，并给出最终是否所有步骤都已满足的结论。
只输出 JSON，不要任何解释。格式：
{"completed": ["已完成步骤"], "remaining": ["未完成步骤"], "all_done": true}"""


def make_plan(client, user_query: str, functions: list) -> list:
    """让 LLM 把一个需求拆成步骤清单，返回步骤文本列表。"""
    tools_desc = "\n".join(
        f"- {f['function']['name']}: {f['function'].get('description', '')}"
        for f in functions
    )
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": PLANNER_SYSTEM},
            {"role": "user", "content": f"用户需求：{user_query}\n\n可用工具：\n{tools_desc}"},
        ],
        response_format={"type": "json_object"},
    )
    try:
        data = json.loads(resp.choices[0].message.content or "{}")
        steps = data.get("steps", [])
    except (json.JSONDecodeError, AttributeError):
        steps = []
    return [str(s) for s in steps]


def review_plan(client, steps: list, memory) -> dict:
    """让 LLM 根据当前对话记录，自检规划完成情况。

    返回 {"completed": [...], "remaining": [...], "all_done": bool}
    """
    if not steps:
        return {"completed": [], "remaining": [], "all_done": True}
    convo = json.dumps(memory.export(), ensure_ascii=False)
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": REVIEW_SYSTEM},
            {
                "role": "user",
                "content": f"规划步骤：{json.dumps(steps, ensure_ascii=False)}\n\n对话记录：{convo}",
            },
        ],
        response_format={"type": "json_object"},
    )
    try:
        data = json.loads(resp.choices[0].message.content or "{}")
    except (json.JSONDecodeError, AttributeError):
        data = {}
    return {
        "completed": data.get("completed", []),
        "remaining": data.get("remaining", []),
        "all_done": bool(data.get("all_done", False)),
    }
