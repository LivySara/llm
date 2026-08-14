// 共享类型定义：消息、工具、规划节点等（对应 Python 版各模块的隐式结构）。

/** LLM 返回的带 function 调用信息（OpenAI 格式）。 */
export interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

/** 记忆里存储的一条消息（system / user / assistant / tool 四种角色）。 */
export interface StoredMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

/** 分层规划的一个节点（顶层为 goal，复合子目标带 sub 子树）。 */
export interface PlanNode {
  goal: string;
  sub: PlanNode[] | null;
}

/** 规划自检结果。 */
export interface PlanReview {
  completed: string[];
  remaining: string[];
  all_done: boolean;
}

/** 交给 LLM 的 function calling 工具描述（OpenAI tools[] 格式）。 */
export interface OpenAIFunctionTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

/** MCP server 返回的 tool 的最小结构（仅取我们需要的字段）。 */
export interface McpTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}
