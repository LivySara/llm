import { useState } from 'react'
import { fmt } from '../perf'
import { Bug, Metrics, Tip, Toolbar } from '../ui'

/**
 * 案例 10：请求瀑布 + 无缓存 + 重复请求
 * 🐛 依赖串行 await（N+1 请求）、同样的数据点一次就发一次请求、不做去重和缓存。
 * 💡 方向：Promise.all 并发、请求去重（inflight map）、缓存（SWR/React Query）、接口聚合（BFF/GraphQL）、预取。
 */

const ITEM_COUNT = 12

function fakeFetch(id: number, cache: Map<number, string>): Promise<string> {
  if (cache.has(id)) return Promise.resolve(`${cache.get(id)}（缓存）`)
  return new Promise((resolve) => {
    setTimeout(() => {
      const value = `详情-${id}`
      cache.set(id, value)
      resolve(value)
    }, 250)
  })
}

export default function RequestsDemo() {
  const [waterfallMs, setWaterfallMs] = useState(0)
  const [parallelMs, setParallelMs] = useState(0)
  const [requests, setRequests] = useState(0)
  const [items, setItems] = useState<string[]>([])
  const [cache] = useState(() => new Map<number, string>())

  const ids = Array.from({ length: ITEM_COUNT }, (_, i) => i + 1)

  const runWaterfall = async () => {
    const t0 = performance.now()
    const result: string[] = []
    // 🐛 串行 await：总耗时 = 单次耗时 × N
    for (const id of ids) {
      result.push(await fakeFetch(id, new Map()))
    }
    setWaterfallMs(performance.now() - t0)
    setRequests((n) => n + ITEM_COUNT)
    setItems(result)
  }

  const runParallel = async () => {
    const t0 = performance.now()
    // ✅ 并发 + 共享缓存
    const result = await Promise.all(ids.map((id) => fakeFetch(id, cache)))
    setParallelMs(performance.now() - t0)
    setRequests((n) => n + ITEM_COUNT)
    setItems(result)
  }

  return (
    <div>
      <Metrics
        items={[
          { label: '串行瀑布耗时', value: `${fmt(waterfallMs)} ms`, warn: waterfallMs > 1000 },
          { label: '并发+缓存耗时', value: `${fmt(parallelMs)} ms` },
          { label: '累计发起请求', value: requests },
          { label: '缓存命中', value: cache.size },
        ]}
      />
      <Toolbar>
        <button className="btn" onClick={runWaterfall}>
          串行瀑布（有问题）
        </button>
        <button className="btn" onClick={runParallel}>
          并发 + 缓存（已优化）
        </button>
      </Toolbar>

      <Bug>
        12 个详情串行请求 = 12 × 250ms ≈ 3s；且每次点击都重新发起（<b>无缓存、无去重</b>），快速连点会产生大量重复请求与竞态覆盖。
      </Bug>
      <Tip>
        ① 无依赖的请求用 <code>Promise.all</code> / <code>allSettled</code> 并发；② inflight map 做请求去重；③ React Query / SWR
        做缓存与失效；④ 后端聚合接口（BFF/DataLoader）消除 N+1；⑤ 预测用户行为做预取（prefetch on hover）。
      </Tip>

      <div className="list">
        {items.map((it, i) => (
          <div className="list-row" key={i}>
            <span className="col-name">{it}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
