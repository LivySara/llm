<script setup lang="ts">
/**
 * 案例 2：深度响应式的大数据
 * 🐛 ref/reactive 会对 10 万条数据做递归 Proxy 代理，创建与更新都极慢，且内存翻倍。
 * 💡 方向：shallowRef + triggerRef、Object.freeze / markRaw、分页、虚拟滚动。
 */
import { nextTick, ref, shallowRef, triggerRef } from 'vue'
import { makeRows, type Row } from './data'
import { fmt } from '../perf'
import Metrics from '../components/Metrics.vue'
import BugTip from '../components/BugTip.vue'

const SIZE = 100000
const mode = ref<'deep' | 'shallow' | 'frozen'>('deep')
const createMs = ref(0)
const updateMs = ref(0)
const version = ref(0)

const deepRows = ref<Row[]>([])
const shallowRows = shallowRef<Row[]>([])
const frozenRows = ref<Row[]>([])

function build() {
  const raw = makeRows(SIZE)
  const t0 = performance.now()
  if (mode.value === 'deep') {
    // 🐛 深度代理：每一行、每个字段都会创建 Proxy
    deepRows.value = raw
  } else if (mode.value === 'shallow') {
    // ✅ 只代理顶层引用
    shallowRows.value = raw
  } else {
    // ✅ 冻结后 Vue 会跳过代理
    frozenRows.value = Object.freeze(raw) as Row[]
  }
  createMs.value = performance.now() - t0
}

async function patchOne() {
  const t0 = performance.now()
  if (mode.value === 'deep') {
    deepRows.value[0].score = Math.floor(Math.random() * 100)
  } else if (mode.value === 'shallow') {
    shallowRows.value[0].score = Math.floor(Math.random() * 100)
    triggerRef(shallowRows)
  } else {
    ;(frozenRows.value as Row[])[0].score = Math.floor(Math.random() * 100)
  }
  await nextTick()
  updateMs.value = performance.now() - t0
  version.value++
}
</script>

<template>
  <Metrics
    :items="[
      { label: '数据量', value: SIZE.toLocaleString() },
      { label: '创建耗时', value: `${fmt(createMs)} ms`, warn: createMs > 200 },
      { label: '改一项耗时', value: `${fmt(updateMs)} ms`, warn: updateMs > 50 },
      { label: '当前模式', value: mode },
    ]"
  />

  <div class="toolbar">
    <label class="field">
      <span>响应式方式</span>
      <select v-model="mode">
        <option value="deep">ref 深度代理（有问题）</option>
        <option value="shallow">shallowRef（已优化）</option>
        <option value="frozen">Object.freeze（已优化）</option>
      </select>
    </label>
    <button class="btn" @click="build">创建数据</button>
    <button class="btn" @click="patchOne">修改第一项</button>
  </div>

  <BugTip>
    <template #bug>
      默认 <code>ref/reactive</code> 会<b>递归</b>为 10 万个对象建立 Proxy：初始化慢、内存占用翻倍、每次访问字段都有代理开销，
      而这些数据其实根本不需要逐字段追踪。
    </template>
    <template #tip>
      大数据列表用 <code>shallowRef</code>（修改后手动 <code>triggerRef</code>）或 <code>Object.freeze</code> /{' '}
      <code>markRaw</code>；只让真正需要驱动视图的字段保持响应式；配合虚拟滚动减少数据量。
    </template>
  </BugTip>

  <div class="list">
    <div class="list-row" v-for="r in (mode === 'deep' ? deepRows : mode === 'shallow' ? shallowRows : frozenRows).slice(0, 20)" :key="r.id">
      <span class="col-name">{{ r.name }}</span>
      <span class="col-dept">{{ r.dept }}</span>
      <span class="col-score">{{ r.score }}</span>
      <span class="muted">v{{ version }}</span>
    </div>
  </div>
</template>
