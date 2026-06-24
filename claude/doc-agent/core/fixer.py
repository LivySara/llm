"""
内容修正模块
基于 LLM 的智能修正建议生成，支持差异化对比
"""

import difflib
from typing import Dict, Any, Optional


def generate_fix_prompt(content: str, file_type: str, issues: list) -> str:
    """
    生成修正提示词
    
    Args:
        content: 原始文件内容
        file_type: 文件类型（python/markdown/json/yaml/text）
        issues: 发现的问题列表
        
    Returns:
        str: 修正提示词
    """
    issues_text = "\n".join([f"- {issue}" for issue in issues])
    
    prompt = f"""请修正以下{file_type}文件的内容。

发现的问题：
{issues_text}

原始内容：
```
{content}
```

要求：
1. 修复所有发现的问题
2. 保持原有内容和结构
3. 只输出修正后的完整内容，不要添加任何解释或说明
4. 确保修正后的内容是完整的、可运行的

修正后的内容：
"""
    
    return prompt


def fix_content_with_llm(content: str, file_type: str, issues: list, llm) -> Dict[str, Any]:
    """
    使用 LLM 修正内容
    
    Args:
        content: 原始文件内容
        file_type: 文件类型
        issues: 发现的问题列表
        llm: LangChain LLM 实例
        
    Returns:
        Dict[str, Any]: 修正结果
            - success: 是否修正成功
            - fixed_content: 修正后的内容（成功时）
            - error: 错误信息（失败时）
    """
    result = {
        "success": False,
        "fixed_content": None,
        "error": None,
    }
    
    try:
        # 生成修正提示词
        prompt = generate_fix_prompt(content, file_type, issues)
        
        # 调用 LLM
        response = llm.invoke(prompt)
        fixed_content = response.content if hasattr(response, "content") else str(response)
        
        # 清理 LLM 输出（移除可能的代码块标记）
        fixed_content = clean_llm_output(fixed_content)
        
        result["success"] = True
        result["fixed_content"] = fixed_content
        
    except Exception as e:
        result["error"] = f"LLM 调用失败: {str(e)}"
    
    return result


def clean_llm_output(output: str) -> str:
    """
    清理 LLM 输出，移除代码块标记
    
    Args:
        output: LLM 输出
        
    Returns:
        str: 清理后的内容
    """
    # 移除 ```python、```json 等代码块标记
    import re
    output = re.sub(r"^```\w*\s*\n", "", output)
    output = re.sub(r"\n```\s*$", "", output)
    
    return output.strip()


def show_diff(original_content: str, fixed_content: str, file_path: str = "") -> str:
    """
    显示原始内容和修正内容的差异
    
    Args:
        original_content: 原始内容
        fixed_content: 修正后的内容
        file_path: 文件路径（用于显示）
        
    Returns:
        str: 差异对比文本
    """
    original_lines = original_content.splitlines(keepends=True)
    fixed_lines = fixed_content.splitlines(keepends=True)
    
    diff = difflib.unified_diff(
        original_lines,
        fixed_lines,
        fromfile=f"原始: {file_path}",
        tofile=f"修正后: {file_path}",
        lineterm="",
    )
    
    return "".join(diff)


def confirm_fix(file_path: str, original_content: str, fixed_content: str) -> bool:
    """
    显示差异并确认是否应用修正
    
    Args:
        file_path: 文件路径
        original_content: 原始内容
        fixed_content: 修正后的内容
        
    Returns:
        bool: 是否确认应用修正
    """
    # 显示差异
    diff_text = show_diff(original_content, fixed_content, file_path)
    
    if not diff_text:
        print("  ✓ 没有差异，无需修正")
        return False
    
    print("\n--- 修正建议（差异对比）---")
    print(diff_text)
    print("--- 结束 ---\n")
    
    # 确认
    while True:
        choice = input("是否应用修正？(y/n): ").strip().lower()
        if choice in ["y", "yes", "是"]:
            return True
        elif choice in ["n", "no", "否"]:
            return False
        else:
            print("请输入 y/yes/是 或 n/no/否")
