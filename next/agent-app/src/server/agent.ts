import { createAgent } from "langchain";
import { createLLM } from "./llm";
import { getTools } from "./tools";

/**
 * 创建 Agent 执行器 (v1.x API)
 * 纯业务逻辑，可被 API Route 和 Server Actions 复用
 */
export const createAgentExecutor = async () => {
  const llm = createLLM();
  const tools = getTools();

  const agent = createAgent({
    model: llm,
    tools,
    systemPrompt: "You are a helpful assistant.", // v1.x 使用 systemPrompt 参数
  });

  return agent;
};

/**
 * 运行 Agent (v1.x 适配)
 * @param message 用户输入消息
 */
export const runAgent = async (message: string) => {
  try {
    // 创建 Agent
    const agent = await createAgentExecutor();

    // v1.x 使用 messages 数组作为输入
    const result = await agent.invoke({
      messages: [{ role: "user", content: message }],
    });
    
    // v1.x 返回 MergedAgentState，从 messages 数组提取最后一条消息
    const messages = result.messages || [];
    const lastMessage = messages[messages.length - 1];
    const responseText = lastMessage?.content || "No response";
    
    return {
      success: true,
      output: typeof responseText === "string" ? responseText : "No response",
    };
  } catch (error) {
    console.error("Agent execution error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
