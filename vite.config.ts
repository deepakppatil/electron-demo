import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

/**
 * The shipped app locks itself down with a `<meta>` CSP. That CSP forbids the
 * inline bootstrap + WebSocket HMR that Vite injects, so we strip the tag while
 * developing and restore it for real builds.
 */
function cspInProductionOnly(): Plugin {
  return {
    name: 'csp-in-production-only',
    // Runs in the dev server only, so the shipped index.html keeps its CSP.
    apply: 'serve',
    transformIndexHtml(html) {
      return html.replace(/\n\s*<meta\s+http-equiv="Content-Security-Policy"[\s\S]*?\/>/, '')
    },
  }
}

// Renderer (React + Tailwind) is built as a normal web app with relative asset
// paths so the production build can be loaded from `file://` inside Electron.
export default defineConfig({
  plugins: [react(), tailwindcss(), cspInProductionOnly()],
  // Relative base is mandatory for packaging with electron-builder.
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  server: {
    // 0.0.0.0 so the sandbox live preview can reach the renderer.
    // Electron itself still talks to it over 127.0.0.1.
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Allow the hostnames used by the Arena live preview proxy.
    // Remove `.e2b.app` if you don't need remote access to the dev server.
    allowedHosts: ['.e2b.app', '.localhost'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 1500,
  },
})
