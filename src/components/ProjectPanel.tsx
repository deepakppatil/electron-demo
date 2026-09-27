import { useState } from 'react'
import {
  ChevronDown,
  Folder,
  GitBranch,
  Plus,
  Search,
  FolderKanban,
  type LucideIcon,
} from 'lucide-react'
import type { Project, Repo, Stage, Task } from '@/lib/data'
import { TONE_CHIP } from '@/lib/tone'
import { cx } from '@/lib/format'

export default function ProjectPanel({
  project,
  repos,
  query,
  onQueryChange,
  onNewProject,
  onNewTask,
  onConfigure,
}: {
  project: Project
  repos: Repo[]
  query: string
  onQueryChange: (v: string) => void
  onNewProject: () => void
  onNewTask: (repo: string) => void
  onConfigure: () => void
}) {
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [reposOpen, setReposOpen] = useState(true)

  const q = query.trim().toLowerCase()
  const visible = q
    ? repos.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.stack.toLowerCase().includes(q) ||
          r.tasks.some((t) => t.name.toLowerCase().includes(q)),
      )
    : repos

  return (
    <div className="flex flex-col gap-4 p-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onNewProject}
          className="flex h-9 items-center gap-2 rounded-[var(--radius-tile)] bg-ink px-3.5 text-[12.5px] font-semibold text-canvas transition hover:bg-ink/90 active:scale-[0.98]"
        >
          <Plus size={15} strokeWidth={2.6} />
          New Project
        </button>

        <div className="relative ml-auto w-full max-w-[380px]">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search repositories or tasks..."
            className="h-9 w-full rounded-[var(--radius-tile)] border border-line bg-elevated pl-9 pr-3 text-[12.5px] text-ink outline-none transition placeholder:text-ink-faint focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      {/* Project details */}
      <section className="animate-rise overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface bevel">
        <header
          className="flex cursor-pointer items-center gap-2.5 px-4 py-3"
          onClick={() => setDetailsOpen((v) => !v)}
        >
          <ChevronDown
            size={15}
            strokeWidth={2.2}
            className={cx(
              'shrink-0 text-ink-faint transition-transform duration-200',
              !detailsOpen && '-rotate-90',
            )}
          />
          <span className="grid size-[26px] shrink-0 place-items-center rounded-md bg-accent/15 text-accent">
            <FolderKanban size={14} strokeWidth={2.2} />
          </span>
          <h2 className="text-[13.5px] font-bold tracking-tight text-ink">Project Details</h2>
          <Pill>{project.name}</Pill>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onConfigure()
            }}
            className="ml-auto text-[12.5px] font-semibold text-accent transition hover:text-accent-hi"
          >
            Configure
          </button>
        </header>

        {detailsOpen && (
          <>
            <div className="h-px bg-line" />
            <div className="grid grid-cols-2 gap-y-4 px-5 py-4 sm:grid-cols-4">
              <Meta label="Repositories" value={String(project.repositories)} first />
              <Meta label="Type" value={project.type} accent />
              <Meta label="Backend" value={project.backend} dot />
              <Meta label="Persona" value={project.persona} />
              <Meta label="Branch" value={project.branch} icon={GitBranch} />
              <Meta label="MCP" value={`${project.mcp.filter(Boolean).length} of ${project.mcp.length}`} dots={project.mcp} />
            </div>
          </>
        )}
      </section>

      {/* Repositories */}
      <section>
        <button
          onClick={() => setReposOpen((v) => !v)}
          className="flex items-center gap-2 px-1 pb-2.5"
        >
          <ChevronDown
            size={15}
            strokeWidth={2.2}
            className={cx(
              'text-ink-faint transition-transform duration-200',
              !reposOpen && '-rotate-90',
            )}
          />
          <h2 className="text-[13.5px] font-bold tracking-tight text-ink">Repositories</h2>
          <span className="tnum text-[12px] font-semibold text-ink-faint">· {visible.length}</span>
        </button>

        {reposOpen && (
          <div className="flex flex-col gap-3">
            {visible.length === 0 && (
              <p className="rounded-[var(--radius-card)] border border-dashed border-line px-4 py-8 text-center text-[12.5px] text-ink-faint">
                No repositories match “{query}”
              </p>
            )}

            {visible.map((repo, i) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                index={i}
                onNewTask={() => onNewTask(repo.name)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function RepoCard({ repo, index, onNewTask }: { repo: Repo; index: number; onNewTask: () => void }) {
  const [open, setOpen] = useState(true)

  return (
    <article
      className="animate-rise overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface bevel"
      style={{ animationDelay: `${80 + index * 55}ms` }}
    >
      <header
        className="flex cursor-pointer items-center gap-3 px-4 py-3"
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronDown
          size={14}
          strokeWidth={2.2}
          className={cx(
            'shrink-0 text-ink-faint transition-transform duration-200',
            !open && '-rotate-90',
          )}
        />
        <span className="grid size-[30px] shrink-0 place-items-center rounded-md bg-amber/15 text-amber">
          <Folder size={15} strokeWidth={2.2} />
        </span>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="truncate font-mono text-[13px] font-semibold text-ink">{repo.name}</h3>
          <Pill tone="amber">{repo.kind}</Pill>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onNewTask()
          }}
          className="ml-auto flex shrink-0 items-center gap-1 text-[12.5px] font-semibold text-accent transition hover:text-accent-hi"
        >
          <Plus size={13} strokeWidth={2.8} />
          New Task
        </button>
      </header>

      {open && (
        <>
          <div className="h-px bg-line" />
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
            <Pill>{repo.stack}</Pill>
            <span className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
              <GitBranch size={12.5} strokeWidth={2.2} className="text-ink-faint" />
              <span className="font-mono">{repo.branch}</span>
            </span>
            <span className="text-[11.5px] text-ink-muted">{repo.summary}</span>
          </div>

          <ul className="border-t border-line">
            {repo.tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        </>
      )}
    </article>
  )
}

function TaskRow({ task }: { task: Task }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line/70 px-4 py-2.5 transition-colors last:border-0 hover:bg-elevated/60">
      <span className="min-w-[168px] flex-1 truncate font-mono text-[12px] font-medium text-ink">
        {task.name}
      </span>
      <StatusPill tone={task.tone}>{task.status}</StatusPill>
      <ProgressBar stages={task.stages} />
    </li>
  )
}

const STAGE_COLOR: Record<Stage, string> = {
  done: 'var(--app-green)',
  running: 'var(--app-blue)',
  input: 'var(--app-amber)',
  todo: 'var(--app-raised)',
}

function ProgressBar({ stages }: { stages: Stage[] }) {
  return (
    <span className="flex w-[220px] shrink-0 gap-1" title="Pipeline stages">
      {stages.map((s, i) => (
        <span
          key={i}
          className="h-[6px] flex-1 rounded-full transition-colors"
          style={{ background: STAGE_COLOR[s] }}
        />
      ))}
    </span>
  )
}

/* --- Primitives ---------------------------------------------------- */

export function Pill({ children, tone }: { children: React.ReactNode; tone?: 'amber' | 'muted' }) {
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center rounded-[5px] px-1.5 py-px text-[10.5px] font-bold uppercase tracking-[0.04em] ring-1 ring-inset',
        tone === 'amber' ? 'bg-amber/15 text-amber ring-amber/30' : 'bg-raised text-ink-muted ring-line-strong',
      )}
    >
      {children}
    </span>
  )
}

export function StatusPill({ tone, children }: { tone: Task['tone']; children: React.ReactNode }) {
  return (
    <span
      className={cx(
        'inline-flex w-[104px] shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.04em] ring-1 ring-inset',
        TONE_CHIP[tone],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}

function Meta({
  label,
  value,
  first,
  accent,
  dot,
  icon: Icon,
  dots,
}: {
  label: string
  value: string
  first?: boolean
  accent?: boolean
  dot?: boolean
  icon?: LucideIcon
  dots?: boolean[]
}) {
  return (
    <div
      className={cx(
        'min-w-0 pr-4',
        !first && 'border-l border-line pl-4',
      )}
    >
      <p className="label mb-1.5">{label}</p>
      <p
        className={cx(
          'flex items-center gap-1.5 truncate text-[12.5px] font-semibold',
          accent ? 'text-amber' : 'text-ink',
        )}
      >
        {Icon && <Icon size={12.5} strokeWidth={2.4} className="shrink-0 text-ink-faint" />}
        {dot && <span className="size-1.5 shrink-0 rounded-full bg-green" />}
        <span className={cx(!Icon && !dot && !dots && 'truncate')}>{value}</span>
        {dots && (
          <span className="ml-1 flex items-center gap-1">
            {dots.map((on, i) => (
              <span
                key={i}
                className="size-2 rounded-full"
                style={{ background: on ? 'var(--app-green)' : 'var(--app-line-strong)' }}
              />
            ))}
          </span>
        )}
      </p>
    </div>
  )
}
