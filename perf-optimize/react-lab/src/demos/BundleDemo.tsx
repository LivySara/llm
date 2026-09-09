import { useState } from 'react'
// 🐛 全量引入 lodash：只用了一个 debounce，却把整个 lodash（~70KB min / ~24KB gzip）打进首屏包
import _ from 'lodash'
import { Bug, Metrics, Tip, Toolbar } from '../ui'

/**
 * 案例 12：首屏包体积失控
 * 🐛 全量引入大依赖、所有路由/组件同步 import、没有代码分割。
 * 💡 方向：按需引入（lodash/debounce、lodash-es + Tree Shaking）、React.lazy + Suspense、动态 import、产物分析。
 */
export default function BundleDemo() {
  const [logs, setLogs] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  const useDebounce = () => {
    const fn = _.debounce((value: string) => {
      setLogs((l) => [`debounce 触发：${value}`, ...l].slice(0, 5))
    }, 300)
    fn(String(Date.now()))
  }

  const loadOnDemand = async () => {
    // ✅ 运行时按需加载，拆成独立 chunk
    const mod = await import('./HeavyChart')
    setLogs((l) => [`已按需加载：${mod.default.name}（${mod.chunkTag}）`, ...l].slice(0, 5))
    setLoaded(true)
  }

  return (
    <div>
      <Metrics
        items={[
          { label: 'lodash 引入方式', value: 'import _ from "lodash"（全量）' },
          { label: '首屏是否含大组件', value: '是（同步打包）' },
          { label: '按需 chunk', value: loaded ? '已加载' : '未加载' },
        ]}
      />
      <Toolbar>
        <button className="btn" onClick={useDebounce}>
          调用 _.debounce（触发全量 lodash）
        </button>
        <button className="btn" onClick={loadOnDemand}>
          动态 import 大组件（已优化）
        </button>
      </Toolbar>

      <Bug>
        只用到一个 <code>debounce</code>，却 <code>import _ from 'lodash'</code>：整包进首屏 chunk；
        重型图表组件同步 import，首屏 JS 直接膨胀，影响下载、解析、执行（LCP / TBT）。
      </Bug>
      <Tip>
        ① <code>import debounce from 'lodash/debounce'</code> 或换 <code>lodash-es</code> 享受 Tree Shaking；②{' '}
        <code>React.lazy(() =&gt; import('./HeavyChart'))</code> + <code>Suspense</code> 做路由/组件级分割；③ 用
        <code>rollup-plugin-visualizer</code> / <code>source-map-explorer</code> 定期体检；④ 第三方 SDK 延迟加载。
      </Tip>

      <div className="list">
        {logs.length === 0 && <div className="list-more">点击上方按钮观察行为（打开 DevTools → Network/Performance 对比）</div>}
        {logs.map((l, i) => (
          <div className="list-row" key={i}>
            <span className="col-name">{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
