import React, { useState, useEffect, useCallback } from 'react';
import { List, Button, Input, Modal, message } from 'antd';
import {
  getConversations,
  createConversation,
  renameConversation,
  deleteConversation,
  Conversation,
} from '../services/api';
import './ConversationSidebar.css';

interface ConversationSidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onConversationDeleted: (conversationId: string) => void;
  onConversationRenamed: () => void;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onConversationDeleted,
  onConversationRenamed,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // 加载会话列表
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      message.error('加载会话列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 创建新会话
  const handleNewConversation = async () => {
    try {
      await createConversation();
      await loadConversations();
      onNewConversation();
    } catch (err) {
      message.error('创建会话失败');
    }
  };

  // 删除会话
  const handleDelete = (conversationId: string, title: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除会话"${title}"吗？`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteConversation(conversationId);
          message.success('删除成功');
          if (conversationId === activeConversationId) {
            onConversationDeleted(conversationId);
          }
          await loadConversations();
        } catch (err) {
          message.error('删除失败');
        }
      },
    });
  };

  // 开始重命名
  const handleStartRename = (conversation: Conversation) => {
    setRenamingId(conversation.conversation_id);
    setRenameValue(conversation.title);
  };

  // 确认重命名
  const handleConfirmRename = async () => {
    if (!renamingId || !renameValue.trim()) return;

    try {
      await renameConversation(renamingId, renameValue.trim());
      setRenamingId(null);
      setRenameValue('');
      await loadConversations();
      onConversationRenamed();
    } catch (err) {
      message.error('重命名失败');
    }
  };

  // 取消重命名
  const handleCancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  return (
    <div className="conversation-sidebar">
      <div className="sidebar-header">
        <h2>聊天助手</h2>
        <Button
          type="primary"
          icon={<span>+</span>}
          onClick={handleNewConversation}
          className="new-chat-btn"
        >
          新建对话
        </Button>
      </div>

      <div className="conversation-list">
        <List
          loading={loading}
          dataSource={conversations}
          renderItem={(conversation) => (
            <List.Item
              className={`conversation-item ${
                conversation.conversation_id === activeConversationId ? 'active' : ''
              }`}
              onClick={() => onSelectConversation(conversation.conversation_id)}
            >
              {renamingId === conversation.conversation_id ? (
                <div className="rename-container" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onPressEnter={handleConfirmRename}
                    autoFocus
                    size="small"
                  />
                  <div className="rename-actions">
                    <Button
                      type="text"
                      size="small"
                      onClick={handleConfirmRename}
                    >
                      ✓
                    </Button>
                    <Button
                      type="text"
                      size="small"
                      onClick={handleCancelRename}
                    >
                      ✗
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="conversation-info">
                  <div className="conversation-title">
                    {conversation.title || '新对话'}
                  </div>
                  <div className="conversation-actions">
                    <Button
                      type="text"
                      size="small"
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRename(conversation);
                      }}
                    >
                      重命名
                    </Button>
                    <Button
                      type="text"
                      size="small"
                      danger
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(conversation.conversation_id, conversation.title);
                      }}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              )}
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default ConversationSidebar;
