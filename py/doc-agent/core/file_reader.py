"""
文件读取模块
支持多种文件类型读取和编码检测
"""

import os
from pathlib import Path
from typing import List, Optional, Dict, Any


# 支持的文件扩展名
SUPPORTED_EXTENSIONS = {
    ".md": "markdown",
    ".py": "python",
    ".txt": "text",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml",
}


def detect_encoding(file_path: str, default_encoding: str = "utf-8") -> str:
    """
    检测文件编码
    
    Args:
        file_path: 文件路径
        default_encoding: 默认编码
        
    Returns:
        str: 检测到的编码
    """
    # 尝试常见编码
    encodings = ["utf-8", "gbk", "gb2312", "latin-1"]
    
    for encoding in encodings:
        try:
            with open(file_path, "r", encoding=encoding) as f:
                f.read()
                return encoding
        except (UnicodeDecodeError, UnicodeError):
            continue
    
    # 如果所有编码都失败，返回默认编码
    return default_encoding


def read_file(file_path: str) -> Dict[str, Any]:
    """
    读取文件内容
    
    Args:
        file_path: 文件路径
        
    Returns:
        Dict[str, Any]: 包含文件信息的字典
            - success: 是否读取成功
            - content: 文件内容（成功时）
            - error: 错误信息（失败时）
            - file_path: 文件路径
            - file_type: 文件类型
            - encoding: 检测到的编码
    """
    result = {
        "success": False,
        "content": None,
        "error": None,
        "file_path": file_path,
        "file_type": None,
        "encoding": None,
    }
    
    # 检查文件是否存在
    if not os.path.exists(file_path):
        result["error"] = f"文件不存在: {file_path}"
        return result
    
    # 检查文件扩展名
    ext = Path(file_path).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        result["error"] = f"不支持的文件类型: {ext}"
        return result
    
    result["file_type"] = SUPPORTED_EXTENSIONS[ext]
    
    # 检测编码并读取文件
    try:
        encoding = detect_encoding(file_path)
        result["encoding"] = encoding
        
        with open(file_path, "r", encoding=encoding) as f:
            content = f.read()
        
        result["success"] = True
        result["content"] = content
        
    except Exception as e:
        result["error"] = f"读取文件失败: {str(e)}"
    
    return result


def scan_directory(input_dir: str, recursive: bool = False) -> List[str]:
    """
    扫描目录，获取所有支持的文件路径
    
    Args:
        input_dir: 输入目录路径
        recursive: 是否递归扫描子目录
        
    Returns:
        List[str]: 文件路径列表
    """
    input_path = Path(input_dir)
    
    if not input_path.exists():
        raise FileNotFoundError(f"目录不存在: {input_dir}")
    
    if not input_path.is_dir():
        raise NotADirectoryError(f"不是目录: {input_dir}")
    
    file_paths = []
    
    if recursive:
        # 递归扫描
        for file_path in input_path.rglob("*"):
            if file_path.is_file() and file_path.suffix.lower() in SUPPORTED_EXTENSIONS:
                file_paths.append(str(file_path))
    else:
        # 只扫描当前目录
        for file_path in input_path.iterdir():
            if file_path.is_file() and file_path.suffix.lower() in SUPPORTED_EXTENSIONS:
                file_paths.append(str(file_path))
    
    # 按文件名排序
    file_paths.sort()
    
    return file_paths


def get_file_info(file_path: str) -> Dict[str, Any]:
    """
    获取文件基本信息
    
    Args:
        file_path: 文件路径
        
    Returns:
        Dict[str, Any]: 文件信息
    """
    path = Path(file_path)
    
    return {
        "file_name": path.name,
        "file_extension": path.suffix.lower(),
        "file_size": path.stat().st_size if path.exists() else 0,
        "file_path": str(path.resolve()),
    }
