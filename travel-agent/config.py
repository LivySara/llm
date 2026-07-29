"""读取 .env 中的运行配置。"""
import os

from dotenv import load_dotenv

load_dotenv()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
MODEL = os.getenv("MODEL", "deepseek-chat")
SERVER_PATH = os.getenv("SERVER_PATH")

if not DEEPSEEK_API_KEY or DEEPSEEK_API_KEY.startswith("sk-xxxx"):
    raise RuntimeError("请在 .env 中配置真实的 DEEPSEEK_API_KEY")
if not SERVER_PATH:
    raise RuntimeError("请在 .env 中配置 SERVER_PATH（指向 mcp server.py 的绝对路径）")
