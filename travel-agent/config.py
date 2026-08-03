"""读取 .env 中的运行配置。"""
import os

from dotenv import load_dotenv

load_dotenv()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
MODEL = os.getenv("MODEL", "deepseek-chat")
SERVER_PATH = os.getenv("SERVER_PATH")

# Phase 3：支持同时连接多个 MCP server（逗号分隔）。
# 兼容旧配置：若只配了 SERVER_PATH，则当作单 server 使用。
SERVER_PATHS = [p.strip() for p in os.getenv("SERVER_PATHS", "").split(",") if p.strip()]
if not SERVER_PATHS and SERVER_PATH:
    SERVER_PATHS = [SERVER_PATH]

if not DEEPSEEK_API_KEY or DEEPSEEK_API_KEY.startswith("sk-xxxx"):
    raise RuntimeError("请在 .env 中配置真实的 DEEPSEEK_API_KEY")
if not SERVER_PATHS:
    raise RuntimeError("请在 .env 中配置 SERVER_PATHS（逗号分隔的多个 mcp server.py 绝对路径），或配置 SERVER_PATH")
