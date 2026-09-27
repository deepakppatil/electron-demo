import { useEffect, useMemo, useState } from 'react'
import { Search, RefreshCw, Plus, Download, Radio } from 'lucide-react'
import TitleBar from '@/components/TitleBar'
import Sidebar from '@/components/Sidebar'
import StatCard from '@/components/StatCard'
import TrafficChart from '@/components/TrafficChart'
import ActivityFeed from '@/components/ActivityFeed'
import DeployTable from '@/components/DeployTable'
import { KPIS } from '@/lib/data'
import { cx } from '@/lib/format'

export default function App() {
  const [now, setNow] = useState(() => new Date())
  const [query, setQuery] = useState('')
  const [live, setLive] = useState(true)

  // Live clock in the header — small detail, big "this is a real app" signal.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Ctrl/⌘+K focuses the search field from anywhere in the app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        document.getElementById('command-search')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const greeting = useMemo(() => {
    const h = now.getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }, [now])

  const kpis = useMemo(
    () => KPIS.map((k) => (k.id === 'requests' ? { ...k, value: k.value + (live ? Math.floor((now.getSeconds() / 60) * 140) : 0) } : k)),
    [now, live],
  )

  return (
    <div className="flex h-full flex-col overflow-hidden bg-canvas">
      <TitleBar />

      <div className="flex min-h-0 flex-1">
        <Sidebar />

        <main className="scroll-thin flex min-w-0 flex-1 flex-col overflow-y-auto">
          {/* Page header */}
          <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-canvas/85 px-6 py-4 backdrop-blur-xl">
            <div className="min-w-0">
              <h1 className="text-[19px] font-semibold leading-tight tracking-tight text-ink">
                {greeting}, Devon
              </h1>
              <p className="mt-0.5 flex items-center gap-2 text-[12px] text-ink-faint">
                All systems are healthy · updated{' '}
                <span className="tnum text-ink-muted">{now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
                />
                <input
                  id="command-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search services, deploys…"
                  className="h-8 w-56 rounded-lg border border-line bg-surface pl-8 pr-3 text-[12.5px] text-ink outline-none transition placeholder:text-ink-faint focus:border-accent/60 focus:ring-2 focus:ring-accent/15"
                />
              </div>

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

              <IconButton label="Export report">
                <Download size={14} />
              </IconButton>
              <button className="flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-[12.5px] font-semibold text-white shadow-[0_2px_10px_-2px_rgba(124,92,255,0.7)] transition hover:bg-accent-hi active:scale-[0.98]">
                <Plus size={14} strokeWidth={2.4} /> New project
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 p-6">
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
              Atlas prototype · Electron {typeof window !== 'undefined' && window.desktop ? `· ${window.desktop.platform}` : '· browser preview'}
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}

function IconButton({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className="grid size-8 place-items-center rounded-lg border border-line bg-surface text-ink-muted transition hover:border-line-strong hover:text-ink active:scale-95"
    >
      {children}
    </button>
  )
}
