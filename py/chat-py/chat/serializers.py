from rest_framework import serializers
from .models import Message, Conversation

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'timestamp']

class ConversationListSerializer(serializers.ModelSerializer):
    """会话列表序列化器（不包含消息，用于列表展示）"""
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'conversation_id', 'title', 'created_at', 'updated_at', 'message_count']
    
    def get_message_count(self, obj):
        return obj.messages.count()

class ConversationDetailSerializer(serializers.ModelSerializer):
    """会话详情序列化器（包含消息）"""
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['id', 'conversation_id', 'title', 'created_at', 'updated_at', 'messages']
