import { useMemo, useState } from 'react'
import { DEMOS, type Category } from './demos/registry'
import { useFps } from './perf'

const CATEGORY_ORDER: Category[] = ['渲染', '计算', '布局动画', '内存', '网络', '构建体积']

export default function App() {
  const [activeId, setActiveId] = useState(DEMOS[0].id)
  const fps = useFps()

  const active = DEMOS.find((d) => d.id === activeId) ?? DEMOS[0]
  const grouped = useMemo(() => {
    const map = new Map<Category, typeof DEMOS>()
    for (const c of CATEGORY_ORDER) map.set(c, [])
    for (const d of DEMOS) map.get(d.category)?.push(d)
    return map
  }, [])

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>React 性能优化实验室</h1>
          <p className="subtitle">每一个案例都是「故意写错」的代码，先复现卡顿，再按提示动手优化</p>
        </div>
        <div className={`fps ${fps < 50 ? 'fps-bad' : ''}`}>
          <span className="fps-value">{fps}</span>
          <span className="fps-unit">FPS</span>
        </div>
      </header>

      <div className="body">
        <aside className="sidebar">
          {CATEGORY_ORDER.map((cat) => {
            const list = grouped.get(cat) ?? []
            if (!list.length) return null
            return (
              <div className="group" key={cat}>
                <div className="group-title">{cat}</div>
                {list.map((d) => (
                  <button
                    key={d.id}
                    className={`nav-item ${d.id === activeId ? 'nav-item-active' : ''}`}
                    onClick={() => setActiveId(d.id)}
                  >
                    <span>{d.title}</span>
                    <span className={`level level-${d.level}`}>{d.level}</span>
                  </button>
                ))}
              </div>
            )
          })}
          <div className="sidebar-footer">
            共 {DEMOS.length} 个案例 · 用 React DevTools Profiler + Performance 面板对照观察
          </div>
        </aside>

        <main className="main">
          <div className="main-head">
            <h2>{active.title}</h2>
            <div className="tags">
              <span className="tag">{active.category}</span>
              <span className="tag tag-ghost">难度 {active.level}</span>
            </div>
          </div>

          <section className="stage-panel">
            <DemoHost key={active.id} meta={active} />
          </section>

          <section className="notes">
            <div className="note">
              <h3>如何复现</h3>
              <ol>
                {active.reproduce.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
            <div className="note">
              <h3>可观察现象</h3>
              <ul>
                {active.symptoms.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="note">
              <h3>根因</h3>
              <ul>
                {active.causes.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="note note-fix">
              <h3>优化清单</h3>
              <ul>
                {active.fixes.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="note note-verify">
              <h3>验收标准</h3>
              <p dangerouslySetInnerHTML={{ __html: active.verify }} />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function DemoHost({ meta }: { meta: (typeof DEMOS)[number] }) {
  const Comp = meta.component
  return <Comp />
}
