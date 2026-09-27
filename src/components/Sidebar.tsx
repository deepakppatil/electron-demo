import { useState } from 'react'
import {
  LayoutDashboard,
  Activity,
  Boxes,
  Users,
  CreditCard,
  Settings,
  ChevronsUpDown,
  Plus,
  Zap,
  Command,
  CircleHelp,
} from 'lucide-react'
import { cx } from '@/lib/format'

const PRIMARY = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
  { id: 'activity', label: 'Activity', icon: Activity, badge: '12' },
  { id: 'projects', label: 'Projects', icon: Boxes, badge: '8' },
  { id: 'team', label: 'Team', icon: Users, badge: null },
]

const SECONDARY = [
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const [active, setActive] = useState('overview')

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-surface">
      {/* Workspace switcher */}
      <div className="p-3">
        <button className="group flex w-full items-center gap-2.5 rounded-xl border border-line bg-elevated/70 p-2 text-left transition hover:border-line-strong hover:bg-elevated">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-accent to-cyan text-[11px] font-bold text-white">
            A
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-ink">Acme Inc.</span>
            <span className="block text-[11px] text-ink-faint">Enterprise plan</span>
          </span>
          <ChevronsUpDown size={14} className="shrink-0 text-ink-faint transition group-hover:text-ink-muted" />
        </button>
      </div>

      <nav className="scroll-thin flex-1 overflow-y-auto px-3 pb-3">
        <SectionLabel>Monitor</SectionLabel>
        <ul className="space-y-0.5">
          {PRIMARY.map((item) => (
            <NavItem
              key={item.id}
              {...item}
              active={active === item.id}
              onSelect={() => setActive(item.id)}
            />
          ))}
        </ul>

        <SectionLabel className="mt-6">Account</SectionLabel>
        <ul className="space-y-0.5">
          {SECONDARY.map((item) => (
            <NavItem
              key={item.id}
              {...item}
              badge={null}
              active={active === item.id}
              onSelect={() => setActive(item.id)}
            />
          ))}
        </ul>
      </nav>

      {/* Usage meter */}
      <div className="px-3 pb-3">
        <div className="rounded-xl border border-line bg-elevated/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
              <Zap size={12} className="text-accent" />
              Build minutes
            </span>
            <span className="tnum text-[11px] text-ink-faint">62%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-canvas">
            <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-accent to-cyan" />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
            3,120 of 5,000 min used · resets in 12 days
          </p>
          <button className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line-strong bg-raised py-1.5 text-[12px] font-medium text-ink-muted transition hover:border-accent/50 hover:text-ink">
            <Plus size={12} /> Upgrade plan
          </button>
        </div>
      </div>

      {/* User */}
      <div className="flex items-center gap-2.5 border-t border-line p-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-accent text-[11px] font-bold text-white">
          DK
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-medium text-ink">Devon K.</p>
          <p className="truncate text-[11px] text-ink-faint">devon@acme.io</p>
        </div>
        <button
          aria-label="Keyboard shortcuts"
          className="grid size-7 place-items-center rounded-lg text-ink-faint transition hover:bg-raised hover:text-ink-muted"
        >
          <Command size={14} />
        </button>
        <button
          aria-label="Help"
          className="grid size-7 place-items-center rounded-lg text-ink-faint transition hover:bg-raised hover:text-ink-muted"
        >
          <CircleHelp size={14} />
        </button>
      </div>
    </aside>
  )
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cx(
        'px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-ink-faint/70',
        className,
      )}
    >
      {children}
    </p>
  )
}

function NavItem({
  label,
  icon: Icon,
  badge,
  active,
  onSelect,
}: {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  badge: string | null
  active: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        onClick={onSelect}
        aria-current={active ? 'page' : undefined}
        className={cx(
          'group relative flex w-full items-center gap-2.5 rounded-lg px-2 py-[7px] text-[13px] transition-colors',
          active
            ? 'bg-raised font-medium text-ink'
            : 'text-ink-muted hover:bg-elevated hover:text-ink',
        )}
      >
        {active && (
          <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-accent" />
        )}
        <Icon
          size={15}
          strokeWidth={1.9}
          className={cx('shrink-0', active ? 'text-accent-hi' : 'text-ink-faint group-hover:text-ink-muted')}
        />
        <span className="flex-1 text-left">{label}</span>
        {badge && (
          <span className="tnum rounded-md bg-raised px-1.5 py-px text-[10.5px] font-medium text-ink-faint group-hover:text-ink-muted">
            {badge}
          </span>
        )}
      </button>
    </li>
  )
}
