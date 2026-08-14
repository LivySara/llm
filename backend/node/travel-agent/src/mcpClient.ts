// MCP 客户端封装（对应 Python 版 mcp_client.py）：
//  - 把 MCP 工具列表转成 OpenAI function calling 所需的 tools 结构
//  - 通过 stdio 拉起并连接多个 Python MCP server，按工具名路由调用
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { McpTool, OpenAIFunctionTool } from "./types.js";

/** 把 MCP 工具列表转换成 OpenAI function calling 的 tools 结构。 */
export function toOpenAIFunctions(tools: McpTool[]): OpenAIFunctionTool[] {
  return tools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description || "",
      parameters:
        (t.inputSchema as Record<string, unknown>) || {
          type: "object",
          properties: {},
        },
    },
  }));
}

export interface McpConnection {
  /** 所有已连接的 server 客户端（用于退出时统一关闭）。 */
  clients: Client[];
  /** 工具名 -> 对应 MCP server 客户端的路由表。 */
  toolSessionMap: Record<string, Client>;
  /** 合并后的工具列表（OpenAI function 格式）。 */
  functions: OpenAIFunctionTool[];
}

/**
 * 通过 stdio 拉起并连接多个 MCP server。
 * 每个 server 以独立子进程启动，合并所有工具到一个 functions 列表，
 * 并记录「工具名 -> client」映射，供 react 路由。
 */
export async function connectServers(
  paths: string[],
  command: string,
): Promise<McpConnection> {
  const clients: Client[] = [];
  const toolSessionMap: Record<string, Client> = {};
  const functions: OpenAIFunctionTool[] = [];

  for (const path of paths) {
    const transport = new StdioClientTransport({
      command,
      args: [path],
      env: { ...(process.env as unknown as Record<string, string>) },
    });
    const client = new Client({ name: "travel-agent", version: "1.0.0" });
    await client.connect(transport);
    clients.push(client);

    const list = await client.listTools();
    for (const t of list.tools as unknown as McpTool[]) {
      functions.push(...toOpenAIFunctions([t]));
      toolSessionMap[t.name] = client;
    }
  }

  return { clients, toolSessionMap, functions };
}

/** 解析 LLM 给出的参数（JSON 字符串）并调用 MCP 工具，返回文本结果。 */
export async function callMcpTool(
  client: Client,
  name: string,
  argumentsStr: string,
): Promise<string> {
  let args: Record<string, unknown> = {};
  try {
    args =
      argumentsStr && typeof argumentsStr === "string"
        ? JSON.parse(argumentsStr)
        : (argumentsStr as Record<string, unknown>) || {};
  } catch {
    console.log(`  [警告] 工具参数不是合法 JSON：${argumentsStr}`);
    args = {};
  }

  try {
    const result = await client.callTool({ name, arguments: args });
    const content = (result as { content?: unknown[] }).content || [];
    const texts: string[] = [];
    for (const item of content) {
      if (
        item &&
        typeof item === "object" &&
        "text" in item &&
        typeof (item as { text: unknown }).text === "string"
      ) {
        texts.push((item as { text: string }).text);
      }
    }
    return texts.length ? texts.join("\n") : "(工具无返回文本)";
  } catch (e) {
    const err = e as { message?: string };
    return `工具调用失败：${err?.message || String(e)}`;
  }
}
