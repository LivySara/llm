import { useEffect, useState } from 'react'
import { leakStore } from '../perf'
import { Bug, Metrics, Tip, Toolbar } from '../ui'

/**
 * 案例 9：内存泄漏与僵尸副作用
 * 🐛 setInterval / 全局事件监听 / 订阅在组件卸载后仍在运行，还会持续引用已卸载组件的状态。
 * 💡 方向：useEffect 返回清理函数、AbortController、事件总线退订、卸载标志位。
 */

let scrollHandler: (() => void) | null = null

function LeakyPanel() {
  const [, force] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      leakStore.ticks += 1
      force((n) => n + 1) // 🐛 卸载后仍在 setState
    }, 300)

    // 🐛 全局监听注册后从未移除，且被模块级变量持有，永远无法被 GC
    scrollHandler = () => {
      leakStore.scrolls += 1
    }
    window.addEventListener('scroll', scrollHandler)

    return () => {
      clearInterval(id) // ✅ 定时器清理了
      // ❌ 事件监听忘了移除
    }
  }, [])

  return (
    <div className="card">
      <div className="card-title">已挂载的面板</div>
      <div className="card-value">
        interval tick：<b>{leakStore.ticks}</b>
      </div>
      <div className="card-value">试着滚动页面，观察 scroll 计数</div>
    </div>
  )
}

export default function MemoryLeakDemo() {
  const [mounted, setMounted] = useState(false)
  const [, force] = useState(0)

  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 500)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      <Metrics
        items={[
          { label: '组件状态', value: mounted ? '已挂载' : '已卸载' },
          { label: '卸载后仍在跑的 tick', value: leakStore.ticks, warn: !mounted && leakStore.ticks > 0 },
          { label: 'scroll 监听触发次数', value: leakStore.scrolls, warn: leakStore.scrolls > 0 },
          { label: '泄漏的监听器', value: scrollHandler ? '仍被持有' : '无' },
        ]}
      />
      <Toolbar>
        <button className="btn" onClick={() => setMounted((m) => !m)}>
          {mounted ? '卸载组件' : '挂载组件'}
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
            scrollHandler = null
            leakStore.reset()
          }}
        >
          手动清理 + 重置计数
        </button>
      </Toolbar>

      <Bug>
        组件卸载后：<code>scroll</code> 监听依旧存在（慢慢累积成僵尸监听）、闭包持有旧 state、定时器里的 setState 无法被回收；
        来回切换挂载 N 次，就泄漏 N 份监听与闭包。
      </Bug>
      <Tip>
        每个 <code>useEffect</code> 都要返回清理函数（清定时器、<code>removeEventListener</code>、取消订阅、<code>abort()</code> 请求）；
        用 <code>AbortController</code> 统一取消；异步回调里判断 <code>mountedRef.current</code>；DevTools Memory 面板做
        「挂载 → 卸载 → GC → 快照对比」验证。
      </Tip>

      <div className="cards">{mounted ? <LeakyPanel /> : <div className="card card-empty">组件已卸载（但副作用可能还在跑）</div>}</div>
      <div className="scroll-space" />
    </div>
  )
}
