# editProfile.tsx Bug 记录：submit 按钮导致整页刷新

## 现象

`editProfile.tsx` 中的 "Edit / Save" 按钮点击后，页面会**闪动一下并回到初始状态**，输入的内容全部丢失，按钮"点了等于白点"。

## 根因

按钮位于 `<form>` 内部，且类型为 `type="submit"`：

```tsx
<form>
  {/* ...输入框... */}
  <button type="submit">Edit / Save</button>
</form>
```

但该 `<form>` **没有任何 `onSubmit` 处理函数，也没有调用 `e.preventDefault()`**。

于是点击按钮时，浏览器会按 `<form>` 的**默认行为提交表单**：
1. 浏览器发起表单提交 → 整页刷新（reload）
2. React 应用重新挂载 → 所有 `useState` 的 state 重置为初始值
3. 页面回到初始态，看起来就像"闪一下、变回原样"

## 为什么是 Bug

- 本意是切换"编辑 / 保存"状态（toggle `isEdit`），并不需要真正提交表单。
- 因为没阻止默认行为，按钮的 `onClick` 效果被整页刷新瞬间抹掉，state 复位。

## 修复方案（二选一）

**方案 A：把按钮改成普通按钮，不参与表单提交**

```tsx
<button type="button" onClick={() => setIsEdit(!isEdit)}>
  {isEdit ? 'Save' : 'Edit'}
</button>
```

**方案 B：给 form 加 onSubmit 并阻止默认行为**

```tsx
<form onSubmit={e => e.preventDefault()}>
  {/* ... */}
  <button type="submit" onClick={() => setIsEdit(!isEdit)}>
    {isEdit ? 'Save' : 'Edit'}
  </button>
</form>
```

> 推荐方案 A：本场景只是切换编辑态，用 `type="button"` 语义更清晰，也避免任何意外提交。

## 关联说明

- 另一个同类文件 bug：`editProfile.tsx` 非编辑态把名字**硬编码**成了 `Jane` / `Jacobs`，应改为读取 `firstName` / `lastName` state。
- 排查要点：表单默认提交行为 + 缺少 `preventDefault()` 是常见的"页面闪动/状态丢失"根因。
