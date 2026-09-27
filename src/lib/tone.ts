import type { Tone } from './data'

/** Semantic colour per metric. Kept in one place so re-skinning stays a token edit. */
export const TONE_TEXT: Record<Tone, string> = {
  accent: 'text-accent',
  blue: 'text-blue',
  green: 'text-green',
  amber: 'text-amber',
  red: 'text-red',
  purple: 'text-purple',
}

/** Filled status pill — bg tint + text + hairline ring. */
export const TONE_CHIP: Record<Tone, string> = {
  accent: 'bg-accent/18 text-accent ring-accent/35',
  blue: 'bg-blue/18 text-blue ring-blue/35',
  green: 'bg-green/18 text-green ring-green/35',
  amber: 'bg-amber/18 text-amber ring-amber/35',
  red: 'bg-red/18 text-red ring-red/35',
  purple: 'bg-purple/18 text-purple ring-purple/35',
}

/** Soft square icon tile. */
export const TONE_TILE: Record<Tone, string> = {
  accent: 'bg-accent/15 text-accent',
  blue: 'bg-blue/15 text-blue',
  green: 'bg-green/15 text-green',
  amber: 'bg-amber/15 text-amber',
  red: 'bg-red/15 text-red',
  purple: 'bg-purple/15 text-purple',
}

/** Raw hex for inline SVG (gradients, sparklines) where a CSS class won't do. */
export const TONE_HEX: Record<Tone, string> = {
  accent: '#f2593f',
  blue: '#5d9df7',
  green: '#46d08a',
  amber: '#f7b84b',
  red: '#ff5f5f',
  purple: '#a78bfa',
}

/** Stage → colour, used by the segmented task progress bars. */
export const STAGE_FILL = {
  done: 'bg-green',
  running: 'bg-blue',
  input: 'bg-amber',
  todo: 'bg-raised',
} as const
