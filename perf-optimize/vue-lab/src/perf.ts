import { onMounted, onUnmounted, onUpdated, ref } from 'vue'

export { fmt } from './demos/data'

/** 实时 FPS 采样 */
export function useFps() {
  const fps = ref(60)
  let raf = 0
  let frames = 0
  let last = performance.now()

  const loop = () => {
    frames++
    const now = performance.now()
    if (now - last >= 500) {
      fps.value = Math.round((frames * 1000) / (now - last))
      frames = 0
      last = now
    }
    raf = requestAnimationFrame(loop)
  }

  onMounted(() => {
    raf = requestAnimationFrame(loop)
  })
  onUnmounted(() => cancelAnimationFrame(raf))

  return fps
}

/** 组件更新次数统计 */
export function useUpdateCount() {
  const count = ref(0)
  onMounted(() => {
    count.value++
  })
  onUpdated(() => {
    count.value++
  })
  return count
}

/** 上一次更新（render + patch）耗时 */
export function useUpdateTime() {
  const cost = ref(0)
  let start = performance.now()
  onUpdated(() => {
    cost.value = performance.now() - start
  })
  const mark = () => {
    start = performance.now()
  }
  return { cost, mark }
}

/** 模块级计数器：用于观察「组件已卸载但副作用仍在运行」 */
export const leakStore = {
  ticks: 0,
  scrolls: 0,
  listeners: 0,
  reset() {
    this.ticks = 0
    this.scrolls = 0
    this.listeners = 0
  },
}
