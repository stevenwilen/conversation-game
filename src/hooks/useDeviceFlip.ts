import { useEffect } from 'react'

// "Turn the phone around to open the card to the group."
//
// Best-effort gesture using the device-orientation sensor. On a real phone,
// tilting the top of the phone away from you past vertical (a deliberate flip
// to show others) fires `onFlip`. It re-arms only once the phone returns to a
// normal reading angle, so one physical flip = one action.
//
// This never fires in a desktop devtools viewport (no sensor) — long-press is
// the documented, always-available fallback for the same action.

type PermissionState = 'granted' | 'denied' | 'default'

interface OrientationPermission {
  requestPermission?: () => Promise<PermissionState>
}

function orientationApi(): OrientationPermission | undefined {
  if (typeof window === 'undefined') return undefined
  return window.DeviceOrientationEvent as unknown as
    | OrientationPermission
    | undefined
}

/** True if this browser exposes device-orientation at all. */
export function flipSupported(): boolean {
  return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
}

/**
 * Ask for motion/orientation access. On iOS 13+ this must be called from a
 * user gesture (e.g. tapping "Start"). Returns whether we may use the sensor.
 */
export async function requestFlipPermission(): Promise<boolean> {
  const api = orientationApi()
  if (!api) return false
  if (typeof api.requestPermission === 'function') {
    try {
      const result = await api.requestPermission()
      return result === 'granted'
    } catch {
      return false
    }
  }
  // Non-iOS browsers don't gate orientation behind a prompt.
  return true
}

export function useDeviceFlip(enabled: boolean, onFlip: () => void) {
  useEffect(() => {
    if (!enabled || !flipSupported()) return

    // Require the phone to sit at a normal reading angle before a flip counts.
    let armed = true

    const handler = (event: DeviceOrientationEvent) => {
      const beta = event.beta // front-to-back tilt, degrees
      if (beta == null) return

      if (armed && Math.abs(beta) > 150) {
        // Flipped far past vertical — treat as "shown to the group".
        armed = false
        onFlip()
      } else if (!armed && Math.abs(beta) < 90) {
        armed = true
      }
    }

    window.addEventListener('deviceorientation', handler)
    return () => window.removeEventListener('deviceorientation', handler)
  }, [enabled, onFlip])
}
