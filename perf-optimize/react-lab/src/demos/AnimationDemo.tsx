import { useEffect, useRef, useState } from 'react'
import { useFps } from '../perf'
import { Bug, Metrics, Tip, Toolbar } from '../ui'

const COUNT = 500

/**
 * 案例 8：动画属性选错，越过合成层
 * 🐛 用 left/top 驱动 500 个元素的动画，每帧都要重新布局 + 绘制。
 * 💡 方向：transform: translate3d / opacity、will-change、减少动画元素、CSS 动画交给合成线程。
 */
export default function AnimationDemo() {
  const [mode, setMode] = useState<'bad' | 'good'>('bad')
  const [running, setRunning] = useState(false)
  const boxRefs = useRef<(HTMLDivElement | null)[]>([])
  const fps = useFps()

  useEffect(() => {
    if (!running) return
    let raf = 0
    let t = 0
    const loop = () => {
      t += 1
      for (let i = 0; i < boxRefs.current.length; i++) {
        const el = boxRefs.current[i]
        if (!el) continue
        const x = 120 + Math.sin((t + i * 6) / 20) * 100
        const y = 30 + Math.cos((t + i * 6) / 25) * 30
        if (mode === 'bad') {
          // 🐛 改 left/top：触发布局 + 绘制
          el.style.left = `${x}px`
          el.style.top = `${y}px`
        } else {
          // ✅ 只改 transform：走合成层
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [running, mode])

  return (
    <div>
      <Metrics
        items={[
          { label: '实时 FPS', value: fps, warn: fps < 50 },
          { label: '动画元素', value: COUNT },
          { label: '当前方式', value: mode === 'bad' ? 'left/top（有问题）' : 'transform（已优化）' },
        ]}
      />
      <Toolbar>
        <button className="btn" onClick={() => setRunning((r) => !r)}>
          {running ? '停止' : '开始'}
        </button>
        <button className="btn" onClick={() => setMode(mode === 'bad' ? 'good' : 'bad')}>
          切换为 {mode === 'bad' ? 'transform' : 'left/top'}
        </button>
      </Toolbar>

      <Bug>
        500 个元素每帧修改 <code>left/top</code>：帧流程要走完整的 Style → Layout → Paint → Composite，主线程直接被打满，FPS 掉到个位数。
      </Bug>
      <Tip>
        只动 <code>transform</code> 与 <code>opacity</code>（可跳过布局和绘制，交给合成线程）；必要时
        <code>will-change: transform</code> 提升为独立图层；控制同时动画的元素数量；纯装饰动画改用 CSS/Web Animations。
      </Tip>

      <div className="stage">
        {Array.from({ length: COUNT }, (_, i) => (
          <div
            key={i}
            className="dot"
            ref={(el) => {
              boxRefs.current[i] = el
            }}
            style={{ background: `hsl(${(i * 7) % 360} 70% 55%)` }}
          />
        ))}
      </div>
    </div>
  )
}
