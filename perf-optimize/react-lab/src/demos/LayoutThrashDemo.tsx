import { useRef, useState } from 'react'
import { fmt } from '../perf'
import { Bug, Metrics, Tip, Toolbar } from '../ui'

const COUNT = 800

/**
 * 案例 7：强制同步布局（Layout Thrashing）
 * 🐛 在循环里「读布局 → 写样式」交替进行，每次读取都强制浏览器提前完成布局。
 * 💡 方向：读写分离（先批量读、再批量写）、避免逐元素改几何属性、用 transform 代替 width/height/top/left。
 */
export default function LayoutThrashDemo() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [badMs, setBadMs] = useState(0)
  const [goodMs, setGoodMs] = useState(0)
  const [version, setVersion] = useState(0)

  const getEls = () => Array.from(wrapRef.current?.querySelectorAll<HTMLElement>('.bar') ?? [])

  const runBad = () => {
    const els = getEls()
    const t0 = performance.now()
    for (let i = 0; i < els.length; i++) {
      // 🐛 读（强制布局）→ 写（让布局失效）→ 再读 …… 触发 N 次强制同步布局
      const h = els[i].offsetHeight
      els[i].style.height = `${(h % 40) + 10 + (i % 7)}px`
    }
    setBadMs(performance.now() - t0)
  }

  const runGood = () => {
    const els = getEls()
    const t0 = performance.now()
    // ✅ 先一次性读完，再一次性写入
    const heights = els.map((el) => el.offsetHeight)
    for (let i = 0; i < els.length; i++) {
      els[i].style.height = `${(heights[i] % 40) + 10 + (i % 7)}px`
    }
    setGoodMs(performance.now() - t0)
  }

  return (
    <div>
      <Metrics
        items={[
          { label: '元素数量', value: COUNT },
          { label: '读写交替耗时', value: `${fmt(badMs, 2)} ms`, warn: badMs > 20 },
          { label: '读写分离耗时', value: `${fmt(goodMs, 2)} ms` },
          { label: '差距', value: goodMs > 0 ? `${fmt(badMs / goodMs)}x` : '-' },
        ]}
      />
      <Toolbar>
        <button className="btn" onClick={runBad}>
          读写交替（有问题）
        </button>
        <button className="btn" onClick={runGood}>
          读写分离（已优化）
        </button>
        <button className="btn btn-ghost" onClick={() => setVersion((v) => v + 1)}>
          重置高度
        </button>
      </Toolbar>

      <Bug>
        循环内交替执行「读取 <code>offsetHeight</code>」和「写入 <code>style.height</code>」，浏览器每次都要为了拿到准确值而
        <b>强制刷新布局</b>，800 个元素 = 800 次布局。
      </Bug>
      <Tip>
        批量读 → 批量写；优先改 <code>transform/opacity</code>（跳过布局与绘制）；不要在 <code>resize/scroll</code>{' '}
        回调里同步测量；需要测量时用 <code>ResizeObserver</code> + rAF 批处理。
      </Tip>

      <div className="bars" ref={wrapRef} key={version}>
        {Array.from({ length: COUNT }, (_, i) => (
          <div className="bar" key={i} style={{ height: `${10 + (i % 30)}px`, width: `${20 + (i % 60)}px` }} />
        ))}
      </div>
    </div>
  )
}
