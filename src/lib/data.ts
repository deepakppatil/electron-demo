/** Deterministic pseudo-random so the prototype renders identically every run. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

export type Range = '7D' | '30D' | '90D'

export const RANGES: Range[] = ['7D', '30D', '90D']

export type Series = { label: string; points: number[]; compare: number[] }

const dayMs = 86_400_000

export function buildSeries(range: Range): Series {
  const days = range === '7D' ? 7 : range === '30D' ? 30 : 90
  const rand = seeded(days * 7919)
  const points: number[] = []
  const compare: number[] = []

  let value = 18_000
  let prev = 14_500

  for (let i = 0; i < days; i++) {
    const drift = (rand() - 0.42) * 0.34
    const weekly = Math.sin((i / 7) * Math.PI * 2) * 0.14 // weekend dip
    const momentum = (i / days) * 0.42
    value = Math.max(6_000, value * (1 + drift + weekly + momentum * 0.06))
    prev = Math.max(5_000, prev * (1 + (rand() - 0.5) * 0.12 + momentum * 0.03))
    points.push(Math.round(value))
    compare.push(Math.round(prev))
  }

  return { label: 'Requests served', points, compare }
}

export function seriesDates(range: Range, now = Date.now()): Date[] {
  const days = range === '7D' ? 7 : range === '30D' ? 30 : 90
  // Anchor to midnight so labels land on clean day boundaries.
  const end = new Date(now)
  end.setHours(0, 0, 0, 0)
  return Array.from({ length: days }, (_, i) => new Date(end.getTime() - (days - 1 - i) * dayMs))
}

export const KPIS = [
  {
    id: 'requests',
    label: 'Requests',
    value: 1_284_930,
    delta: 12.4,
    tone: 'accent' as const,
    spark: [24, 30, 27, 38, 34, 45, 41, 52, 49, 61, 58, 70],
  },
  {
    id: 'latency',
    label: 'p95 Latency',
    value: 182,
    suffix: 'ms',
    delta: -8.2,
    tone: 'mint' as const,
    spark: [62, 58, 60, 51, 54, 47, 49, 42, 45, 39, 41, 36],
  },
  {
    id: 'uptime',
    label: 'Uptime',
    value: 99.98,
    suffix: '%',
    delta: 0.06,
    tone: 'cyan' as const,
    spark: [96, 97, 96, 98, 97, 99, 98, 99, 99, 100, 99, 100],
  },
  {
    id: 'errors',
    label: 'Error rate',
    value: 0.14,
    suffix: '%',
    delta: -22.1,
    tone: 'rose' as const,
    spark: [44, 48, 41, 46, 38, 40, 33, 36, 29, 31, 24, 21],
  },
]

export type Tone = 'accent' | 'mint' | 'cyan' | 'rose' | 'amber'

export type Activity = {
  id: string
  actor: string
  initials: string
  action: string
  target: string
  at: string
  tone: Tone
  avatar: [string, string]
}

const MIN = 60_000
const HOUR = 3_600_000
const DAY = 86_400_000

export const ACTIVITY: Activity[] = [
  {
    id: 'a1',
    actor: 'Priya Raman',
    initials: 'PR',
    action: 'shipped',
    target: 'api-gateway v2.14.0',
    at: new Date(Date.now() - 4 * MIN).toISOString(),
    tone: 'mint',
    avatar: ['#7c5cff', '#22d3ee'],
  },
  {
    id: 'a2',
    actor: 'Deploy bot',
    initials: 'DB',
    action: 'rolled back',
    target: 'edge-router canary',
    at: new Date(Date.now() - 38 * MIN).toISOString(),
    tone: 'rose',
    avatar: ['#fb7185', '#fbbf24'],
  },
  {
    id: 'a3',
    actor: 'Marco Silva',
    initials: 'MS',
    action: 'merged',
    target: 'PR #482 · cache warmer',
    at: new Date(Date.now() - 2 * HOUR).toISOString(),
    tone: 'accent',
    avatar: ['#34d399', '#22d3ee'],
  },
  {
    id: 'a4',
    actor: 'CI',
    initials: 'CI',
    action: 'passed all checks on',
    target: 'web-dashboard',
    at: new Date(Date.now() - 5 * HOUR).toISOString(),
    tone: 'cyan',
    avatar: ['#6366f1', '#a855f7'],
  },
  {
    id: 'a5',
    actor: 'Anita Desai',
    initials: 'AD',
    action: 'rotated secrets for',
    target: 'production-env',
    at: new Date(Date.now() - 26 * HOUR).toISOString(),
    tone: 'amber',
    avatar: ['#fbbf24', '#fb7185'],
  },
  {
    id: 'a6',
    actor: 'Kenji Watanabe',
    initials: 'KW',
    action: 'provisioned',
    target: 'worker pool · eu-west',
    at: new Date(Date.now() - 3 * DAY).toISOString(),
    tone: 'accent',
    avatar: ['#22d3ee', '#7c5cff'],
  },
]

export type Deploy = {
  id: string
  service: string
  env: 'Production' | 'Staging' | 'Preview'
  version: string
  duration: string
  status: 'Live' | 'Deployed' | 'Queued'
  author: string
  initials: string
}

export const DEPLOYS: Deploy[] = [
  { id: 'd1', service: 'api-gateway', env: 'Production', version: 'v2.14.0', duration: '48s', status: 'Live', author: 'Priya Raman', initials: 'PR' },
  { id: 'd2', service: 'web-dashboard', env: 'Production', version: 'v5.3.11', duration: '1m 12s', status: 'Live', author: 'Marco Silva', initials: 'MS' },
  { id: 'd3', service: 'edge-router', env: 'Staging', version: 'v0.9.41-rc3', duration: '31s', status: 'Deployed', author: 'Deploy bot', initials: 'DB' },
  { id: 'd4', service: 'indexer', env: 'Staging', version: 'v1.7.0-beta', duration: '2m 04s', status: 'Queued', author: 'Anita Desai', initials: 'AD' },
  { id: 'd5', service: 'billing-worker', env: 'Preview', version: 'v3.0.2', duration: '26s', status: 'Deployed', author: 'Kenji Watanabe', initials: 'KW' },
]
