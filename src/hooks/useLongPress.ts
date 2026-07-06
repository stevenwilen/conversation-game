import { useCallback, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

// Long-press detection that plays nicely with a draggable card:
// - starts a timer on pointer down
// - cancels if the pointer moves past a small tolerance (that's a drag/swipe)
// - exposes `firedRef` so the host can suppress the tap that follows the release
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

  const timer = useRef<number | undefined>(undefined)
  const origin = useRef<{ x: number; y: number } | null>(null)
  const firedRef = useRef(false)

  const cancel = useCallback(() => {
    if (timer.current !== undefined) {
      window.clearTimeout(timer.current)
      timer.current = undefined
    }
    origin.current = null
  }, [])

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      firedRef.current = false
      origin.current = { x: e.clientX, y: e.clientY }
      timer.current = window.setTimeout(() => {
        firedRef.current = true
        onLongPress()
      }, delay)
    },
    [onLongPress, delay],
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
    cancel,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: cancel,
      onPointerCancel: cancel,
      onPointerLeave: cancel,
    },
  }
}
