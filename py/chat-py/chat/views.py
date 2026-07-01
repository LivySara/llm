from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import StreamingHttpResponse
from django.shortcuts import get_object_or_404
import uuid
import json
from .models import Conversation, Message
from .serializers import MessageSerializer, ConversationListSerializer, ConversationDetailSerializer
from .services import DeepSeekService


# ==================== 会话管理 API ====================

@api_view(['GET'])
def get_conversations(request):
    """获取会话列表"""
    try:
        conversations = Conversation.objects.all()
        serializer = ConversationListSerializer(conversations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def create_conversation(request):
    """创建新会话"""
    try:
        conversation_id = str(uuid.uuid4())
        title = request.data.get('title', '新对话')
        conversation = Conversation.objects.create(
            conversation_id=conversation_id,
            title=title
        )
        serializer = ConversationDetailSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_conversation(request, conversation_id):
    """获取指定会话详情（包含消息）"""
    try:
        conversation = get_object_or_404(Conversation, conversation_id=conversation_id)
        serializer = ConversationDetailSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
def rename_conversation(request, conversation_id):
    """重命名会话"""
    try:
        conversation = get_object_or_404(Conversation, conversation_id=conversation_id)
        title = request.data.get('title', '').strip()
        if not title:
            return Response(
                {'error': '标题不能为空'},
                status=status.HTTP_400_BAD_REQUEST
            )
        conversation.title = title
        conversation.save()
        serializer = ConversationListSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
def delete_conversation(request, conversation_id):
    """删除会话"""
    try:
        conversation = get_object_or_404(Conversation, conversation_id=conversation_id)
        conversation.delete()
        return Response({'status': 'success'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_conversation_messages(request, conversation_id):
    """获取指定会话的消息历史"""
    try:
        conversation = get_object_or_404(Conversation, conversation_id=conversation_id)
        messages = Message.objects.filter(conversation=conversation)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== 聊天 API ====================

def get_conversation_by_id(conversation_id):
    """根据 conversation_id 获取会话，不存在则返回 404"""
    if not conversation_id:
        raise ValueError("conversation_id 不能为空")
    return get_object_or_404(Conversation, conversation_id=conversation_id)


@api_view(['POST'])
def chat_message(request):
    """处理聊天消息（非流式）"""
    try:
        message_content = request.data.get('message', '').strip()
        conversation_id = request.data.get('conversation_id')
        
        if not message_content:
            return Response(
                {'error': '消息不能为空'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not conversation_id:
            return Response(
                {'error': 'conversation_id 不能为空'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 获取会话
        conversation = get_conversation_by_id(conversation_id)
        
        # 保存用户消息
        Message.objects.create(
            conversation=conversation,
            role='user',
            content=message_content
        )
        
        # 获取会话历史
        messages = Message.objects.filter(conversation=conversation).values('role', 'content')
        messages_list = [{'role': msg['role'], 'content': msg['content']} for msg in messages]
        
        # 调用 DeepSeek API
        service = DeepSeekService()
        ai_response = service.chat(messages_list)
        
        # 保存 AI 回复
        Message.objects.create(
            conversation=conversation,
            role='assistant',
            content=ai_response
        )
        
        # 更新会话标题（如果是第一条消息且标题为默认）
        if conversation.title == '新对话' and messages.count() <= 2:
            conversation.title = message_content[:20] + ('...' if len(message_content) > 20 else '')
            conversation.save()
        
        # 返回响应
        return Response({
            'id': str(uuid.uuid4()),
            'message': {
                'role': 'assistant',
                'content': ai_response
            },
            'status': 'success'
        }, status=status.HTTP_200_OK)
    
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'处理请求失败: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def chat_message_stream(request):
    """流式聊天接口 - 支持打字机效果 (SSE)"""
    try:
        message_content = request.data.get('message', '').strip()
        conversation_id = request.data.get('conversation_id')
        
        if not message_content:
            return Response(
                {'error': '消息不能为空'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not conversation_id:
            return Response(
                {'error': 'conversation_id 不能为空'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 获取会话
        conversation = get_conversation_by_id(conversation_id)
        
        # 保存用户消息
        Message.objects.create(
            conversation=conversation,
            role='user',
            content=message_content
        )
        
        # 获取会话历史
        messages = Message.objects.filter(conversation=conversation).values('role', 'content')
        messages_list = [{'role': msg['role'], 'content': msg['content']} for msg in messages]
        
        # 调用 DeepSeek API (流式)
        service = DeepSeekService()
        
        def generate():
            """生成 SSE 格式的流式响应"""
            full_content = []
            try:
                for chunk in service.chat_stream(messages_list):
                    full_content.append(chunk)
                    # SSE 格式: data: {json}\n\n
                    data = json.dumps({'content': chunk, 'done': False})
                    yield f"data: {data}\n\n"
                
                # 流式输出完成，保存完整消息到数据库
                complete_message = ''.join(full_content)
                Message.objects.create(
                    conversation=conversation,
                    role='assistant',
                    content=complete_message
                )
                
                # 更新会话标题（如果是第一条消息且标题为默认）
                if conversation.title == '新对话':
                    first_user_msg = Message.objects.filter(
                        conversation=conversation, 
                        role='user'
                    ).first()
                    if first_user_msg:
                        title = first_user_msg.content[:20] + ('...' if len(first_user_msg.content) > 20 else '')
                        conversation.title = title
                        conversation.save()
                
                # 发送完成信号
                done_data = json.dumps({'content': '', 'done': True})
                yield f"data: {done_data}\n\n"
            except Exception as e:
                error_data = json.dumps({'error': str(e)})
                yield f"data: {error_data}\n\n"
        
        response = StreamingHttpResponse(
            generate(),
            content_type='text/event-stream'
        )
        # SSE 必需头部
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        
        return response
        
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'处理请求失败: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def clear_history(request):
    """清除指定会话的历史"""
    try:
        conversation_id = request.data.get('conversation_id')
        
        if not conversation_id:
            return Response(
                {'error': 'conversation_id 不能为空'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        conversation = get_object_or_404(Conversation, conversation_id=conversation_id)
        conversation.messages.all().delete()
        
        return Response({'status': 'success'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def health_check(request):
    """健康检查"""
    return Response({'status': 'ok'}, status=status.HTTP_200_OK)
