import { ACTIVITY, type Tone } from '@/lib/data'
import { relativeTime, cx } from '@/lib/format'

const DOT: Record<Tone, string> = {
  accent: 'bg-accent',
  mint: 'bg-mint',
  cyan: 'bg-cyan',
  rose: 'bg-rose',
  amber: 'bg-amber',
}

export default function ActivityFeed() {
  return (
    <section className="animate-rise flex min-h-0 flex-col rounded-[var(--radius-card)] border border-line bg-surface bevel" style={{ animationDelay: '120ms' }}>
      <header className="flex items-center justify-between border-b border-line p-4">
        <h2 className="text-[13.5px] font-semibold tracking-tight text-ink">Activity</h2>
        <button className="text-[11.5px] font-medium text-ink-faint transition hover:text-accent-hi">
          View all
        </button>
      </header>

      <ol className="scroll-thin min-h-0 flex-1 overflow-y-auto p-2">
        {ACTIVITY.map((item, i) => (
          <li key={item.id}>
            <div className="group relative flex gap-3 rounded-lg p-2 transition-colors hover:bg-elevated">
              {/* Timeline rail */}
              {i !== ACTIVITY.length - 1 && (
                <span className="absolute left-[27px] top-[42px] h-[calc(100%-24px)] w-px bg-line group-hover:bg-line-strong" />
              )}

              <span
                className="relative grid size-8 shrink-0 place-items-center rounded-full text-[10.5px] font-bold text-white"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${item.avatar[0]}, ${item.avatar[1]})`,
                }}
              >
                {item.initials}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] leading-snug text-ink">
                  <span className="font-medium">{item.actor}</span>{' '}
                  <span className="text-ink-faint">{item.action}</span>{' '}
                  <span className="text-ink-muted">{item.target}</span>
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-faint">
                  <span className={cx('size-1.5 rounded-full', DOT[item.tone])} />
                  {relativeTime(item.at)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
