<script setup lang="ts">
/**
 * 案例 7：v-if / v-show 误用
 * 🐛 高频切换一个包含上千节点的区块时用 v-if：每次都要销毁并重建整棵子树。
 * 💡 方向：频繁切换用 v-show（或 CSS 控制），配合 KeepAlive 缓存，减少单块节点规模。
 */
import { nextTick, ref } from 'vue'
import { fmt } from '../perf'
import Metrics from '../components/Metrics.vue'
import BugTip from '../components/BugTip.vue'

const size = 2000
const mode = ref<'v-if' | 'v-show'>('v-if')
const visible = ref(true)
const lastMs = ref(0)

async function toggle() {
  const t0 = performance.now()
  visible.value = !visible.value
  await nextTick()
  lastMs.value = performance.now() - t0
}
</script>

<template>
  <Metrics
    :items="[
      { label: '区块节点数', value: size.toLocaleString() },
      { label: '切换耗时', value: `${fmt(lastMs)} ms`, warn: lastMs > 30 },
      { label: '当前指令', value: mode },
      { label: '可见性', value: visible ? '显示' : '隐藏' },
    ]"
  />

  <div class="toolbar">
    <label class="field">
      <span>指令</span>
      <select v-model="mode">
        <option value="v-if">v-if（有问题）</option>
        <option value="v-show">v-show（已优化）</option>
      </select>
    </label>
    <button class="btn" @click="toggle">切换显隐</button>
    <span class="muted">连续快速点击，观察耗时差异</span>
  </div>

  <BugTip>
    <template #bug>
      高频切换用 <code>v-if</code>：每次都要<b>卸载 + 重建</b> 2000 个节点（创建 vnode、挂载 DOM、执行指令与组件生命周期），
      比单纯切一次 <code>display</code> 贵几个数量级。
    </template>
    <template #tip>
      频繁切换改 <code>v-show</code>；需要保留状态用 <code>&lt;KeepAlive&gt;</code>；把大区块进一步拆小或做懒加载；
      真正不需要时（低频、首屏外）才用 <code>v-if</code>。
    </template>
  </BugTip>

  <div class="bars">
    <template v-if="mode === 'v-if'">
      <div v-if="visible" class="bars-inner">
        <div class="bar" v-for="i in size" :key="i" :style="{ width: '8px', height: `${8 + (i % 20)}px` }" />
      </div>
    </template>
    <div v-else v-show="visible" class="bars-inner">
      <div class="bar" v-for="i in size" :key="i" :style="{ width: '8px', height: `${8 + (i % 20)}px` }" />
    </div>
  </div>
</template>
