# Atlas — Electron + React + Tailwind desktop prototype

A single-screen desktop application prototype built with the real production stack:
**Electron** (main + preload), **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**.
Packages to **Windows (NSIS + portable .exe)** and **macOS (.dmg + .zip)** via `electron-builder`.

---

## Quick start

```bash
npm install          # first run only
npm run dev          # Vite dev server + Electron with HMR
```

`npm run dev` starts Vite on **:5173** and launches Electron pointed at it. The renderer hot-reloads;
edits to `electron/*.ts` need a restart (or `npm run build:electron -- --watch` in a second terminal).

> First install downloads the Electron binary (~100 MB). It is fetched during `npm install`'s
> postinstall step — if your network blocks it, run `node node_modules/electron/install.js`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server + Electron (live reload) |
| `npm run build` | Bundle `electron/` with esbuild, then build the renderer to `dist/` |
| `npm start` | Production build, then run it in Electron |
| `npm run typecheck` | `tsc --noEmit` across renderer + main |
| `npm run dist:win` | Package a Windows x64 installer + portable exe into `release/` |
| `npm run dist:mac` | Package a macOS dmg + zip (x64 + arm64) into `release/` |
| `npm run dist:all` | Both platforms in one pass |
| `npm run dist` | Current platform only |

### Packaging notes

- **Windows** — run `npm run dist:win` on Windows, or on macOS/Linux with Wine installed
  (`brew install --cask wine-stable`). Output: `release/Atlas Setup 0.1.0.exe` and `release/Atlas 0.1.0.exe`.
- **macOS** — `.dmg` signing requires macOS. The config sets `identity: null` so an **unsigned** build
  works on any machine; Gatekeeper will still warn on first launch. For a real release set
  `identity` to your Developer ID and add notarization.
- The app icon is `build/icon.png` (1024×1024). electron-builder auto-converts it to `.ico` / `.icns`.

---

## Project structure

```
electron/
  main.ts        BrowserWindow lifecycle, window chrome, IPC, single-instance lock
  preload.ts     contextBridge API — the renderer's only access to the OS
src/
  App.tsx        Screen composition
  index.css      Design tokens (@theme) + base layer  ← re-theme the app here
  components/    TitleBar · Sidebar · StatCard · TrafficChart · ActivityFeed · DeployTable
  lib/           data (fixtures) · format (number/date) · useMeasure
scripts/
  build-electron.mjs   esbuild bundler for main/preload
index.html       CSP lives here (production only; stripped in dev)
vite.config.ts   Renderer build + the dev-only CSP strip
electron-builder.yml
```

## Architecture notes

**Security.** `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`. The renderer
never touches `require` or `ipcRenderer` directly — it only sees the small `window.desktop` API
exposed by the preload. External links are intercepted and opened in the system browser.

**Platform-aware chrome.** macOS uses `titleBarStyle: 'hiddenInset'` so the native traffic lights sit
over our custom bar (we reserve 88px). Windows and Linux use `frame: false` and draw their own
minimize / maximize / close buttons. The renderer branches on `window.desktop.platform`.

**Theming.** Every colour, radius, and font is a CSS variable in the `@theme` block at the top of
`src/index.css`. Change a token there and the whole app re-skins — no component edits needed.

**Fonts.** System font stacks (SF Pro on macOS, Segoe UI on Windows) so the app looks native on both
and ships with zero font payload.

**Layout.** The window frame never scrolls (`body { overflow: hidden }`); only the content pane does.
The main pane is a sticky-header + scrollable-body layout, so the page header stays pinned.

## Keyboard

| Shortcut | Action |
| --- | --- |
| `Ctrl/⌘ + K` | Focus the search field |
| `Esc` | Blur search |

## Prototype shortcuts

The screen is deliberately interactive so the design can be evaluated as a real app rather than a
static mock: the traffic chart has a crosshair + tooltip and a working 7/30/90-day range switch,
sidebar navigation and the Live/Paused toggle change state, the clock ticks, and the deploy table
highlights on hover.
