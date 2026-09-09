<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { leakStore } from '../../perf'

const local = ref(0)
let timer = 0

function onScroll() {
  leakStore.scrolls++
}

onMounted(() => {
  timer = window.setInterval(() => {
    leakStore.ticks++
    local.value++
  }, 300)

  // 🐛 注册的全局监听没有在卸载时移除
  window.addEventListener('scroll', onScroll)
  leakStore.listeners++
})

onUnmounted(() => {
  clearInterval(timer)
  // ❌ 忘记 removeEventListener
})
</script>

<template>
  <div class="card">
    <div class="card-title">已挂载的面板</div>
    <div class="card-value">本地 tick：<b>{{ local }}</b></div>
    <div class="card-value muted">滚动页面观察 scroll 计数</div>
  </div>
</template>
