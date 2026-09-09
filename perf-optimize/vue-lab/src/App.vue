<script setup lang="ts">
import { computed, ref } from 'vue'
import { DEMOS, type Category } from './demos/registry'
import { useFps } from './perf'

const CATEGORY_ORDER: Category[] = ['渲染', '响应式', '计算', '布局动画', '内存', '构建体积']

const activeId = ref(DEMOS[0].id)
const fps = useFps()
const active = computed(() => DEMOS.find((d) => d.id === activeId.value) ?? DEMOS[0])
const grouped = computed(() => {
  const map = new Map<Category, typeof DEMOS>()
  for (const c of CATEGORY_ORDER) map.set(c, [])
  for (const d of DEMOS) map.get(d.category)?.push(d)
  return map
})
</script>

<template>
  <div class="app">
    <header class="header">
      <div>
        <h1>Vue 性能优化实验室</h1>
        <p class="subtitle">每一个案例都是「故意写错」的代码，先复现卡顿，再按提示动手优化</p>
      </div>
      <div class="fps" :class="{ 'fps-bad': fps < 50 }">
        <span class="fps-value">{{ fps }}</span>
        <span class="fps-unit">FPS</span>
      </div>
    </header>

    <div class="body">
      <aside class="sidebar">
        <div class="group" v-for="(list, cat) in grouped" :key="String(cat)">
          <template v-if="list.length">
            <div class="group-title">{{ cat }}</div>
            <button
              v-for="d in list"
              :key="d.id"
              class="nav-item"
              :class="{ 'nav-item-active': d.id === activeId }"
              @click="activeId = d.id"
            >
              <span>{{ d.title }}</span>
              <span class="level" :class="`level-${d.level}`">{{ d.level }}</span>
            </button>
          </template>
        </div>
        <div class="sidebar-footer">共 {{ DEMOS.length }} 个案例 · 用 Vue DevTools Performance + Chrome Performance 面板对照观察</div>
      </aside>

      <main class="main">
        <div class="main-head">
          <h2>{{ active.title }}</h2>
          <div class="tags">
            <span class="tag">{{ active.category }}</span>
            <span class="tag tag-ghost">难度 {{ active.level }}</span>
          </div>
        </div>

        <section class="stage-panel">
          <component :is="active.component" :key="active.id" />
        </section>

        <section class="notes">
          <div class="note">
            <h3>如何复现</h3>
            <ol>
              <li v-for="s in active.reproduce" :key="s">{{ s }}</li>
            </ol>
          </div>
          <div class="note">
            <h3>可观察现象</h3>
            <ul>
              <li v-for="s in active.symptoms" :key="s">{{ s }}</li>
            </ul>
          </div>
          <div class="note">
            <h3>根因</h3>
            <ul>
              <li v-for="s in active.causes" :key="s">{{ s }}</li>
            </ul>
          </div>
          <div class="note note-fix">
            <h3>优化清单</h3>
            <ul>
              <li v-for="s in active.fixes" :key="s">{{ s }}</li>
            </ul>
          </div>
          <div class="note note-verify">
            <h3>验收标准</h3>
            <p v-html="active.verify" />
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
