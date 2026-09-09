# perf-optimize（前端性能优化）

存放前端性能优化相关的资料、实践记录与可运行 demo。

## 目录约定

新建内容按主题命名文件，前缀分类便于检索：

| 前缀 | 主题 |
| --- | --- |
| `load-` | 加载性能（资源体积、懒加载、预加载、缓存策略） |
| `render-` | 渲染性能（重排重绘、长列表、动画、React 渲染优化） |
| `network-` | 网络（HTTP 缓存、CDN、请求合并、协议） |
| `build-` | 构建打包（Tree Shaking、分包、压缩、产物分析） |
| `metric-` | 性能指标与监控（Core Web Vitals、埋点、APM） |

示例：`render-long-list.md`、`build-bundle-split.md`。

## 可运行的性能实验室

两个刻意写满性能问题的练手项目，覆盖渲染 / 计算 / 响应式 / 内存 / 网络 / 构建体积：

| 项目 | 说明 | 启动 |
| --- | --- | --- |
| `react-lab/` | React 18 + TS + Vite，12 个案例 | `cd react-lab && npm install && npm run dev`（5173） |
| `vue-lab/` | Vue 3 + TS + Vite，11 个案例 | `cd vue-lab && npm install && npm run dev`（5273） |

每个案例都提供：可交互的问题现场 + 实时指标（FPS / 渲染次数 / 耗时）+ 复现步骤 + 根因 + 优化清单 + 验收标准。

## 与 perf-render 的分工

- `perf-render/`：渲染专题的零散笔记与 demo（如虚拟列表）。
- `perf-optimize/`：前端性能优化的完整体系，覆盖加载 / 渲染 / 网络 / 构建 / 监控。

## 待补充清单

- [ ] 加载性能：关键渲染路径、资源优先级、图片与字体优化
- [ ] 渲染性能：虚拟列表、避免重排、合成层与动画
- [ ] 网络：缓存策略、预连接、请求合并
- [ ] 构建：产物分析、代码分割、依赖治理
- [ ] 指标：LCP / INP / CLS 采集与优化手段
