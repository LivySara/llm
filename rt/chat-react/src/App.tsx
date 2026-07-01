import { useState, useEffect, useCallback } from 'react';
import ConversationSidebar from './components/ConversationSidebar';
import ChatWindow from './components/ChatWindow';
import { getConversations, createConversation, Conversation } from './services/api';
import './App.css';

function App() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // 加载会话列表
  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);

      // 如果没有活跃会话，选择第一个
      if (!activeConversationId && data.length > 0) {
        setActiveConversationId(data[0].conversation_id);
      }
    } catch (err) {
      console.error('加载会话列表失败:', err);
    }
  }, [activeConversationId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 选择会话
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  // 新建会话
  const handleNewConversation = async () => {
    try {
      const newConv = await createConversation();
      await loadConversations();
      setActiveConversationId(newConv.conversation_id);
    } catch (err) {
      console.error('创建会话失败:', err);
    }
  };

  // 会话被删除
  const handleConversationDeleted = (conversationId: string) => {
    if (conversationId === activeConversationId) {
      // 如果删除的是当前活跃会话，切换到第一个可用会话
      const remaining = conversations.filter(c => c.conversation_id !== conversationId);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].conversation_id);
      } else {
        setActiveConversationId(null);
      }
    }
  };

  return (
    <div className="app">
      <ConversationSidebar
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onConversationDeleted={handleConversationDeleted}
        onConversationRenamed={loadConversations}
      />
      <div className="main-content">
        {activeConversationId ? (
          <ChatWindow conversationId={activeConversationId} />
        ) : (
          <div className="empty-state">
            <h2>欢迎使用聊天助手</h2>
            <p>请选择已有对话或创建新对话</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
