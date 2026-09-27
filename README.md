# Harness — Electron + React + Tailwind desktop prototype

A single-screen desktop application prototype built with the real production stack:
**Electron 44** (main + preload), **React 19**, **TypeScript**, **Vite 7**, **Tailwind CSS v4**.
Packages to **Windows (NSIS + portable .exe)** and **macOS (.dmg + .zip)** via `electron-builder`.

The UI reproduces the *Harness* reference: a warm plum-dark agent-orchestration console with a
left rail, a five-cell metric strip, a project/repository tree with segmented pipeline bars, an
Agent Assistant panel, and a full-width status bar.

---

## Quick start

```bash
npm install          # first run only
npm run dev          # Vite dev server + Electron with HMR
```

`npm run dev` starts Vite on **:5173** and launches Electron pointed at it. The renderer hot-reloads;
edits to `electron/*.ts` need a restart (or `npm run build:electron -- --watch` in a second terminal).

> First install downloads the Electron binary (~100 MB) during `npm install`'s postinstall step.
> If your network blocks it, run `node node_modules/electron/install.js`.

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
| `./scripts/make-icon.sh` | Regenerate `build/icon.png` (needs ImageMagick) |

### Packaging notes

- **Windows** — run `npm run dist:win` on Windows, or on macOS/Linux with Wine installed
  (`brew install --cask wine-stable`). Output: `release/Harness Setup 0.1.0.exe` and a portable exe.
- **macOS** — `.dmg` signing requires macOS. The config sets `identity: null` so an **unsigned** build
  works on any machine; Gatekeeper will still warn on first launch. For a real release set
  `identity` to your Developer ID and add notarization.
- The app icon is `build/icon.png` (1024×1024, transparent corners). electron-builder auto-converts
  it to `.ico` / `.icns`. `scripts/make-icon.sh` regenerates it from vector primitives.

---

## Project structure

```
electron/
  main.ts        BrowserWindow lifecycle, window chrome, IPC, single-instance lock
  preload.ts     contextBridge API — the renderer's only access to the OS
src/
  App.tsx        Screen composition
  index.css      Design tokens (:root dark + light) + @theme inline  ← re-theme here
  components/    TopBar · Sidebar · StatStrip · ProjectPanel · AgentPanel ·
                 StatusBar · Sparkline · CommandPalette
  lib/           data (fixtures) · tone (semantic colour map) · format · useTheme
scripts/
  build-electron.mjs   esbuild bundler for main/preload
  make-icon.sh         vector app-icon generator
index.html       CSP lives here (production only; stripped in dev)
vite.config.ts   Renderer build + the dev-only CSP strip
electron-builder.yml
```

## Architecture notes

**Security.** `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`. The renderer
never touches `require` or `ipcRenderer` directly — it only sees the small `window.desktop` API
exposed by the preload. External links are intercepted and opened in the system browser.

**Platform-aware chrome.** macOS uses `titleBarStyle: 'hiddenInset'` so the native traffic lights sit
over our custom bar (the sidebar reserves 84px so the "Harness" wordmark clears them). Windows and
Linux use `frame: false` and draw their own minimize / maximize / close buttons in the top bar. The
renderer branches on `window.desktop.platform`.

**Theming.** Every colour, radius, and font is a CSS variable in the two `:root` blocks at the top of
`src/index.css` (dark + light). An `@theme inline` layer maps them onto Tailwind utilities
(`bg-surface`, `text-ink`, `border-line`, …), so opacity modifiers keep working and the whole app
re-skins the instant a variable changes — no component edits. The sidebar has a light/dark toggle to
prove it; the choice persists in `localStorage` and is mirrored to `nativeTheme` plus the window
background colour in the main process so the frame never flashes the wrong shade.

**Semantic colour.** `src/lib/tone.ts` maps a `Tone` (`accent · blue · green · amber · red · purple`)
to text / chip / tile / raw-hex, so a metric's meaning is defined once and reused by the stat strip,
status pills, progress bars, and agent tiles.

**Fonts.** System stacks (SF Pro on macOS, Segoe UI on Windows) so the app looks native on both and
ships with zero font payload. Repository, branch, and command names use the mono stack.

**Layout.** The window frame never scrolls (`body { overflow: hidden }`). The shell is a
`sidebar | main` split over a full-width status bar; inside `main` the top bar and the five-cell stat
strip are fixed while the left (projects) and right (agents) columns scroll independently — so the
metrics stay pinned no matter how long the repository list gets.

## Keyboard

| Shortcut | Action |
| --- | --- |
| `Ctrl/⌘ + K` | Open / close the command palette |
| `↑` `↓` | Move through palette results |
| `Enter` | Open the highlighted result |
| `Esc` | Dismiss the palette |

## Prototype behaviour

The screen is a working app rather than a static mock, so the design can be judged in motion:

- **Command palette** (`⌘K`) — fuzzy subsequence search over pages, projects, repositories, and
  agents, with grouped results and full keyboard navigation. Most results actually navigate.
- **Live search** — the toolbar field filters repositories by name, stack, or task name.
- **Collapsible regions** — project details, the repositories group, and every repository card.
- **Collapsible sidebar** — the panel button in the wordmark row switches between the 280px rail and
  a 68px icon rail.
- **Theme toggle** — swaps the whole token set and syncs the native window chrome.
- Actions (New Project, Configure, New Task, View, Start Task Bot) raise toasts.
