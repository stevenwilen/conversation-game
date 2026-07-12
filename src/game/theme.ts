import type { Depth, Screen } from './types'

// Visual identity for each depth level. Depth is communicated with a solid
// COLOR (plus a label) so the current depth reads at a glance while the phone is
// passed around. Flat colors on purpose — this is a prototype, not a shipped
// app. The card surface stays cream with dark ink at every depth.

export interface DepthTheme {
  /** Short player-facing name. */
  label: string
  /** One-line mood, mirrors CLAUDE.md depth descriptions. */
  blurb: string
  /** Solid background color behind the card. */
  bg: string
  /** Solid accent readable on cream (the card's deck tag). */
  accent: string
}

export const DEPTH_THEME: Record<Depth, DepthTheme> = {
  1: {
    label: 'Surface',
    blurb: 'Easy, funny, low-pressure.',
    bg: '#F79457',
    accent: '#C85B12',
  },
  2: {
    label: 'Casual',
    blurb: 'Relaxed, and a little more open.',
    bg: '#F26E5E',
    accent: '#C63A24',
  },
  3: {
    label: 'Personal',
    blurb: 'Real thoughts, values, and experiences.',
    bg: '#E85C7E',
    accent: '#B72A55',
  },
  4: {
    label: 'Vulnerable',
    blurb: 'Honest, reflective, emotionally open.',
    bg: '#7C5BC9',
    accent: '#5B32B0',
  },
  5: {
    label: 'Very Deep',
    blurb: 'Rare, and only reached on purpose.',
    bg: '#3F3183',
    accent: '#2B1E63',
  },
}

/** Solid background color for a given depth. */
export function depthBackground(depth: Depth): string {
  return DEPTH_THEME[depth].bg
}

// Flat color for each screen. App paints the current one on the root <html> so
// the browser canvas (including the iOS safe-area strip) matches the screen.
export const START_BG = '#EE6E82'
// Warm peach-sand: carries the warmth of the start screen instead of dropping to
// a cold gray "settings page". White surfaces and cream deck cards pop against
// it, and it harmonizes with the coral/pink/green deck accents. Flat, no
// gradient — the warmth comes from the hue, not shading.
export const SETUP_BG = '#F4E3D3'
export const TRANSITION_BG = '#5C4680'

export function screenBackground(screen: Screen, depth: Depth): string {
  switch (screen) {
    case 'setup':
      return SETUP_BG
    case 'playing':
      return depthBackground(depth)
    case 'transition':
      return TRANSITION_BG
    default:
      return START_BG
  }
}
