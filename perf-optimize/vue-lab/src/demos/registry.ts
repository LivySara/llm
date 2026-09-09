import type { Component } from 'vue'
import LongListDemo from './LongListDemo.vue'
import DeepReactiveDemo from './DeepReactiveDemo.vue'
import ComputedCostDemo from './ComputedCostDemo.vue'
import WatchDeepDemo from './WatchDeepDemo.vue'
import PropsStabilityDemo from './PropsStabilityDemo.vue'
import InputStormDemo from './InputStormDemo.vue'
import VIfVShowDemo from './VIfVShowDemo.vue'
import MemoryLeakDemo from './MemoryLeakDemo.vue'
import VForKeyMemoDemo from './VForKeyMemoDemo.vue'
import MainThreadBlockDemo from './MainThreadBlockDemo.vue'
import BundleDemo from './BundleDemo.vue'

export type Category = '渲染' | '响应式' | '计算' | '内存' | '布局动画' | '构建体积'

export interface DemoMeta {
  id: string
  title: string
  category: Category
  level: '入门' | '进阶' | '高难'
  reproduce: string[]
  symptoms: string[]
  causes: string[]
  fixes: string[]
  verify: string
  component: Component
}

export const DEMOS: DemoMeta[] = [
  {
    id: 'long-list',
    title: '长列表全量渲染',
    category: '渲染',
    level: '入门',
    reproduce: ['把条数拉到 3 万以上', '点击「生成并渲染」', '在搜索框里连续输入'],
    symptoms: ['点击后白屏/卡顿数百毫秒', '滚动掉帧', '搜索输入延迟明显'],
    causes: ['可视区外的数据也被创建成真实 DOM', 'patch、样式计算、布局、绘制成本随节点数线性上涨'],
    fixes: ['虚拟滚动（vue-virtual-scroller / @tanstack/vue-virtual）', '分页或无限滚动', 'content-visibility: auto', '数据用 shallowRef 避免深度代理'],
    verify: '5 万条数据下首屏 &lt; 100ms、滚动稳定 60fps、DOM 节点数保持在 100 以内',
    component: LongListDemo,
  },
  {
    id: 'deep-reactive',
    title: '深度响应式的大数据',
    category: '响应式',
    level: '进阶',
    reproduce: ['选择 ref 深度代理 → 创建数据（10 万条）', '记录创建耗时', '切换到 shallowRef / Object.freeze 再对比', '点击「修改第一项」对比更新耗时'],
    symptoms: ['创建耗时数百毫秒', '内存占用明显偏高', '单次更新卡顿'],
    causes: ['ref/reactive 递归为每条数据建立 Proxy', '代理本身有内存与访问开销，而列表数据并不需要逐字段追踪'],
    fixes: ['shallowRef + triggerRef', 'Object.freeze / markRaw 跳过代理', '只让驱动视图的字段保持响应式', '配合虚拟滚动减少数据量'],
    verify: '创建与更新耗时下降一个数量级，内存快照无大量 Proxy',
    component: DeepReactiveDemo,
  },
  {
    id: 'computed-cost',
    title: '模板里调用方法 / 计算未缓存',
    category: '计算',
    level: '入门',
    reproduce: ['点击「无关状态 +1」', '观察「本次计算耗时」', '勾选改用 computed 后再点一次'],
    symptoms: ['无关状态变化也会卡顿', '输入关键字时明显掉帧'],
    causes: ['模板中直接调用方法，每次组件更新都会执行', 'filter+sort 的结果没有缓存'],
    fixes: ['改用 computed 缓存派生数据', '列表项加 v-memo', '稳定计算提到 setup 外层', '超大计算放 Web Worker'],
    verify: '无关状态变化时计算耗时为 0ms',
    component: ComputedCostDemo,
  },
  {
    id: 'watch-deep',
    title: 'deep watch 大对象',
    category: '响应式',
    level: '进阶',
    reproduce: ['点击「开始高频更新」', '观察 watch 触发次数与页面流畅度'],
    symptoms: ['每 200ms 一次全量遍历', '主线程被依赖收集与回调占满'],
    causes: ['deep: true 会递归遍历整棵对象树收集依赖', '任意深层字段变化都会触发回调，形成回调风暴'],
    fixes: ['精确 getter：watch(() => state.user.name, cb)', '用 watchEffect 收敛依赖', '高频回调防抖/节流', '大数据不要放进响应式系统'],
    verify: '回调只在实际关心的字段变化时触发，且耗时 &lt; 1ms',
    component: WatchDeepDemo,
  },
  {
    id: 'props-stability',
    title: '不稳定的 props 触发子组件更新',
    category: '渲染',
    level: '入门',
    reproduce: ['连续点击「父组件状态 +1」', '观察子组件渲染次数', '勾选稳定引用后对比'],
    symptoms: ['子组件每次都被更新', '单次更新 20ms+'],
    causes: ['模板内联的对象/箭头函数每次都是新引用', 'props 变化导致子组件被迫重新渲染'],
    fixes: ['配置对象与事件提到 setup 外层或用 computed 固化', '列表项用 v-memo', '减少无意义的属性透传'],
    verify: '父组件状态变化时子组件渲染次数不再增长',
    component: PropsStabilityDemo,
  },
  {
    id: 'input-storm',
    title: '输入风暴',
    category: '渲染',
    level: '入门',
    reproduce: ['在输入框快速连续输入「用户-123」', '观察按键响应延迟', '勾选防抖后对比'],
    symptoms: ['每个按键卡顿几十毫秒', '输入过程中列表闪烁掉帧'],
    causes: ['v-model 直接驱动 3 万条数据过滤 + 大列表 patch', '高优先级输入被低优先级渲染拖累'],
    fixes: ['防抖 / 节流', 'v-memo 减少 diff', '输入值本地化，结果异步同步', '过滤下沉 Worker 或预建索引'],
    verify: '连续输入时输入框无卡顿，延迟 &lt; 16ms',
    component: InputStormDemo,
  },
  {
    id: 'vif-vshow',
    title: 'v-if / v-show 误用',
    category: '渲染',
    level: '入门',
    reproduce: ['保持 v-if 模式，连续点击「切换显隐」', '切换到 v-show 再点一次', '对比切换耗时'],
    symptoms: ['v-if 切换耗时是 v-show 的数十倍', '频繁切换时明显掉帧'],
    causes: ['v-if 每次都要销毁并重建整棵子树（2000 节点）'],
    fixes: ['高频切换改用 v-show', '需要保留状态用 KeepAlive', '拆分大区块、做懒加载'],
    verify: '切换耗时降到 5ms 以内，无子树重建',
    component: VIfVShowDemo,
  },
  {
    id: 'memory-leak',
    title: '内存泄漏与僵尸副作用',
    category: '内存',
    level: '高难',
    reproduce: ['点击「挂载组件」再「卸载组件」', '卸载后滚动页面，观察 scroll 计数是否还在涨'],
    symptoms: ['卸载后全局监听仍在响应', '反复挂载内存持续上升'],
    causes: ['onUnmounted 里只清了定时器，忘了 removeEventListener', '闭包持有已卸载组件的 ref'],
    fixes: ['onUnmounted / onScopeDispose 清理所有副作用', '请求用 AbortController', 'Memory 面板做快照对比验证'],
    verify: '卸载后所有计数停止增长，反复挂载 20 次内存无明显上升',
    component: MemoryLeakDemo,
  },
  {
    id: 'key-memo',
    title: 'key 用错 + 缺少 v-memo',
    category: '渲染',
    level: '进阶',
    reproduce: ['在某几行的输入框里输入内容', '点击「在头部插入一行」观察输入框内容是否错位', '关闭 index key 再试一次', '开关 v-memo 对比更新耗时'],
    symptoms: ['插入/排序后行内输入状态错位', '父级状态变化导致整列表全量 diff'],
    causes: ['用 index 当 key，key 随位置变化而无法正确复用', '没有 v-memo，所有列表项都要参与 diff'],
    fixes: ['key 使用稳定唯一业务 id', '大列表项加 v-memo="[item.id, item.score]"', '减少单帧 patch 规模'],
    verify: '插入/排序后行内状态不错位，父级更新时列表 diff 被跳过',
    component: VForKeyMemoDemo,
  },
  {
    id: 'main-thread-block',
    title: '长任务阻塞主线程',
    category: '渲染',
    level: '进阶',
    reproduce: ['点击「同步计算 fib(42)」', '期间观察小球与 FPS'],
    symptoms: ['小球静止 1~2 秒', '按钮点不动，INP/TBT 恶化'],
    causes: ['同步 JS 独占主线程，渲染与事件全部排队'],
    fixes: ['Web Worker 承载纯计算', 'rAF / requestIdleCallback / scheduler.postTask 切片', '优化算法复杂度'],
    verify: '计算期间小球保持运动，无 &gt; 50ms 的 Long Task',
    component: MainThreadBlockDemo,
  },
  {
    id: 'bundle',
    title: '首屏包体积失控',
    category: '构建体积',
    level: '进阶',
    reproduce: ['执行 npm run build 观察产物体积', '点击「按需加载」观察 Network 是否新增 chunk'],
    symptoms: ['首屏 JS 过大，弱网白屏时间长', '只用一个函数却引入整个 lodash'],
    causes: ['全量引入 lodash 无法 Tree Shaking', '重型组件同步 import，未做代码分割'],
    fixes: ['按需引入 lodash/debounce 或 lodash-es', 'defineAsyncComponent / 路由懒加载', 'rollup-plugin-visualizer 定期体检'],
    verify: '首屏 chunk 明显下降，重型组件独立成按需 chunk',
    component: BundleDemo,
  },
]
