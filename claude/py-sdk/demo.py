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
from openai import OpenAI
from dotenv import load_dotenv

# 加载 .env 文件中的环境变量
load_dotenv()


def init_client() -> OpenAI:
    """初始化 OpenAI 客户端（使用 DeepSeek 的 OpenAI 兼容接口）"""
    api_key = os.getenv("DEEPSEEK_API_KEY")
    base_url = os.getenv("DEEPSEEK_BASE_URL")

    if not api_key:
        raise ValueError("未找到 DEEPSEEK_API_KEY，请在 .env 文件中设置")

    client = OpenAI(
        api_key=api_key,
        base_url=base_url,
    )
    return client


def basic_message_example(client: OpenAI):
    """示例1：基本消息调用（非流式）"""
    print("=" * 50)
    print("示例1：基本消息调用")
    print("=" * 50)

    response = client.chat.completions.create(
        model="deepseek-v4-pro",
        max_tokens=1000,
        messages=[
            {"role": "system", "content": "你是一个有帮助的助手。"},
            {"role": "user", "content": "你好，请介绍一下自己。"},
        ],
    )

    print("\n完整响应对象：")
    print(response)

    print("\n回复内容：")
    print(response.choices[0].message.content)


def streaming_example(client: OpenAI):
    """示例2：流式响应"""
    print("\n" + "=" * 50)
    print("示例2：流式响应")
    print("=" * 50)

    response = client.chat.completions.create(
        model="deepseek-v4-flash",  # 使用 flash 模型，响应更快
        max_tokens=1000,
        stream=True,  # 开启流式
        messages=[
            {"role": "user", "content": "请用流式方式介绍一下 Python 的优点。"},
        ],
    )

    print("\n流式回复：")
    for chunk in response:
        delta = chunk.choices[0].delta
        if delta and delta.content:
            print(delta.content, end="", flush=True)

    print("\n\n流式调用完成！")


def multi_turn_conversation_example(client: OpenAI):
    """示例3：多轮对话"""
    print("\n" + "=" * 50)
    print("示例3：多轮对话")
    print("=" * 50)

    messages = [
        {"role": "system", "content": "你是一个机器学习专家。"},
    ]

    # 第一轮对话
    messages.append({"role": "user", "content": "我想学习机器学习，应该从哪里开始？"})

    response = client.chat.completions.create(
        model="deepseek-v4-pro",
        max_tokens=1000,
        messages=messages,
    )

    assistant_reply = response.choices[0].message.content
    print(f"\n用户：{messages[-1]['content']}")
    print(f"\n助手：{assistant_reply}")

    # 将助手回复加入历史
    messages.append({"role": "assistant", "content": assistant_reply})

    # 第二轮对话
    messages.append({"role": "user", "content": "能推荐一些具体的学习资源吗？"})

    response = client.chat.completions.create(
        model="deepseek-v4-pro",
        max_tokens=1000,
        messages=messages,
    )

    print(f"\n用户：{messages[-1]['content']}")
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
        model="deepseek-v4-pro",
        max_tokens=1000,
        tools=tools,
        messages=[
            {"role": "user", "content": "北京今天天气怎么样？"},
        ],
    )

    message = response.choices[0].message

    print("\n模型响应：")
    print(f"内容：{message.content}")

    # 检查是否需要调用工具
    if message.tool_calls:
        for tool_call in message.tool_calls:
            print(f"\n工具调用：{tool_call.function.name}")
            print(f"参数：{tool_call.function.arguments}")

            # 模拟工具执行（实际应调用真实天气 API）
            if tool_call.function.name == "get_weather":
                import json
                args = json.loads(tool_call.function.arguments)
                tool_result = f"{args['city']}今天是晴天，温度 25°C"

                # 将工具调用结果返回给模型
                second_response = client.chat.completions.create(
                    model="deepseek-v4-pro",
                    max_tokens=1000,
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


def main():
    """主函数"""
    print("DeepSeek OpenAI 兼容接口调用示例")
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

    except Exception as e:
        print(f"\n发生错误：{e}")


if __name__ == "__main__":
    main()
