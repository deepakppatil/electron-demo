import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const watch = process.argv.includes('--watch')

/** @type {import('esbuild').BuildOptions} */
const common = {
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  sourcemap: true,
  logLevel: 'info',
  // Electron and native deps must stay external — they are resolved at runtime.
  external: ['electron'],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
}

const targets = [
  { entry: 'electron/main.ts', out: 'dist-electron/main.js' },
  { entry: 'electron/preload.ts', out: 'dist-electron/preload.js' },
]

for (const t of targets) {
  await build({
    ...common,
    entryPoints: [path.join(root, t.entry)],
    outfile: path.join(root, t.out),
  })
}

if (watch) {
  console.log('[build-electron] watching electron/ …')
  const { context } = await import('esbuild')
  for (const t of targets) {
    const ctx = await context({
      ...common,
      entryPoints: [path.join(root, t.entry)],
      outfile: path.join(root, t.out),
    })
    await ctx.watch()
  }
  console.log('[build-electron] ready')
}
