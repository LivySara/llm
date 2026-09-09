import { useState } from 'react'
import { heavyFilterSort, makeRows } from './data'
import { fmt, useRenderTime } from '../perf'
import { Bug, Metrics, Tip, Toolbar } from '../ui'

const ROWS = makeRows(30000)

/**
 * 案例 6：输入风暴
 * 🐛 每敲一个字符都同步触发 3 万条数据过滤 + 大列表重渲染，输入延迟肉眼可见。
 * 💡 方向：受控转非受控、debounce/throttle、useDeferredValue + memo、Web Worker 过滤。
 */
export default function InputStormDemo() {
  const [keyword, setKeyword] = useState('')
  const [inputLatency, setInputLatency] = useState(0)
  const renderTime = useRenderTime()

  const handleChange = (value: string) => {
    const t0 = performance.now()
    setKeyword(value)
    // 🐛 同步 setState，React 会在同一帧内完成昂贵的过滤与渲染，这里量到的就是「按键到提交」的成本
    requestAnimationFrame(() => setInputLatency(performance.now() - t0))
  }

  const list = heavyFilterSort(ROWS, keyword, 'score')

  return (
    <div>
      <Metrics
        items={[
          { label: '按键响应延迟', value: `${fmt(inputLatency)} ms`, warn: inputLatency > 50 },
          { label: '上次渲染耗时', value: `${fmt(renderTime)} ms`, warn: renderTime > 30 },
          { label: '结果条数', value: list.length.toLocaleString() },
        ]}
      />
      <Toolbar>
        <input
          className="input"
          value={keyword}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="连续快速输入试试，例如 用户-12"
        />
        <button className="btn" onClick={() => handleChange('')}>
          清空
        </button>
      </Toolbar>

      <Bug>
        输入是最高优先级交互，却绑定了 O(n) 过滤 + 大列表重渲染：每个按键都要等几十毫秒，连续输入直接卡成幻灯片，
        且每次输入都会产生一次完整的 commit。
      </Bug>
      <Tip>
        ① 防抖/节流（<code>lodash/debounce</code> 或自实现）；② 低优先级更新 <code>useDeferredValue(keyword)</code> 配合
        <code>memo</code> 列表项；③ 输入框改非受控 + <code>ref</code>；④ 大数据过滤放 Web Worker / 预建索引。
      </Tip>

      <div className="list">
        {list.slice(0, 100).map((r) => (
          <div className="list-row" key={r.id}>
            <span className="col-name">{r.name}</span>
            <span className="col-dept">{r.dept}</span>
            <span className="col-score">{r.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
