import { memo, useCallback, useMemo, useState } from 'react'
import { busyWait, fmt } from './data'
import { useRenderCount, useRenderTime } from '../perf'
import { Bug, Metrics, Tip, Toolbar } from '../ui'

/**
 * 案例 5：内联 props 让 memo 失效
 * 🐛 子组件虽然 memo 了，但父组件每次渲染都传入新的对象/函数/数组/JSX children，引用永远不相等。
 * 💡 方向：useCallback 固化函数、useMemo 固化对象与数组、children 提升、稳定常量外提。
 */

interface ChildProps {
  config: { title: string; size: number }
  onSelect: (id: number) => void
  items: number[]
  children?: React.ReactNode
}

const Child = memo(function Child({ config, onSelect, items, children }: ChildProps) {
  busyWait(20)
  const renders = useRenderCount()
  return (
    <div className="card">
      <div className="card-title">
        {config.title}（size={config.size}, items={items.length}）
      </div>
      <div className="card-value">
        渲染次数 <b>{renders}</b>
      </div>
      <button className="btn btn-small" onClick={() => onSelect(1)}>
        选择
      </button>
      {children}
    </div>
  )
})

const STABLE_STYLE = { title: '固定配置', size: 12 }

export default function InlinePropsDemo() {
  const [counter, setCounter] = useState(0)
  const [fixed, setFixed] = useState(false)
  const renderTime = useRenderTime()

  // ✅ 对照：稳定引用
  const stableSelect = useCallback((id: number) => console.log('select', id), [])
  const stableItems = useMemo(() => [1, 2, 3], [])
  const stableChildren = useMemo(() => <p className="muted">稳定的 children</p>, [])

  return (
    <div>
      <Metrics
        items={[
          { label: '父组件 state', value: counter },
          { label: '上次渲染耗时', value: `${fmt(renderTime)} ms`, warn: renderTime > 40 },
          { label: '当前模式', value: fixed ? '稳定引用（已修复）' : '内联 props（有问题）' },
        ]}
      />
      <Toolbar>
        <button className="btn" onClick={() => setCounter((c) => c + 1)}>
          父组件 state + 1
        </button>
        <label className="switch">
          <input type="checkbox" checked={fixed} onChange={(e) => setFixed(e.target.checked)} />
          使用稳定引用（对照）
        </label>
      </Toolbar>

      <Bug>
        子组件被 <code>memo</code> 包裹，但 <code>config</code> / <code>onSelect</code> / <code>items</code> / <code>children</code>{' '}
        每次渲染都是<b>全新引用</b>，浅比较必然失败，memo 形同虚设。
      </Bug>
      <Tip>
        函数用 <code>useCallback</code>、对象/数组用 <code>useMemo</code>、常量提到组件外、不变的 children 提到父组件外层；
        也可用 <code>useEvent</code> 模式或状态管理库直接消费稳定 dispatch。
      </Tip>

      <div className="cards">
        {fixed ? (
          <Child config={STABLE_STYLE} onSelect={stableSelect} items={stableItems}>
            {stableChildren}
          </Child>
        ) : (
          <Child config={{ title: '固定配置', size: 12 }} onSelect={() => console.log('select')} items={[1, 2, 3]}>
            <p className="muted">每次都是新的 children</p>
          </Child>
        )}
      </div>
    </div>
  )
}
