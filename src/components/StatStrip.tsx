import { Circle, TriangleAlert, Bot, CirclePlay, CircleCheckBig, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { STATS } from '@/lib/data'
import { TONE_HEX, TONE_TEXT, TONE_TILE } from '@/lib/tone'
import Sparkline from './Sparkline'

const ICONS = {
  total: Circle,
  critical: TriangleAlert,
  progress: Bot,
  awaiting: CirclePlay,
  done: CircleCheckBig,
}

export default function StatStrip() {
  return (
    <section className="grid shrink-0 grid-cols-2 divide-x divide-y divide-line border-b border-line bg-surface sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
      {STATS.map((stat, i) => {
        const Icon = ICONS[stat.id as keyof typeof ICONS]
        const up = stat.delta >= 0
        return (
          <div
            key={stat.id}
            className="animate-rise px-4 py-3"
            style={{ animationDelay: `${i * 55}ms` }}
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className={`grid size-[22px] shrink-0 place-items-center rounded-[6px] ${TONE_TILE[stat.tone]}`}
              >
                <Icon size={12.5} strokeWidth={2.4} />
              </span>
              <span className="label min-w-0 flex-1 truncate">{stat.label}</span>
              <Sparkline values={stat.spark} color={TONE_HEX[stat.tone]} className="shrink-0 opacity-80" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="tnum text-[27px] font-bold leading-none tracking-tight text-ink">
                {stat.value}
              </span>
              <span
                className={`tnum flex items-center gap-px text-[11.5px] font-bold ${TONE_TEXT[stat.tone]}`}
              >
                {up ? (
                  <ArrowUpRight size={12} strokeWidth={2.8} />
                ) : (
                  <ArrowDownRight size={12} strokeWidth={2.8} />
                )}
                {Math.abs(stat.delta)}%
              </span>
              <span className="text-[10.5px] text-ink-faint">vs last wk</span>
            </div>
          </div>
        )
      })}
    </section>
  )
}
