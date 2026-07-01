"""
DeepSeek API 命令行聊天机器人
支持多轮对话、流式输出、对话历史管理
"""

import os
import sys
from openai import OpenAI, APIError
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()


def init_client() -> OpenAI:
    """初始化 OpenAI 客户端"""
    api_key = os.getenv("DEEPSEEK_API_KEY")
    base_url = os.getenv("DEEPSEEK_BASE_URL")

    if not api_key:
        raise ValueError("未找到 DEEPSEEK_API_KEY，请在 .env 文件中设置")
    
    client = OpenAI(
        api_key=api_key,
        base_url=base_url,
        timeout=60.0,
        max_retries=2,
    )
    return client


def print_welcome():
    """打印欢迎信息和使用说明"""
    print("=" * 60)
    print("🤖 DeepSeek AI 聊天机器人")
    print("=" * 60)
    print("\n💡 使用说明：")
    print("  • 直接输入问题即可开始聊天")
    print("  • /clear    清除对话历史")
    print("  • /history  查看对话历史")
    print("  • /help     显示帮助信息")
    print("  • /exit     退出程序")
    print("  • /quit     退出程序")
    print("\n" + "=" * 60 + "\n")


def print_help():
    """打印帮助信息"""
    print("\n📖 命令列表：")
    print("  /clear      - 清除所有对话历史，重新开始")
    print("  /history    - 显示当前对话历史")
    print("  /tokens     - 显示当前 token 使用统计")
    print("  /model      - 显示当前使用的模型")
    print("  /help       - 显示此帮助信息")
    print("  /exit       - 退出程序")
    print("  /quit       - 退出程序\n")


def print_history(messages: list):
    """打印对话历史"""
    if not messages:
        print("📭 对话历史为空\n")
        return
    
    print("\n📜 对话历史：")
    print("-" * 60)
    for i, msg in enumerate(messages, 1):
        role = "👤 用户" if msg["role"] == "user" else "🤖 助手"
        content = msg["content"][:100] + "..." if len(msg["content"]) > 100 else msg["content"]
        print(f"{i}. {role}: {content}")
    print("-" * 60 + "\n")


def chat_with_streaming(client: OpenAI, messages: list, model: str = "deepseek-chat"):
    """使用流式响应进行聊天"""
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            stream=True,
            temperature=0.7,
        )
        
        full_response = ""
        print("\n🤖 助手: ", end="", flush=True)
        
        for chunk in response:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                print(content, end="", flush=True)
                full_response += content
        
        print("\n")
        return full_response
        
    except APIError as e:
        print(f"\n❌ API 错误: {e.message}")
        print(f"   状态码: {e.status_code}\n")
        return None


def main():
    """主函数：交互式聊天循环"""
    # 初始化客户端
    try:
        client = init_client()
    except ValueError as e:
        print(f"❌ 错误: {e}")
        return
    
    print_welcome()
    
    # 初始化消息历史
    messages = [
        {
            "role": "system",
            "content": "你是一个有帮助的 AI 助手。请用中文回答问题，回答要简洁明了。"
        }
    ]
    
    total_tokens = 0
    model = "deepseek-v4-pro"
    
    # 聊天循环
    while True:
        try:
            # 获取用户输入
            user_input = input("👤 你: ").strip()
            
            if not user_input:
                continue
            
            # 处理特殊命令
            if user_input.startswith("/"):
                command = user_input.lower()
                
                if command in ["/exit", "/quit"]:
                    print("\n👋 再见！感谢使用 DeepSeek AI 聊天机器人")
                    break
                
                elif command == "/clear":
                    messages = [messages[0]]  # 保留 system prompt
                    total_tokens = 0
                    print("✅ 对话历史已清除\n")
                
                elif command == "/history":
                    print_history(messages[1:])  # 跳过 system prompt
                
                elif command == "/help":
                    print_help()
                
                elif command == "/tokens":
                    print(f"\n📊 Token 统计: {total_tokens}\n")
                
                elif command == "/model":
                    print(f"\n🔧 当前模型: {model}\n")
                
                else:
                    print("❓ 未知命令，输入 /help 查看可用命令\n")
                
                continue
            
            # 将用户消息添加到历史
            messages.append({
                "role": "user",
                "content": user_input
            })
            
            # 获取 AI 回复
            assistant_reply = chat_with_streaming(client, messages, model)
            
            if assistant_reply:
                # 将 AI 回复添加到历史
                messages.append({
                    "role": "assistant",
                    "content": assistant_reply
                })
                
                # 统计 tokens（简单估算：每个中文字符 ~1.3 token）
                total_tokens += len(user_input) + len(assistant_reply)
        
        except KeyboardInterrupt:
            print("\n\n👋 聊天已中断，再见！")
            break
        
        except APIError as e:
            print(f"\n❌ API 连接错误: {e.message}")
            print("   请检查 API Key 和网络连接\n")
        
        except Exception as e:
            print(f"\n❌ 发生错误: {e}\n")


if __name__ == "__main__":
    main()