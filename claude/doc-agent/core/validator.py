"""
内容校验模块
包括语法校验、格式校验和完整性校验
"""

import ast
import json
import re
from typing import List, Dict, Any, Optional


class ValidationResult:
    """校验结果"""
    def __init__(self, is_valid: bool = True):
        self.is_valid = is_valid
        self.issues: List[str] = []
        self.suggestions: List[str] = []
    
    def add_issue(self, issue: str, suggestion: Optional[str] = None):
        """添加问题"""
        self.issues.append(issue)
        if suggestion:
            self.suggestions.append(suggestion)
        self.is_valid = False
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "is_valid": self.is_valid,
            "issues": self.issues,
            "suggestions": self.suggestions,
        }


def validate_python(content: str) -> ValidationResult:
    """
    校验 Python 文件
    
    Args:
        content: 文件内容
        
    Returns:
        ValidationResult: 校验结果
    """
    result = ValidationResult()
    
    # 语法校验
    try:
        ast.parse(content)
    except SyntaxError as e:
        result.add_issue(
            f"Python 语法错误: {e.msg} (行 {e.lineno})",
            "请检查并修复语法错误"
        )
    
    # 格式校验：检查是否有文档字符串
    try:
        tree = ast.parse(content)
        if tree.body:
            # 检查模块级文档字符串
            first_node = tree.body[0]
            if not (isinstance(first_node, ast.Expr) and isinstance(first_node.value, ast.Str)):
                result.add_issue(
                    "缺少模块级文档字符串",
                    "请在文件开头添加文档字符串（docstring）"
                )
    except:
        pass
    
    # 完整性校验：检查是否有空函数/类定义
    try:
        tree = ast.parse(content)
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                if not node.body or (len(node.body) == 1 and isinstance(node.body[0], ast.Pass)):
                    result.add_issue(
                        f"空函数定义: {node.name} (行 {node.lineno})",
                        "请为函数添加实现或删除空函数"
                    )
    except:
        pass
    
    return result


def validate_json(content: str) -> ValidationResult:
    """
    校验 JSON 文件
    
    Args:
        content: 文件内容
        
    Returns:
        ValidationResult: 校验结果
    """
    result = ValidationResult()
    
    # 语法校验
    try:
        json.loads(content)
    except json.JSONDecodeError as e:
        result.add_issue(
            f"JSON 格式错误: {e.msg} (位置 {e.pos})",
            "请检查并修复 JSON 格式错误"
        )
    
    return result


def validate_yaml(content: str) -> ValidationResult:
    """
    校验 YAML 文件
    
    Args:
        content: 文件内容
        
    Returns:
        ValidationResult: 校验结果
    """
    result = ValidationResult()
    
    # 语法校验
    try:
        import yaml
        yaml.safe_load(content)
    except ImportError:
        result.add_issue(
            "缺少 PyYAML 库",
            "请安装 PyYAML: pip install PyYAML"
        )
    except yaml.YAMLError as e:
        result.add_issue(
            f"YAML 格式错误: {str(e)}",
            "请检查并修复 YAML 格式错误"
        )
    
    return result


def validate_markdown(content: str) -> ValidationResult:
    """
    校验 Markdown 文件
    
    Args:
        content: 文件内容
        
    Returns:
        ValidationResult: 校验结果
    """
    result = ValidationResult()
    
    # 格式校验：检查标题层级
    lines = content.split("\n")
    for i, line in enumerate(lines, 1):
        # 检查标题格式
        if line.startswith("#"):
            # 检查标题后是否有空格
            if not re.match(r"^#+\s", line):
                result.add_issue(
                    f"Markdown 标题格式错误 (行 {i}): {line[:20]}...",
                    "请在 # 后添加空格，例如：# 标题"
                )
    
    # 完整性校验：检查是否有标题
    if not re.search(r"^#\s", content, re.MULTILINE):
        result.add_issue(
            "Markdown 文件缺少一级标题",
            "请在文件开头添加一级标题，例如：# 文档标题"
        )
    
    return result


def validate_text(content: str) -> ValidationResult:
    """
    校验纯文本文件
    
    Args:
        content: 文件内容
        
    Returns:
        ValidationResult: 校验结果
    """
    result = ValidationResult()
    
    # 完整性校验：检查是否为空
    if not content.strip():
        result.add_issue(
            "文件内容为空",
            "请添加文件内容"
        )
    
    return result


def validate_content(content: str, file_type: str) -> ValidationResult:
    """
    根据文件类型校验内容
    
    Args:
        content: 文件内容
        file_type: 文件类型（python/markdown/json/yaml/text）
        
    Returns:
        ValidationResult: 校验结果
    """
    if file_type == "python":
        return validate_python(content)
    elif file_type == "json":
        return validate_json(content)
    elif file_type == "yaml":
        return validate_yaml(content)
    elif file_type == "markdown":
        return validate_markdown(content)
    elif file_type == "text":
        return validate_text(content)
    else:
        result = ValidationResult()
        result.add_issue(
            f"不支持的文件类型: {file_type}",
            "请使用支持的文件类型"
        )
        return result
