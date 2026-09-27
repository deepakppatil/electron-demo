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

**Theming.** Every colour, radius, and font is a CSS variable in the two `:root` blocks at the top
of `src/index.css` (dark + light). An `@theme inline` layer maps them onto Tailwind utilities
(`bg-surface`, `text-ink`, `border-line`, …), so opacity modifiers keep working and the whole app
re-skins the instant a variable changes — no component edits. The header has a light/dark toggle to
prove it, and the choice persists in `localStorage`. The Electron main process mirrors the theme to
`nativeTheme` and the window background colour so the frame never flashes the wrong shade.

**Fonts.** System font stacks (SF Pro on macOS, Segoe UI on Windows) so the app looks native on both
and ships with zero font payload.

**Layout.** The window frame never scrolls (`body { overflow: hidden }`); only the content pane does.
The main pane is a sticky-header + scrollable-body layout, so the page header stays pinned.

## Keyboard

| Shortcut | Action |
| --- | --- |
| `Ctrl/⌘ + K` | Open / close the command palette |
| `↑` `↓` | Move through palette results |
| `Enter` | Open the highlighted result |
| `Esc` | Dismiss the palette |

## Prototype details

The screen is deliberately interactive so the design can be judged as a real app rather than a
static mock:

- **Command palette** (`⌘K`) — fuzzy subsequence search over pages, the deployed services, and
  actions, with grouped results and full keyboard navigation.
- **Traffic chart** — crosshair + tooltip, and a working 7/30/90-day range switch backed by a
  deterministic seeded generator, so the numbers never jitter between renders.
- **Theme toggle** — swaps the entire token set, and syncs the native window chrome.
- Live/pause toggle, a ticking clock, a KPI that nudges upward while live, toasts on actions,
  hover states throughout, and a dark theme that is the product default.

## Where the real Electron bits live

| Concern | File |
| --- | --- |
| Window creation, lifecycle, single-instance lock | `electron/main.ts` |
| The only renderer↔OS bridge (`contextBridge`) | `electron/preload.ts` |
| Window controls IPC (`minimize` / `toggleMaximize` / `close`) | `electron/main.ts` + `TitleBar.tsx` |
| Platform-aware titlebar (mac traffic lights vs. custom) | `electron/main.ts` + `TitleBar.tsx` |
| Theme → native chrome sync | `electron/main.ts` (`theme:set`) |
