export interface Row {
  id: number
  name: string
  email: string
  dept: string
  score: number
  tag: string
  updatedAt: string
}

const TAGS = ['核心', '重要', '常规', '观察', '归档']
const DEPTS = ['研发', '测试', '产品', '设计', '运营', '数据']

function mulberry32(seed: number) {
  let s = seed
  return function next() {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeRows(count: number, seed = 42): Row[] {
  const rand = mulberry32(seed)
  const rows: Row[] = new Array(count)
  for (let i = 0; i < count; i++) {
    const n = Math.floor(rand() * 10000)
    rows[i] = {
      id: i + 1,
      name: `用户-${n}`,
      email: `user${n}@example.com`,
      dept: DEPTS[Math.floor(rand() * DEPTS.length)],
      score: Math.floor(rand() * 100),
      tag: TAGS[Math.floor(rand() * TAGS.length)],
      updatedAt: new Date(1700000000000 + i * 3600_000).toISOString().slice(0, 10),
    }
  }
  return rows
}

export function heavyFilterSort(rows: Row[], keyword: string, sortBy: 'score' | 'name' | 'dept'): Row[] {
  const kw = keyword.trim().toLowerCase()
  const filtered = kw
    ? rows.filter((r) => r.name.includes(kw) || r.email.includes(kw) || r.dept.includes(kw))
    : rows.slice()
  filtered.sort((a, b) => {
    if (sortBy === 'score') return a.score - b.score
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return a.dept.localeCompare(b.dept)
  })
  let acc = 0
  for (let i = 0; i < filtered.length; i++) acc += Math.sqrt(filtered[i].score + i)
  void acc
  return filtered
}

export function fib(n: number): number {
  return n <= 1 ? n : fib(n - 1) + fib(n - 2)
}

export function busyWait(ms: number) {
  const end = performance.now() + ms
  while (performance.now() < end) {
    /* block */
  }
}

export function fmt(n: number, digits = 1) {
  return n.toFixed(digits)
}
