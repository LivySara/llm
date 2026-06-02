import os
import uuid
import dotenv
from anthropic import Anthropic, APIError

# 加载.env文件中的环境变量
dotenv.load_dotenv()

# 校验API Key是否配置
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    raise ValueError(
        "未找到ANTHROPIC_API_KEY环境变量，请检查：\n"
        "1. 是否将.env.example重命名为.env\n"
        "2. 是否在.env中正确填写了API Key"
    )

# 读取中转站基础地址（可选，不配置则使用Anthropic官方默认地址）
base_url = os.getenv("ANTHROPIC_BASE_URL", None)

# 读取 User-Agent 配置（可选，未配置则使用默认值）
user_agent = os.getenv(
    "ANTHROPIC_USER_AGENT",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
)

# 初始化Anthropic客户端，传入base_url以适配中转站
client = Anthropic(
    api_key=api_key,
    base_url=base_url,
    default_headers={"User-Agent": user_agent}
)


def get_session_id() -> str:
    """获取 session_id：优先从环境变量读取，无配置时自动生成 UUID"""
    env_session_id = os.getenv("CLAUDE_SESSION_ID")
    if env_session_id:
        return env_session_id
    return str(uuid.uuid4())


def print_chunk_callback(text_chunk: str) -> None:
    """
    基础回调函数：实时打印流式返回的文本片段
    参数:
        text_chunk: 流式返回的单段文本片段
    """
    # flush=True 确保文本实时输出，不会缓存在缓冲区
    print(text_chunk, end="", flush=True)


def collect_chunk_callback(text_chunk: str) -> None:
    """
    收集型回调函数：将流式返回的文本片段收集到全局列表中
    注意：调用前需要先初始化 `collect_chunk_callback.collected_text = []`
    参数:
        text_chunk: 流式返回的单段文本片段
    """
    collect_chunk_callback.collected_text.append(text_chunk)


def stream_claude_with_callback(
    prompt: str,
    callbacks: list = None,
    model: str = "claude-haiku-4-5-20251001",
    max_tokens: int = 1024,
    session_id: str = None
) -> str:
    """
    带回调的Claude流式调用函数
    参数:
        prompt: 用户输入的提示词
        callbacks: 回调函数列表，每个函数接收单个文本片段作为参数，默认为实时打印回调
        model: 使用的Claude模型名，默认使用haiku（成本低、速度快，易访问）
        max_tokens: 最大生成token数，默认1024
        session_id: 会话ID，用于中转站追踪会话，为None时自动获取
    返回:
        完整拼接的响应文本，若调用失败返回None
    """
    # 设置默认回调函数
    if callbacks is None:
        callbacks = [print_chunk_callback]

    # 获取最终的 session_id
    final_session_id = session_id if session_id else get_session_id()

    # 构造请求参数
    extra_params = {}
    if final_session_id:
        extra_params["metadata"] = {"session_id": final_session_id}

    full_text_parts = []
    try:
        # 使用stream上下文管理器，自动处理流的开启和关闭
        with client.messages.stream(
            model=model,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
            **extra_params
        ) as stream:
            # 遍历流式返回的文本片段
            for text_chunk in stream.text_stream:
                # 执行所有注册的回调函数
                for callback in callbacks:
                    callback(text_chunk)
                # 收集文本片段用于后续拼接完整响应
                full_text_parts.append(text_chunk)

        # 流式输出完成后换行，避免后续输出粘连
        print()
        # 拼接所有文本片段为完整响应
        return "".join(full_text_parts)

    except APIError as e:
        print(f"Claude API调用错误: {e}")
        return None
    except Exception as e:
        print(f"调用过程发生未知错误: {e}")
        return None


def sync_claude_call(
    prompt: str,
    model: str = "claude-haiku-4-5-20251001",
    max_tokens: int = 1024,
    session_id: str = None
) -> str:
    """
    同步调用Claude API（阻塞式，等待完整响应后返回）
    参数:
        prompt: 用户输入的提示词
        model: 使用的Claude模型名
        max_tokens: 最大生成token数
        session_id: 会话ID，用于中转站追踪会话，为None时自动获取
    返回:
        完整响应文本，若调用失败返回None
    """
    # 获取最终的 session_id
    final_session_id = session_id if session_id else get_session_id()

    # 构造请求参数
    extra_params = {}
    if final_session_id:
        extra_params["metadata"] = {"session_id": final_session_id}

    try:
        message = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
            **extra_params
        )
        return message.content[0].text
    except APIError as e:
        print(f"Claude API调用错误: {e}")
        return None
    except Exception as e:
        print(f"调用过程发生未知错误: {e}")
        return None


def main():
    # 测试提示词
    test_prompt = "请用100字左右的英文简洁介绍Python的核心特点"

    print("="*50)
    print("示例1：流式调用 + 实时打印回调（默认回调）")
    print("="*50)
    stream_claude_with_callback(test_prompt)

    # print("\n" + "="*50)
    # print("示例2：流式调用 + 收集文本回调（后续统一处理）")
    # print("="*50)
    # # 初始化收集列表
    # collect_chunk_callback.collected_text = []
    # # 传入收集型回调
    # full_response = stream_claude_with_callback(
    #     prompt=test_prompt,
    #     callbacks=[collect_chunk_callback]
    # )
    # if full_response:
    #     print("收集到的完整响应内容：")
    #     print(full_response)

    # print("\n" + "="*50)
    # print("示例3：同步调用对比（阻塞式，等待完整响应）")
    # print("="*50)
    # sync_response = sync_claude_call(test_prompt)
    # if sync_response:
    #     print("同步调用完整响应内容：")
    #     print(sync_response)


if __name__ == "__main__":
    main()