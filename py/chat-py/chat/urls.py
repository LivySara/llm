from django.urls import path
from . import views

urlpatterns = [
    # 会话管理 API
    path('conversations/', views.get_conversations, name='get_conversations'),
    path('conversations/create/', views.create_conversation, name='create_conversation'),
    path('conversations/<str:conversation_id>/', views.get_conversation, name='get_conversation'),
    path('conversations/<str:conversation_id>/rename/', views.rename_conversation, name='rename_conversation'),
    path('conversations/<str:conversation_id>/delete/', views.delete_conversation, name='delete_conversation'),
    path('conversations/<str:conversation_id>/messages/', views.get_conversation_messages, name='get_conversation_messages'),

    # 聊天 API
    path('chat/', views.chat_message, name='chat_message'),
    path('chat/stream/', views.chat_message_stream, name='chat_message_stream'),
    path('clear/', views.clear_history, name='clear_history'),
    path('health/', views.health_check, name='health_check'),
]
