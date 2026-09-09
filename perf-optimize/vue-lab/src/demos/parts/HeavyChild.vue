<script setup lang="ts">
import { busyWait } from '../data'
import { useUpdateCount } from '../../perf'

const props = defineProps<{
  title: string
  config: { color: string; size: number }
  onPick: (id: number) => void
}>()

busyWait(20) // 模拟重型子组件渲染
const renders = useUpdateCount()
</script>

<template>
  <div class="card" :style="{ borderColor: props.config.color }">
    <div class="card-title">{{ props.title }}（size={{ props.config.size }}）</div>
    <div class="card-value">渲染次数 <b>{{ renders }}</b></div>
    <button class="btn btn-small" @click="props.onPick(1)">选择</button>
  </div>
</template>
