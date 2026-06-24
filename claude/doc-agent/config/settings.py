"""
配置管理模块
使用 python-dotenv 加载 .env 文件中的环境变量
"""

import os
from pathlib import Path
from typing import Optional


class LLMConfig:
    """LLM 配置"""
    def __init__(self):
        self.provider: str = "deepseek"
        self.deepseek_api_key: str = ""
        self.deepseek_model: str = "deepseek-chat"
        self.deepseek_api_base: str = "https://api.deepseek.com"
        self.openai_api_key: str = ""
        self.openai_model: str = "gpt-3.5-turbo"
        self.openai_api_base: Optional[str] = None


class DirConfig:
    """目录配置"""
    def __init__(self):
        self.input_dir: str = "samples/input"
        self.output_dir: str = "samples/output"
        self.summary_filename: str = "summary.md"


class AppConfig:
    """应用配置"""
    def __init__(self):
        self.verbose: bool = True
        self.max_iterations: int = 5


class Settings:
    """总配置类"""
    def __init__(self):
        self.llm = LLMConfig()
        self.dir = DirConfig()
        self.app = AppConfig()
    
    @classmethod
    def from_env(cls, env_path: Optional[str] = None) -> "Settings":
        """
        从环境变量加载配置
        
        Args:
            env_path: .env 文件路径，如果为 None 则自动查找
            
        Returns:
            Settings: 配置对象
        """
        # 加载 .env 文件
        if env_path is None:
            # 查找项目根目录下的 .env 文件
            current_file = Path(__file__).resolve()
            project_root = current_file.parent.parent
            env_path = str(project_root / ".env")
        
        if os.path.exists(env_path):
            from dotenv import load_dotenv
            load_dotenv(dotenv_path=env_path)
        
        settings = cls()
        
        # 加载 LLM 配置
        settings.llm.provider = os.getenv("LLM_PROVIDER", "deepseek")
        settings.llm.deepseek_api_key = os.getenv("DEEPSEEK_API_KEY", "")
        settings.llm.deepseek_model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
        settings.llm.deepseek_api_base = os.getenv("DEEPSEEK_API_BASE", "https://api.deepseek.com")
        settings.llm.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        settings.llm.openai_model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        settings.llm.openai_api_base = os.getenv("OPENAI_API_BASE") or None
        
        # 加载目录配置
        settings.dir.input_dir = os.getenv("INPUT_DIR", "samples/input")
        settings.dir.output_dir = os.getenv("OUTPUT_DIR", "samples/output")
        settings.dir.summary_filename = os.getenv("SUMMARY_FILENAME", "summary.md")
        
        # 加载应用配置
        settings.app.verbose = os.getenv("APP_VERBOSE", "true").lower() == "true"
        settings.app.max_iterations = int(os.getenv("MAX_ITERATIONS", "5"))
        
        return settings
    
    def get_input_dir(self) -> Path:
        """获取输入目录的绝对路径"""
        path = Path(self.dir.input_dir)
        if not path.is_absolute():
            # 相对于项目根目录
            current_file = Path(__file__).resolve()
            project_root = current_file.parent.parent
            path = project_root / path
        return path
    
    def get_output_dir(self) -> Path:
        """获取输出目录的绝对路径"""
        path = Path(self.dir.output_dir)
        if not path.is_absolute():
            # 相对于项目根目录
            current_file = Path(__file__).resolve()
            project_root = current_file.parent.parent
            path = project_root / path
        return path
    
    def get_summary_path(self) -> Path:
        """获取摘要文件的绝对路径"""
        return self.get_output_dir() / self.dir.summary_filename


# 全局配置实例（延迟加载）
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """
    获取全局配置实例（单例模式）
    
    Returns:
        Settings: 配置对象
    """
    global _settings
    if _settings is None:
        _settings = Settings.from_env()
    return _settings
