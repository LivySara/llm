<script setup lang="ts">
/** 被动态 import 的重型组件：携带一大段常量数据，制造独立 chunk。 */
const BIG_TABLE = Array.from({ length: 20000 }, (_, i) => ({
  x: i,
  y: Math.sin(i / 100) * 100,
  label: `point-${i}`,
}))
</script>

<template>
  <div class="card">
    <div class="card-title">重型图表（异步 chunk｜heavy-chart-chunk）</div>
    <div class="card-value">携带 {{ BIG_TABLE.length.toLocaleString() }} 个点的常量数据</div>
  </div>
</template>
