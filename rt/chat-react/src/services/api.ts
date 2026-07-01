import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});

// ==================== 类型定义 ====================

export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface Conversation {
  id: number;
  conversation_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface ChatResponse {
  id: string;
  message: Message;
  status: 'success' | 'error';
}

export interface StreamCallback {
  onChunk: (content: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

// ==================== 会话管理 API ====================

/**
 * 获取会话列表
 */
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await api.get<Conversation[]>('/conversations/');
    return response.data;
  } catch (error) {
    console.error('获取会话列表失败:', error);
    throw error;
  }
};

/**
 * 创建新会话
 */
export const createConversation = async (title?: string): Promise<Conversation> => {
  try {
    const response = await api.post<Conversation>('/conversations/create/', {
      title: title || '新对话',
    });
    return response.data;
  } catch (error) {
    console.error('创建会话失败:', error);
    throw error;
  }
};

/**
 * 重命名会话
 */
export const renameConversation = async (
  conversationId: string,
  title: string
): Promise<Conversation> => {
  try {
    const response = await api.patch<Conversation>(
      `/conversations/${conversationId}/rename/`,
      { title }
    );
    return response.data;
  } catch (error) {
    console.error('重命名会话失败:', error);
    throw error;
  }
};

/**
 * 删除会话
 */
export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    await api.delete(`/conversations/${conversationId}/delete/`);
  } catch (error) {
    console.error('删除会话失败:', error);
    throw error;
  }
};

/**
 * 获取指定会话的消息历史
 */
export const getConversationMessages = async (
  conversationId: string
): Promise<Message[]> => {
  try {
    const response = await api.get<Message[]>(
      `/conversations/${conversationId}/messages/`
    );
    return response.data;
  } catch (error) {
    console.error('获取消息历史失败:', error);
    throw error;
  }
};

// ==================== 聊天 API ====================

/**
 * 发送聊天消息 (流式) - 支持打字机效果
 */
export const sendMessageStream = async (
  message: string,
  conversationId: string,
  callbacks: StreamCallback
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/chat/stream/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法读取响应流');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // 处理 SSE 格式的数据
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';  // 保留最后一个不完整的块

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);  // 去掉 "data: " 前缀
          try {
            const data = JSON.parse(dataStr);

            if (data.error) {
              callbacks.onError(data.error);
              return;
            }

            if (data.content) {
              callbacks.onChunk(data.content);
            }

            if (data.done) {
              callbacks.onDone();
              return;
            }
          } catch (e) {
            console.error('解析 SSE 数据失败:', e);
          }
        }
      }
    }

    callbacks.onDone();
  } catch (error) {
    console.error('流式发送消息失败:', error);
    callbacks.onError(error instanceof Error ? error.message : '发送失败');
  }
};

/**
 * 发送聊天消息 (非流式)
 */
export const sendMessage = async (
  message: string,
  conversationId: string
): Promise<ChatResponse> => {
  try {
    const response = await api.post<ChatResponse>('/chat/', {
      message: message,
      conversation_id: conversationId,
    });
    return response.data;
  } catch (error) {
    console.error('发送消息失败:', error);
    throw error;
  }
};

/**
 * 清除指定会话的历史
 */
export const clearHistory = async (conversationId: string): Promise<void> => {
  try {
    await api.post('/clear/', {
      conversation_id: conversationId,
    });
  } catch (error) {
    console.error('清除历史失败:', error);
    throw error;
  }
};

export default api;
