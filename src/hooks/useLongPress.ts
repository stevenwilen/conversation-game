import { useCallback, useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { animate, useMotionValue } from 'framer-motion'
import type { AnimationPlaybackControls } from 'framer-motion'

// Long-press detection that plays nicely with a draggable card:
// - drives a `progress` motion value (0 -> 1) over the hold duration, so the
//   host can render a visible "keep holding" indicator (P1)
// - the progress animation COMPLETING is what fires onLongPress — the ring you
//   see filling is the real thing, not a separate estimate
// - cancels (and retracts the ring) if the pointer moves past a small tolerance
//   (that's a drag/swipe) or is released early
// - exposes `firedRef` so the host can suppress the tap that follows release
//
// This is the reliable "open to group" path — it works with mouse in a
// phone-sized devtools viewport, where device-orientation never fires.

interface LongPressOptions {
  delay?: number
  moveTolerance?: number
}

export function useLongPress(
  onLongPress: () => void,
  options?: LongPressOptions,
) {
  const delay = options?.delay ?? 500
  const moveTolerance = options?.moveTolerance ?? 12

  const progress = useMotionValue(0)
  const controls = useRef<AnimationPlaybackControls | null>(null)
  const origin = useRef<{ x: number; y: number } | null>(null)
  const firedRef = useRef(false)
  // Highest progress reached during the current press. Lets the host tell a
  // quick tap apart from a deliberate-but-aborted hold.
  const peak = useRef(0)

  useEffect(() => {
    const unsubscribe = progress.on('change', (value) => {
      if (value > peak.current) peak.current = value
    })
    return unsubscribe
  }, [progress])

  const cancel = useCallback(() => {
    controls.current?.stop()
    controls.current = null
    origin.current = null
    // Smoothly retract the ring if the hold didn't complete.
    const current = progress.get()
    if (current > 0 && current < 1) {
      animate(progress, 0, { duration: 0.16, ease: 'easeOut' })
    }
  }, [progress])

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      firedRef.current = false
      origin.current = { x: e.clientX, y: e.clientY }
      progress.set(0)
      peak.current = 0
      controls.current = animate(progress, 1, {
        duration: delay / 1000,
        ease: 'linear',
        onComplete: () => {
          firedRef.current = true
          onLongPress()
        },
      })
    },
    [delay, onLongPress, progress],
  )

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!origin.current) return
      const dx = e.clientX - origin.current.x
      const dy = e.clientY - origin.current.y
      if (dx * dx + dy * dy > moveTolerance * moveTolerance) cancel()
    },
    [cancel, moveTolerance],
  )

  return {
    firedRef,
    progress,
    cancel,
    // True when this press was a real hold (ring clearly showing), not a tap.
    wasHeld: () => peak.current > 0.55,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: cancel,
      onPointerCancel: cancel,
      onPointerLeave: cancel,
    },
  }
}
