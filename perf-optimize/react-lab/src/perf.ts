import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export { fmt } from './demos/data'

/** 实时 FPS 采样（每 500ms 更新一次） */
export function useFps(): number {
  const [fps, setFps] = useState(60)
  useEffect(() => {
    let raf = 0
    let frames = 0
    let last = performance.now()
    const loop = () => {
      frames++
      const now = performance.now()
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)))
        frames = 0
        last = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return fps
}

/** 组件渲染次数统计（渲染期自增，返回当前累计次数） */
export function useRenderCount(): number {
  const ref = useRef(0)
  ref.current += 1
  return ref.current
}

/** 上一次 render + commit 的耗时（ms） */
export function useRenderTime(): number {
  const start = performance.now()
  const last = useRef(0)
  useLayoutEffect(() => {
    last.current = performance.now() - start
  })
  return last.current
}

/** 全局模块级计数器，用于演示「组件已卸载但副作用仍在运行」 */
export const leakStore = {
  ticks: 0,
  scrolls: 0,
  log: [] as string[],
  reset() {
    this.ticks = 0
    this.scrolls = 0
    this.log = []
  },
}

/** 把一次操作的耗时打到面板上 */
export function useTimedAction() {
  const [last, setLast] = useState(0)
  const run = (fn: () => void) => {
    const t0 = performance.now()
    fn()
    setLast(performance.now() - t0)
  }
  return { last, run }
}
