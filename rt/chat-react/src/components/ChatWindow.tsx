import { useState, useRef, useEffect } from 'react';
import {
  sendMessageStream,
  getConversationMessages,
  clearHistory,
  Message,
} from '../services/api';
import './ChatWindow.css';

interface ChatWindowProps {
  conversationId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
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

  // 加载当前会话的消息历史
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const history = await getConversationMessages(conversationId);
        setMessages(history);
      } catch (err) {
        console.error('加载历史失败:', err);
      }
    };
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

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
      await sendMessageStream(
        inputValue,
        conversationId,
        {
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
        }
      );
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
        await clearHistory(conversationId);
        setMessages([]);
        setError('');
      } catch (err) {
        setError('清除失败');
      }
    }
  };

  // 简单的 Markdown 渲染（代码块、列表、粗体等）
  const renderContent = (content: string) => {
    if (!content) return null;

    // 处理代码块 ```code```
    const parts = content.split(/(```[\s\S]*?```)/g);
    return (
      <>
        {parts.map((part, i) => {
          if (part.startsWith('```') && part.endsWith('```')) {
            const code = part.slice(3, -3);
            const lines = code.split('\n');
            const codeContent = lines.length > 1 && lines[0].length < 20 ? lines.slice(1).join('\n') : code;
            return (
              <pre key={i}><code>{codeContent}</code></pre>
            );
          }
          // 处理行内代码 `code`
          const inlineParts = part.split(/(`[^`]+`)/g);
          return inlineParts.map((inlinePart, j) => {
            if (inlinePart.startsWith('`') && inlinePart.endsWith('`')) {
              return <code key={`${i}-${j}`}>{inlinePart.slice(1, -1)}</code>;
            }
            // 简单处理换行和列表
            const lines = inlinePart.split('\n');
            return lines.map((line, k) => {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                return <ul key={`${i}-${j}-${k}`}><li>{line.trim().slice(2)}</li></ul>;
              }
              if (/^\d+\.\s/.test(trimmedLine)) {
                return <ol key={`${i}-${j}-${k}`}><li>{trimmedLine.replace(/^\d+\.\s/, '')}</li></ol>;
              }
              if (trimmedLine.startsWith('# ')) {
                return <strong key={`${i}-${j}-${k}`} style={{ display: 'block', fontSize: '16px', marginTop: '12px' }}>{trimmedLine.slice(2)}</strong>;
              }
              if (trimmedLine === '') {
                return <br key={`${i}-${j}-${k}`} />;
              }
              return <p key={`${i}-${j}-${k}`}>{line}</p>;
            });
          });
        })}
      </>
    );
  };

  return (
    <div className="chat-window">
      {/* 极简 Header */}
      <div className="chat-header">
        <h1>ChatGPT</h1>
        <button className="clear-btn" onClick={handleClearHistory}>
          清除对话
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>开始新对话</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message message-${msg.role}`}>
            <div className="message-avatar" />
            <div className="message-content">
              {msg.role === 'assistant' && !msg.content && loading ? (
                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                renderContent(msg.content)
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <div className="input-wrapper">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="发送消息..."
            disabled={loading}
            className="chat-input"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button type="submit" disabled={loading || !inputValue.trim()} className="send-btn" title="发送" />
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
