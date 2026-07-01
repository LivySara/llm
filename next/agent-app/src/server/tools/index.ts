import { DynamicTool } from "@langchain/core/tools";

/**
 * 获取当前时间的工具
 */
export const getCurrentTimeTool = new DynamicTool({
  name: "get_current_time",
  description: "获取当前的日期和时间。当用户询问时间、日期相关问题时使用此工具。",
  func: async () => {
    const now = new Date();
    return `当前时间是：${now.toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}`;
  },
});

/**
 * 简单计算器工具
 */
export const calculatorTool = new DynamicTool({
  name: "calculator",
  description: "执行数学计算。输入应该是一个数学表达式，例如 '100 * 2' 或 'sqrt(144)'。当需要计算数学表达式时使用此工具。",
  func: async (input: string) => {
    try {
      // 安全评估数学表达式（仅支持基本运算）
      const sanitized = input.replace(/[^0-9+\-*/().\s]/g, "");
      const result = Function(`"use strict"; return (${sanitized})`)();
      return `计算结果：${result}`;
    } catch {
      return "计算错误：无法解析数学表达式";
    }
  },
});

/**
 * 获取所有可用工具
 */
export const getTools = () => {
  return [getCurrentTimeTool, calculatorTool];
};
