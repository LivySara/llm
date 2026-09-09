<script setup lang="ts">
/**
 * 案例 5：不稳定的 props 让子组件反复更新
 * 🐛 模板里内联对象/箭头函数，每次父组件更新都是新引用，子组件被迫重新渲染。
 * 💡 方向：常量外提、computed/toRef 固化、事件用稳定函数引用、必要时用 v-memo。
 */
import { computed, ref } from 'vue'
import { fmt, useUpdateTime } from '../perf'
import Metrics from '../components/Metrics.vue'
import BugTip from '../components/BugTip.vue'
import HeavyChild from './parts/HeavyChild.vue'

const counter = ref(0)
const stable = ref(false)
const { cost } = useUpdateTime()

// ✅ 对照：稳定引用（setup 中只创建一次）
const STABLE_CONFIG = { color: '#28c76f', size: 12 }
const stableConfig = computed(() => STABLE_CONFIG)
function stablePick(id: number) {
  log(`stable pick ${id}`)
}

// 模板里内联箭头函数时，每次渲染都会生成新函数引用
function log(msg: string) {
  console.log(msg)
}
</script>

<template>
  <Metrics
    :items="[
      { label: '父组件状态', value: counter },
      { label: '上次更新耗时', value: `${fmt(cost)} ms`, warn: cost > 40 },
      { label: '模式', value: stable ? '稳定引用（已修复）' : '内联 props（有问题）' },
    ]"
  />

  <div class="toolbar">
    <button class="btn" @click="counter++">父组件状态 +1</button>
    <label class="switch">
      <input type="checkbox" v-model="stable" />
      使用稳定引用（对照，切换会重建子组件、计数归零）
    </label>
  </div>

  <BugTip>
    <template #bug>
      模板中写 <code>:config="{ color: '#ff6b6b' }"</code> 或 <code>@click="(id) =&gt; ..."</code>：
      每次父组件更新都会生成<b>全新对象/函数</b>，子组件 props 永不相等，20ms 的昂贵渲染被反复触发。
    </template>
    <template #tip>
      把配置对象与事件处理函数提到 <code>setup</code> 外层或用 <code>computed</code> 固化；列表项用
      <code>v-memo</code> 精确控制更新；大子组件可用 <code>defineOptions({ inheritAttrs: false })</code> 减少无用属性透传。
    </template>
  </BugTip>

  <div class="cards">
    <HeavyChild
      v-if="stable"
      title="稳定引用"
      :config="stableConfig"
      :on-pick="stablePick"
    />
    <HeavyChild
      v-else
      title="内联 props"
      :config="{ color: '#ff6b6b', size: 12 }"
      :on-pick="(id: number) => log(`inline pick ${id}`)"
    />
  </div>
</template>
