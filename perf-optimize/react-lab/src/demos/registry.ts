import type { ComponentType } from 'react'
import LongListDemo from './LongListDemo'
import ExpensiveComputeDemo from './ExpensiveComputeDemo'
import ReRenderChainDemo from './ReRenderChainDemo'
import ContextBlastDemo from './ContextBlastDemo'
import InlinePropsDemo from './InlinePropsDemo'
import InputStormDemo from './InputStormDemo'
import LayoutThrashDemo from './LayoutThrashDemo'
import AnimationDemo from './AnimationDemo'
import MemoryLeakDemo from './MemoryLeakDemo'
import RequestsDemo from './RequestsDemo'
import MainThreadBlockDemo from './MainThreadBlockDemo'
import BundleDemo from './BundleDemo'

export type Category = '渲染' | '计算' | '内存' | '网络' | '布局动画' | '构建体积'

export interface DemoMeta {
  id: string
  title: string
  category: Category
  level: '入门' | '进阶' | '高难'
  /** 如何复现问题 */
  reproduce: string[]
  /** 能观察到的现象 */
  symptoms: string[]
  /** 根因 */
  causes: string[]
  /** 优化清单 */
  fixes: string[]
  /** 优化后验收方式 */
  verify: string
  component: ComponentType
}

export const DEMOS: DemoMeta[] = [
  {
    id: 'long-list',
    title: '长列表全量渲染',
    category: '渲染',
    level: '入门',
    reproduce: ['把条数拉到 5 万', '点击「生成并渲染」', '在搜索框里连续输入字符'],
    symptoms: ['点击后白屏/卡顿数百毫秒', '滚动掉帧', '搜索输入延迟明显'],
    causes: ['可视区外的数据也被创建成真实 DOM', '节点数量线性上涨导致样式计算、布局、绘制成本暴涨'],
    fixes: ['虚拟滚动（react-window / @tanstack/virtual / 手写窗口化）', '分页或无限滚动', 'content-visibility: auto 跳过屏幕外渲染', '搜索下沉到索引或 Worker'],
    verify: '5 万条数据下首屏渲染 &lt; 100ms、滚动稳定 60fps、DOM 节点数保持在 100 以内',
    component: LongListDemo,
  },
  {
    id: 'expensive-compute',
    title: '重复且昂贵的计算',
    category: '计算',
    level: '入门',
    reproduce: ['点击「切换主题」或「触发一次无关重渲染」', '观察「本次计算耗时」'],
    symptoms: ['与列表无关的操作也要卡顿', '输入关键字时明显掉帧'],
    causes: ['派生数据没有缓存，每次 render 都重跑 filter+sort', '昂贵的 fib 与渲染耦合在同一个函数体'],
    fixes: ['useMemo 缓存派生结果并缩小依赖', '结果稳定的计算提到组件外 / useRef 固化', '递归改迭代 + 记忆化', '大计算迁移到 Web Worker'],
    verify: '切换主题/点按钮时计算耗时为 0ms，只有关键字或排序变化才重新计算',
    component: ExpensiveComputeDemo,
  },
  {
    id: 're-render-chain',
    title: '重渲染风暴',
    category: '渲染',
    level: '入门',
    reproduce: ['连续点击「count + 1」', '观察子组件渲染次数与渲染耗时', '勾选 React.memo 再点一次对比'],
    symptoms: ['单次点击耗时 ~100ms', '不依赖该 state 的子组件也全部重渲染'],
    causes: ['父组件 state 变化触发整棵子树 render', '子组件渲染本身很重却没做记忆化'],
    fixes: ['React.memo + 稳定 props', '状态下沉到真正使用它的组件', '把不变的子树通过 children 提到外层', '重型更新用 useDeferredValue / startTransition 降级'],
    verify: '点击按钮后子组件渲染次数不再增长，渲染耗时降到 10ms 内',
    component: ReRenderChainDemo,
  },
  {
    id: 'context-blast',
    title: 'Context 引发全量重渲染',
    category: '渲染',
    level: '进阶',
    reproduce: ['保持 tick 运行', '观察「用户信息」「购物车」的渲染次数'],
    symptoms: ['只关心 user/cart 的组件每 300ms 重渲染一次', '整棵消费者子树持续消耗 CPU'],
    causes: ['所有状态塞进一个 Context，value 每次都是新对象', 'Context 没有选择器能力，任意字段变化通知全部消费者'],
    fixes: ['按变化频率拆分 Context', '状态与 dispatch 分离，dispatch 用稳定引用', 'useSyncExternalStore 做选择器订阅', '高频共享状态用 zustand / jotai'],
    verify: 'tick 变化时只有时钟组件重渲染，其它组件渲染次数保持不变',
    component: ContextBlastDemo,
  },
  {
    id: 'inline-props',
    title: '内联 props 让 memo 失效',
    category: '渲染',
    level: '进阶',
    reproduce: ['点击「父组件 state + 1」', '观察子组件渲染次数', '勾选「使用稳定引用」再点一次对比'],
    symptoms: ['memo 包裹了却依然每次都重渲染', '每次渲染耗时 20ms+'],
    causes: ['内联对象/函数/数组/children 每次都是新引用', 'memo 的浅比较必然不相等'],
    fixes: ['useCallback 固化回调', 'useMemo 固化对象与数组', '常量外提到模块作用域', 'children 提升到不会重渲染的层级'],
    verify: '父组件 state 变化时子组件渲染次数保持不变',
    component: InlinePropsDemo,
  },
  {
    id: 'input-storm',
    title: '输入风暴',
    category: '渲染',
    level: '进阶',
    reproduce: ['在输入框里快速连续输入「用户-123」', '观察按键响应延迟'],
    symptoms: ['每个按键卡顿几十毫秒', '输入过程中列表闪烁、掉帧'],
    causes: ['每次 onChange 同步触发全量过滤 + 大列表 commit', '高优先级输入被低优先级渲染拖累'],
    fixes: ['debounce / throttle', 'useDeferredValue + memo 列表项', '输入框改非受控（ref）', '过滤放进 Web Worker 或预建索引'],
    verify: '连续输入时输入框无卡顿，延迟 &lt; 16ms，列表允许「慢一拍」更新',
    component: InputStormDemo,
  },
  {
    id: 'layout-thrash',
    title: '强制同步布局（Layout Thrashing）',
    category: '布局动画',
    level: '进阶',
    reproduce: ['点击「读写交替」', '再点击「读写分离」', '对比两者耗时'],
    symptoms: ['同样的 DOM 操作，耗时相差数倍', 'Performance 面板里出现大量 Layout 记录'],
    causes: ['循环内「读布局属性 → 写样式」交替，强制浏览器反复提前布局'],
    fixes: ['读写分离：先批量读，再批量写', '用 transform / opacity 代替几何属性', '测量逻辑放到 rAF 或 ResizeObserver 里批处理'],
    verify: '耗时下降到 1/3 以下，Performance 中强制布局警告消失',
    component: LayoutThrashDemo,
  },
  {
    id: 'animation',
    title: '动画越过合成层',
    category: '布局动画',
    level: '进阶',
    reproduce: ['点击「开始」', '观察 FPS', '切换为 transform 再对比'],
    symptoms: ['left/top 动画时 FPS 掉到 10 以下', '主线程被 Style/Layout/Paint 占满'],
    causes: ['修改 left/top 会触发布局与重绘，且逐元素 JS 驱动'],
    fixes: ['改用 transform: translate3d / opacity', '必要时 will-change 提升合成层（注意别滥用）', '减少同时动画的元素，装饰动画交给 CSS'],
    verify: 'FPS 回到 55+，Performance 中不再有逐帧 Layout/Paint',
    component: AnimationDemo,
  },
  {
    id: 'memory-leak',
    title: '内存泄漏与僵尸副作用',
    category: '内存',
    level: '高难',
    reproduce: ['点击「挂载组件」再「卸载组件」', '卸载后滚动页面，观察 scroll 计数是否还在涨'],
    symptoms: ['卸载后全局监听仍在响应', '反复挂载后内存持续上升，控制台出现更新已卸载组件的警告'],
    causes: ['useEffect 没有返回清理函数', '全局监听被模块级变量持有无法 GC', '定时器回调里对已卸载组件 setState'],
    fixes: ['每个副作用都返回清理函数', 'AbortController 统一取消请求', '异步回调判断 mountedRef', 'Memory 面板做快照对比验证'],
    verify: '卸载后所有计数停止增长，反复挂载 20 次内存无明显上升',
    component: MemoryLeakDemo,
  },
  {
    id: 'requests',
    title: '请求瀑布与缓存缺失',
    category: '网络',
    level: '入门',
    reproduce: ['点击「串行瀑布」', '再点击「并发 + 缓存」', '多次点击观察请求数'],
    symptoms: ['12 个请求串行耗时 ~3s', '重复点击产生大量重复请求'],
    causes: ['无依赖请求被写成串行 await（N+1）', '没有缓存与 inflight 去重'],
    fixes: ['Promise.all / allSettled 并发', 'inflight map 去重 + LRU 缓存', 'React Query / SWR 统一缓存与失效', 'BFF 聚合接口，预取关键数据'],
    verify: '总耗时从 3s 降到 ~250ms，重复点击不再新增请求',
    component: RequestsDemo,
  },
  {
    id: 'main-thread-block',
    title: '长任务阻塞主线程',
    category: '渲染',
    level: '进阶',
    reproduce: ['点击「同步计算 fib(42)」', '期间观察小球与 FPS'],
    symptoms: ['小球静止 1~2 秒', '按钮点不动，INP/TBT 恶化'],
    causes: ['同步 JS 独占主线程，渲染与事件全部排队'],
    fixes: ['Web Worker 承载纯计算', '时间切片：rAF / scheduler.postTask / requestIdleCallback', '优化算法复杂度', 'startTransition 标记可中断更新'],
    verify: '计算期间小球保持运动，FPS 不低于 45，无 &gt; 50ms 的 Long Task',
    component: MainThreadBlockDemo,
  },
  {
    id: 'bundle',
    title: '首屏包体积失控',
    category: '构建体积',
    level: '进阶',
    reproduce: ['执行 npm run build 观察产物体积', '点击「动态 import 大组件」观察 Network 是否新增 chunk'],
    symptoms: ['首屏 JS 过大，弱网下白屏时间长', '只用一个函数却引入整个库'],
    causes: ['全量引入 lodash 无法 Tree Shaking', '重型组件同步 import，未做代码分割'],
    fixes: ['按需引入 lodash/debounce 或改用 lodash-es', 'React.lazy + Suspense 路由级/组件级分割', 'rollup-plugin-visualizer 定期体检', '第三方 SDK 延迟加载'],
    verify: '首屏 chunk 明显下降，重型组件独立成按需加载的 chunk',
    component: BundleDemo,
  },
]
