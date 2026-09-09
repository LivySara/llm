import { memo, useState } from 'react'
import { busyWait, fmt } from './data'
import { useRenderCount, useRenderTime } from '../perf'
import { Bug, Metrics, Tip, Toolbar } from '../ui'

/**
 * 案例 3：重渲染风暴
 * 🐛 父组件任意一个 state 变化，所有子组件（哪怕不依赖它）全部重渲染，且子组件渲染很贵。
 * 💡 方向：React.memo + 稳定 props、状态下沉、children 提升、按订阅粒度拆分。
 */

interface ChildProps {
  label: string
  color: string
}

// 每个子组件渲染需要 ~25ms（模拟真实业务里的重型组件）
function ChildBase({ label, color }: ChildProps) {
  busyWait(25)
  const renders = useRenderCount()
  return (
    <div className="card" style={{ borderColor: color }}>
      <div className="card-title">{label}</div>
      <div className="card-value">
        渲染次数 <b>{renders}</b>
      </div>
    </div>
  )
}

const MemoChild = memo(ChildBase)

export default function ReRenderChainDemo() {
  const [count, setCount] = useState(0)
  const [unrelated, setUnrelated] = useState(0)
  const [useMemoVersion, setUseMemoVersion] = useState(false)
  const renderTime = useRenderTime()
  const parentRenders = useRenderCount()

  const Child = useMemoVersion ? MemoChild : ChildBase

  return (
    <div>
      <Metrics
        items={[
          { label: '父组件渲染次数', value: parentRenders },
          { label: '上次渲染耗时', value: `${fmt(renderTime)} ms`, warn: renderTime > 100 },
          { label: '计数 state', value: count },
          { label: '无关 state', value: unrelated },
        ]}
      />
      <Toolbar>
        <button className="btn" onClick={() => setCount((c) => c + 1)}>
          count + 1
        </button>
        <button className="btn" onClick={() => setUnrelated((u) => u + 1)}>
          无关 state + 1
        </button>
        <label className="switch">
          <input type="checkbox" checked={useMemoVersion} onChange={(e) => setUseMemoVersion(e.target.checked)} />
          启用 React.memo（对照）
        </label>
      </Toolbar>

      <Bug>
        子组件只用到静态的 <code>label/color</code>，却因为父组件 state 变化被<b>全部重渲染</b>：单次点击 = 4 × 25ms ≈ 100ms 的白白消耗。
      </Bug>
      <Tip>
        ① <code>React.memo</code> + 稳定 props（配合 useCallback/useMemo）；② 把 state 下沉到真正需要的子组件；
        ③ 用 <code>children</code> 把不变的子树提到父组件之外；④ 重型渲染用 <code>useDeferredValue</code>/过渡更新降级。
      </Tip>

      <div className="cards">
        <Child label="订单概览" color="#4f8cff" />
        <Child label="转化漏斗" color="#28c76f" />
        <Child label="活跃用户" color="#ff9f43" />
        <Child label="收入趋势" color="#a66dd4" />
      </div>

      <p className="muted">
        对照实验：勾选 React.memo 后再点击按钮，子组件渲染次数不再增长，渲染耗时明显下降 —— 这就是「减少无意义渲染」的收益。
      </p>
    </div>
  )
}
