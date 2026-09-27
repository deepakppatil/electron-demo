import { useEffect, useState } from 'react'
import { Minus, Square, Copy, X, Search } from 'lucide-react'
import { cx } from '@/lib/format'

export default function TopBar({
  title,
  onSearch,
}: {
  title: string
  onSearch: () => void
}) {
  const desktop = typeof window !== 'undefined' ? window.desktop : undefined
  const isMac = desktop?.platform === 'darwin'
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    if (!desktop) return
    desktop.window.isMaximized().then(setMaximized)
    return desktop.window.onMaximizedChange(setMaximized)
  }, [desktop])

  return (
    <header
      className="drag flex h-11 shrink-0 items-center justify-between border-b border-line bg-canvas/70 pl-5 backdrop-blur-xl"
      style={isMac ? { paddingLeft: 20 } : undefined}
    >
      <h1 className="text-[15px] font-bold tracking-tight text-ink">{title}</h1>

      <div className="flex items-center">
        <button
          onClick={onSearch}
          className="no-drag mr-2 flex h-7 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[11.5px] text-ink-faint transition hover:border-line-strong hover:text-ink-muted"
        >
          <Search size={12.5} />
          <span>Search</span>
          <kbd className="rounded border border-line bg-raised px-1 font-mono text-[9.5px] text-ink-faint">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        </button>

        {!isMac && (
          <div className="no-drag flex">
            <WinButton label="Minimize" onClick={() => desktop?.window.minimize()}>
              <Minus size={15} strokeWidth={1.5} />
            </WinButton>
            <WinButton
              label={maximized ? 'Restore' : 'Maximize'}
              onClick={() => desktop?.window.toggleMaximize()}
            >
              {maximized ? (
                <Copy size={12} strokeWidth={1.5} />
              ) : (
                <Square size={10.5} strokeWidth={1.5} />
              )}
            </WinButton>
            <WinButton label="Close" danger onClick={() => desktop?.window.close()}>
              <X size={15} strokeWidth={1.5} />
            </WinButton>
          </div>
        )}
      </div>
    </header>
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
        'grid h-11 w-11 place-items-center text-ink-muted transition-colors',
        danger ? 'hover:bg-[#e81123] hover:text-white' : 'hover:bg-white/10 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}
