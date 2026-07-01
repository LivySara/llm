"""
内容摘要模块
基于 LLM 的内容摘要生成，针对不同文件类型的定制化摘要模板
"""

from typing import Dict, Any, List


def generate_summary_prompt(content: str, file_type: str, file_name: str) -> str:
    """
    生成摘要提示词
    
    Args:
        content: 文件内容
        file_type: 文件类型（python/markdown/json/yaml/text）
        file_name: 文件名
        
    Returns:
        str: 摘要提示词
    """
    # 根据文件类型生成不同的提示词
    if file_type == "python":
        prompt = f"""请为以下 Python 文件生成摘要。

文件名：{file_name}

文件内容：
```
{content}
```

请生成摘要，包括：
1. 文件功能描述（一句话）
2. 主要类/函数列表
3. 依赖的库
4. 关键信息（作者、创建日期等，如果有）

摘要：
"""
    
    elif file_type == "markdown":
        prompt = f"""请为以下 Markdown 文档生成摘要。

文件名：{file_name}

文档内容：
```
{content}
```

请生成摘要，包括：
1. 文档标题
2. 主要内容概述（一段话）
3. 关键要点（列表形式）
4. 标签（3-5个关键词）

摘要：
"""
    
    elif file_type == "json":
        prompt = f"""请为以下 JSON 文件生成摘要。

文件名：{file_name}

文件内容：
```
{content}
```

请生成摘要，包括：
1. JSON 结构描述（顶层键列表）
2. 主要用途推测
3. 关键字段说明

摘要：
"""
    
    elif file_type == "yaml":
        prompt = f"""请为以下 YAML 文件生成摘要。

文件名：{file_name}

文件内容：
```
{content}
```

请生成摘要，包括：
1. YAML 结构描述（顶层键列表）
2. 主要用途推测
3. 关键配置项说明

摘要：
"""
    
    else:  # text
        prompt = f"""请为以下文本文件生成摘要。

文件名：{file_name}

文件内容：
```
{content}
```

请生成摘要，包括：
1. 文件内容概述（一段话）
2. 关键要点（列表形式）
3. 标签（3-5个关键词）

摘要：
"""
    
    return prompt


def generate_summary(content: str, file_type: str, file_name: str, llm) -> Dict[str, Any]:
    """
    使用 LLM 生成摘要
    
    Args:
        content: 文件内容
        file_type: 文件类型
        file_name: 文件名
        llm: LangChain LLM 实例
        
    Returns:
        Dict[str, Any]: 摘要结果
            - success: 是否生成成功
            - summary: 摘要内容（成功时）
            - error: 错误信息（失败时）
    """
    result = {
        "success": False,
        "summary": None,
        "error": None,
    }
    
    try:
        # 生成摘要提示词
        prompt = generate_summary_prompt(content, file_type, file_name)
        
        # 调用 LLM
        response = llm.invoke(prompt)
        summary = response.content if hasattr(response, "content") else str(response)
        
        result["success"] = True
        result["summary"] = summary
        
    except Exception as e:
        result["error"] = f"LLM 调用失败: {str(e)}"
    
    return result


def format_summary_for_file(file_path: str, summary: str, validation_result: Dict[str, Any]) -> str:
    """
    格式化单个文件的摘要（用于汇总文件）
    
    Args:
        file_path: 文件路径
        summary: 摘要内容
        validation_result: 校验结果
        
    Returns:
        str: 格式化的摘要文本
    """
    from pathlib import Path
    
    file_name = Path(file_path).name
    
    text = f"""
## 文件：{file_name}

**路径**：`{file_path}`

"""
    
    # 添加校验信息
    if validation_result and not validation_result.get("is_valid", True):
        text += "**校验结果**：❌ 发现问题\n"
        issues = validation_result.get("issues", [])
        if issues:
            text += "**问题列表**：\n"
            for issue in issues:
                text += f"- {issue}\n"
        text += "\n"
    else:
        text += "**校验结果**：✅ 通过\n\n"
    
    # 添加摘要
    text += "**摘要**：\n\n"
    text += summary
    text += "\n\n---\n"
    
    return text


def combine_summaries(summaries: List[Dict[str, Any]]) -> str:
    """
    合并所有文件的摘要，生成汇总文件
    
    Args:
        summaries: 摘要列表，每个元素包含 file_path, summary, validation_result
        
    Returns:
        str: 合并后的汇总文本
    """
    # 生成标题
    text = "# 文档处理摘要汇总\n\n"
    text += f"**生成时间**：{__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    text += f"**文件数量**：{len(summaries)}\n\n"
    text += "---\n\n"
    
    # 添加每个文件的摘要
    for item in summaries:
        text += format_summary_for_file(
            file_path=item["file_path"],
            summary=item["summary"],
            validation_result=item.get("validation_result"),
        )
    
    return text
