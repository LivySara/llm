# React 状态管理学习笔记

> 日期：2026-07-02
> 学习来源：React 官方文档
> 学习章节：用 State 响应输入、选择 State 结构

---

## 一、用 State 响应输入（Responding to input with State）

### 1.1 核心思想：UI 是状态的函数
React 的核心设计是 **UI = f(state)** —— 界面由状态推导而来，而不是直接去命令式地修改 DOM。

- 传统的命令式（jQuery 风格）：找到 DOM 节点 → 手动改它的文本/样式。
- React 的声明式：**给组件一个 state，根据 state 渲染 JSX**，剩下交给 React。

关键洞察：**state 和 DOM 是分离的**。你声明「当 state 是 X 时应该显示什么」，而不是「去把那个按钮改成禁用」。

### 1.2 何时需要 State（什么时候用 useState）
需要 state 的常见信号：
- 当数据随时间变化、且变化后界面需要重新渲染时。
- 例如：输入框内容、开关选中态、列表数据、计时器。

不需要 state 的情况：
- 直接从 props 计算出来的值（应该用「派生」而不是存一份 state）。
- 永远不变的值。
- 可以从已有 state 算出来的数据（冗余 state，见第二节）。

### 1.3 useState 基本用法
```tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0); // 0 是初始值
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```
- `useState` 返回一个数组：`[当前值, 设置函数]`。
- 解构命名约定：`[something, setSomething]`。

### 1.4 事件处理函数中更新 State
```tsx
<button onClick={() => setCount(count + 1)}>点击</button>
```
- 更新 state 只能通过 setter 函数，不能直接 `count++`。
- state 是只读的（immutable），每次更新都是产生新值。

### 1.5 重要概念：State 是一张快照（Snapshot）
- **调用 setter 不会立刻改变 state 变量，而是「安排」一次重新渲染**。
- 本次渲染中读到的 state，永远是当前这次渲染闭包里的值（快照）。
- 这就是为什么在事件处理函数里连续调用 `setCount(count + 1)` 三次，最终只 +1：
```tsx
// ❌ 三次都用的是同一个 count 快照，最终只 +1
setCount(count + 1);
setCount(count + 1);
setCount(count + 1);
```

### 1.6 排队多次更新：使用「更新函数」
如果想基于「上一次的 state」来更新，传入一个函数：
```tsx
// ✅ React 会把前一次结果传给下一次，依次累加
setCount(c => c + 1);
setCount(c => c + 1);
setCount(c => c + 1);
// 最终 +3
```
- 更新函数 `(c) => c + 1` 是**纯函数**：只接收旧值、返回新值，不依赖外部变量。
- React 会按顺序把它们放进队列，逐个执行。

### 1.7 对象与数组也要作为不可变数据更新
- state 里的对象/数组：永远不要直接 `obj.x = 1` 或 `arr.push(...)`。
- 要**创建新的**对象/数组再 set：
```tsx
// 对象
setForm({ ...form, name: 'Tom' });            // 展开 + 覆盖字段
// 数组
setList([...list, newItem]);                  // 追加
setList(list.filter(item => item.id !== id)); // 删除
setList(list.map(item => item.id === id ? { ...item, done: true } : item)); // 更新某项
```
- 嵌套深的更新用展开很啰嗦，这正是第二节「避免深层嵌套 state」要解决的。

---

## 二、选择 State 结构（Choosing the State Structure）

目标：让 state 既**最小**又**不矛盾**，减少 bug。

### 2.1 原则 1：把相关的 state 合并在一起
如果多个值总是一起变化，就把它们放进同一个对象/数组，而不是拆成多个 useState。
```tsx
// ❌ 分散
const [x, setX] = useState(0);
const [y, setY] = useState(0);
// ✅ 合并
const [position, setPosition] = useState({ x: 0, y: 0 });
```

### 2.2 原则 2：避免 state 之间互相矛盾（Contradictions）
不要把同一个事实用两种 state 表达，导致可能出现「两个都为真」的非法状态。
```tsx
// ❌ 矛盾：isSent=true 但 isSending=true 是非法组合
const [isSending, setIsSending] = useState(false);
const [isSent, setIsSent] = useState(false);
// ✅ 用一个 status 表达：'typing' | 'sending' | 'sent'
const [status, setStatus] = useState('typing');
```
- 单一字段的枚举，天然杜绝了非法组合。

### 2.3 原则 3：避免冗余的 state（Redundancy）
能从已有 state 或 props **计算出来**的值，就不要单独存一份 state，否则两份数据会「不同步」。
```tsx
// ❌ 冗余：fullName 可以从 firstName/lastName 算出来，却单独存了
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState(''); // 容易和前两个不同步
// ✅ 在渲染时派生
const fullName = `${firstName} ${lastName}`;
```

### 2.4 原则 4：避免 state 中的重复（Duplication）
同一份数据不要出现在多个地方。比如一个商品列表，每项都有 `isSelected`，又单独维护一个 `selectedItems` 数组 —— 两份来源容易冲突。
- 优先从单一数据源派生，例如：
```tsx
const selectedItems = items.filter(item => item.isSelected);
```

### 2.5 原则 5：避免过深的嵌套 state（Deeply nested）
嵌套越深，不可变更新越痛苦（要写一长串展开）。
- 偏好**扁平化**结构，必要时用「ID + 查找表」的方式：
```tsx
// ❌ 深层嵌套
state = { houses: [{ rooms: [{ items: [...] }] }] };
// ✅ 扁平化：用 id 关联
state = {
  houses: { 'h1': { rooms: ['r1'] } },
  rooms:  { 'r1': { items: ['i1'] } },
  items:  { 'i1': { name: 'chair' } },
};
```

### 2.6 小结：好 state 的特征
| 特征 | 说明 |
| --- | --- |
| 最小 | 只存必要的事实，其余靠派生 |
| 一致 | 不存在互相矛盾的字段 |
| 单一数据源 | 不重复存同一份数据 |
| 扁平 | 嵌套尽量浅，更新才简单 |

---

## 三、今日要点速记
- state 是快照，更新是「排队」，不是「立刻」。
- 依赖上一次 state 时用「更新函数」`setX(prev => ...)`。
- 对象和数组更新 = 创建新值，不要 mutate。
- 好结构 = 相关合并 + 不矛盾 + 不冗余 + 不重复 + 不深嵌套。
