<script setup lang="ts">
/**
 * 案例 9：key 用错 + 缺少 v-memo 导致的全量 diff
 * 🐛 用 index 当 key：插入/排序后 DOM 与状态错误复用；大量列表项每次父级更新都要全量 diff。
 * 💡 方向：稳定唯一 key（业务 id）、v-memo 精准跳过、减少单帧 patch 规模。
 */
import { ref } from 'vue'
import { makeRows, type Row } from './data'
import { fmt, useUpdateTime } from '../perf'
import Metrics from '../components/Metrics.vue'
import BugTip from '../components/BugTip.vue'

const rows = ref<Row[]>(makeRows(3000, 7).slice(0, 60))
const useIndexKey = ref(true)
const useMemo = ref(false)
const tick = ref(0)
const { cost } = useUpdateTime()

function insertTop() {
  rows.value.unshift({ ...rows.value[0], id: Date.now(), name: `新插入-${rows.value.length}` })
}

function shuffle() {
  rows.value = rows.value.slice().reverse()
}

/** v-memo 依赖：关闭优化时把 tick 也作为依赖，模拟「每次都要 diff」 */
function memoDeps(r: Row) {
  return useMemo.value ? [r.id, r.score] : [r.id, r.score, tick.value]
}
</script>

<template>
  <Metrics
    :items="[
      { label: '列表条数', value: rows.length },
      { label: '上次更新耗时', value: `${fmt(cost)} ms`, warn: cost > 20 },
      { label: 'key 策略', value: useIndexKey ? 'index（有问题）' : 'id（正确）' },
      { label: 'v-memo', value: useMemo ? '开启' : '关闭' },
    ]"
  />

  <div class="toolbar">
    <button class="btn" @click="insertTop">在头部插入一行</button>
    <button class="btn" @click="shuffle">反转列表</button>
    <button class="btn btn-ghost" @click="tick++">父级状态 +1（触发全量 diff）</button>
    <label class="switch"><input type="checkbox" v-model="useIndexKey" />用 index 当 key</label>
    <label class="switch"><input type="checkbox" v-model="useMemo" />开启 v-memo（对照）</label>
  </div>

  <BugTip>
    <template #bug>
      用 <code>index</code> 当 key 时，头部插入会让<b>所有行的 key 发生位移</b>，Vue 只能按位置复用，
      输入框等内部状态全部错位（见下方每行输入框）；同时父级任意更新都会导致整列表逐项 diff。
    </template>
    <template #tip>
      key 必须用稳定唯一的业务 id；大列表项加 <code>v-memo="[item.id, item.score]"</code> 跳过无变化的 diff；
      避免在同一帧里对超长列表做大范围顺序调整。
    </template>
  </BugTip>

  <div class="list">
    <div
      v-for="(r, i) in rows"
      :key="useIndexKey ? i : r.id"
      v-memo="memoDeps(r)"
      class="list-row"
    >
      <span class="col-name">{{ r.name }}</span>
      <span class="col-dept">{{ r.dept }}</span>
      <span class="col-score">{{ r.score }}</span>
      <input class="input input-sm" placeholder="在这里输入点内容，再点「头部插入」" />
      <span class="muted">tick={{ tick }}</span>
    </div>
  </div>
</template>
