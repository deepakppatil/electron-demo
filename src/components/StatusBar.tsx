import {
  GitBranch,
  LayoutGrid,
  CircleDot,
  TriangleAlert,
  Blocks,
  Sparkles,
  UserRound,
  Bell,
} from 'lucide-react'

export default function StatusBar() {
  return (
    <footer className="flex h-9 shrink-0 items-center justify-between border-t border-line bg-surface px-4 text-[11.5px] text-ink-muted select-none">
      {/* Left cluster */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 font-medium text-ink-muted">
          <GitBranch size={13} strokeWidth={2.2} className="text-ink-faint" />
          develop
        </span>
        <Divider />
        <span className="flex items-center gap-1.5">
          <LayoutGrid size={13} strokeWidth={2} className="text-ink-faint" />
          No active run
        </span>
        <Divider />
        <span className="tnum flex items-center gap-1.5" title="Errors">
          <CircleDot size={12} strokeWidth={2.4} className="text-ink-faint" />0
        </span>
        <Divider />
        <span className="tnum flex items-center gap-1.5" title="Warnings">
          <TriangleAlert size={12} strokeWidth={2.4} className="text-ink-faint" />0
        </span>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 font-semibold text-amber">
          <Blocks size={13} strokeWidth={2.2} />
          MCP 2/3
        </span>
        <Divider />
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles size={13} strokeWidth={2.2} className="text-ink-faint" />
          Claude Code
        </span>
        <Divider />
        <span className="flex items-center gap-1.5 font-semibold text-blue">
          <UserRound size={13} strokeWidth={2.2} />
          Architect
        </span>

        <span className="relative ml-1 grid size-6 place-items-center text-ink-muted">
          <Bell size={14} strokeWidth={2} />
          <span className="absolute right-0.5 top-0.5 size-[7px] rounded-full bg-accent ring-2 ring-[var(--app-surface)]" />
        </span>
      </div>
    </footer>
  )
}

function Divider() {
  return <span className="h-3.5 w-px bg-line" />
}
