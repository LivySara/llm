"""
LLM 工厂模块
支持切换不同 API 提供商（DeepSeek / OpenAI）
"""

import os
from typing import Optional

from langchain_openai import ChatOpenAI
from langchain_core.language_models.base import BaseLLM


def create_llm(
    provider: str = "deepseek",
    model: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: Optional[int] = None,
    **kwargs
) -> ChatOpenAI:
    """
    创建 LLM 实例
    
    Args:
        provider: API 提供商（"deepseek" 或 "openai"）
        model: 模型名称（如果为 None 则使用默认模型）
        temperature: 温度参数（控制随机性）
        max_tokens: 最大 token 数
        **kwargs: 其他参数
        
    Returns:
        ChatOpenAI: LangChain LLM 实例
        
    Raises:
        ValueError: 不支持的 provider
        EnvironmentError: 缺少必要的 API Key
    """
    if provider == "deepseek":
        # 使用 ChatOpenAI 兼容接口调用 DeepSeek
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            raise EnvironmentError("缺少 DEEPSEEK_API_KEY 环境变量，请在 .env 文件中配置")
        
        api_base = os.getenv("DEEPSEEK_API_BASE", "https://api.deepseek.com")
        model = model or os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
        
        return ChatOpenAI(
            model=model,
            openai_api_key=api_key,
            openai_api_base=api_base,
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs
        )
    
    elif provider == "openai":
        # 使用 OpenAI 原生接口
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise EnvironmentError("缺少 OPENAI_API_KEY 环境变量，请在 .env 文件中配置")
        
        api_base = os.getenv("OPENAI_API_BASE") or None
        model = model or os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        
        return ChatOpenAI(
            model=model,
            openai_api_key=api_key,
            openai_api_base=api_base,
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs
        )
    
    else:
        raise ValueError(f"不支持的 provider: {provider}，请使用 'deepseek' 或 'openai'")


def create_llm_from_settings(settings) -> ChatOpenAI:
    """
    从配置对象创建 LLM 实例
    
    Args:
        settings: Settings 配置对象
        
    Returns:
        ChatOpenAI: LangChain LLM 实例
    """
    return create_llm(
        provider=settings.llm.provider,
        temperature=0.3,
    )
