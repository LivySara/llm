import type { ReactNode } from 'react'

export function Metrics({ items }: { items: { label: string; value: ReactNode; warn?: boolean }[] }) {
  return (
    <div className="metrics">
      {items.map((it) => (
        <div key={it.label} className={`metric ${it.warn ? 'metric-warn' : ''}`}>
          <span className="metric-label">{it.label}</span>
          <span className="metric-value">{it.value}</span>
        </div>
      ))}
    </div>
  )
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="toolbar">{children}</div>
}

export function Bug({ children }: { children: ReactNode }) {
  return <div className="bug">🐛 问题点：{children}</div>
}

export function Tip({ children }: { children: ReactNode }) {
  return <div className="tip">💡 优化提示：{children}</div>
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}
