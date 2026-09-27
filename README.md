# Harness — Electron + React + Tailwind desktop prototype

A single-screen desktop application prototype built with the real production stack:
**Electron 44** (main + preload), **React 19**, **TypeScript**, **Vite 7**, **Tailwind CSS v4**.
Packages to **Windows (NSIS + portable `.exe`)** and **macOS (`.dmg` + `.zip`)** via `electron-builder`,
locally or from a **GitLab CI** pipeline.

The UI reproduces the *Harness* reference: a warm plum-dark agent-orchestration console with a
left rail, a five-cell metric strip, a project/repository tree with segmented pipeline bars, an
Agent Assistant panel, and a full-width status bar.

---

## Contents

- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Building the executable](#building-the-executable)
  - [Prerequisites](#prerequisites)
  - [Build on Windows](#build-on-windows)
  - [Build on macOS](#build-on-macos)
  - [Build on Linux](#build-on-linux)
  - [What you get](#what-you-get)
  - [Cross-compiling](#cross-compiling)
  - [Code signing and notarization](#code-signing-and-notarization)
  - [Troubleshooting](#troubleshooting)
- [GitLab CI](#gitlab-ci)
- [Project structure](#project-structure)
- [Architecture notes](#architecture-notes)
- [Keyboard](#keyboard)
- [Prototype behaviour](#prototype-behaviour)

---

## Quick start

```bash
npm install          # first run only
npm run dev          # Vite dev server + Electron with HMR
```

`npm run dev` starts Vite on **:5173** and launches Electron pointed at it. The renderer hot-reloads;
edits to `electron/*.ts` need a restart (or `npm run build:electron -- --watch` in a second terminal).

> The first `npm install` downloads the **Electron binary (~100 MB)** in a postinstall step. If your
> network or proxy blocks it, run it manually: `node node_modules/electron/install.js`

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server + Electron (live reload) |
| `npm run build` | Bundle `electron/` with esbuild, then build the renderer to `dist/` |
| `npm start` | Production build, then run it in Electron |
| `npm run typecheck` | `tsc --noEmit` across renderer + main |
| `npm run clean` | Delete `dist/` and `dist-electron/` |
| `npm run dist` | Package for the **current** platform |
| `npm run dist:win` | Package Windows x64 → NSIS installer + portable `.exe` |
| `npm run dist:mac` | Package macOS x64 + arm64 → `.dmg` + `.zip` |
| `npm run dist:linux` | Package Linux → `.AppImage` |
| `npm run dist:all` | Windows, then macOS, in one command |
| `npm run icon` | Regenerate `build/icon.png` (needs ImageMagick) |

---

## Building the executable

Every packaging script runs `npm run build` first, so you never ship a stale bundle:

```
npm run build          # → dist/ (renderer) + dist-electron/ (main, preload)
electron-builder       # → release/ (installers)
```

### Prerequisites

| | Requirement |
| --- | --- |
| **Node.js** | `>= 20.19` (Vite 7 floor). `22.12+` recommended — CI pins **22.22.3**. `nvm use` reads `.nvmrc`. |
| **Disk** | ~1.5 GB: `node_modules`, the Electron binary, and the unpacked app in `release/`. |
| **Windows** | Windows 10 or later. Nothing else — electron-builder downloads its own NSIS toolchain into the user cache on first run. |
| **macOS** | `xcode-select --install` (Command Line Tools). macOS 11+ to run Apple Silicon builds. |
| **Network** | Only on the first run, to fetch the Electron binary and the packaging toolchains. Both are cached afterwards. |

> Electron bundles its own Chromium, so **no WebView2 or browser runtime** is required on the
> target machine. The only OS requirement is the one Electron itself imposes (Windows 10+).

### Build on Windows

```powershell
git clone https://github.com/deepakppatil/electron-demo.git
cd electron-demo
npm ci

npm run dist:win
```

`dist:win` runs `npm run build && electron-builder --win --x64 --publish never`.

**Output in `release/`:**

| File | What it is |
| --- | --- |
| `Harness Setup 0.1.0.exe` | **NSIS installer.** Lets the user pick the install directory, creates Start-menu and desktop shortcuts. Choose this for distribution. |
| `Harness 0.1.0.exe` | **Portable executable.** Runs with no install; good for internal testing or a zip drop. |
| `win-unpacked/` | The unpacked app — handy for inspecting resources or running with a debugger attached. |

**Smoke-test the result before shipping it:**

```powershell
# Portable — no install, no elevation
.\release\Harness 0.1.0.exe

# Or install silently and inspect what landed
.\release\"Harness Setup 0.1.0.exe" /S /D=C:\Harness
Get-ChildItem C:\Harness
```

SmartScreen will warn on an unsigned binary — expected, see [Code signing](#code-signing-and-notarization).

### Build on macOS

```bash
git clone https://github.com/deepakppatil/electron-demo.git
cd electron-demo
xcode-select --install     # once, if the CLT are not already installed
npm ci

npm run dist:mac
```

`dist:mac` runs `npm run build && electron-builder --mac --x64 --arm64 --publish never`.

**Output in `release/`:**

| File | What it is |
| --- | --- |
| `Harness-0.1.0-arm64.dmg` | **Apple Silicon** disk image. |
| `Harness-0.1.0-x64.dmg` | **Intel** disk image. |
| `Harness-0.1.0-arm64.zip` | Apple Silicon `.app`, for notarization pipelines and direct distribution. |
| `Harness-0.1.0-x64.zip` | Intel `.app`, same. |
| `mac-arm64/Harness.app`, `mac/Harness.app` | The unpacked bundles. |

One Mac build produces **both** architectures. To ship a single universal binary instead, change
`electron-builder.yml`:

```yaml
mac:
  target:
    - target: dmg
      arch: [universal]
```

**Smoke-test the result:**

```bash
open release/Harness-0.1.0-arm64.dmg      # drag to Applications, launch
"/Applications/Harness.app/Contents/MacOS/Harness"   # run the binary directly
```

An unsigned build is quarantined by Gatekeeper on first launch. Clear it locally with:

```bash
xattr -dr com.apple.quarantine /Applications/Harness.app
```

### Build on Linux

```bash
npm ci
npm run dist:linux      # → release/Harness-0.1.0.AppImage
chmod +x release/Harness-0.1.0.AppImage
```

### What you get

Inside the packaged app, `dist/` (the React renderer) and `dist-electron/` (main + preload) are
packed into an `app.asar` archive with maximum compression. The source maps ship too, so you can
symbolicate production stack traces.

### Cross-compiling

| From | → Windows | → macOS | → Linux |
| --- | --- | --- | --- |
| **Windows** | ✅ native | ❌ impossible | ❌ not supported |
| **macOS** | ⚠️ via Wine | ✅ native | ❌ not supported |
| **Linux** | ⚠️ via Wine | ❌ impossible | ✅ native |

- **macOS builds only work on macOS.** The `.app` bundle and the `.dmg` wrapper are produced with
  macOS-only tooling (`hdiutil`, `codesign`). No amount of configuration changes this — use a macOS
  runner, which is exactly what the CI pipeline does.
- **Windows builds from macOS/Linux work through Wine** and are fine for a prototype:

  ```bash
  brew install --cask wine-stable     # macOS
  # or, on Debian/Ubuntu:
  sudo dpkg --add-architecture i386 && sudo apt update && sudo apt install -y wine wine32 wine64
  npm run dist:win
  ```

  On Apple Silicon, Wine still needs Rosetta (`softwareupdate --install-rosetta`). For a
  distribution build, prefer a real Windows runner — Wine can silently produce a subtly broken
  installer, and it cannot code-sign.

### Code signing and notarization

Builds are **unsigned by default** (`identity: null` in `electron-builder.yml`) so they work
anywhere. Unsigned builds are fine for internal use, but macOS Gatekeeper and Windows SmartScreen
will both warn end users, and macOS will refuse to open a downloaded app outright unless they clear
the quarantine flag.

Nothing needs to change in the config — supply these variables and electron-builder picks them up.

**Windows (Authenticode)**

| Variable | Type | Value |
| --- | --- | --- |
| `CSC_LINK` | File | Path to the `.pfx`, or a base64-encoded `.pfx` in a plain variable. |
| `CSC_KEY_PASSWORD` | Variable | Password for the `.pfx`. **Mask this variable.** |

```powershell
$env:CSC_LINK = "C:\certs\harness.pfx"
$env:CSC_KEY_PASSWORD = "…"
npm run dist:win
```

**macOS (Developer ID + notarization)**

| Variable | Type | Value |
| --- | --- | --- |
| `CSC_LINK` | Variable | Base64 `.p12` exported from the Developer ID Application certificate. |
| `CSC_KEY_PASSWORD` | Variable | Password for the `.p12`. **Mask this.** |
| `APPLE_ID` | Variable | Apple ID used for notarization. |
| `APPLE_APP_SPECIFIC_PASSWORD` | Variable | App-specific password. **Mask this.** |
| `APPLE_TEAM_ID` | Variable | 10-character team ID. |

```bash
export CSC_LINK="$(base64 -i harness.p12 | tr -d '\n')"
export CSC_KEY_PASSWORD="…"
export APPLE_ID="you@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="…"
export APPLE_TEAM_ID="ABCDE12345"
npm run dist:mac
```

> The CI pipeline sets `CSC_IDENTITY_AUTO_DISCOVERY: "false"` globally. That is deliberate and
> complementary to `CSC_LINK`: it stops electron-builder from *searching the keychain* for a stray
> certificate (which causes a confusing "cannot find valid certificate" error when there isn't one),
> while an explicit `CSC_LINK` is still honoured. So `CSC_LINK` alone is all you need.

### Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `unable to verify the first certificate` | A TLS-intercepting proxy. Export `NODE_EXTRA_CA_CERTS=/path/to/corp-ca.pem` (and the same for the packaging tool), or pre-populate the Electron cache. |
| `Cannot find module 'electron'` at package time | The Electron postinstall never ran. `node node_modules/electron/install.js` |
| `dmg cannot be built on linux` | Expected. macOS artifacts require a macOS runner. |
| `Cannot create code signing certificate` | No signing identity. Leave it unsigned (`identity: null`) or supply `CSC_LINK`. |
| NSIS download fails | Corporate proxy blocking GitHub releases. Set `ELECTRON_BUILDER_BINARIES_MIRROR`. |
| Windows build is slow the first time | electron-builder is downloading NSIS and winCodeSign. It is cached in `%LOCALAPPDATA%\electron-builder\Cache`. |
| App opens with a white flash | Window `backgroundColor` in `electron/main.ts` is out of sync with the app canvas. Keep it equal to `--app-canvas`. |

---

## GitLab CI

`.gitlab-ci.yml` builds, packages, and releases the app on every push.

```
        ┌── check ────────────┐   ┌── package ──────────────┐   ┌── release ──┐
branch →│ typecheck           │ → │ package:linux  (AppImage)│ → │ release      │
 / MR   │ build (dist/)       │   │ package:windows (nsis)   │   │ GitLab       │
        └─────────────────────┘   │ package:macos (dmg/zip)  │   │ release with │
                                  └─────────────────────────┘   │ all artifacts│
                                                                 └─────────────┘
```

**When each job runs**

| Job | Runs on | Runner | Produces |
| --- | --- | --- | --- |
| `typecheck` | every branch, MR, tag | Linux (`node:22-bookworm`) | — |
| `build` | every branch, MR, tag | Linux | `dist/`, `dist-electron/` (1 day) |
| `package:linux` | tags, default branch | Linux | `release/*.AppImage` (30 days) |
| `package:windows` | tags, default branch | tag `windows` | `release/*.exe` (30 days) |
| `package:macos` | tags, default branch | tag `macos` | `release/*.dmg`, `release/*.zip` (30 days) |
| `release` | tags only | Linux (`alpine`) | A GitLab release containing every artifact, kept forever |

### Registering runners

`typecheck` and `build` need nothing — any Linux docker runner works. The packaging jobs need
**native** runners, because a `.dmg` cannot be built on Linux and signing cannot be done through
Wine.

**macOS runner** (GitLab.com shared runners are tagged `macos`; for self-hosted, register your own):

```bash
gitlab-runner register \
  --url "https://gitlab.com" \
  --token "$RUNNER_TOKEN" \
  --executor shell \
  --description "macos-packager" \
  --tag-list "macos" \
  --shell "bash"
```

**Windows runner** (PowerShell is the default shell, which is what the pipeline scripts assume):

```powershell
gitlab-runner.exe register `
  --url "https://gitlab.com" `
  --token "$RUNNER_TOKEN" `
  --executor shell `
  --description "windows-packager" `
  --tag-list "windows" `
  --shell "powershell"
```

The pipeline does not assume Node is preinstalled: each native runner gets a guard step that
downloads and checksum-verifies Node **22.22.3** only if `node` is missing, then prepends it to
`$GITHUB_PATH` so later steps see it.

If a runner with the `macos` or `windows` tag is not available, those jobs stay pending. Register
the runners, or temporarily drop the platform by deleting its `package:*` job **and** its entry in
`release.needs`.

### Producing a release

```bash
git tag v0.1.0
git push origin v0.1.0
```

That triggers the full pipeline; the `release` job collects every artifact and attaches it to a
GitLab release named **Harness v0.1.0**.

### CI/CD variables for signed builds

Add these under **Settings → CI/CD → Variables** (*Protect* the masked ones so they cannot leak
into a fork's pipeline). Same list as [Code signing](#code-signing-and-notarization) above:

- Windows: `CSC_LINK` (File), `CSC_KEY_PASSWORD` (Masked)
- macOS: `CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`
  (all Masked except the team ID)

Add them as **environment-scoped** variables if you want unsigned branch builds and signed tags
only: create an environment, protect it, and set the variables there.

### Caching

`node_modules` is not cached. Instead, the pipeline caches the two directories that actually make
builds slow, keyed on `package-lock.json`:

- `.npm/` — the npm package tarballs (`npm_config_cache` is pointed here)
- `.cache/electron/` — the ~100 MB Electron binary (`ELECTRON_CACHE`)
- `.cache/electron-builder/` — the NSIS and `winCodeSign` toolchains (`ELECTRON_BUILDER_CACHE`)

Caching the Electron binary is the single biggest win: without it every job re-downloads ~100 MB.

### Notes

- The pipeline uses `npm ci`, never `npm install`, so a run either reproduces the committed lockfile
  exactly or fails.
- `electron-builder` runs in `script`, not `after_script` — a failure in `after_script` does **not**
  fail the job, which would let a broken build go green.
- Shared and hidden jobs are used instead of YAML anchors: an anchored block scalar resolves
  inconsistently between YAML parsers, and GitLab *replaces* rather than appends arrays on
  `extends`, so every job that needs a different step list declares it in full.

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
.gitlab-ci.yml
```

## Architecture notes

**Security.** `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`. The renderer
never touches `require` or `ipcRenderer` directly — it only sees the small `window.desktop` API
exposed by the preload. External links are intercepted and opened in the system browser, and a
Content-Security-Policy is applied to production builds.

**Platform-aware chrome.** macOS uses `titleBarStyle: 'hiddenInset'` so the native traffic lights sit
over our custom bar (the sidebar reserves 84px so the "Harness" wordmark clears them). Windows and
Linux use `frame: false` and draw their own minimize / maximize / close buttons. The renderer
branches on `window.desktop.platform`.

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
