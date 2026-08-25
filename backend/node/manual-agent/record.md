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

## 2026-08-25：实现目标

① Tool Registry
- 工具函数列表、LLM使用工具列表定义统一管理
- 工具函数未考虑异步
- 工具函数执行失败该如何兜底
[注意]：类型 + Schema + Runtime 校验 尽量只维护一份定义
② Agent Loop
- 内层加一个while
③ 多轮对话
④ 多个 Tool
⑤ Tool 参数校验
- 参数名正确性
- 必填参数有无
- 类型正确性
- 参数值合法性
- schema 约束是否满足
⑥ Tool 执行失败处理
- 需要将失败的执行结果给LLM，不能直接中断agent运行
⑦ 最大循环次数
- max_steps 限制 单次agent 执行的安全上限
⑧ 简单的 Agent Memory


> tool 设计思想1：不要将第三方数据原封不动给LLM

- LLM-driven Planning / 动态任务分解
- 决策 & 执行分离

## 问题

- 若LLM无限调用Tool怎么办？
> 个人：记录每一个工具的被调用次数，最大取值是？LLM如何退出不再决策调用工具？
> 官方：防止LLM无限调用，max_steps（单次agent run 的安全上限, 防止 Agent 无限运行的保险丝，而不是限制正常任务复杂度的硬规则）；长任务应该拆成多个agent run，而不是无限增加max_steps
注意：【任务需要多少步】& 【防止无限循环】分开考虑

> agent 设计思想1：agent的能力不是【允许它无限思考】，而是在【自主决策】和 【运行约束】之间取得平衡

- 若有20个 tool，怎么保证schema & execute 的参数类型永远对应
> tool registry 优化：定义好每个tool元信息，自动生成toolRegistry

- 若tool后期变多，手写validate会变得麻烦
> 官方：给LLM的schema中parameters承担参数校验，json schema 自带校验配置

## 2026-08-26：实现目标

① Tool Error Recovery
② Tool Retry / Timeout
③ Tool Permission
④ Human-in-the-loop
⑤ Context / Memory
⑥ Planning
⑦ MCP