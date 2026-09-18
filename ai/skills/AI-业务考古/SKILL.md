---
name: ai-business-archaeology
description: Use AI to understand a new project's real business by tracing backend code, APIs, business objects, workflows, state changes, database operations, and frontend pages. Activate when the user takes over an unfamiliar project and wants to understand what the system does, how users operate it, or how frontend behavior maps to backend business logic.
---

# AI Business Archaeology

## Purpose

Help the user build a **business map**, not merely understand code.

The final goal is for the user to explain:

- What problem the system solves
- Who uses it
- What users actually do
- What the core business objects are
- How those objects relate
- What the main business workflows are
- Which APIs implement those workflows
- How APIs flow through Controller/Router → Service/Domain → database
- Which business rules and state transitions exist
- How the frontend pages correspond to real business operations

## Core principle

Use this loop:

`Question → code evidence → explanation → user restates → AI checks`

Do not dump a large project explanation all at once.

Always prefer concrete evidence from files, functions, APIs, models, SQL, and call chains. Clearly mark uncertainty. Do not invent business meaning from filenames or class names alone.

## Workflow

Follow these stages progressively. Do not force all stages into one response.

### 1. Find the business entry points

First determine what the system actually does.

Ask the AI to identify:

- Main business problem
- User roles
- Main business modules
- Controller / Router entry points
- Important Service / Domain code
- Main database tables
- 3–5 representative business workflows

Prompt:

```text
我刚接手这个后端项目，我的目标不是学习代码，而是尽可能快速理解这个系统的真实业务。

请先不要大段介绍技术架构。

请从代码中寻找：
1. 系统主要解决什么业务问题？
2. 系统有哪些主要角色？
3. 后端有哪些主要业务模块？
4. 每个模块对应什么业务？
5. 哪些 Controller / Router 是业务入口？
6. 哪些 Service / Domain 类是真正的业务逻辑？
7. 涉及哪些核心数据库表？
8. 找出 3～5 条典型用户业务流程，并从接口入口一路追踪到数据库。

要求：
- 结论尽量引用具体代码文件和函数
- 不确定的地方明确标记
- 不要根据目录名称猜业务
- 优先分析真实代码调用关系
- 用简单中文解释
- 最后给出“业务模块 → API → Service → 数据表”的对应关系
```

### 2. Find core business objects

Look for business nouns rather than only technical components.

Examples:

- Project
- Environment
- Service
- Task
- Order
- Ticket
- User

For each important object determine:

- Real-world meaning
- Database table/model
- Important fields
- Relationships
- Create/read/update/delete entry points
- Important state fields

Prompt:

```text
请从后端代码中找出这个系统最重要的业务对象。

不要只根据类名判断。

对每个核心业务对象说明：
1. 它在业务上代表什么？
2. 对应哪些数据库表？
3. 有哪些重要字段？
4. 和其他业务对象是什么关系？
5. 创建、修改、删除、查询分别在哪里？

最后画出简单的业务关系图。

重点告诉我：如果我要理解这个系统，最应该先搞懂哪几个业务对象。
```

### 3. Find business actions and state transitions

Do not stop at CRUD.

Look for actions such as:

- Submit
- Approve
- Publish
- Deploy
- Execute
- Retry
- Cancel
- Close
- Roll back

Prompt:

```text
请不要按照 CRUD 给我介绍代码。

请从后端代码中寻找“业务动作”和“状态变化”。

请选择一个核心业务对象，完整追踪：

用户操作
→ API
→ Controller / Router
→ Service
→ 核心业务判断
→ 数据库操作
→ 状态变化

重点关注：
- if / else 中的业务判断
- status 字段
- 权限判断
- 前置条件
- 后置动作
- 异常情况
- 事务
- 消息队列 / 异步任务

不要只解释代码语法，要解释为什么业务上需要这样做。
```

### 4. Connect frontend to backend

For a frontend developer, explicitly connect:

`user action → page → API → backend business logic → database → UI result`

Prompt:

```text
我现在负责这个前端页面，请帮我把页面和后端业务串起来。

请找到：
1. 页面主要解决什么业务？
2. 页面有哪些用户操作？
3. 每个操作调用哪个 API？
4. API 对应哪个 Controller / Router？
5. 后端进入哪个 Service？
6. Service 做了哪些业务判断？
7. 查询或修改哪些数据库表？
8. 返回结果如何影响前端页面？
9. 页面有哪些业务规则需要特别注意？

重点解释业务，不要解释 Vue 语法。

最后用：
用户操作 → 页面 → API → Controller → Service → 数据库 → 业务结果
总结。
```

### 5. Trace one complete workflow

Only investigate one workflow at a time.

Example:

`创建 Service → API → Controller → Service → validation → DB → state change`

Prompt:

```text
现在不要泛泛介绍整个项目。

我们只研究这个业务流程：
【填写具体业务动作】

请从用户操作开始，一直追踪到数据库。

严格按照：
1. 用户做什么
2. 前端哪个页面
3. 调用了哪个 API
4. API 进入哪里
5. Controller 做什么
6. Service 做什么
7. 哪些地方存在业务判断
8. 查询了哪些数据
9. 修改了哪些数据
10. 最终业务状态发生什么变化

每一步尽量给出具体文件和函数。
如果调用链中有不确定的地方，明确标记。
不要跳步。
```

### 6. Extract business rules

Business meaning is often hidden inside conditions.

Look especially for:

- Preconditions
- Permissions
- Status restrictions
- Data relationships
- Duplicate-operation restrictions
- Transactions
- Concurrency
- Exceptions
- Retry logic
- Async processing

Prompt:

```text
请帮我从刚才的业务流程中找出所有业务规则。

重点寻找：
- 前置条件
- 状态限制
- 权限限制
- 数据关联限制
- 必填条件
- 重复操作限制
- 异常处理
- 事务
- 并发控制
- 异步任务
- 重试机制

对于每条规则说明：
1. 业务规则是什么？
2. 为什么需要？
3. 代码在哪里？
4. 如果没有这个规则，业务上可能发生什么？

不要只解释代码，要解释它对应的现实业务含义。
```

### 7. Let AI test the user's understanding

After explanation, stop explaining.

Ask one question at a time.

Prompt:

```text
根据我们刚才分析的代码，请不要继续给我讲。

现在你来考我。

一次只问我一个问题。

问题围绕真实业务，例如：
- 这个系统解决什么问题？
- Project 和 Environment 是什么关系？
- 为什么要先创建 Project？
- 创建 Service 前需要满足什么条件？
- 某个状态为什么不能直接修改？
- 这个 API 为什么需要这个参数？
- 这个操作会修改哪些数据？

我回答后：
1. 判断我的理解是否正确
2. 如果错误，指出具体错误
3. 给出对应代码证据
4. 再问下一题

不要考纯技术语法。
重点考察我是否真正理解业务。
```

### 8. Produce a one-page business map

At the end, compress the understanding.

Use:

```text
# 项目业务地图

## 1. 系统是什么
一句话说明系统解决什么问题。

## 2. 用户角色
- ...

## 3. 核心业务对象
- ...

## 4. 对象关系
...

## 5. 核心业务流程
...

## 6. 核心 API
| 业务动作 | API | 后端入口 | 数据表 |
|---|---|---|---|

## 7. 关键业务规则
1. ...
2. ...

## 8. 我负责的前端页面
页面：
对应业务：
涉及 API：
需要注意的业务规则：

## 9. 目前仍然不确定
- ...
```

## Operating rules

1. **One question at a time.** Avoid giant explanations.
2. **Evidence before conclusions.** Cite files/functions/API/table whenever possible.
3. **Backend first, frontend second.** Use backend logic to validate business meaning.
4. **Nouns first, verbs second.** Find business objects, then actions and state transitions.
5. **Do not confuse CRUD with business.** Business actions and rules are more informative.
6. **Do not assume understanding.** Use reverse questioning to verify it.
7. **Keep notes small.** Each resolved question should become one short business note.
8. **Always distinguish facts from hypotheses.** Mark uncertain conclusions explicitly.
9. **When the user is working on a specific page, prioritize that page's business flow rather than analyzing the entire repository.**
10. **If the repository is large, narrow the scope by module, route, API, business object, or page before tracing deeper.**

## Success criterion

The skill succeeds when the user can independently explain a real workflow in this form:

```text
用户为什么做这个操作
↓
这个操作解决什么业务问题
↓
涉及哪些业务对象
↓
前端哪个页面
↓
调用哪个 API
↓
后端经过哪些业务逻辑
↓
查询/修改哪些数据
↓
状态如何变化
↓
有哪些业务规则
```

The goal is not for the user to memorize the code. The goal is for the user to build a mental model of the business and use that model when developing, debugging, reviewing, or asking AI to modify code.
