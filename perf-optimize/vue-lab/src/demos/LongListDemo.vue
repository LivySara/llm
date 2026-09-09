<script setup lang="ts">
/**
 * 案例 1：长列表全量渲染
 * 🐛 1 万条数据一次性 v-for 成真实 DOM，首屏与交互全部卡死。
 * 💡 方向：虚拟滚动（vue-virtual-scroller / @tanstack/vue-virtual / 手写）、分页、content-visibility。
 */
import { ref } from 'vue'
import { makeRows, type Row } from './data'
import { fmt, useUpdateTime } from '../perf'
import Metrics from '../components/Metrics.vue'
import BugTip from '../components/BugTip.vue'

const count = ref(5000)
const rows = ref<Row[]>(makeRows(5000))
const keyword = ref('')
const buildMs = ref(0)
const { cost } = useUpdateTime()

function regenerate() {
  const t0 = performance.now()
  rows.value = makeRows(count.value)
  buildMs.value = performance.now() - t0
}
</script>

<template>
  <Metrics
    :items="[
      { label: '数据条数', value: rows.length.toLocaleString() },
      { label: 'DOM 行数', value: rows.length.toLocaleString(), warn: rows.length > 3000 },
      { label: '数据生成耗时', value: `${fmt(buildMs)} ms` },
      { label: '上次更新耗时', value: `${fmt(cost)} ms`, warn: cost > 100 },
    ]"
  />

  <div class="toolbar">
    <label class="field">
      <span>条数 {{ count.toLocaleString() }}</span>
      <input type="range" min="1000" max="100000" step="1000" v-model.number="count" />
    </label>
    <button class="btn" @click="regenerate">生成并渲染</button>
    <input class="input" v-model="keyword" placeholder="输入关键字（每次输入全量过滤）" />
  </div>

  <BugTip>
    <template #bug>
      可视区只有约 20 行，却把 <b>{{ rows.length.toLocaleString() }}</b> 行全部渲染成 DOM：patch、样式计算、布局、绘制成本线性上涨。
    </template>
    <template #tip>
      只渲染可视区（虚拟列表 / 窗口化），或 <code>content-visibility: auto</code> + 分页；大数据用 <code>shallowRef</code> 避免深度代理，过滤下沉到 Worker。
    </template>
  </BugTip>

  <div class="list">
    <div class="list-row" v-for="r in keyword ? rows.filter((x) => x.name.includes(keyword)) : rows" :key="r.id">
      <span class="avatar" :style="{ background: `hsl(${r.id % 360} 60% 45%)` }">{{ r.name.slice(-1) }}</span>
      <span class="col-name">{{ r.name }}</span>
      <span class="col-email">{{ r.email }}</span>
      <span class="col-dept">{{ r.dept }}</span>
      <span class="col-tag">{{ r.tag }}</span>
      <span class="col-bar"><i :style="{ width: `${r.score}%` }" /></span>
    </div>
  </div>
</template>
