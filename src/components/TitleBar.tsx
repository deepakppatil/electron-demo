import { useEffect, useState } from 'react'
import { Minus, Square, Copy, X, Search, Sparkles } from 'lucide-react'
import { cx } from '@/lib/format'

function useDesktop() {
  return typeof window !== 'undefined' ? window.desktop : undefined
}

export default function TitleBar({ onSearch }: { onSearch: () => void }) {
  const desktop = useDesktop()
  const isMac = desktop?.platform === 'darwin'
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    if (!desktop) return
    desktop.window.isMaximized().then(setMaximized)
    return desktop.window.onMaximizedChange(setMaximized)
  }, [desktop])

  // macOS renders native traffic lights over our bar, so we only reserve space.
  if (isMac) {
    return (
      <header
        className="drag flex h-11 shrink-0 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur-xl"
        style={{ paddingLeft: 88 }}
      >
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="text-[13px] font-semibold tracking-tight text-ink">Atlas</span>
          <span className="rounded-md bg-raised px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
            v0.1.0
          </span>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <button
            className="no-drag group flex h-7 items-center gap-2 rounded-lg border border-line bg-elevated/60 px-2.5 text-[12px] text-ink-faint transition hover:border-line-strong hover:text-ink-muted"
            onClick={onSearch}
          >
            <Search size={13} />
            <span>Search</span>
            <kbd className="rounded border border-line bg-canvas px-1 font-mono text-[10px] text-ink-faint">
              ⌘K
            </kbd>
          </button>
        </div>
      </header>
    )
  }

  return (
    <header className="drag flex h-10 shrink-0 items-center border-b border-line bg-surface/80 backdrop-blur-xl">
      {/* Left: brand */}
      <div className="flex w-60 shrink-0 items-center gap-2.5 pl-4">
        <Logo />
        <span className="text-[13px] font-semibold tracking-tight text-ink">Atlas</span>
      </div>

      {/* Center: breadcrumb */}
      <div className="flex flex-1 items-center justify-center gap-1.5 text-[12px] text-ink-faint">
        <span>acme-inc</span>
        <span className="opacity-50">/</span>
        <span className="text-ink-muted">Production</span>
      </div>

      {/* Right: search + window controls */}
      <div className="flex shrink-0 items-center">
        <button
          className="no-drag mr-2 flex h-7 items-center gap-2 rounded-lg border border-line bg-elevated/60 px-2.5 text-[12px] text-ink-faint transition hover:border-line-strong hover:text-ink-muted"
          onClick={onSearch}
        >
          <Search size={13} />
          <span>Search</span>
          <kbd className="rounded border border-line bg-canvas px-1 font-mono text-[10px] text-ink-faint">
            Ctrl K
          </kbd>
        </button>

        <div className="no-drag flex">
          <WinButton label="Minimize" onClick={() => desktop?.window.minimize()}>
            <Minus size={15} strokeWidth={1.6} />
          </WinButton>
          <WinButton
            label={maximized ? 'Restore' : 'Maximize'}
            onClick={() => desktop?.window.toggleMaximize()}
          >
            {maximized ? <Copy size={12} strokeWidth={1.6} /> : <Square size={11} strokeWidth={1.6} />}
          </WinButton>
          <WinButton label="Close" danger onClick={() => desktop?.window.close()}>
            <X size={15} strokeWidth={1.6} />
          </WinButton>
        </div>
      </div>
    </header>
  )
}

function Logo() {
  return (
    <span className="relative grid size-5 place-items-center rounded-[6px] bg-gradient-to-br from-accent to-cyan shadow-[0_0_0_1px_rgba(124,92,255,0.35),0_2px_8px_-2px_rgba(124,92,255,0.6)]">
      <Sparkles size={11} className="text-white" strokeWidth={2.2} />
    </span>
  )
}

function WinButton({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode
  onClick: () => void
  label: string
  danger?: boolean
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(
        'grid h-10 w-11 place-items-center text-ink-muted transition-colors',
        danger
          ? 'hover:bg-[#e81123] hover:text-white'
          : 'hover:bg-white/8 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}
