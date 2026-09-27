import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { Tone } from '@/lib/data'
import { cx } from '@/lib/format'

const TONE_TEXT: Record<Tone, string> = {
  accent: 'text-accent-hi',
  mint: 'text-mint',
  cyan: 'text-cyan',
  rose: 'text-rose',
  amber: 'text-amber',
}

const TONE_FILL: Record<Tone, string> = {
  accent: '#7c5cff',
  mint: '#34d399',
  cyan: '#22d3ee',
  rose: '#fb7185',
  amber: '#fbbf24',
}

export type Kpi = {
  id: string
  label: string
  value: number
  suffix?: string
  delta: number
  tone: Tone
  spark: number[]
}

function formatValue(value: number, suffix?: string) {
  if (suffix === '%') return `${value.toFixed(2)}%`
  if (suffix === 'ms') return `${value}${suffix}`
  if (value >= 1000)
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value)
  return `${value}${suffix ?? ''}`
}

export default function StatCard({ kpi, index }: { kpi: Kpi; index: number }) {
  const up = kpi.delta >= 0
  // Error rate going down is good — invert the sentiment for the rose metric.
  const good = kpi.id === 'errors' ? !up : up
  const deltaText = `${up ? '+' : ''}${kpi.delta}%`

  return (
    <article
      className="animate-rise group relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface p-4 bevel transition-colors hover:border-line-strong"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-[12px] font-medium text-ink-muted">{kpi.label}</p>
        <span
          className={cx(
            'tnum flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
            good ? 'bg-mint/10 text-mint' : 'bg-rose/10 text-rose',
          )}
        >
          {up ? <ArrowUpRight size={11} strokeWidth={2.4} /> : <ArrowDownRight size={11} strokeWidth={2.4} />}
          {deltaText}
        </span>
      </div>

      <p className="text-[26px] font-semibold leading-none tracking-tight text-ink tnum">
        {formatValue(kpi.value, kpi.suffix)}
      </p>
      <p className="mt-1.5 text-[11px] text-ink-faint">vs. previous period</p>

      <Sparkline values={kpi.spark} color={TONE_FILL[kpi.tone]} className={TONE_TEXT[kpi.tone]} />
    </article>
  )
}

function Sparkline({
  values,
  color,
  className,
}: {
  values: number[]
  color: string
  className?: string
}) {
  const w = 200
  const h = 40
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1

  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - 3 - ((v - min) / span) * (h - 10)
    return [x, y] as const
  })

  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${w},${h} L0,${h} Z`
  const id = `spark-${color.replace('#', '')}`

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cx('mt-3 h-9 w-full opacity-70 transition-opacity group-hover:opacity-100', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
