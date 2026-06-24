#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文档处理 Agent MVP - CLI 主程序
"""

import sys
import os
from pathlib import Path
from typing import List, Dict, Any

# 添加项目根目录到 Python 路径
project_root = Path(__file__).resolve().parent
sys.path.insert(0, str(project_root))

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.prompt import Confirm, Prompt
except ImportError:
    print("请先安装依赖：pip install rich")
    sys.exit(1)

from config.settings import get_settings
from utils.llm_factory import create_llm_from_settings
from core.file_reader import scan_directory, read_file
from core.validator import validate_content
from core.fixer import fix_content_with_llm, confirm_fix
from core.summarizer import generate_summary, combine_summaries
from core.writer import write_fixed_file, write_summary_file


console = Console()


def print_banner():
    """打印欢迎横幅"""
    banner = """
╔══════════════════════════════════════════════════════════════╗
║                    文档处理 Agent MVP                        ║
║              读取 → 校验 → 修正 → 摘要                    ║
╚══════════════════════════════════════════════════════════════╝
"""
    console.print(Panel(banner, style="bold blue"))


def select_llm_provider() -> str:
    """
    选择 LLM 提供商
    
    Returns:
        str: 选择的提供商（"deepseek" 或 "openai"）
    """
    console.print("\n[bold]步骤 1/4: 配置 LLM[/bold]")
    
    settings = get_settings()
    current = settings.llm.provider
    
    console.print(f"当前 LLM: [cyan]{current}[/cyan]")
    
    if Confirm.ask("是否切换?", default=False):
        provider = Prompt.ask(
            "选择 LLM 提供商",
            choices=["deepseek", "openai"],
            default="deepseek"
        )
        # 更新配置
        settings.llm.provider = provider
        console.print(f"已切换到: [cyan]{provider}[/cyan]")
    else:
        provider = current
    
    return provider


def get_input_directory() -> str:
    """
    获取输入目录路径
    
    Returns:
        str: 输入目录路径
    """
    console.print("\n[bold]步骤 2/4: 指定输入目录[/bold]")
    
    settings = get_settings()
    default_dir = settings.dir.input_dir
    
    input_dir = Prompt.ask("输入目录路径", default=default_dir)
    
    # 转换为绝对路径
    input_path = Path(input_dir)
    if not input_path.is_absolute():
        input_path = project_root / input_path
    
    if not input_path.exists():
        console.print(f"[red]错误：目录不存在: {input_path}[/red]")
        return get_input_directory()
    
    return str(input_path)


def scan_and_display_files(input_dir: str) -> List[str]:
    """
    扫描目录并显示文件列表
    
    Args:
        input_dir: 输入目录路径
        
    Returns:
        List[str]: 文件路径列表
    """
    console.print("\n[bold]步骤 3/4: 扫描文件[/bold]")
    
    try:
        file_paths = scan_directory(input_dir, recursive=False)
        
        if not file_paths:
            console.print("[yellow]警告：未发现支持的文件[/yellow]")
            console.print("支持的文件类型: .md, .py, .txt, .json, .yaml, .yml")
            return []
        
        # 显示文件列表
        table = Table(title="发现文件")
        table.add_column("序号", justify="center")
        table.add_column("文件名", style="cyan")
        table.add_column("路径", style="dim")
        
        for i, file_path in enumerate(file_paths, 1):
            file_name = Path(file_path).name
            table.add_row(str(i), file_name, file_path)
        
        console.print(table)
        console.print(f"[green]共发现 {len(file_paths)} 个文件[/green]")
        
        return file_paths
        
    except Exception as e:
        console.print(f"[red]扫描目录失败: {str(e)}[/red]")
        return []


def process_single_file(file_path: str, llm, output_dir: str) -> Dict[str, Any]:
    """
    处理单个文件
    
    Args:
        file_path: 文件路径
        llm: LLM 实例
        output_dir: 输出目录
        
    Returns:
        Dict[str, Any]: 处理结果
    """
    file_name = Path(file_path).name
    console.print(Panel(f"处理文件: [cyan]{file_name}[/cyan]", style="dim"))
    
    result = {
        "file_path": file_path,
        "file_name": file_name,
        "success": False,
        "fixed": False,
        "summary": None,
        "error": None,
    }
    
    try:
        # 步骤 1: 读取文件
        console.print("  [bold]步骤 1/4: 读取文件...[/bold]", end="")
        read_result = read_file(file_path)
        
        if not read_result["success"]:
            console.print(f"[red]✗[/red]")
            console.print(f"  [red]错误: {read_result['error']}[/red]")
            result["error"] = read_result["error"]
            return result
        
        console.print("[green]✓[/green]")
        
        content = read_result["content"]
        file_type = read_result["file_type"]
        
        # 步骤 2: 校验内容
        console.print("  [bold]步骤 2/4: 校验内容...[/bold]")
        validation_result = validate_content(content, file_type)
        
        if validation_result["issues"]:
            console.print(f"  [yellow]发现 {len(validation_result['issues'])} 个问题:[/yellow]")
            for issue in validation_result["issues"]:
                console.print(f"    - [yellow]{issue}[/yellow]")
        else:
            console.print("  [green]✓ 校验通过[/green]")
        
        # 步骤 3: 修正内容（如果有问题）
        if not validation_result["is_valid"]:
            console.print("  [bold]步骤 3/4: 生成修正建议...[/bold]")
            
            fix_result = fix_content_with_llm(
                content=content,
                file_type=file_type,
                issues=validation_result["issues"],
                llm=llm
            )
            
            if fix_result["success"]:
                # 显示差异并确认
                confirmed = confirm_fix(
                    file_path=file_path,
                    original_content=content,
                    fixed_content=fix_result["fixed_content"]
                )
                
                if confirmed:
                    # 写入修正后的文件
                    write_result = write_fixed_file(
                        original_file_path=file_path,
                        fixed_content=fix_result["fixed_content"],
                        output_dir=output_dir
                    )
                    
                    if write_result["success"]:
                        console.print(f"  [green]✓ 修正已保存至: {write_result['output_path']}[/green]")
                        result["fixed"] = True
                    else:
                        console.print(f"  [red]✗ 写入失败: {write_result['error']}[/red]")
                else:
                    console.print("  [yellow]已跳过修正[/yellow]")
            else:
                console.print(f"  [red]✗ 修正失败: {fix_result['error']}[/red]")
        
        # 步骤 4: 生成摘要
        console.print("  [bold]步骤 4/4: 生成摘要...[/bold]", end="")
        summary_result = generate_summary(
            content=content,
            file_type=file_type,
            file_name=file_name,
            llm=llm
        )
        
        if summary_result["success"]:
            console.print("[green]✓[/green]")
            result["summary"] = summary_result["summary"]
        else:
            console.print(f"[red]✗[/red]")
            console.print(f"  [red]错误: {summary_result['error']}[/red]")
            result["error"] = summary_result["error"]
            return result
        
        result["success"] = True
        console.print("[green]处理完成[/green]")
        
    except Exception as e:
        console.print(f"[red]处理失败: {str(e)}[/red]")
        result["error"] = str(e)
    
    return result


def main():
    """主函数"""
    # 打印欢迎横幅
    print_banner()
    
    try:
        # 步骤 1: 配置 LLM
        provider = select_llm_provider()
        
        # 创建 LLM 实例
        console.print(f"\n正在初始化 LLM ({provider})...")
        settings = get_settings()
        settings.llm.provider = provider
        llm = create_llm_from_settings(settings)
        console.print("[green]✓ LLM 初始化成功[/green]")
        
        # 步骤 2: 指定输入目录
        input_dir = get_input_directory()
        console.print(f"输入目录: [cyan]{input_dir}[/cyan]")
        
        # 步骤 3: 扫描文件
        file_paths = scan_and_display_files(input_dir)
        
        if not file_paths:
            console.print("[yellow]没有文件需要处理[/yellow]")
            return
        
        # 确认开始处理
        if not Confirm.ask("\n是否开始处理?", default=True):
            console.print("[yellow]已取消[/yellow]")
            return
        
        # 步骤 4: 处理文件
        console.print("\n[bold]步骤 4/4: 开始处理[/bold]")
        console.print("-" * 50)
        
        processed_files = []
        summaries = []
        
        for file_path in file_paths:
            result = process_single_file(file_path, llm, input_dir)
            
            if result["success"]:
                processed_files.append(result)
                summaries.append({
                    "file_path": result["file_path"],
                    "summary": result["summary"],
                    "validation_result": None,  # 简化，实际应该传递
                })
            
            console.print("-" * 50)
        
        # 生成汇总文件
        if summaries:
            console.print("\n[bold]生成汇总文件...[/bold]")
            summary_content = combine_summaries(summaries)
            
            settings = get_settings()
            output_dir = str(settings.get_output_dir())
            summary_path = write_summary_file(
                summary_content=summary_content,
                output_dir=output_dir
            )
            
            if summary_path["success"]:
                console.print(f"[green]✓ 汇总文件已保存至: {summary_path['output_path']}[/green]")
            else:
                console.print(f"[red]✗ 保存汇总文件失败: {summary_path['error']}[/red]")
        
        # 打印处理统计
        console.print("\n[bold]处理完成！[/bold]")
        table = Table(title="处理统计")
        table.add_column("项目", style="bold")
        table.add_column("数量", justify="right", style="green")
        table.add_row("总文件数", str(len(file_paths)))
        table.add_row("成功处理", str(len(processed_files)))
        table.add_row("失败", str(len(file_paths) - len(processed_files)))
        console.print(table)
        
    except KeyboardInterrupt:
        console.print("\n[yellow]用户中断[/yellow]")
    except Exception as e:
        console.print(f"\n[red]程序异常: {str(e)}[/red]")
        import traceback
        console.print(traceback.format_exc())


if __name__ == "__main__":
    main()
