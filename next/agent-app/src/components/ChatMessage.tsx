"use client";

import type { ToolCall } from "@/types/chat";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
  toolCalls?: ToolCall[];
}

export default function ChatMessage({
  role,
  content,
  timestamp,
  toolCalls,
}: ChatMessageProps) {
  const isUser = role === "user";
  const isSystem = role === "system";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-blue-500 text-white"
            : isSystem
            ? "bg-gray-100 text-gray-600 italic"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        {/* 角色标签 */}
        <div className="mb-1 text-xs font-medium opacity-70">
          {isUser ? "你" : isSystem ? "系统" : "AI 助手"}
          {timestamp && (
            <span className="ml-2">
              {new Date(timestamp).toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        {/* 消息内容 */}
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {content}
        </div>

        {/* 工具调用展示 */}
        {toolCalls && toolCalls.length > 0 && (
          <div className="mt-3 border-t border-gray-200 pt-2">
            <details className="text-xs">
              <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-700">
                查看工具调用 ({toolCalls.length})
              </summary>
              <div className="mt-2 space-y-2">
                {toolCalls.map((call, idx) => (
                  <div key={idx} className="rounded bg-white/50 p-2">
                    <div className="font-mono text-gray-600">
                      <span className="font-medium">工具:</span> {call.name}
                    </div>
                    <div className="font-mono text-gray-600">
                      <span className="font-medium">输入:</span> {JSON.stringify(call.args)}
                    </div>
                    {call.result && (
                      <div className="font-mono text-gray-600">
                        <span className="font-medium">输出:</span> {call.result}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
