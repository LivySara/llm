/** 被 BundleDemo 动态 import 的「重型组件」：故意带上一大段无用的常量数据，制造独立 chunk。 */
export const chunkTag = 'heavy-chart-chunk'

const BIG_TABLE = Array.from({ length: 20000 }, (_, i) => ({
  x: i,
  y: Math.sin(i / 100) * 100,
  label: `point-${i}`,
}))

export default function HeavyChart() {
  return (
    <div className="card">
      <div className="card-title">重型图表（异步 chunk）</div>
      <div className="card-value">携带 {BIG_TABLE.length.toLocaleString()} 个点的常量数据</div>
    </div>
  )
}
