import { useCallback } from 'react'

// Tiny haptic pulses via the Vibration API. Gracefully no-ops where the API
// is missing. NOTE: iOS Safari does not implement navigator.vibrate at all, so
// on iPhone these calls do nothing — this is an Android/desktop enhancement, a
// known web-platform limitation (see summary tradeoffs).

export type HapticKind = 'light' | 'commit' | 'open' | 'pass'

const PATTERNS: Record<HapticKind, number | number[]> = {
  light: 10,
  commit: 18,
  open: [10, 30, 22],
  pass: [0, 26, 34, 18],
}

export function useHaptics() {
  return useCallback((kind: HapticKind) => {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function'
    ) {
      try {
        navigator.vibrate(PATTERNS[kind])
      } catch {
        // Vibration is a nice-to-have; never let it break a turn.
      }
    }
  }, [])
}
