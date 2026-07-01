import { ChatOpenAI } from "@langchain/openai";

/**
 * 创建 LLM 模型（使用 DeepSeek）
 * 统一的 LLM 配置，避免代码重复
 */
export const createLLM = (modelName = "deepseek-v4-flash") => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not set in environment variables");
  }

  return new ChatOpenAI({
    apiKey,
    configuration: {
      baseURL,
    },
    model: modelName,
    temperature: 0.7,
  });
};
