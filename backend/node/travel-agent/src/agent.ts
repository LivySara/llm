// ReAct 主循环（对应 Python 版 agent.py 的 react 函数）：
// 感知 -> 规划 -> 行动 -> 再感知。LLM 用 function calling 决定调哪个工具，
// 工具按名路由到对应 MCP server 执行，结果回填后再进入下一轮。
import OpenAI from "openai";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { OpenAIFunctionTool, StoredMessage } from "./types.js";
import { Memory } from "./memory.js";
import { callMcpTool } from "./mcpClient.js";
import { MODEL } from "./config.js";

export const MAX_TOOL_TURNS = 6;

/** 把内部存储的消息映射成 OpenAI SDK 要求的消息格式。 */
function toSdkMessages(
  messages: StoredMessage[],
): OpenAI.Chat.ChatCompletionMessageParam[] {
  return messages.map((m) => {
    if (m.role === "tool") {
      return {
        role: "tool",
        tool_call_id: m.tool_call_id as string,
        content: m.content ?? "",
      } as OpenAI.Chat.ChatCompletionMessageParam;
    }
    if (m.role === "assistant" && m.tool_calls) {
      return {
        role: "assistant",
        content: m.content ?? null,
        tool_calls: m.tool_calls,
      } as OpenAI.Chat.ChatCompletionMessageParam;
    }
    return {
      role: m.role,
      content: m.content ?? "",
    } as OpenAI.Chat.ChatCompletionMessageParam;
  });
}

/**
 * ReAct 主循环。
 * @param toolSessionMap 工具名 -> 对应 MCP server 客户端，用于把工具调用路由到正确的 server。
 */
export async function react(
  client: OpenAI,
  toolSessionMap: Record<string, Client>,
  functions: OpenAIFunctionTool[],
  memory: Memory,
): Promise<void> {
  for (let turn = 1; turn <= MAX_TOOL_TURNS; turn++) {
    console.log(`\n--- 第 ${turn} 轮 ---`);

    // ① 感知：把当前所有上下文（用户问题 + 历史 + 上次工具结果）喂给 LLM
    const resp = await client.chat.completions.create({
      model: MODEL,
      messages: toSdkMessages(memory.export()),
      tools: functions as unknown as OpenAI.Chat.ChatCompletionTool[],
      tool_choice: "auto",
    });
    const msg = resp.choices[0].message;

    // ② 规划：LLM 决定「还需不需要调工具、调哪个、传什么参数」（结论即 tool_calls）
    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      console.log("[规划] 信息足够，不再调用工具，输出最终回答");
      memory.add("assistant", msg.content || "");
      console.log("\n助手：", msg.content || "");
      return;
    }

    const toolNames = msg.tool_calls.map((tc) => tc.function.name);
    console.log(`[规划] 决定调用工具：${toolNames.join(", ")}`);

    // 记录带 tool_calls 的 assistant 消息，供后续 tool 结果配对
    memory.addAssistantToolcall({
      content: msg.content,
      tool_calls: msg.tool_calls.map((tc) => ({
        id: tc.id,
        type: "function",
        function: { name: tc.function.name, arguments: tc.function.arguments },
      })),
    });

    for (const tc of msg.tool_calls) {
      const name = tc.function.name;
      const rawArgs = tc.function.arguments;
      console.log(`  [行动] 执行 ${name}(${rawArgs})`);

      // ③ 行动：按工具名路由到对应的 MCP server，真的去执行工具
      const session = toolSessionMap[name];
      if (!session) {
        console.log(`  [观察] 未找到工具 ${name} 对应的 server`);
        memory.addToolResult(tc.id, `错误：找不到工具 ${name}`);
        continue;
      }
      const result = await callMcpTool(session, name, rawArgs);
      console.log(`  [观察] ${result}`);

      // ④ 再感知：把结果塞回记忆，下一轮 LLM 就能看到
      memory.addToolResult(tc.id, result);
    }
    // 循环回到顶上：下一轮的"感知"会把这次结果一起喂给 LLM
  }
  console.log("\n助手：（已达到最大工具调用轮数，可能存在循环，请调整问题。）");
}
