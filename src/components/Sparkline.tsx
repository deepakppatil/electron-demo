/** Tiny trend line with an end cap — matches the stat strip in the reference. */
export default function Sparkline({
  values,
  color,
  className = '',
}: {
  values: number[]
  color: string
  className?: string
}) {
  const w = 56
  const h = 18
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1

  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * (w - 3),
    h - 2.5 - ((v - min) / span) * (h - 7),
  ])

  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [ex, ey] = pts[pts.length - 1]

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      className={className}
      aria-hidden
    >
      <path d={d} stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={ex} cy={ey} r="2.2" fill={color} />
    </svg>
  )
}
