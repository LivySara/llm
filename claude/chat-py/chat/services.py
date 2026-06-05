import os
from openai import OpenAI
from django.conf import settings

class DeepSeekService:
    """DeepSeek AI 服务"""
    
    def __init__(self):
        self.api_key = settings.DEEPSEEK_API_KEY
        self.base_url = settings.DEEPSEEK_BASE_URL
        self.model = settings.DEEPSEEK_MODEL
        
        if not self.api_key:
            raise ValueError("DEEPSEEK_API_KEY environment variable not set")
        
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
            timeout=60.0,
            max_retries=2
        )
    
    def chat(self, messages: list[dict]) -> str:
        """
        调用 DeepSeek API 获取对话回复
        
        Args:
            messages: 消息列表 [{"role": "user", "content": "..."}, ...]
        
        Returns:
            AI 生成的回复文本
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=2000,
            )
            
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"DeepSeek API 调用失败: {str(e)}")
    
    def chat_stream(self, messages: list[dict]):
        """
        调用 DeepSeek API 获取流式对话回复
        
        Args:
            messages: 消息列表
        
        Yields:
            文本块
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=2000,
                stream=True,
            )
            
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            raise Exception(f"DeepSeek API 流式调用失败: {str(e)}")
