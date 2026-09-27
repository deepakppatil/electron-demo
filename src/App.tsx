import { useCallback, useEffect, useMemo, useState } from 'react'
import { Moon, Sun, Boxes, FolderKanban, Settings, Activity as ActivityIcon, ServerCog, Wrench, type LucideIcon } from 'lucide-react'
import TopBar from '@/components/TopBar'
import Sidebar from '@/components/Sidebar'
import StatStrip from '@/components/StatStrip'
import StatusBar from '@/components/StatusBar'
import ProjectPanel from '@/components/ProjectPanel'
import { AgentPanel, TaskBotPanel } from '@/components/AgentPanel'
import CommandPalette, { type PaletteItem } from '@/components/CommandPalette'
import { PROJECTS, REPOS, NAV, AGENTS } from '@/lib/data'
import { useTheme } from '@/lib/useTheme'

const NAV_ICONS: Record<string, LucideIcon> = {
  workspace: FolderKanban,
  health: ActivityIcon,
  jira: Settings,
  audit: Settings,
  config: Settings,
}

export default function App() {
  const [nav, setNav] = useState('workspace')
  const [projectId, setProjectId] = useState(PROJECTS[0].id)
  const [collapsed, setCollapsed] = useState(false)
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { theme, toggle } = useTheme()

  const project = useMemo(
    () => PROJECTS.find((p) => p.id === projectId) ?? PROJECTS[0],
    [projectId],
  )
  const isMac = window.desktop?.platform === 'darwin'

  const notify = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }, [])

  const closePalette = useCallback(() => setPaletteOpen(false), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const paletteItems = useMemo<PaletteItem[]>(
    () => [
      ...NAV.map((n) => ({
        id: `nav-${n.id}`,
        label: n.label,
        group: 'Navigate',
        icon: NAV_ICONS[n.id] ?? FolderKanban,
      })),
      ...PROJECTS.map((p) => ({
        id: `proj-${p.id}`,
        label: p.name,
        hint: `${p.repositories} repositories · ${p.openTasks} open tasks`,
        group: 'Projects',
        icon: FolderKanban,
      })),
      ...REPOS.map((r) => ({
        id: `repo-${r.id}`,
        label: r.name,
        hint: `${r.stack} · ${r.branch}`,
        group: 'Repositories',
        icon: ServerCog,
      })),
      ...AGENTS.map((a) => ({
        id: `agent-${a.id}`,
        label: a.name,
        hint: `${a.command} · ${a.task}`,
        group: 'Agents',
        icon: Wrench,
      })),
      { id: 'act-new-task', label: 'Create a new task', group: 'Actions', icon: Wrench },
      { id: 'act-toggle-theme', label: 'Toggle colour theme', group: 'Actions', icon: theme === 'dark' ? Sun : Moon },
      { id: 'act-sidebar', label: collapsed ? 'Expand sidebar' : 'Collapse sidebar', group: 'Actions', icon: Boxes },
    ],
    [theme, collapsed],
  )

  return (
    <div className="flex h-full flex-col overflow-hidden bg-canvas">
      <div className="flex min-h-0 flex-1">
        <Sidebar
          active={nav}
          project={projectId}
          collapsed={collapsed}
          onSelectNav={setNav}
          onSelectProject={setProjectId}
          onNewProject={() => notify('New project flow opened')}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          theme={theme}
          onToggleTheme={toggle}
          macInset={isMac}
        />

        <main className="relative flex min-w-0 flex-1 flex-col">
          <div className="aurora grid-veil pointer-events-none absolute inset-0" aria-hidden />

          <TopBar title="Workspace" onSearch={() => setPaletteOpen(true)} />

          <StatStrip />

          <div className="relative z-10 flex min-h-0 flex-1">
            {/* Left: projects + repositories */}
            <div className="scroll-thin min-w-0 flex-1 overflow-y-auto">
              <ProjectPanel
                project={project}
                repos={REPOS}
                query={query}
                onQueryChange={setQuery}
                onNewProject={() => notify('New project flow opened')}
                onConfigure={() => notify(`Configuring ${project.name}…`)}
                onNewTask={(repo) => notify(`New task in ${repo}`)}
              />
            </div>

            {/* Right: agents */}
            <aside className="scroll-thin w-[420px] shrink-0 overflow-y-auto p-5">
              <div className="flex flex-col gap-4">
                <AgentPanel onView={(a) => notify(`Opening ${a.name}…`)} />
                <TaskBotPanel onStart={() => notify('Task Bot started')} />
              </div>
            </aside>
          </div>
        </main>
      </div>

      <StatusBar />

      {toast && (
        <div
          role="status"
          className="animate-palette pointer-events-none fixed bottom-14 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-line-strong bg-elevated/95 px-3.5 py-2 text-[12.5px] font-medium text-ink shadow-xl backdrop-blur-md"
        >
          {toast}
        </div>
      )}

      <CommandPalette
        open={paletteOpen}
        onClose={closePalette}
        items={paletteItems}
        onSelect={(item) => {
          if (item.id.startsWith('nav-')) setNav(item.id.slice(4))
          else if (item.id.startsWith('proj-')) setProjectId(item.id.slice(5))
          else if (item.id === 'act-toggle-theme') toggle()
          else if (item.id === 'act-sidebar') setCollapsed((v) => !v)
          else notify(`Opened “${item.label}”`)
        }}
      />
    </div>
  )
}
