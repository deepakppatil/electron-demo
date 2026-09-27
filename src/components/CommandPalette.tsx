import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search, CornerDownLeft, ArrowUp, ArrowDown, type LucideIcon } from 'lucide-react'
import { cx } from '@/lib/format'

export type PaletteItem = {
  id: string
  label: string
  hint?: string
  group: string
  icon: LucideIcon
  shortcut?: string
}

/** Subsequence match, earlier + tighter = higher score. */
function score(query: string, target: string): number {
  if (!query) return 1
  const q = query.toLowerCase()
  const t = target.toLowerCase()

  const direct = t.indexOf(q)
  if (direct !== -1) return 1000 - direct * 4 - (t.length - q.length)

  let ti = 0
  let hits = 0
  let streak = 0
  let best = 0
  for (let qi = 0; qi < q.length; qi++) {
    const found = t.indexOf(q[qi], ti)
    if (found === -1) return 0
    streak = found === ti ? streak + 1 : 0
    best = Math.max(best, streak)
    hits++
    ti = found + 1
  }
  return hits * 10 + best * 6
}

export default function CommandPalette({
  open,
  onClose,
  items,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  items: PaletteItem[]
  onSelect: (item: PaletteItem) => void
}) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
    }
  }, [open])

  const results = useMemo(() => {
    if (!query.trim()) return items.slice(0, 9)
    return items
      .map((item) => ({ item, s: Math.max(score(query, item.label), score(query, item.group) * 0.6) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 9)
      .map((r) => r.item)
  }, [items, query])

  useEffect(() => setCursor(0), [query])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setCursor((c) => (results.length ? (c + 1) % results.length : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setCursor((c) => (results.length ? (c - 1 + results.length) % results.length : 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const item = results[cursor]
        if (item) {
          onSelect(item)
          onClose()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, cursor, onClose, onSelect])

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [cursor, results])

  if (!open) return null

  let lastGroup = ''

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh]">
      <div
        className="animate-fade absolute inset-0 bg-black/55 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="animate-palette relative w-[min(620px,92vw)] overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[0_24px_70px_-12px_rgba(0,0,0,0.65)]"
      >
        <div className="flex items-center gap-2.5 border-b border-line px-3.5">
          <Search size={15} className="shrink-0 text-ink-faint" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a page, service or action…"
            className="h-12 flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-faint"
          />
          <kbd className="rounded-md border border-line bg-raised px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
            Esc
          </kbd>
        </div>

        <div ref={listRef} className="scroll-thin max-h-[46vh] overflow-y-auto p-1.5">
          {results.length === 0 && (
            <p className="px-3 py-8 text-center text-[12.5px] text-ink-faint">
              No matches for “{query}”
            </p>
          )}

          {results.map((item, i) => {
            const showGroup = item.group !== lastGroup
            lastGroup = item.group
            const Icon = item.icon
            const active = i === cursor
            return (
              <div key={item.id}>
                {showGroup && (
                  <p className="px-2.5 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint/70">
                    {item.group}
                  </p>
                )}
                <button
                  data-active={active}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => {
                    onSelect(item)
                    onClose()
                  }}
                  className={cx(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                    active ? 'bg-raised text-ink' : 'text-ink-muted hover:bg-elevated',
                  )}
                >
                  <span
                    className={cx(
                      'grid size-7 shrink-0 place-items-center rounded-md border border-line',
                      active ? 'border-accent/40 bg-accent/12 text-accent-hi' : 'bg-raised text-ink-faint',
                    )}
                  >
                    <Icon size={14} strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium">{item.label}</span>
                    {item.hint && <span className="block truncate text-[11px] text-ink-faint">{item.hint}</span>}
                  </span>
                  {active && <CornerDownLeft size={13} className="shrink-0 text-ink-faint" />}
                </button>
              </div>
            )
          })}
        </div>

        <footer className="flex items-center gap-4 border-t border-line bg-raised/50 px-3.5 py-2 text-[10.5px] text-ink-faint">
          <span className="flex items-center gap-1">
            <ArrowUp size={10} />
            <ArrowDown size={10} /> navigate
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft size={10} /> open
          </span>
          <span className="ml-auto font-mono">atlas · ⌘K</span>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
