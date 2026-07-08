import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { TurnAction } from '../game/types'
import { TRANSITION_BG } from '../game/theme'
import { useHaptics } from '../hooks/useHaptics'

// The hand-off. Appears after every action to move the spotlight to the next
// player and pace the game — the next card can't be revealed until a short dwell
// passes and the phone is tapped. "Go back" undoes an accidental action.

interface TransitionScreenProps {
  nextPlayerName: string
  action: TurnAction | null
  onContinue: () => void
  onUndo: () => void
}

const DWELL_MS = 900

function actionLabel(action: TurnAction | null): string {
  switch (action) {
    case 'lighter':
      return 'Going lighter'
    case 'deeper':
      return 'Going deeper'
    case 'stay':
      return 'Same level'
    case 'pivot':
      return 'New topic'
    default:
      return 'Nice'
  }
}

// A static direction icon: chevrons down for deeper, up for lighter, a check for
// staying at the same level.
function ActionIcon({ action }: { action: TurnAction | null }) {
  const svg = {
    width: 34,
    height: 34,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  if (action === 'deeper') {
    return (
      <svg {...svg}>
        <path d="M7 7l5 5 5-5" />
        <path d="M7 13l5 5 5-5" />
      </svg>
    )
  }
  if (action === 'lighter') {
    return (
      <svg {...svg}>
        <path d="M7 12l5-5 5 5" />
        <path d="M7 18l5-5 5 5" />
      </svg>
    )
  }
  if (action === 'pivot') {
    return (
      <svg {...svg}>
        <path d="M17 2l4 4-4 4" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="M7 22l-4-4 4-4" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    )
  }
  // Stay at the same level: a simple horizontal mark, no up or down.
  return (
    <svg {...svg}>
      <path d="M6 12h12" />
    </svg>
  )
}

export function TransitionScreen({
  nextPlayerName,
  action,
  onContinue,
  onUndo,
}: TransitionScreenProps) {
  const [ready, setReady] = useState(false)
  const haptic = useHaptics()

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), DWELL_MS)
    return () => window.clearTimeout(timer)
  }, [])

  // A little buzz as the phone is handed over.
  useEffect(() => {
    haptic('pass')
  }, [haptic])

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      style={{ background: TRANSITION_BG }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => {
        if (ready) onContinue()
      }}
    >
      <div className="phone-frame text-white">
        {/* Go back — undo an accidental tap/swipe. Available immediately, and
            stops the tap from also continuing to the next player. */}
        <div className="flex px-4 pt-4">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onUndo()
            }}
            className="rounded-full bg-white/12 px-4 py-2 text-[14px] font-semibold text-white/85"
          >
            ‹ Go back
          </button>
        </div>

        {/* Centered hand-off */}
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="flex h-[74px] w-[74px] items-center justify-center rounded-full border border-white/15 bg-white/10 text-white">
            <ActionIcon action={action} />
          </div>

          <div className="mt-5 text-[22px] font-semibold tracking-[-0.01em] text-white/90">
            {actionLabel(action)}
          </div>

          <div className="mt-8">
            <div className="text-[15px] font-medium text-white/55">
              Pass the phone to
            </div>
            <div className="mt-1 text-balance text-[34px] font-bold leading-tight tracking-[-0.01em]">
              {nextPlayerName}
            </div>
          </div>

          <div className="mt-10 flex h-6 items-center justify-center">
            {ready ? (
              <span className="text-[14px] font-semibold text-white/70">
                Tap anywhere to continue
              </span>
            ) : (
              <div
                className="h-1.5 w-24 overflow-hidden rounded-full bg-white/15"
                aria-hidden
              >
                <motion.div
                  className="h-full rounded-full bg-white/70"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: DWELL_MS / 1000, ease: 'linear' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
