<script setup lang="ts">
/**
 * 案例 11：首屏包体积失控
 * 🐛 全量引入 lodash、重型组件同步 import，没有代码分割。
 * 💡 方向：按需引入、defineAsyncComponent 异步组件、路由级分割、产物分析。
 */
import { computed, defineAsyncComponent, ref, shallowRef } from 'vue'
// 🐛 只用了一个 debounce，却把整个 lodash 打进首屏包
import _ from 'lodash'
import Metrics from '../components/Metrics.vue'
import BugTip from '../components/BugTip.vue'

const logs = ref<string[]>([])
const heavyName = ref('未加载')
const HeavyChart = shallowRef<any>(null)

const metrics = computed(() => [
  { label: 'lodash 引入方式', value: "import _ from 'lodash'（全量）", warn: true },
  { label: '重型组件', value: heavyName.value },
  { label: '首屏 JS', value: '包含 lodash + 全部组件', warn: true },
])

function useDebounce() {
  const fn = _.debounce((value: string) => {
    logs.value = [`debounce 触发：${value}`, ...logs.value].slice(0, 5)
  }, 300)
  fn(String(Date.now()))
}

async function loadOnDemand() {
  HeavyChart.value = defineAsyncComponent(() => import('./HeavyChart.vue'))
  heavyName.value = 'HeavyChart（按需 chunk）'
  logs.value = ['已发起动态 import，观察 Network 里新增的 chunk', ...logs.value].slice(0, 5)
}
</script>

<template>
  <Metrics :items="metrics" />

  <div class="toolbar">
    <button class="btn" @click="useDebounce">调用 _.debounce</button>
    <button class="btn" @click="loadOnDemand">defineAsyncComponent 按需加载（已优化）</button>
  </div>

  <BugTip>
    <template #bug>
      只用到一个 <code>debounce</code> 却 <code>import _ from 'lodash'</code>：整包进首屏 chunk；
      重型图表同步 import，首屏 JS 膨胀，拖慢下载、解析与执行（LCP / TBT）。
    </template>
    <template #tip>
      <code>import debounce from 'lodash/debounce'</code> 或改用 <code>lodash-es</code> 享受 Tree Shaking；
      用 <code>defineAsyncComponent(() =&gt; import('./X.vue'))</code> / 路由懒加载；
      <code>rollup-plugin-visualizer</code> 定期体检产物。
    </template>
  </BugTip>

  <div class="cards">
    <Suspense v-if="HeavyChart">
      <component :is="HeavyChart" />
    </Suspense>
    <div class="card card-empty" v-else>重型组件尚未加载</div>
  </div>

  <div class="list">
    <div class="list-row" v-for="(l, i) in logs" :key="i"><span class="col-name">{{ l }}</span></div>
    <div v-if="!logs.length" class="list-more">点击上方按钮，打开 DevTools → Network 对比</div>
  </div>
</template>
