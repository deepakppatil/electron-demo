import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Search,
  RefreshCw,
  Plus,
  Download,
  Radio,
  Sun,
  Moon,
  Boxes,
  Activity,
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Rocket,
  ServerCog,
} from 'lucide-react'
import TitleBar from '@/components/TitleBar'
import Sidebar from '@/components/Sidebar'
import StatCard from '@/components/StatCard'
import TrafficChart from '@/components/TrafficChart'
import ActivityFeed from '@/components/ActivityFeed'
import DeployTable from '@/components/DeployTable'
import CommandPalette, { type PaletteItem } from '@/components/CommandPalette'
import { KPIS, DEPLOYS } from '@/lib/data'
import { useTheme } from '@/lib/useTheme'
import { cx } from '@/lib/format'

const PAGES: PaletteItem[] = [
  { id: 'p-overview', label: 'Overview', group: 'Navigate', icon: LayoutDashboard, shortcut: 'G O' },
  { id: 'p-activity', label: 'Activity', group: 'Navigate', icon: Activity },
  { id: 'p-projects', label: 'Projects', group: 'Navigate', icon: Boxes },
  { id: 'p-team', label: 'Team', group: 'Navigate', icon: Users },
  { id: 'p-billing', label: 'Billing', group: 'Navigate', icon: CreditCard },
  { id: 'p-settings', label: 'Settings', group: 'Navigate', icon: Settings },
]

const ACTIONS: PaletteItem[] = [
  { id: 'a-new', label: 'Create a new project', group: 'Actions', icon: Plus },
  { id: 'a-export', label: 'Export report as CSV', group: 'Actions', icon: Download },
  { id: 'a-deploy', label: 'Trigger a production deploy', group: 'Actions', icon: Rocket },
  { id: 'a-scale', label: 'Scale worker pool', group: 'Actions', icon: ServerCog },
]

export default function App() {
  const [now, setNow] = useState(() => new Date())
  const [toast, setToast] = useState<string | null>(null)
  const [live, setLive] = useState(true)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { theme, toggle } = useTheme()

  // Live clock in the header — small detail, big "this is a real app" signal.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const closePalette = useCallback(() => setPaletteOpen(false), [])

  // Transient confirmation for prototype-only actions.
  const notify = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }, [])

  // ⌘/Ctrl+K opens the palette, anywhere in the app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    const onOpen = () => setPaletteOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('atlas:command', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('atlas:command', onOpen)
    }
  }, [])

  const paletteItems = useMemo<PaletteItem[]>(
    () => [
      ...PAGES,
      ...DEPLOYS.map((d) => ({
        id: `d-${d.id}`,
        label: d.service,
        hint: `${d.env} · ${d.version}`,
        group: 'Services',
        icon: ServerCog,
      })),
      ...ACTIONS,
    ],
    [],
  )

  const greeting = useMemo(() => {
    const h = now.getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }, [now])

  const kpis = useMemo(
    () =>
      KPIS.map((k) =>
        k.id === 'requests' ? { ...k, value: k.value + (live ? Math.floor((now.getSeconds() / 60) * 140) : 0) } : k,
      ),
    [now, live],
  )

  return (
    <div className="flex h-full flex-col overflow-hidden bg-canvas">
      <TitleBar onSearch={() => setPaletteOpen(true)} />

      <div className="flex min-h-0 flex-1">
        <Sidebar />

        <main className="scroll-thin relative flex min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="aurora grid-veil pointer-events-none sticky top-0 z-0 h-0" aria-hidden />

          {/* Page header */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-canvas/85 px-6 py-4 backdrop-blur-xl">
            <div className="min-w-0">
              <h1 className="text-[19px] font-semibold leading-tight tracking-tight text-ink">
                {greeting}, Devon
              </h1>
              <p className="mt-0.5 flex items-center gap-2 text-[12px] text-ink-faint">
                All systems are healthy · updated{' '}
                <span className="tnum text-ink-muted">
                  {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaletteOpen(true)}
                className="flex h-8 w-56 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 text-left text-[12.5px] text-ink-faint transition hover:border-line-strong hover:text-ink-muted"
              >
                <Search size={14} className="shrink-0" />
                <span className="flex-1 truncate">Search…</span>
                <kbd className="rounded border border-line bg-canvas px-1 font-mono text-[10px] text-ink-faint">
                  {isMacLike() ? '⌘K' : 'Ctrl K'}
                </kbd>
              </button>

              <button
                onClick={() => setLive((v) => !v)}
                title={live ? 'Pause live updates' : 'Resume live updates'}
                className={cx(
                  'flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition',
                  live
                    ? 'border-mint/30 bg-mint/10 text-mint hover:bg-mint/15'
                    : 'border-line bg-surface text-ink-faint hover:text-ink-muted',
                )}
              >
                {live ? <Radio size={13} className="animate-pulse" /> : <RefreshCw size={13} />}
                {live ? 'Live' : 'Paused'}
              </button>

              <IconButton label="Toggle theme" onClick={toggle}>
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </IconButton>
              <IconButton label="Export report" onClick={() => notify('Report export queued')}>
                <Download size={14} />
              </IconButton>
              <button
                onClick={() => setPaletteOpen(true)}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-[12.5px] font-semibold text-white shadow-[0_2px_10px_-2px_rgba(124,92,255,0.7)] transition hover:bg-accent-hi active:scale-[0.98]"
              >
                <Plus size={14} strokeWidth={2.4} /> New project
              </button>
            </div>
          </div>

          <div className="relative z-10 flex flex-1 flex-col gap-4 p-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi, i) => (
                <StatCard key={kpi.id} kpi={kpi} index={i} />
              ))}
            </div>

            {/* Chart + activity */}
            <div className="grid min-h-[340px] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
              <TrafficChart />
              <ActivityFeed />
            </div>

            {/* Deploys */}
            <DeployTable />

            <footer className="pb-2 pt-1 text-center text-[11px] text-ink-faint">
              Atlas prototype · Electron{' '}
              {window.desktop ? `· ${window.desktop.platform}` : '· browser preview'}
            </footer>
          </div>
        </main>
      </div>

      {toast && (
        <div
          role="status"
          className="animate-palette pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line-strong bg-elevated/95 px-3.5 py-2 text-[12.5px] text-ink shadow-xl backdrop-blur-md"
        >
          {toast}
        </div>
      )}

      <CommandPalette
        open={paletteOpen}
        onClose={closePalette}
        items={paletteItems}
        onSelect={(item) => notify(`Opened “${item.label}”`)}
      />
    </div>
  )
}

function isMacLike() {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-lg border border-line bg-surface text-ink-muted transition hover:border-line-strong hover:text-ink active:scale-95"
    >
      {children}
    </button>
  )
}
