// 规划模块（Plan-and-Execute，对应 Python 版 planner.py）：
// 把用户需求拆成有序步骤清单，并支持分层递归拆解、完成度自检与对话摘要。
import OpenAI from "openai";
import type { OpenAIFunctionTool, PlanNode, PlanReview } from "./types.js";
import { MODEL } from "./config.js";

/** 分层规划的最大深度（顶层为 0，最多再展开两层 -> 共 3 层）。 */
export const MAX_PLAN_DEPTH = 2;

const PLANNER_SYSTEM = `你是一个旅行规划拆解器。
给定用户的旅行需求，以及当前可用的工具列表，请把需求拆解成有序的、可执行的步骤清单（steps）。
每个步骤用一句话描述：要完成什么、可能需要调用哪个工具来获取信息。
只输出 JSON，不要任何解释。格式：{"steps": ["步骤1描述", "步骤2描述", ...]}`;

const REVIEW_SYSTEM = `你是一个规划自检器。
下面是一份旅行规划步骤清单，以及到目前为止 Agent 的对话记录。
请判断哪些步骤已经完成，并给出最终是否所有步骤都已满足的结论。
只输出 JSON，不要任何解释。格式：
{"completed": ["已完成步骤"], "remaining": ["未完成步骤"], "all_done": true}`;

const EXPAND_SYSTEM = `你是一个任务复杂度判断器。
给定一个规划步骤，请判断它是「原子动作」（一步即可完成，如单次工具调用或一次计算）
还是「复合子目标」（需要进一步拆成多个步骤）。
只输出 JSON：{"expand": true} 或 {"expand": false}，不要任何解释。`;

const SUMMARY_SYSTEM = `你是一个对话摘要器。
给定「已有摘要」和「新增对话片段」，请产出一份更新后的简洁摘要。
务必保留：关键数字（票价、预算、人数）、已做的决策、用户的偏好与约束。
不要输出解释，只输出摘要正文。`;

function toolsDesc(functions: OpenAIFunctionTool[]): string {
  return functions
    .map((f) => `- ${f.function.name}: ${f.function.description}`)
    .join("\n");
}

/** 让 LLM 把一个需求拆成步骤清单，返回步骤文本列表。 */
async function makePlan(
  client: OpenAI,
  userQuery: string,
  functions: OpenAIFunctionTool[],
): Promise<string[]> {
  const resp = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: PLANNER_SYSTEM },
      {
        role: "user",
        content: `用户需求：${userQuery}\n\n可用工具：\n${toolsDesc(functions)}`,
      },
    ],
    response_format: { type: "json_object" },
  });
  try {
    const data = JSON.parse(resp.choices[0].message.content || "{}");
    return (data.steps || []).map(String);
  } catch {
    return [];
  }
}

/** 让 LLM 根据当前对话记录，自检规划完成情况。 */
export async function reviewPlan(
  client: OpenAI,
  steps: string[],
  exportMessages: () => unknown[],
): Promise<PlanReview> {
  if (!steps.length) return { completed: [], remaining: [], all_done: true };
  const convo = JSON.stringify(exportMessages());
  const resp = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: REVIEW_SYSTEM },
      {
        role: "user",
        content: `规划步骤：${JSON.stringify(steps)}\n\n对话记录：${convo}`,
      },
    ],
    response_format: { type: "json_object" },
  });
  try {
    const data = JSON.parse(resp.choices[0].message.content || "{}");
    return {
      completed: (data.completed || []).map(String),
      remaining: (data.remaining || []).map(String),
      all_done: Boolean(data.all_done),
    };
  } catch {
    return { completed: [], remaining: [], all_done: false };
  }
}

/** 让 LLM 判断某步骤是否值得进一步拆解（到最后一层前就停止展开）。 */
async function needsExpansion(
  client: OpenAI,
  step: string,
  depth: number,
  maxDepth: number,
): Promise<boolean> {
  if (depth >= maxDepth - 1) return false;
  const resp = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: EXPAND_SYSTEM },
      { role: "user", content: `步骤：${step}` },
    ],
    response_format: { type: "json_object" },
  });
  try {
    return Boolean(JSON.parse(resp.choices[0].message.content || "{}").expand);
  } catch {
    return false;
  }
}

/**
 * 把用户需求递归拆成多层子目标，返回节点树。
 * 节点结构：{ goal, sub }。顶层把整体需求拆成步骤；
 * 对判定为「复合子目标」的步骤再递归拆解，直到达到 MAX_PLAN_DEPTH 或已是原子动作。
 */
export async function decompose(
  client: OpenAI,
  userQuery: string,
  functions: OpenAIFunctionTool[],
  depth = 0,
  maxDepth = MAX_PLAN_DEPTH,
): Promise<PlanNode[]> {
  const steps = await makePlan(client, userQuery, functions);
  const nodes: PlanNode[] = [];
  for (const step of steps) {
    if (await needsExpansion(client, step, depth, maxDepth)) {
      const sub = await decompose(client, step, functions, depth + 1, maxDepth);
      nodes.push({ goal: step, sub });
    } else {
      nodes.push({ goal: step, sub: null });
    }
  }
  return nodes;
}

/** 把新增对话片段合并进已有摘要，返回更新后的摘要（用于上下文压缩）。 */
export async function summarizeDialogue(
  client: OpenAI,
  newText: string,
  prevSummary = "",
): Promise<string> {
  let user = "";
  if (prevSummary) user += `已有摘要：\n${prevSummary}\n\n`;
  user += `新增对话片段：\n${newText}`;
  const resp = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SUMMARY_SYSTEM },
      { role: "user", content: user },
    ],
  });
  return (resp.choices[0].message.content || "").trim();
}
