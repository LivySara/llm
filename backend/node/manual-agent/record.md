# 第一阶段

## 跑通最小agent

- 对话、tools调用

终端输入
   ↓
LLM
   ↓
LLM 判断：要不要调用 Tool
   ↓
Tool Call
   ↓
你的 Node.js 代码真正执行 Tool
   ↓
Tool Result
   ↓
把 Tool Result 再交给 LLM
   ↓
LLM 生成最终回答
   ↓
终端输出

## 实现目标

① Tool Registry
- 工具函数列表、LLM使用工具列表定义统一管理
- 工具函数未考虑异步
- 工具函数执行失败该如何兜底
② Agent Loop
③ 多轮对话
④ 多个 Tool
⑤ Tool 参数校验
⑥ Tool 执行失败处理
⑦ 最大循环次数
⑧ 简单的 Agent Memory