"""
输出写入模块
支持修正内容写回和摘要汇总文件生成
"""

import os
from pathlib import Path
from typing import List, Dict, Any, Optional


def write_fixed_file(
    original_file_path: str,
    fixed_content: str,
    output_dir: Optional[str] = None,
    suffix: str = ".fixed"
) -> Dict[str, Any]:
    """
    将修正后的内容写入新文件（不覆盖原文件）
    
    Args:
        original_file_path: 原始文件路径
        fixed_content: 修正后的内容
        output_dir: 输出目录（如果为 None 则与原文件同目录）
        suffix: 文件名后缀（如 .fixed）
        
    Returns:
        Dict[str, Any]: 写入结果
            - success: 是否写入成功
            - output_path: 输出文件路径（成功时）
            - error: 错误信息（失败时）
    """
    result = {
        "success": False,
        "output_path": None,
        "error": None,
    }
    
    try:
        original_path = Path(original_file_path)
        
        # 确定输出路径
        if output_dir:
            output_dir_path = Path(output_dir)
            output_dir_path.mkdir(parents=True, exist_ok=True)
            output_path = output_dir_path / f"{original_path.stem}{suffix}{original_path.suffix}"
        else:
            output_path = original_path.parent / f"{original_path.stem}{suffix}{original_path.suffix}"
        
        # 写入文件
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(fixed_content)
        
        result["success"] = True
        result["output_path"] = str(output_path)
        
    except Exception as e:
        result["error"] = f"写入文件失败: {str(e)}"
    
    return result


def write_summary_file(
    summary_content: str,
    output_dir: str,
    filename: str = "summary.md"
) -> Dict[str, Any]:
    """
    将摘要写入汇总文件
    
    Args:
        summary_content: 摘要内容
        output_dir: 输出目录
        filename: 文件名
        
    Returns:
        Dict[str, Any]: 写入结果
    """
    result = {
        "success": False,
        "output_path": None,
        "error": None,
    }
    
    try:
        output_dir_path = Path(output_dir)
        output_dir_path.mkdir(parents=True, exist_ok=True)
        
        output_path = output_dir_path / filename
        
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(summary_content)
        
        result["success"] = True
        result["output_path"] = str(output_path)
        
    except Exception as e:
        result["error"] = f"写入摘要文件失败: {str(e)}"
    
    return result


def write_processing_report(
    processed_files: List[Dict[str, Any]],
    output_dir: str,
    filename: str = "processing_report.json"
) -> Dict[str, Any]:
    """
    将处理报告写入 JSON 文件
    
    Args:
        processed_files: 已处理文件列表
        output_dir: 输出目录
        filename: 文件名
        
    Returns:
        Dict[str, Any]: 写入结果
    """
    import json
    
    result = {
        "success": False,
        "output_path": None,
        "error": None,
    }
    
    try:
        output_dir_path = Path(output_dir)
        output_dir_path.mkdir(parents=True, exist_ok=True)
        
        output_path = output_dir_path / filename
        
        # 构建报告数据
        report = {
            "total_files": len(processed_files),
            "processed_files": processed_files,
        }
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        result["success"] = True
        result["output_path"] = str(output_path)
        
    except Exception as e:
        result["error"] = f"写入处理报告失败: {str(e)}"
    
    return result
