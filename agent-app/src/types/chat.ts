export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: string;
}

export interface ChatRequest {
  messages: Message[];
  stream?: boolean;
}

export interface ChatResponse {
  message: Message;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}
