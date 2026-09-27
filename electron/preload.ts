import { contextBridge, ipcRenderer } from 'electron'

/**
 * The only surface the renderer gets. No Node, no `require`, no ipcRenderer.
 */
contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,

  /** Keeps the OS title bar / window controls in step with the app theme. */
  setTheme: (theme: 'dark' | 'light') => ipcRenderer.send('theme:set', theme),

  window: {
    minimize: () => ipcRenderer.send('win:minimize'),
    toggleMaximize: () => ipcRenderer.send('win:toggle-maximize'),
    close: () => ipcRenderer.send('win:close'),
    isMaximized: () => ipcRenderer.invoke('win:is-maximized') as Promise<boolean>,
    onMaximizedChange: (callback: (isMaximized: boolean) => void) => {
      const handler = (_e: unknown, value: boolean) => callback(value)
      ipcRenderer.on('win:maximized', handler)
      return () => ipcRenderer.removeListener('win:maximized', handler)
    },
  },
})
