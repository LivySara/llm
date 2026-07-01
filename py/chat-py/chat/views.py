from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import StreamingHttpResponse
import uuid
import json
from .models import Conversation, Message
from .serializers import MessageSerializer
from .services import DeepSeekService

CURRENT_CONVERSATION_ID = None

def get_or_create_conversation():
    """获取或创建当前会话"""
    global CURRENT_CONVERSATION_ID
    
    if not CURRENT_CONVERSATION_ID:
        CURRENT_CONVERSATION_ID = str(uuid.uuid4())
        Conversation.objects.get_or_create(conversation_id=CURRENT_CONVERSATION_ID)
    
    return Conversation.objects.get(conversation_id=CURRENT_CONVERSATION_ID)

@api_view(['POST'])
def chat_message(request):
    """处理聊天消息"""
    try:
        message_content = request.data.get('message', '').strip()
        
        if not message_content:
            return Response(
                {'error': '消息不能为空'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 获取或创建会话
        conversation = get_or_create_conversation()
        
        # 保存用户消息
        user_message = Message.objects.create(
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
        assistant_message = Message.objects.create(
            conversation=conversation,
            role='assistant',
            content=ai_response
        )
        
        # 返回响应
        return Response({
            'id': str(uuid.uuid4()),
            'message': {
                'role': 'assistant',
                'content': ai_response
            },
            'status': 'success'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': f'处理请求失败: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def chat_history(request):
    """获取聊天历史"""
    try:
        conversation = get_or_create_conversation()
        messages = Message.objects.filter(conversation=conversation)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def clear_history(request):
    """清除聊天历史"""
    try:
        global CURRENT_CONVERSATION_ID
        
        if CURRENT_CONVERSATION_ID:
            conversation = Conversation.objects.get(conversation_id=CURRENT_CONVERSATION_ID)
            conversation.delete()
            CURRENT_CONVERSATION_ID = None
        
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


@api_view(['POST'])
def chat_message_stream(request):
    """流式聊天接口 - 支持打字机效果 (SSE)"""
    try:
        message_content = request.data.get('message', '').strip()
        
        if not message_content:
            return Response(
                {'error': '消息不能为空'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 获取或创建会话
        conversation = get_or_create_conversation()
        
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
        # response['Connection'] = 'keep-alive'
        
        return response
        
    except Exception as e:
        return Response(
            {'error': f'处理请求失败: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
