<script setup lang="ts">
/**
 * 案例 3：模板里调用方法 & 昂贵计算未缓存
 * 🐛 模板中直接调用 getFiltered() —— 每次组件更新都会重新执行；重算与无关状态耦合。
 * 💡 方向：computed 缓存、缩小依赖、v-memo、把不依赖响应式的计算提到 setup 外层。
 */
import { computed, ref } from 'vue'
import { heavyFilterSort, makeRows, type Row } from './data'
import { fmt, useUpdateTime } from '../perf'
import Metrics from '../components/Metrics.vue'
import BugTip from '../components/BugTip.vue'

const ROWS = makeRows(30000)
const keyword = ref('')
const sortBy = ref<'score' | 'name' | 'dept'>('score')
const unrelated = ref(0)
const lastCost = ref(0)
const { cost } = useUpdateTime()

// 🐛 每次渲染都会重新执行的「方法」
function getFiltered(): Row[] {
  const t0 = performance.now()
  const result = heavyFilterSort(ROWS, keyword.value, sortBy.value)
  lastCost.value = performance.now() - t0
  return result
}

// ✅ 对照：带缓存的计算属性
const cachedFiltered = computed(() => heavyFilterSort(ROWS, keyword.value, sortBy.value))
const useComputed = ref(false)
const lb = '{'
const rb = '}'
</script>

<template>
  <Metrics
    :items="[
      { label: '本次计算耗时', value: `${fmt(lastCost)} ms`, warn: lastCost > 30 },
      { label: '上次更新耗时', value: `${fmt(cost)} ms`, warn: cost > 50 },
      { label: '无关状态', value: unrelated },
      { label: '模式', value: useComputed ? 'computed（已优化）' : '模板方法（有问题）' },
    ]"
  />

  <div class="toolbar">
    <input class="input" v-model="keyword" placeholder="关键字，例如 用户-1" />
    <select v-model="sortBy">
      <option value="score">按分数</option>
      <option value="name">按名称</option>
      <option value="dept">按部门</option>
    </select>
    <button class="btn" @click="unrelated++">无关状态 +1</button>
    <label class="switch">
      <input type="checkbox" v-model="useComputed" />
      改用 computed（对照）
    </label>
  </div>

  <BugTip>
    <template #bug>
      模板里写 <code>{{ lb }}{{ lb }} getFiltered().length {{ rb }}{{ rb }}</code> 这类<b>方法调用</b>：只要组件任意状态变化（包括无关的 unrelated），
      方法就会重跑一次 3 万条数据的 filter + sort。
    </template>
    <template #tip>
      用 <code>computed</code> 缓存派生数据（依赖不变则直接复用）；列表项配合 <code>v-memo</code>；
      稳定不变的计算提到 <code>setup</code> 外层或普通模块；超大计算放 Worker。
    </template>
  </BugTip>

  <div class="list">
    <div class="list-row" v-for="r in (useComputed ? cachedFiltered : getFiltered()).slice(0, 40)" :key="r.id">
      <span class="col-name">{{ r.name }}</span>
      <span class="col-dept">{{ r.dept }}</span>
      <span class="col-score">{{ r.score }}</span>
    </div>
  </div>
</template>
