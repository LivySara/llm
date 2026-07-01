"use client";

import { useState, useCallback } from "react";
import ChatInput from "@/components/ChatInput";
import MessageList from "@/components/MessageList";
import type { Message } from "@/types/chat";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback(async (content: string) => {
    // 添加用户消息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 准备历史消息（用于记忆）
      const history = messages.map(({ role, content }) => ({
        role,
        content,
      }));

      // 调用 API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          history,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "请求失败");
      }

      // 添加 AI 回复
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message || "抱歉，我无法处理您的请求",
        timestamp: Date.now(),
        toolCalls: data.intermediateSteps || [],
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Send message error:", error);
      
      // 添加错误消息
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "system",
        content: `错误: ${error instanceof Error ? error.message : "未知错误"}`,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* 顶部导航 */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path d="M9 3.5a5.5 5.5 0 00-4.136 9.265A4.5 4.5 0 0010.5 21.5a4.75 4.75 0 004.061-2.658A5.5 5.5 0 0018 15.5a5.5 5.5 0 00-9-4.5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                AI Agent
              </h1>
              <p className="text-xs text-gray-500">智能助手</p>
            </div>
          </div>
          <button
            onClick={() => {
              setMessages([]);
            }}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title="新建对话"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
            </svg>
          </button>
        </div>
      </header>

      {/* 消息列表区域 */}
      <main className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />
      </main>

      {/* 输入区域 */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-md">
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </footer>
    </div>
  );
}
