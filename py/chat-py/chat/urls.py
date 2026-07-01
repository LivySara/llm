from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.chat_message, name='chat_message'),
    path('chat/stream/', views.chat_message_stream, name='chat_message_stream'),
    path('history/', views.chat_history, name='chat_history'),
    path('clear/', views.clear_history, name='clear_history'),
    path('health/', views.health_check, name='health_check'),
]
