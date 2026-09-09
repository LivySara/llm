import { useState } from 'react'
import { fib, heavyFilterSort, makeRows, type Row } from './data'
import { fmt, useRenderTime } from '../perf'
import { Bug, Field, Metrics, Tip, Toolbar } from '../ui'

const ROWS = makeRows(30000)

/**
 * 案例 2：重复且昂贵的计算
 * 🐛 每次 render 都重跑 filter + sort + fib，且与「主题」等无关状态耦合。
 * 💡 方向：useMemo 缓存派生数据、缩小依赖、把 fib 换成迭代/记忆化、Worker 化。
 */
export default function ExpensiveComputeDemo() {
  const [keyword, setKeyword] = useState('')
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'dept'>('score')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [clicks, setClicks] = useState(0)
  const [cost, setCost] = useState(0)
  const renderTime = useRenderTime()

  // 🐛 没有任何缓存：任意 state 变化（包括切换主题、点按钮）都会重跑
  const t0 = performance.now()
  const list = heavyFilterSort(ROWS, keyword, sortBy)
  const fibResult = fib(28)
  const computeMs = performance.now() - t0

  const triggerRerender = () => {
    setCost(0)
    setClicks((c) => c + 1)
    setCost(computeMs)
  }

  return (
    <div className={theme === 'dark' ? 'box box-dark' : 'box'}>
      <Metrics
        items={[
          { label: '本次计算耗时', value: `${fmt(computeMs)} ms`, warn: computeMs > 30 },
          { label: '上次渲染耗时', value: `${fmt(renderTime)} ms`, warn: renderTime > 50 },
          { label: 'fib(28)', value: fibResult },
          { label: '无关操作次数', value: clicks },
        ]}
      />
      <Toolbar>
        <Field label="关键字">
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="用户-1" />
        </Field>
        <Field label="排序">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'score')}>
            <option value="score">分数</option>
            <option value="name">名称</option>
            <option value="dept">部门</option>
          </select>
        </Field>
        <button className="btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          切换主题（与列表无关）
        </button>
        <button className="btn" onClick={triggerRerender}>
          触发一次无关重渲染
        </button>
      </Toolbar>

      <Bug>
        切换主题、点按钮这类<b>与列表无关</b>的操作，也会让 3 万条数据重新 filter+sort 并重新计算 fib(28)（{fmt(cost || computeMs)} ms 白烧掉）。
      </Bug>
      <Tip>
        用 <code>useMemo(() =&gt; heavyFilterSort(ROWS, keyword, sortBy), [keyword, sortBy])</code> 缓存；把昂贵且稳定的结果提到组件外或用
        <code>useRef</code> 固化；纯计算型 fib 改成迭代 + 记忆化；必要时丢进 Web Worker。
      </Tip>

      <div className="list">
        {list.slice(0, 60).map((r: Row) => (
          <div className="list-row" key={r.id}>
            <span className="col-name">{r.name}</span>
            <span className="col-dept">{r.dept}</span>
            <span className="col-tag">{r.tag}</span>
            <span className="col-score">{r.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
