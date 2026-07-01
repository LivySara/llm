"""
DeepSeek OpenAI 兼容接口调用示例
根据 DeepSeek API 文档：https://api-docs.deepseek.com/

功能：
1. 基本消息调用
2. 流式响应
3. 多轮对话
4. 工具调用（Tool Use）
5. 思考模型（deepseek-reasoner）
"""

import os
import json
import asyncio
from openai import OpenAI, AsyncOpenAI, APIError
from dotenv import load_dotenv

# 加载 .env 文件中的环境变量
load_dotenv()


def init_client() -> OpenAI:
    """初始化 OpenAI 客户端（使用 DeepSeek 的 OpenAI 兼容接口）"""
    api_key = os.getenv("DEEPSEEK_API_KEY")
    base_url = os.getenv("DEEPSEEK_BASE_URL")

    if not api_key:
        raise ValueError("未找到 DEEPSEEK_API_KEY，请在 .env 文件中设置")
    
    # OpenAI() 不传入api_key和base_url时会自动从环境变量中读取
    client = OpenAI(
        api_key=api_key,
        base_url=base_url,
        timeout=60.0,  # 设置超时时间
        max_retries=2,  # 自动重试次数
    )
    return client


def init_async_client() -> AsyncOpenAI:
    """初始化异步客户端"""
    api_key = os.getenv("DEEPSEEK_API_KEY")
    base_url = os.getenv("DEEPSEEK_BASE_URL")

    if not api_key:
        raise ValueError("未找到 DEEPSEEK_API_KEY，请在 .env 文件中设置")
    
    client = AsyncOpenAI(
        api_key=api_key,
        base_url=base_url,
        timeout=60.0,
        max_retries=2,
    )
    return client


def basic_message_example(client: OpenAI):
    """示例1：基本消息调用（非流式）"""
    print("=" * 50)
    print("示例1：基本消息调用")
    print("=" * 50)

    # 使用 Chat Completions API（DeepSeek 支持）
    response = client.chat.completions.create(
        model="deepseek-v4-pro",
        messages=[
            {"role": "system", "content": "你是一个有帮助的助手。"},
            {"role": "user", "content": "你好，请介绍一下自己。"},
        ],
    )

    print("\n回复内容：")
    print(response.choices[0].message.content)
    print(f"\n使用的 tokens：{response.usage.total_tokens}")


def streaming_example(client: OpenAI):
    """示例2：流式响应"""
    print("\n" + "=" * 50)
    print("示例2：流式响应")
    print("=" * 50)

    print("\n流式回复：")
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "user", "content": "请用流式方式介绍一下 Python 的优点。"},
        ],
        stream=True,
    )
    for chunk in response:
        if chunk.choices[0].delta.content:
            print(chunk.choices[0].delta.content, end="", flush=True)

    print("\n\n流式调用完成！")


def multi_turn_conversation_example(client: OpenAI):
    """示例3：多轮对话（使用新 API）"""
    print("\n" + "=" * 50)
    print("示例3：多轮对话")
    print("=" * 50)

    # 新 API 使用 messages 参数进行多轮对话
    messages = [
        {"role": "system", "content": "你是一个机器学习专家。"},
    ]

    # 第一轮对话
    user_msg1 = "我想学习机器学习，应该从哪里开始？"
    messages.append({"role": "user", "content": user_msg1})

    response = client.chat.completions.create(
        model="deepseek-v4-pro",
        messages=messages,
    )

    assistant_reply = response.choices[0].message.content
    print(f"\n用户：{user_msg1}")
    print(f"\n助手：{assistant_reply}")

    # 将助手回复加入历史
    messages.append({"role": "assistant", "content": assistant_reply})

    # 第二轮对话
    user_msg2 = "能推荐一些具体的学习资源吗？"
    messages.append({"role": "user", "content": user_msg2})

    response = client.chat.completions.create(
        model="deepseek-v4-pro",
        messages=messages,
    )

    print(f"\n用户：{user_msg2}")
    print(f"\n助手：{response.choices[0].message.content}")


def tool_use_example(client: OpenAI):
    """示例4：工具调用（Tool Use）"""
    print("\n" + "=" * 50)
    print("示例4：工具调用")
    print("=" * 50)

    # 定义工具（OpenAI 格式）
    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "获取指定城市的天气信息",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "city": {
                            "type": "string",
                            "description": "城市名称，例如：北京、上海",
                        }
                    },
                    "required": ["city"],
                },
            },
        }
    ]

    # 第一次调用，让模型决定是否使用工具
    response = client.chat.completions.create(
        model="deepseek-chat",
        tools=tools,
        messages=[
            {"role": "user", "content": "北京今天天气怎么样？"},
        ],
    )

    message = response.choices[0].message

    print("\n模型响应：")
    if message.content:
        print(f"内容：{message.content}")

    # 检查是否需要调用工具
    if message.tool_calls:
        for tool_call in response.tool_calls:
            print(f"\n工具调用：{tool_call.function.name}")
            print(f"参数：{tool_call.function.arguments}")

            # 模拟工具执行（实际应调用真实天气 API）
            if tool_call.function.name == "get_weather":
                args = json.loads(tool_call.function.arguments)
                tool_result = f"{args['city']}今天是晴天，温度 25°C"

                # 将工具调用结果返回给模型
                second_response = client.chat.completions.create(
                    model="deepseek-chat",
                    tools=tools,
                    messages=[
                        {"role": "user", "content": "北京今天天气怎么样？"},
                        message.model_dump(),  # 助手的工具调用消息
                        {
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": tool_result,
                        },
                    ],
                )

                print(f"\n最终回复：{second_response.choices[0].message.content}")
    else:
        print("\n模型未调用工具，直接回复：")
        if message.content:
            print(message.content)


def reasoning_model_example(client: OpenAI):
    """示例5：思考模型（deepseek-reasoner）"""
    print("\n" + "=" * 50)
    print("示例5：思考模型（deepseek-reasoner）")
    print("=" * 50)

    response = client.chat.completions.create(
        model="deepseek-reasoner",
        messages=[
            {"role": "user", "content": "9.9 和 9.11 谁更大？请仔细思考。"},
        ],
    )

    message = response.choices[0].message

    # deepseek-reasoner 会返回 reasoning_content（思考过程）
    if hasattr(message, "reasoning_content") and message.reasoning_content:
        print("\n思考过程：")
        print(message.reasoning_content)

    print("\n最终回复：")
    print(message.content)


async def async_streaming_example(client: AsyncOpenAI):
    """示例6：异步流式响应（新特性）"""
    print("\n" + "=" * 50)
    print("示例6：异步流式响应")
    print("=" * 50)

    print("\n异步流式回复：")
    response = await client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "user", "content": "请用流式方式解释异步编程的概念。"},
        ],
        stream=True,
    )
    async for chunk in response:
        if chunk.choices[0].delta.content:
            print(chunk.choices[0].delta.content, end="", flush=True)

    print("\n\n异步流式调用完成！")


def main():
    """主函数"""
    print("DeepSeek OpenAI 兼容接口调用示例（最新 SDK v1.0+ 写法）")
    print("Base URL: https://api.deepseek.com")
    print("=" * 50)

    # 检查 API Key 是否设置
    if not os.getenv("DEEPSEEK_API_KEY"):
        print("\n错误：未设置 DEEPSEEK_API_KEY 环境变量")
        print("请在 .env 文件中添加：")
        print("  DEEPSEEK_API_KEY=your-deepseek-api-key")
        return

    # 初始化客户端
    client = init_client()

    try:
        # 运行示例（根据需要取消注释）
        basic_message_example(client)
        # streaming_example(client)
        # multi_turn_conversation_example(client)
        # tool_use_example(client)
        # reasoning_model_example(client)  # 需要 deepseek-reasoner 模型权限
        # asyncio.run(async_main())  # 运行异步示例

    except APIError as e:
        print(f"\nAPI 错误：{e.message}")
        print(f"状态码：{e.status_code}")
    except Exception as e:
        print(f"\n发生错误：{e}")
    finally:
        client.close()  # 关闭客户端连接


async def async_main():
    """异步主函数"""
    client = init_async_client()
    try:
        await async_streaming_example(client)
    finally:
        await client.close()


if __name__ == "__main__":
    main()
    # 或运行异步示例：asyncio.run(async_main())
