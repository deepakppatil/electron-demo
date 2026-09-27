import { app, BrowserWindow, ipcMain, shell, nativeTheme } from 'electron'
import path from 'node:path'

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
const isDev = Boolean(DEV_SERVER_URL)

let mainWindow: BrowserWindow | null = null

const isMac = process.platform === 'darwin'

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1120,
    minHeight: 680,
    show: false,
    backgroundColor: '#15111a',
    // macOS keeps the native traffic lights (hiddenInset); Windows/Linux get a
    // fully custom titlebar that we draw in React.
    ...(isMac
      ? { titleBarStyle: 'hiddenInset' as const, trafficLightPosition: { x: 18, y: 18 } }
      : { frame: false }),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  })

  // Avoid the white flash before React paints.
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    if (isDev) mainWindow?.webContents.openDevTools({ mode: 'detach' })
  })

  if (isDev) {
    mainWindow.loadURL(DEV_SERVER_URL!)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Any external link opens in the system browser, never inside the shell.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowed = isDev ? DEV_SERVER_URL : `file://${path.join(__dirname, '../dist/index.html')}`
    if (!url.startsWith(allowed)) {
      event.preventDefault()
      if (/^https?:/.test(url)) shell.openExternal(url)
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('maximize', () => mainWindow?.webContents.send('win:maximized', true))
  mainWindow.on('unmaximize', () => mainWindow?.webContents.send('win:maximized', false))
}

function focusMainWindow() {
  if (!mainWindow) return createWindow()
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.focus()
}

// --- Single instance --------------------------------------------------------
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', focusMainWindow)
  app.whenReady().then(() => {
    nativeTheme.themeSource = 'dark'
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  if (!isMac) app.quit()
})

// --- Window controls IPC ----------------------------------------------------
ipcMain.on('win:minimize', () => mainWindow?.minimize())
ipcMain.on('win:toggle-maximize', () => {
  if (!mainWindow) return
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
})
ipcMain.on('win:close', () => mainWindow?.close())
ipcMain.handle('win:is-maximized', () => mainWindow?.isMaximized() ?? false)
ipcMain.on('theme:set', (_e, theme: 'dark' | 'light') => {
  nativeTheme.themeSource = theme
  mainWindow?.setBackgroundColor(theme === 'light' ? '#f4f1f5' : '#15111a')
})
