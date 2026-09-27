import { DEPLOYS, type Deploy } from '@/lib/data'
import { cx } from '@/lib/format'

const STATUS: Record<Deploy['status'], { dot: string; chip: string }> = {
  Live: { dot: 'bg-mint', chip: 'bg-mint/10 text-mint ring-mint/25' },
  Deployed: { dot: 'bg-cyan', chip: 'bg-cyan/10 text-cyan ring-cyan/25' },
  Queued: { dot: 'bg-ink-faint', chip: 'bg-raised text-ink-muted ring-line-strong' },
}

const ENV: Record<Deploy['env'], string> = {
  Production: 'text-accent-hi bg-accent/10 ring-accent/25',
  Staging: 'text-amber bg-amber/10 ring-amber/25',
  Preview: 'text-ink-muted bg-raised ring-line-strong',
}

export default function DeployTable() {
  return (
    <section
      className="animate-rise overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface bevel"
      style={{ animationDelay: '180ms' }}
    >
      <header className="flex items-center justify-between border-b border-line p-4">
        <div>
          <h2 className="text-[13.5px] font-semibold tracking-tight text-ink">Recent deploys</h2>
          <p className="mt-0.5 text-[11.5px] text-ink-faint">Last 24 hours across all environments</p>
        </div>
        <button className="rounded-lg border border-line px-2.5 py-1 text-[11.5px] font-medium text-ink-muted transition hover:border-line-strong hover:text-ink">
          Open pipeline
        </button>
      </header>

      <div className="scroll-thin overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-[10.5px] uppercase tracking-[0.07em] text-ink-faint/70">
              <Th>Service</Th>
              <Th>Environment</Th>
              <Th>Version</Th>
              <Th className="text-right">Duration</Th>
              <Th>Status</Th>
              <Th>Triggered by</Th>
            </tr>
          </thead>
          <tbody>
            {DEPLOYS.map((d) => (
              <tr
                key={d.id}
                className="border-b border-line/60 last:border-0 transition-colors hover:bg-elevated/60"
              >
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2 text-[12.5px] font-medium text-ink">
                    <span className="size-1.5 rounded-full bg-accent/70" />
                    {d.service}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={cx(
                      'inline-flex rounded-md px-1.5 py-0.5 text-[10.5px] font-medium ring-1 ring-inset',
                      ENV[d.env],
                    )}
                  >
                    {d.env}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-[11.5px] text-ink-muted">{d.version}</td>
                <td className="tnum px-4 py-2.5 text-right font-mono text-[11.5px] text-ink-faint">
                  {d.duration}
                </td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                    <span className={cx('size-1.5 rounded-full', STATUS[d.status].dot)} />
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2 text-[12px] text-ink-muted">
                    <span className="grid size-5 place-items-center rounded-full bg-raised text-[9px] font-bold text-ink-muted">
                      {d.initials}
                    </span>
                    {d.author}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th scope="col" className={cx('px-4 py-2 font-medium', className)}>
      {children}
    </th>
  )
}
