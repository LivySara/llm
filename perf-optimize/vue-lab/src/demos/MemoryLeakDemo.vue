<script setup lang="ts">
/**
 * 案例 8：内存泄漏与僵尸副作用
 * 🐛 定时器/全局监听/订阅在组件卸载后仍在运行，闭包还持有已卸载组件的状态。
 * 💡 方向：onUnmounted 清理、事件总线退订、AbortController、onScopeDispose。
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { leakStore } from '../perf'
import Metrics from '../components/Metrics.vue'
import BugTip from '../components/BugTip.vue'
import LeakyPanel from './parts/LeakyPanel.vue'

const mounted = ref(false)
const display = ref({ ticks: 0, scrolls: 0, listeners: 0 })
let poll = 0

onMounted(() => {
  poll = window.setInterval(() => {
    display.value = { ticks: leakStore.ticks, scrolls: leakStore.scrolls, listeners: leakStore.listeners }
  }, 400)
})
onUnmounted(() => clearInterval(poll))
</script>

<template>
  <Metrics
    :items="[
      { label: '组件状态', value: mounted ? '已挂载' : '已卸载' },
      { label: '累计 interval tick', value: display.ticks, warn: !mounted && display.ticks > 0 },
      { label: 'scroll 触发次数', value: display.scrolls, warn: display.scrolls > 0 },
      { label: '泄漏的监听器', value: display.listeners, warn: display.listeners > 0 },
    ]"
  />

  <div class="toolbar">
    <button class="btn" @click="mounted = !mounted">{{ mounted ? '卸载组件' : '挂载组件' }}</button>
    <button
      class="btn btn-ghost"
      @click="
        () => {
          leakStore.reset()
          display = { ticks: 0, scrolls: 0, listeners: 0 }
        }
      "
    >
      重置计数
    </button>
  </div>

  <BugTip>
    <template #bug>
      组件卸载后：<code>scroll</code> 监听依然存在（每挂载一次泄漏一份）、定时器回调引用着已卸载组件的 ref、
      来回切换 N 次就泄漏 N 份闭包与监听器，内存只增不减。
    </template>
    <template #tip>
      在 <code>onUnmounted</code> / <code>onScopeDispose</code> 里清定时器、<code>removeEventListener</code>、取消订阅；
      请求用 <code>AbortController</code>；用 DevTools Memory 做「挂载 → 卸载 → 强制 GC → 快照对比」验证。
    </template>
  </BugTip>

  <div class="cards">
    <LeakyPanel v-if="mounted" />
    <div v-else class="card card-empty">组件已卸载（但副作用可能还在跑）</div>
  </div>
  <div class="scroll-space" />
</template>
