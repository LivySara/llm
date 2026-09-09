import { createContext, useContext, useEffect, useState } from 'react'
import { busyWait, fmt } from './data'
import { useRenderCount, useRenderTime } from '../perf'
import { Bug, Metrics, Tip, Toolbar } from '../ui'

/**
 * 案例 4：Context 大对象引发的全量重渲染
 * 🐛 所有字段塞进一个 Context，且 value 每次都是新对象；高频变化的 tick 让所有消费者一起重渲染。
 * 💡 方向：Context 拆分（状态与 dispatch 分离）、useSyncExternalStore/订阅选择器、zustand/jotai 等。
 */

interface Store {
  user: { name: string; role: string }
  cart: number
  tick: number
  setCart: (n: number) => void
}

const StoreContext = createContext<Store>(null as unknown as Store)

function StoreProvider({ children }: { children: React.ReactNode }) {
  const [tick, setTick] = useState(0)
  const [cart, setCart] = useState(3)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTick((t) => t + 1), 300)
    return () => clearInterval(id)
  }, [running])

  // 🐛 高频变化的 tick 与稳定的 user/cart 放在同一个 value 里，且每次都是新对象
  const value: Store = { user: { name: '张三', role: '管理员' }, cart, tick, setCart }
  void setRunning

  return (
    <StoreContext.Provider value={value}>
      <div className="toolbar" style={{ marginBottom: 12 }}>
        <button className="btn" onClick={() => setRunning((r) => !r)}>
          {running ? '暂停 tick' : '开始 tick'}
        </button>
        <button className="btn" onClick={() => setCart((c) => c + 1)}>
          购物车 + 1
        </button>
      </div>
      {children}
    </StoreContext.Provider>
  )
}

function UserCard() {
  const { user } = useContext(StoreContext)
  busyWait(15)
  const renders = useRenderCount()
  return (
    <div className="card">
      <div className="card-title">用户信息（只关心 user）</div>
      <div className="card-value">
        {user.name} / {user.role}
      </div>
      <div className="card-value">
        渲染次数 <b>{renders}</b>
      </div>
    </div>
  )
}

function CartPanel() {
  const { cart } = useContext(StoreContext)
  busyWait(15)
  const renders = useRenderCount()
  return (
    <div className="card">
      <div className="card-title">购物车（只关心 cart）</div>
      <div className="card-value">{cart} 件</div>
      <div className="card-value">
        渲染次数 <b>{renders}</b>
      </div>
    </div>
  )
}

function TickPanel() {
  const { tick } = useContext(StoreContext)
  const renders = useRenderCount()
  return (
    <div className="card">
      <div className="card-title">实时时钟（唯一关心 tick）</div>
      <div className="card-value">{tick}</div>
      <div className="card-value">
        渲染次数 <b>{renders}</b>
      </div>
    </div>
  )
}

function ConsumerArea() {
  const renderTime = useRenderTime()
  return (
    <>
      <Metrics
        items={[
          { label: '消费者子树渲染耗时', value: `${fmt(renderTime)} ms`, warn: renderTime > 30 },
          { label: 'tick 频率', value: '每 300ms' },
        ]}
      />
      <div className="cards">
        <UserCard />
        <CartPanel />
        <TickPanel />
      </div>
    </>
  )
}

export default function ContextBlastDemo() {
  return (
    <div>
      <Bug>
        只有一个组件关心 <code>tick</code>，但 value 是同一个对象，<b>所有</b> <code>useContext</code> 的组件每 300ms 全部重渲染一次
        （且都是 15ms 的昂贵渲染）。
      </Bug>
      <Tip>
        ① 按变化频率拆分 Context（<code>UserContext</code> / <code>CartContext</code> / <code>TickContext</code>）；
        ② value 用 <code>useMemo</code> 固化，dispatch 单独放稳定 Context；③ 用 <code>useSyncExternalStore</code> 做选择器订阅；
        ④ 高频共享状态交给 zustand/jotai 之类的细粒度订阅库。
      </Tip>
      <StoreProvider>
        <ConsumerArea />
      </StoreProvider>
    </div>
  )
}
