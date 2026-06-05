from django.contrib import admin
from .models import Conversation, Message

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['conversation_id', 'created_at', 'updated_at']
    search_fields = ['conversation_id']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'role', 'content', 'timestamp']
    list_filter = ['role', 'timestamp']
    search_fields = ['content']
    readonly_fields = ['timestamp']
