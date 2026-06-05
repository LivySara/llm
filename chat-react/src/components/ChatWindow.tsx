import React, { useState, useRef, useEffect } from 'react';
import { sendMessageStream, getChatHistory, clearHistory, Message } from '../services/api';
import './ChatWindow.css';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 加载聊天历史
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getChatHistory();
        setMessages(history);
      } catch (err) {
        console.error('加载历史失败:', err);
      }
    };
    loadHistory();
  }, []);

  // 发送消息 (流式 - 打字机效果)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || loading) {
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
    };

    // 立即显示用户消息，并添加一个空的 AI 消息占位
    setMessages((prev) => [...prev, userMessage, { role: 'assistant', content: '' }]);
    setInputValue('');
    setLoading(true);
    setError('');

    try {
      await sendMessageStream(inputValue, {
        onChunk: (content: string) => {
          // 逐块更新 AI 消息内容 (打字机效果)
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.content += content;
            }
            return newMessages;
          });
        },
        onDone: () => {
          setLoading(false);
        },
        onError: (error: string) => {
          setError(error);
          setLoading(false);
        },
      });
    } catch (err) {
      setError('发送失败，请检查后端服务');
      console.error('错误:', err);
      setLoading(false);
    }
  };

  // 清除历史
  const handleClearHistory = async () => {
    if (window.confirm('确定要清除所有对话吗？')) {
      try {
        await clearHistory();
        setMessages([]);
        setError('');
      } catch (err) {
        setError('清除失败');
      }
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h1>🤖 AI 聊天助手</h1>
        <button className="clear-btn" onClick={handleClearHistory}>
          清除历史
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>👋 开始聊天吧！</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message message-${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              {msg.role === 'assistant' && !msg.content && loading ? (
                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入你的问题..."
          disabled={loading}
          className="chat-input"
        />
        <button type="submit" disabled={loading || !inputValue.trim()} className="send-btn">
          {loading ? '发送中...' : '发送'}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
