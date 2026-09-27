import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const KEY = 'harness.theme'

function read(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem(KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return 'dark'
}

/** Theme lives on <html data-theme>; every token in index.css follows it. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(read)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem(KEY, theme)
    // Let Electron paint the matching native window chrome.
    window.desktop?.setTheme?.(theme)
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return { theme, toggle }
}
