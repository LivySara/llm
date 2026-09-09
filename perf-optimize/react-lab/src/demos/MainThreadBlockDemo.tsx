import { useState } from 'react'
import { fib, fmt } from './data'
import { useFps } from '../perf'
import { Bug, Metrics, Tip, Toolbar } from '../ui'

/**
 * 案例 11：长任务阻塞主线程
 * 🐛 一个同步大循环（fib(43)）独占主线程 1~2s，期间动画停止、点击无响应，INP 直接爆表。
 * 💡 方向：时间切片（scheduler/requestIdleCallback）、Web Worker、算法优化、分帧渲染。
 */
export default function MainThreadBlockDemo() {
  const [blockMs, setBlockMs] = useState(0)
  const [slicedMs, setSlicedMs] = useState(0)
  const [result, setResult] = useState(0)
  const fps = useFps()

  const runBlock = () => {
    const t0 = performance.now()
    // 🐛 同步大计算，独占主线程
    setResult(fib(42))
    setBlockMs(performance.now() - t0)
  }

  const runSliced = () => {
    const t0 = performance.now()
    let i = 0
    let acc = 0
    // ✅ 时间切片：每帧只算一小块，让出主线程
    const step = () => {
      const end = performance.now() + 8
      while (performance.now() < end && i < 20000000) {
        acc += i % 7
        i++
      }
      setResult(acc)
      if (i < 20000000) {
        requestAnimationFrame(step)
      } else {
        setSlicedMs(performance.now() - t0)
      }
    }
    requestAnimationFrame(step)
  }

  return (
    <div>
      <Metrics
        items={[
          { label: '实时 FPS', value: fps, warn: fps < 50 },
          { label: '同步阻塞耗时', value: `${fmt(blockMs)} ms`, warn: blockMs > 50 },
          { label: '时间切片总耗时', value: `${fmt(slicedMs)} ms` },
          { label: '计算结果', value: result },
        ]}
      />
      <Toolbar>
        <button className="btn" onClick={runBlock}>
          同步计算 fib(42)（有问题）
        </button>
        <button className="btn" onClick={runSliced}>
          时间切片计算（已优化）
        </button>
      </Toolbar>

      <Bug>
        点下第一个按钮后，下方小球会<b>完全静止</b>、按钮点不动：单个长任务（&gt;50ms 即 Long Task）阻塞渲染与事件，
        INP / TBT 指标直接恶化。
      </Bug>
      <Tip>
        ① 把纯计算放进 <code>Web Worker</code>（最彻底）；② 用 <code>requestAnimationFrame</code> /{' '}
        <code>scheduler.postTask</code> / <code>requestIdleCallback</code> 切片；③ 优化算法复杂度（递归 fib → 迭代 O(n)）；
        ④ 大任务用 <code>startTransition</code> 标记为可中断更新。
      </Tip>

      <div className="stage stage-sm">
        <div className="ball" />
      </div>
    </div>
  )
}
