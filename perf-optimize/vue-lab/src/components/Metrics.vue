<script setup lang="ts">
interface Item {
  label: string
  value: string | number
  warn?: boolean
}
defineProps<{ items: Item[] }>()
</script>

<template>
  <div class="metrics">
    <div v-for="it in items" :key="it.label" class="metric" :class="{ 'metric-warn': it.warn }">
      <span class="metric-label">{{ it.label }}</span>
      <span class="metric-value">{{ it.value }}</span>
    </div>
  </div>
</template>
