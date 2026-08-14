// Agent 的记忆模块（对应 Python 版 memory.py）：
// 维护 system + 对话历史 + 工具调用/结果 + 分层规划 + 早期对话摘要。
// 支持上下文长度保护（export 只保留最近 N 条）与跨会话持久化（save/load）。
import fs from "node:fs";
import type { PlanNode, StoredMessage } from "./types.js";

export const MAX_CONTEXT_MESSAGES = 20;

export class Memory {
  systemPrompt: string | null;
  messages: StoredMessage[];
  plan: PlanNode[];
  summary: string;

  constructor(systemPrompt?: string | null) {
    this.systemPrompt = systemPrompt ?? null;
    this.messages = [];
    this.plan = [];
    this.summary = "";
  }

  /** 追加一条普通消息（system / user / assistant）。 */
  add(role: StoredMessage["role"], content: string | null): void {
    this.messages.push({ role, content });
  }

  /** 记录 LLM 返回、带 tool_calls 的 assistant 消息（OpenAI 格式）。 */
  addAssistantToolcall(msg: {
    content: string | null;
    tool_calls?: StoredMessage["tool_calls"];
  }): void {
    this.messages.push({
      role: "assistant",
      content: msg.content ?? "",
      tool_calls: msg.tool_calls,
    });
  }

  /** 记录某次工具调用的返回结果。 */
  addToolResult(toolCallId: string, content: string): void {
    this.messages.push({ role: "tool", tool_call_id: toolCallId, content });
  }

  /** 设置/更新规划步骤清单（分层节点树）。 */
  setPlan(steps: PlanNode[]): void {
    this.plan = [...steps];
  }

  /**
   * 导出可直接传给 LLM 的 messages 列表，带上下文长度保护：
   *  - 前置早期对话摘要（替代硬截断，避免丢关键信息）
   *  - 只保留最近 MAX_CONTEXT_MESSAGES 条
   *  - 安全修剪：若截断点落在孤立的 tool 结果上（其父 tool_call 已被丢弃），直接丢弃
   */
  export(): StoredMessage[] {
    const out: StoredMessage[] = [];
    if (this.systemPrompt) {
      out.push({ role: "system", content: this.systemPrompt });
    }
    if (this.summary) {
      out.push({
        role: "system",
        content: "（以下是早期对话的摘要）\n" + this.summary,
      });
    }

    let recent = this.messages.slice(-MAX_CONTEXT_MESSAGES);
    while (recent.length && recent[0].role === "tool") {
      recent = recent.slice(1);
    }
    out.push(...recent);
    return out;
  }

  /**
   * 上下文压缩：当对话超过窗口时，把最早的一批摘要化并从 messages 移除。
   * 被压缩的部分不会丢信息，而是合并进 summary（增量累积）。
   * 注意不会切断 tool_call 对——若前缀末尾是带 tool_calls 的 assistant，
   * 则把紧随其后的 tool 结果也一并纳入压缩前缀。
   */
  async compress(
    summarize: (newText: string, prev: string) => Promise<string>,
  ): Promise<void> {
    let dropN = this.messages.length - MAX_CONTEXT_MESSAGES;
    if (dropN <= 0) return;

    while (dropN < this.messages.length) {
      const cand = this.messages[dropN - 1];
      if (cand.role === "assistant" && cand.tool_calls) {
        dropN += 1;
      } else {
        break;
      }
    }

    const prefix = this.messages.slice(0, dropN);
    this.messages = this.messages.slice(dropN);
    const prefixText = JSON.stringify(prefix, null, 2);
    this.summary = await summarize(prefixText, this.summary);
  }

  /** 把记忆序列化到 JSON 文件（含 system_prompt / 对话 / 规划 / 摘要）。 */
  save(path: string): void {
    fs.writeFileSync(
      path,
      JSON.stringify(
        {
          system_prompt: this.systemPrompt,
          messages: this.messages,
          plan: this.plan,
          summary: this.summary,
        },
        null,
        2,
      ),
      "utf-8",
    );
  }

  /** 从 JSON 文件恢复记忆；文件不存在或解析失败返回 null。 */
  static load(path: string): Memory | null {
    try {
      const data = JSON.parse(fs.readFileSync(path, "utf-8"));
      const m = new Memory(data.system_prompt);
      m.messages = data.messages || [];
      m.plan = data.plan || [];
      m.summary = data.summary || "";
      return m;
    } catch {
      return null;
    }
  }

  /** 清空对话与规划，回到初始状态。 */
  clear(): void {
    this.messages = [];
    this.plan = [];
  }
}
