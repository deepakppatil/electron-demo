import {
  PanelRightClose,
  Plus,
  LayoutGrid,
  Activity,
  Tag,
  ListChecks,
  SlidersHorizontal,
  Folder,
  Sparkles,
  UserRound,
  Moon,
  Sun,
  ChevronRight,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react'
import { NAV, PROJECTS } from '@/lib/data'
import { cx } from '@/lib/format'

const NAV_ICONS: Record<string, LucideIcon> = {
  grid: LayoutGrid,
  pulse: Activity,
  tag: Tag,
  list: ListChecks,
  sliders: SlidersHorizontal,
}

export default function Sidebar({
  active,
  project,
  collapsed,
  onSelectNav,
  onSelectProject,
  onNewProject,
  onToggleCollapse,
  theme,
  onToggleTheme,
  macInset,
}: {
  active: string
  project: string
  collapsed: boolean
  onSelectNav: (id: string) => void
  onSelectProject: (id: string) => void
  onNewProject: () => void
  onToggleCollapse: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  macInset: boolean
}) {
  return (
    <aside
      className={cx(
        'flex shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 ease-out',
        collapsed ? 'w-[68px]' : 'w-[280px]',
      )}
    >
      {/* Brand */}
      <div
        className={cx('flex h-11 shrink-0 items-center', collapsed ? 'justify-center px-2' : 'px-4')}
        style={!collapsed && macInset ? { paddingLeft: 84 } : undefined}
      >
        <span className={cx('text-[15px] font-bold tracking-tight text-ink', collapsed && 'sr-only')}>
          Harness
        </span>
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="ml-auto grid size-7 place-items-center rounded-md text-ink-faint transition hover:bg-raised hover:text-ink"
          >
            <PanelRightClose size={15} />
          </button>
        )}
      </div>

      {/* New project */}
      <div className={cx('px-3 pb-1', collapsed && 'px-2')}>
        <button
          onClick={onNewProject}
          title="New project"
          className={cx(
            'flex h-9 w-full items-center gap-2.5 rounded-[var(--radius-tile)] px-2.5 text-[13px] font-semibold text-ink transition hover:bg-raised active:scale-[0.99]',
            collapsed && 'justify-center px-0',
          )}
        >
          <Plus size={16} strokeWidth={2.6} className="shrink-0 text-accent" />
          {!collapsed && <span>New Project</span>}
        </button>
      </div>

      <nav className="scroll-thin flex-1 overflow-y-auto px-3 py-1">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const Icon = NAV_ICONS[item.icon]
            const isActive = active === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSelectNav(item.id)}
                  title={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={cx(
                    'flex h-9 w-full items-center gap-3 rounded-[var(--radius-tile)] px-2.5 text-[13px] transition-colors',
                    collapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-raised font-semibold text-ink'
                      : 'font-medium text-ink-muted hover:bg-elevated hover:text-ink',
                  )}
                >
                  <Icon
                    size={16}
                    strokeWidth={2}
                    className={cx('shrink-0', isActive ? 'text-ink' : 'text-ink-faint')}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Projects */}
        <SectionLabel collapsed={collapsed}>Projects</SectionLabel>
        <ul className="space-y-0.5">
          {PROJECTS.map((p) => {
            const isActive = project === p.id
            return (
              <li key={p.id}>
                <button
                  onClick={() => onSelectProject(p.id)}
                  title={`${p.name} — ${p.openTasks} open`}
                  className={cx(
                    'flex h-9 w-full items-center gap-3 rounded-[var(--radius-tile)] px-2.5 text-[13px] transition-colors',
                    collapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-raised font-semibold text-ink'
                      : 'font-medium text-ink-muted hover:bg-elevated hover:text-ink',
                  )}
                >
                  <Folder
                    size={16}
                    strokeWidth={2}
                    className={cx('shrink-0', isActive ? 'text-accent' : 'text-ink-faint')}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate text-left">{p.name}</span>
                      <span className="tnum text-[11.5px] font-semibold text-ink-faint">
                        {p.openTasks}
                      </span>
                    </>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Agent */}
        <SectionLabel collapsed={collapsed}>Agent</SectionLabel>
        <ul className="space-y-0.5">
          <AgentRow icon={Sparkles} label="Claude Code" collapsed={collapsed} chevron />
          <AgentRow
            icon={UserRound}
            label="Architect"
            badge="Persona"
            collapsed={collapsed}
          />
          <li>
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Dark theme — switch to light' : 'Light theme — switch to dark'}
              className={cx(
                'flex h-9 w-full items-center gap-3 rounded-[var(--radius-tile)] px-2.5 text-[13px] font-medium text-ink-muted transition-colors hover:bg-elevated hover:text-ink',
                collapsed && 'justify-center px-0',
              )}
            >
              {theme === 'dark' ? (
                <Moon size={16} strokeWidth={2} className="shrink-0 text-ink-faint" />
              ) : (
                <Sun size={16} strokeWidth={2} className="shrink-0 text-ink-faint" />
              )}
              {!collapsed && <span className="truncate">{theme === 'dark' ? 'Dark theme' : 'Light theme'}</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* Account */}
      <div
        className={cx(
          'flex shrink-0 items-center gap-2.5 border-t border-line p-3',
          collapsed && 'justify-center px-2',
        )}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-purple text-[11px] font-bold text-white">
          DP
        </span>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-ink">Foo Bar</p>
              <p className="truncate text-[11px] text-ink-faint">foobar@foo.com</p>
            </div>
            <button
              aria-label="Account menu"
              className="grid size-7 shrink-0 place-items-center rounded-md text-ink-faint transition hover:bg-raised hover:text-ink"
            >
              <MoreHorizontal size={16} />
            </button>
          </>
        )}
      </div>
    </aside>
  )
}

function SectionLabel({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) {
  if (collapsed) return <div className="my-3 h-px bg-line" />
  return (
    <p className="px-2.5 pb-1.5 pt-5 text-[10px] font-bold uppercase tracking-[0.09em] text-ink-faint/80">
      {children}
    </p>
  )
}

function AgentRow({
  icon: Icon,
  label,
  badge,
  collapsed,
  chevron,
}: {
  icon: LucideIcon
  label: string
  badge?: string
  collapsed: boolean
  chevron?: boolean
}) {
  return (
    <li>
      <button
        title={label}
        className={cx(
          'flex h-9 w-full items-center gap-3 rounded-[var(--radius-tile)] px-2.5 text-[13px] font-medium text-ink-muted transition-colors hover:bg-elevated hover:text-ink',
          collapsed && 'justify-center px-0',
        )}
      >
        <Icon size={16} strokeWidth={2} className="shrink-0 text-ink-faint" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left">{label}</span>
            {badge && (
              <span className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                {badge}
              </span>
            )}
            {chevron && <ChevronRight size={14} className="shrink-0 text-ink-faint" />}
          </>
        )}
      </button>
    </li>
  )
}
