<script setup lang="ts">
/**
 * 案例 4：deep watch 大对象
 * 🐛 对超大对象开启 deep watch：每次变更都要递归遍历整棵树收集依赖、触发回调，回调频率还极高。
 * 💡 方向：精确监听字段（() => obj.field）、watchEffect 收敛依赖、防抖、避免 deep: true。
 */
import { reactive, ref, watch } from 'vue'
import { makeRows, type Row } from './data'
import { fmt } from '../perf'
import Metrics from '../components/Metrics.vue'
import BugTip from '../components/BugTip.vue'

const rows = makeRows(50000)
const state = reactive({
  user: { name: '张三', dept: '研发' },
  list: rows,
  tick: 0,
})

const calls = ref(0)
const lastCost = ref(0)
const deepMode = ref(true)
const running = ref(false)

// 🐛 deep: true —— 每 200ms 修改一个深层字段，就要遍历 5 万条数据
watch(
  () => state,
  () => {
    const t0 = performance.now()
    calls.value++
    lastCost.value = performance.now() - t0
  },
  { deep: deepMode.value },
)

watch(
  () => state.tick,
  () => {
    if (!running.value) return
    state.list[state.tick % state.list.length].score = (state.tick * 7) % 100
  },
)

let timer = 0
function toggle() {
  running.value = !running.value
  if (running.value) {
    timer = window.setInterval(() => state.tick++, 200)
  } else {
    clearInterval(timer)
  }
}
</script>

<template>
  <Metrics
    :items="[
      { label: '监听对象规模', value: `${state.list.length.toLocaleString()} 条` },
      { label: 'watch 触发次数', value: calls },
      { label: '最近一次回调耗时', value: `${fmt(lastCost, 2)} ms`, warn: lastCost > 5 },
      { label: 'deep', value: String(deepMode) },
    ]"
  />

  <div class="toolbar">
    <button class="btn" @click="toggle">{{ running ? '停止高频更新' : '开始高频更新' }}</button>
    <span class="muted">每 200ms 改一次深层字段，观察 watch 触发次数与页面流畅度</span>
  </div>

  <BugTip>
    <template #bug>
      <code>watch(state, cb, { deep: true })</code> 会递归遍历整棵对象树建立依赖：5 万条数据下每次变更都要付出巨大遍历成本，
      而且任何深层字段变化都会触发回调（回调风暴）。
    </template>
    <template #tip>
      改成精确 getter：<code>watch(() =&gt; state.user.name, cb)</code>；必须监听集合时用 <code>watchEffect</code> 收敛依赖；
      高频回调加防抖/节流；大数据不要放进响应式系统（<code>shallowRef</code> / <code>markRaw</code>）。
    </template>
  </BugTip>

  <div class="list">
    <div class="list-row" v-for="r in state.list.slice(0, 20)" :key="r.id">
      <span class="col-name">{{ r.name }}</span>
      <span class="col-score">{{ r.score }}</span>
    </div>
  </div>
</template>
