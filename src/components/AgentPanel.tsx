import { Bot, Wrench, Gem, PencilRuler, ListPlus, ChevronRight, type LucideIcon } from 'lucide-react'
import { AGENTS, IDLE_AGENTS, TASK_BOT, type Agent } from '@/lib/data'
import { TONE_TILE } from '@/lib/tone'
import { cx } from '@/lib/format'

const AGENT_ICONS: Record<Agent['icon'], LucideIcon> = {
  wrench: Wrench,
  gem: Gem,
  pen: PencilRuler,
  list: ListPlus,
}

export function AgentPanel({ onView }: { onView: (agent: Agent) => void }) {
  return (
    <section className="animate-rise flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface bevel" style={{ animationDelay: '90ms' }}>
      <header className="flex items-center gap-2.5 px-4 py-3">
        <span className="grid size-[26px] shrink-0 place-items-center rounded-md bg-accent/15 text-accent">
          <Bot size={15} strokeWidth={2.2} />
        </span>
        <h2 className="text-[13.5px] font-bold tracking-tight text-ink">Agent Assistant</h2>
        <span className="ml-auto flex items-center gap-1.5 text-[11.5px] font-semibold text-green">
          <span className="animate-pulse-dot size-1.5 rounded-full bg-green" />
          Active
        </span>
      </header>

      <div className="border-y border-line px-4 py-2.5">
        <p className="text-[12.5px] font-medium text-ink">{AGENTS.length} agents engaged on your tasks right now</p>
        <p className="text-[11.5px] text-ink-faint">Last updated: 2 mins ago</p>
      </div>

      <ul className="flex flex-col gap-2 p-2.5">
        {AGENTS.map((agent) => {
          const Icon = AGENT_ICONS[agent.icon]
          const needsInput = agent.state === 'input'
          return (
            <li
              key={agent.id}
              className="group rounded-[var(--radius-tile)] border border-line bg-elevated p-2.5 transition-colors hover:border-line-strong"
            >
              <div className="flex items-center gap-2.5">
                <span className={cx('grid size-7 shrink-0 place-items-center rounded-md', TONE_TILE[agent.tone])}>
                  <Icon size={14} strokeWidth={2.2} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[12.5px] font-bold text-ink">{agent.name}</span>
                    <span className="truncate font-mono text-[11px] text-ink-faint">{agent.command}</span>
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5">
                    <span className="truncate font-mono text-[11.5px] text-ink-muted">{agent.task}</span>
                    <span className="shrink-0 rounded-[4px] bg-canvas px-1 py-px text-[9.5px] font-bold tracking-[0.05em] text-ink-faint ring-1 ring-inset ring-line-strong">
                      {agent.tag}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => onView(agent)}
                  className="shrink-0 rounded-[6px] border border-accent/45 px-2.5 py-1 text-[11.5px] font-semibold text-accent transition hover:bg-accent/12 hover:border-accent"
                >
                  View
                </button>
              </div>

              <p
                className={cx(
                  'mt-2 flex items-center gap-1.5 text-[11.5px] font-semibold',
                  needsInput ? 'text-amber' : 'text-blue',
                )}
              >
                {needsInput ? (
                  <ChevronRight size={12} strokeWidth={2.8} />
                ) : (
                  <span className="animate-pulse-dot size-1.5 rounded-full bg-blue" />
                )}
                {needsInput ? 'needs your input' : 'running'}
              </p>
            </li>
          )
        })}
      </ul>

      <p className="border-t border-line px-4 py-3 text-[11.5px] leading-relaxed text-ink-faint">
        {IDLE_AGENTS}
      </p>
    </section>
  )
}

export function TaskBotPanel({ onStart }: { onStart: () => void }) {
  return (
    <section
      className="animate-rise overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface bevel"
      style={{ animationDelay: '150ms' }}
    >
      <header className="flex items-center gap-2.5 px-4 py-3">
        <span className="grid size-[26px] shrink-0 place-items-center rounded-md bg-purple/15 text-purple">
          <ListPlus size={15} strokeWidth={2.2} />
        </span>
        <h2 className="text-[13.5px] font-bold tracking-tight text-ink">Task Bot</h2>
      </header>

      <p className="px-4 pb-3 text-[12.5px] leading-relaxed text-ink-muted">{TASK_BOT.blurb}</p>

      <div className="mx-4 flex items-center gap-5 rounded-[var(--radius-tile)] border border-line bg-elevated px-3 py-2.5">
        {TASK_BOT.stats.map((s) => (
          <div key={s.label}>
            <p className="tnum text-[16px] font-bold leading-none text-ink">{s.value}</p>
            <p className="mt-1 text-[10.5px] text-ink-faint">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="px-4 py-3.5">
        <button
          onClick={onStart}
          className="w-full rounded-[var(--radius-tile)] bg-accent py-2 text-[12.5px] font-bold text-white transition hover:bg-accent-hi active:scale-[0.99]"
        >
          Start Task Bot
        </button>
      </div>
    </section>
  )
}
