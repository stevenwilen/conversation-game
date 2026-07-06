import type { Depth, Screen } from './types'

// Visual identity for each depth level. Depth is communicated with COLOR
// (background gradient + accent) as well as a label, so the current depth is
// readable at a glance while a phone is passed around. The card surface itself
// stays cream with dark ink at every depth, so text contrast never drops.

export interface DepthTheme {
  /** Short player-facing name. */
  label: string
  /** One-line mood, mirrors CLAUDE.md depth descriptions. */
  blurb: string
  /** Two-stop background gradient (behind the card). */
  bgFrom: string
  bgTo: string
  /** Saturated accent readable on cream (chips, pips, hints). */
  accent: string
  /** Soft glow tint under the card. */
  glow: string
}

export const DEPTH_THEME: Record<Depth, DepthTheme> = {
  1: {
    label: 'Surface',
    blurb: 'Easy, funny, low-pressure.',
    bgFrom: '#FFD9A0',
    bgTo: '#FF9E7A',
    accent: '#C85B12',
    glow: 'rgba(255, 158, 122, 0.55)',
  },
  2: {
    label: 'Opinion',
    blurb: 'Casual, a little more revealing.',
    bgFrom: '#FFB27A',
    bgTo: '#FF7E6B',
    accent: '#C63A24',
    glow: 'rgba(255, 126, 107, 0.55)',
  },
  3: {
    label: 'Personal',
    blurb: 'Real stories, values, and personal thoughts.',
    bgFrom: '#FF8FA3',
    bgTo: '#EC5B84',
    accent: '#B72A55',
    glow: 'rgba(236, 91, 132, 0.55)',
  },
  4: {
    label: 'Vulnerable',
    blurb: 'Honest, reflective, emotionally open.',
    bgFrom: '#B183E4',
    bgTo: '#7C5CD4',
    accent: '#5B32B0',
    glow: 'rgba(124, 92, 212, 0.6)',
  },
  5: {
    label: 'Very Deep',
    blurb: 'Rare, and only reached on purpose.',
    bgFrom: '#6D5AE0',
    bgTo: '#33265F',
    accent: '#2B1E63',
    glow: 'rgba(80, 62, 170, 0.65)',
  },
}

/** Background gradient string for a given depth. */
export function depthBackground(depth: Depth): string {
  const t = DEPTH_THEME[depth]
  return `linear-gradient(160deg, ${t.bgFrom} 0%, ${t.bgTo} 100%)`
}

// Full-screen gradient for each screen. Single source of truth: the screens use
// these, and App paints the current one on the root <html> element so the
// browser canvas — including the iOS safe-area strip below the app — matches the
// screen instead of showing a dark bar.
export const START_BG =
  'linear-gradient(160deg, #FFC58C 0%, #F87A9A 52%, #B77BE0 100%)'
export const SETUP_BG = 'linear-gradient(160deg, #FFE4C6 0%, #FFB9A2 100%)'
export const TRANSITION_BG = 'linear-gradient(160deg, #1E1630 0%, #2E2142 100%)'
export const END_BG =
  'linear-gradient(160deg, #FFD3A6 0%, #F5849E 55%, #9E77DE 100%)'

export function screenBackground(screen: Screen, depth: Depth): string {
  switch (screen) {
    case 'setup':
      return SETUP_BG
    case 'playing':
      return depthBackground(depth)
    case 'transition':
      return TRANSITION_BG
    case 'end':
      return END_BG
    default:
      return START_BG
  }
}
