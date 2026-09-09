<script setup lang="ts">
/**
 * 案例 6：输入风暴
 * 🐛 每次按键同步触发 3 万条数据过滤 + 大列表 patch，输入延迟肉眼可见。
 * 💡 方向：防抖/节流、v-memo、避免 v-model 直接驱动大列表、过滤下沉 Worker。
 */
import { computed, ref } from 'vue'
import { heavyFilterSort, makeRows, type Row } from './data'
import { fmt, useUpdateTime } from '../perf'
import Metrics from '../components/Metrics.vue'
import BugTip from '../components/BugTip.vue'

const ROWS = makeRows(30000)
const keyword = ref('')
const latency = ref(0)
const optimized = ref(false)
const { cost } = useUpdateTime()

const rawList = computed(() => heavyFilterSort(ROWS, keyword.value, 'score'))
const debouncedKeyword = ref('')
let timer = 0
const debouncedList = computed(() => heavyFilterSort(ROWS, debouncedKeyword.value, 'score'))

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  const t0 = performance.now()
  keyword.value = value
  if (optimized.value) {
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      debouncedKeyword.value = value
      latency.value = performance.now() - t0
    }, 260)
  } else {
    debouncedKeyword.value = value
    latency.value = performance.now() - t0
  }
}

const list = computed<Row[]>(() => (optimized.value ? debouncedList.value : rawList.value))
</script>

<template>
  <Metrics
    :items="[
      { label: '按键响应延迟', value: `${fmt(latency)} ms`, warn: latency > 50 },
      { label: '上次更新耗时', value: `${fmt(cost)} ms`, warn: cost > 30 },
      { label: '结果条数', value: list.length.toLocaleString() },
      { label: '模式', value: optimized ? '防抖（已优化）' : '直接过滤（有问题）' },
    ]"
  />

  <div class="toolbar">
    <input class="input" :value="keyword" @input="onInput" placeholder="快速连续输入，例如 用户-123" />
    <label class="switch">
      <input type="checkbox" v-model="optimized" />
      启用防抖（对照）
    </label>
  </div>

  <BugTip>
    <template #bug>
      <code>v-model</code> 直接绑定大列表的过滤条件：每个按键都要同步跑一次 3 万条过滤 + 完整的 patch，
      输入被低优先级渲染拖死。
    </template>
    <template #tip>
      ① 防抖/节流（<code>lodash/debounce</code>）；② 列表项加 <code>v-memo="[item.id, item.score]"</code> 减少 diff；
      ③ 输入值用本地 ref，过滤结果再同步；④ 大数据过滤放 Web Worker 或预建倒排索引。
    </template>
  </BugTip>

  <div class="list">
    <div class="list-row" v-for="r in list.slice(0, 100)" :key="r.id">
      <span class="col-name">{{ r.name }}</span>
      <span class="col-dept">{{ r.dept }}</span>
      <span class="col-score">{{ r.score }}</span>
    </div>
  </div>
</template>
