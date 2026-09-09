import { useState } from 'react'
import { makeRows, type Row } from './data'
import { fmt, useRenderTime } from '../perf'
import { Bug, Field, Metrics, Tip, Toolbar } from '../ui'

/**
 * 案例 1：长列表全量渲染
 * 🐛 一次性把 N 万条数据渲染成真实 DOM，首屏/交互都会卡死。
 * 💡 方向：虚拟滚动（react-window / react-virtuoso / 手写）、分页、Content-Visibility。
 */
export default function LongListDemo() {
  const [count, setCount] = useState(5000)
  const [rows, setRows] = useState<Row[]>(() => makeRows(5000))
  const [buildMs, setBuildMs] = useState(0)
  const [keyword, setKeyword] = useState('')
  const renderTime = useRenderTime()

  const regenerate = () => {
    setKeyword('')
    const t0 = performance.now()
    const next = makeRows(count)
    setBuildMs(performance.now() - t0)
    setRows(next)
  }

  // 🐛 不做任何窗口化：所有数据一次性渲染成 DOM
  const visible = keyword ? rows.filter((r) => r.name.includes(keyword)) : rows

  return (
    <div>
      <Metrics
        items={[
          { label: '数据条数', value: rows.length.toLocaleString() },
          { label: 'DOM 行数', value: rows.length.toLocaleString(), warn: rows.length > 5000 },
          { label: '数据生成耗时', value: `${fmt(buildMs)} ms` },
          { label: '上次渲染耗时', value: `${fmt(renderTime)} ms`, warn: renderTime > 100 },
        ]}
      />
      <Toolbar>
        <Field label={`条数 ${count.toLocaleString()}`}>
          <input
            type="range"
            min={1000}
            max={100000}
            step={1000}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </Field>
        <button className="btn" onClick={regenerate}>
          生成并渲染
        </button>
        <Field label="搜索（每次输入都会全量过滤）">
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="输入 用户-1" />
        </Field>
      </Toolbar>

      <Bug>
        可视区只有 300 行，却把 <b>全部 {rows.length.toLocaleString()} 行</b> 都渲染成了 DOM：创建节点、样式计算、布局、绘制全部线性上涨，
        滚动与输入都会掉帧。
      </Bug>
      <Tip>
        只渲染可视区（虚拟列表 / 窗口化），或 <code>content-visibility: auto</code> + 分页；搜索走索引/Web Worker，避免在主线程 filter 全量数据。
      </Tip>

      <div className="list">
        {visible.map((r) => (
          <div className="list-row" key={r.id}>
            <span className="avatar" style={{ background: `hsl(${r.id % 360} 60% 45%)` }}>
              {r.name.slice(-1)}
            </span>
            <span className="col-name">{r.name}</span>
            <span className="col-email">{r.email}</span>
            <span className="col-dept">{r.dept}</span>
            <span className="col-tag">{r.tag}</span>
            <span className="col-bar">
              <i style={{ width: `${r.score}%` }} />
            </span>
          </div>
        ))}
        {rows.length > 20 && <div className="list-more">…… 以上 {visible.length.toLocaleString()} 行全部是真实 DOM，可视区只能看到约 20 行</div>}
      </div>
    </div>
  )
}
