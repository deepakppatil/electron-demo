import { useMemo, useState } from 'react'
import { buildSeries, seriesDates, RANGES, type Range } from '@/lib/data'
import { compact, cx } from '@/lib/format'
import { useMeasure } from '@/lib/useMeasure'

const PAD = { top: 14, right: 10, bottom: 26, left: 46 }

/** Catmull-Rom → cubic bezier for a smooth, non-overshooting curve. */
function smoothPath(pts: Array<[number, number]>): string {
  if (pts.length < 2) return ''
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d
}

function niceCeil(n: number) {
  const mag = 10 ** Math.floor(Math.log10(n))
  return Math.ceil(n / mag) * mag
}

export default function TrafficChart() {
  const [range, setRange] = useState<Range>('30D')
  const [hover, setHover] = useState<number | null>(null)
  const { ref, width, height } = useMeasure<HTMLDivElement>()

  const { series, dates, max, ticks } = useMemo(() => {
    const s = buildSeries(range)
    const ds = seriesDates(range)
    const all = [...s.points, ...s.compare]
    const max = niceCeil(Math.max(...all) * 1.12)
    const ticks = Array.from({ length: 5 }, (_, i) => (max / 4) * i).reverse()
    return { series: s, dates: ds, max, ticks }
  }, [range])

  const w = Math.max(width, 320)
  const h = Math.max(height, 200)
  const plotW = w - PAD.left - PAD.right
  const plotH = h - PAD.top - PAD.bottom
  const step = series.points.length > 1 ? plotW / (series.points.length - 1) : plotW

  const toX = (i: number) => PAD.left + i * step
  const toY = (v: number) => PAD.top + plotH - (v / max) * plotH

  const pts = series.points.map((v, i) => [toX(i), toY(v)] as [number, number])
  const cmpPts = series.compare.map((v, i) => [toX(i), toY(v)] as [number, number])

  const line = smoothPath(pts)
  const area = `${line} L${toX(pts.length - 1).toFixed(1)},${(PAD.top + plotH).toFixed(1)} L${PAD.left},${(PAD.top + plotH).toFixed(1)} Z`

  // Show ~6 x labels regardless of range length.
  const labelEvery = Math.max(1, Math.round(series.points.length / 6))
  const total = series.points.reduce((a, b) => a + b, 0)
  const compareTotal = series.compare.reduce((a, b) => a + b, 0)
  const lift = ((total - compareTotal) / compareTotal) * 100

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * w
    const idx = Math.round((x - PAD.left) / step)
    setHover(Math.max(0, Math.min(series.points.length - 1, idx)))
  }

  const active = hover !== null ? series.points[hover] : null
  const activeDate = hover !== null ? dates[hover] : null

  return (
    <section className="animate-rise flex min-h-0 flex-col rounded-[var(--radius-card)] border border-line bg-surface bevel">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-4">
        <div>
          <h2 className="text-[13.5px] font-semibold tracking-tight text-ink">Traffic</h2>
          <p className="mt-0.5 flex items-baseline gap-2 text-[11.5px] text-ink-faint">
            <span className="tnum text-[15px] font-semibold text-ink">{compact(total)}</span>
            requests this period
            <span className={cx('tnum font-medium', lift >= 0 ? 'text-mint' : 'text-rose')}>
              {lift >= 0 ? '↑' : '↓'} {Math.abs(lift).toFixed(1)}%
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Legend swatch="bg-accent" label="Current" />
          <Legend swatch="bg-ink-faint/50" label="Previous" dashed />
          <div className="flex rounded-lg border border-line bg-canvas p-0.5">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cx(
                  'rounded-md px-2 py-1 text-[11.5px] font-medium transition-colors',
                  range === r
                    ? 'bg-raised text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                    : 'text-ink-faint hover:text-ink-muted',
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div ref={ref} className="relative min-h-0 flex-1 p-1">
        {width > 0 && (
          <svg
            width={w}
            height={h}
            className="block touch-none select-none"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
            role="img"
            aria-label={`${series.label} over the last ${range}`}
          >
            <defs>
              <linearGradient id="traffic-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.38" />
                <stop offset="55%" stopColor="#7c5cff" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#7c5cff" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="traffic-stroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#9b82ff" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>

            {/* Grid + y labels */}
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={w - PAD.right}
                  y1={toY(t)}
                  y2={toY(t)}
                  stroke="#1b1f29"
                  strokeWidth={1}
                  shapeRendering="crispEdges"
                />
                <text
                  x={PAD.left - 10}
                  y={toY(t) + 3.5}
                  textAnchor="end"
                  className="fill-[#5f6779] font-mono text-[10px] tnum"
                >
                  {compact(Math.round(t))}
                </text>
              </g>
            ))}

            {/* Comparison line */}
            <path
              d={smoothPath(cmpPts)}
              fill="none"
              stroke="#5f6779"
              strokeOpacity={0.55}
              strokeWidth={1.4}
              strokeDasharray="4 4"
            />

            {/* Current series */}
            <path d={area} fill="url(#traffic-fill)" />
            <path
              d={line}
              fill="none"
              stroke="url(#traffic-stroke)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* X labels */}
            {series.points.map((_, i) =>
              i % labelEvery === 0 || i === series.points.length - 1 ? (
                <text
                  key={i}
                  x={toX(i)}
                  y={h - 8}
                  textAnchor={i === 0 ? 'start' : i === series.points.length - 1 ? 'end' : 'middle'}
                  className="fill-[#5f6779] font-mono text-[10px]"
                >
                  {dates[i].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              ) : null,
            )}

            {/* Crosshair */}
            {hover !== null && (
              <g className="pointer-events-none">
                <line
                  x1={toX(hover)}
                  x2={toX(hover)}
                  y1={PAD.top}
                  y2={PAD.top + plotH}
                  stroke="#3a4152"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <circle cx={toX(hover)} cy={toY(series.points[hover])} r={6} fill="#7c5cff" fillOpacity={0.22} />
                <circle
                  cx={toX(hover)}
                  cy={toY(series.points[hover])}
                  r={3.5}
                  fill="#08090d"
                  stroke="#9b82ff"
                  strokeWidth={2}
                />
              </g>
            )}
          </svg>
        )}

        {hover !== null && active !== null && activeDate && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-line-strong bg-elevated/95 px-2.5 py-1.5 shadow-xl backdrop-blur-md"
            style={{
              left: Math.min(Math.max(toX(hover), 70), w - 70),
              top: Math.max(toY(active) - 58, 4),
            }}
          >
            <p className="text-[10.5px] text-ink-faint">
              {activeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="tnum text-[13px] font-semibold text-ink">
              {new Intl.NumberFormat('en-US').format(active)}
              <span className="ml-1 text-[10.5px] font-normal text-ink-faint">req</span>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function Legend({ swatch, label, dashed }: { swatch: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-ink-faint">
      <span
        className={cx('h-[3px] w-4 rounded-full', swatch)}
        style={dashed ? { backgroundImage: 'repeating-linear-gradient(90deg,currentColor 0 4px,transparent 4px 7px)', backgroundColor: 'transparent', color: '#5f6779' } : undefined}
      />
      {label}
    </span>
  )
}
