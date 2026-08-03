"""规划模块（Plan-and-Execute）：把用户一次性需求，拆成可执行的步骤清单。

为什么需要它：
    Phase 1 的 ReAct 循环是「走一步看一步」——LLM 每轮只决定下一步调什么工具。
    当需求变复杂（如「2 日游、2 大 1 小、预算 3000」），走一步看一步容易遗漏。
    规划模块让 LLM 先「站在高处」把任务拆成步骤清单，Agent 再逐步执行并自检完成情况。

这是 Agent 里「规划(Planning)」能力的显式落地。
"""
import json

from config import MODEL

# Phase 4：分层规划的最大深度（顶层为 0，最多再展开两层 -> 共 3 层）。
MAX_PLAN_DEPTH = 2

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


# ---------------------------------------------------------------------------
# Phase 4 · 分层规划（子目标递归拆解）
# ---------------------------------------------------------------------------
EXPAND_SYSTEM = """你是一个任务复杂度判断器。
给定一个规划步骤，请判断它是「原子动作」（一步即可完成，如单次工具调用或一次计算）
还是「复合子目标」（需要进一步拆成多个步骤）。
只输出 JSON：{"expand": true} 或 {"expand": false}，不要任何解释。"""

SUMMARY_SYSTEM = """你是一个对话摘要器。
给定「已有摘要」和「新增对话片段」，请产出一份更新后的简洁摘要。
务必保留：关键数字（票价、预算、人数）、已做的决策、用户的偏好与约束。
不要输出解释，只输出摘要正文。"""


def _needs_expansion(client, step: str, depth: int, max_depth: int) -> bool:
    """让 LLM 判断某步骤是否值得进一步拆解（到最后一层前就停止展开）。"""
    if depth >= max_depth - 1:
        return False
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": EXPAND_SYSTEM},
            {"role": "user", "content": f"步骤：{step}"},
        ],
        response_format={"type": "json_object"},
    )
    try:
        return bool(json.loads(resp.choices[0].message.content or "{}").get("expand", False))
    except (json.JSONDecodeError, AttributeError):
        return False


def decompose(client, user_query: str, functions: list, depth: int = 0,
              max_depth: int = MAX_PLAN_DEPTH) -> list:
    """把用户需求递归拆成多层子目标，返回节点树。

    节点结构：{"goal": 步骤描述, "sub": [子节点...] | None}
    顶层把整体需求拆成步骤；对判定为「复合子目标」的步骤再递归拆解，
    直到达到 MAX_PLAN_DEPTH 或步骤已是原子动作。
    """
    steps = make_plan(client, user_query, functions)
    nodes = []
    for step in steps:
        if _needs_expansion(client, step, depth, max_depth):
            sub = decompose(client, step, functions, depth + 1, max_depth)
            nodes.append({"goal": step, "sub": sub})
        else:
            nodes.append({"goal": step, "sub": None})
    return nodes


def summarize_dialogue(client, new_text: str, prev_summary: str = "") -> str:
    """把新增对话片段合并进已有摘要，返回更新后的摘要（用于上下文压缩）。"""
    user = ""
    if prev_summary:
        user += f"已有摘要：\n{prev_summary}\n\n"
    user += f"新增对话片段：\n{new_text}"
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SUMMARY_SYSTEM},
            {"role": "user", "content": user},
        ],
    )
    return (resp.choices[0].message.content or "").strip()
