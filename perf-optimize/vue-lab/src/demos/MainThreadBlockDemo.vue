<script setup lang="ts">
/**
 * 案例 10：长任务阻塞主线程
 * 🐛 同步执行 fib(42)，主线程被独占 1~2s，动画停住、点击无响应，INP/TBT 爆表。
 * 💡 方向：Web Worker、时间切片（rAF）、算法优化、把重活挪到空闲时段。
 */
import { ref } from 'vue'
import { fib, fmt } from './data'
import { useFps } from '../perf'
import Metrics from '../components/Metrics.vue'
import BugTip from '../components/BugTip.vue'

const blockMs = ref(0)
const slicedMs = ref(0)
const result = ref(0)
const fps = useFps()

function runBlock() {
  const t0 = performance.now()
  // 🐛 同步大计算，独占主线程
  result.value = fib(42)
  blockMs.value = performance.now() - t0
}

function runSliced() {
  const t0 = performance.now()
  let i = 0
  let acc = 0
  // ✅ 每帧只算 8ms，把主线程还给渲染
  const step = () => {
    const end = performance.now() + 8
    while (performance.now() < end && i < 20000000) {
      acc += i % 7
      i++
    }
    result.value = acc
    if (i < 20000000) {
      requestAnimationFrame(step)
    } else {
      slicedMs.value = performance.now() - t0
    }
  }
  requestAnimationFrame(step)
}
</script>

<template>
  <Metrics
    :items="[
      { label: '实时 FPS', value: fps, warn: fps < 50 },
      { label: '同步阻塞耗时', value: `${fmt(blockMs)} ms`, warn: blockMs > 50 },
      { label: '时间切片总耗时', value: `${fmt(slicedMs)} ms` },
      { label: '计算结果', value: result },
    ]"
  />

  <div class="toolbar">
    <button class="btn" @click="runBlock">同步计算 fib(42)（有问题）</button>
    <button class="btn" @click="runSliced">时间切片计算（已优化）</button>
  </div>

  <BugTip>
    <template #bug>
      点击第一个按钮后下方小球会<b>完全静止</b>：单个长任务（&gt; 50ms）阻塞渲染与事件队列，INP / TBT 直接恶化。
    </template>
    <template #tip>
      把纯计算放进 <code>Web Worker</code>；或用 <code>requestAnimationFrame</code> /{' '}
      <code>requestIdleCallback</code> / <code>scheduler.postTask</code> 做时间切片；递归 fib 改迭代 O(n)。
    </template>
  </BugTip>

  <div class="stage stage-sm"><div class="ball" /></div>
</template>
