import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { TurnAction } from '../game/types'
import { useHaptics } from '../hooks/useHaptics'

// The hand-off. Appears after EVERY action to (a) name the action just taken and
// move the spotlight clearly to the next player, and (b) pace the game — the
// next card can't be revealed until a short dwell passes and the phone is
// deliberately tapped. This is what stops rapid chain-swiping through cards.
// "Go back" undoes an accidental action and returns to the same card.

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
      return 'Going lighter…'
    case 'deeper':
      return 'Going deeper…'
    case 'answer':
      return 'Answered'
    default:
      return 'Nice'
  }
}

// Background reflects the action just taken so the direction is unmistakable:
// warm when easing up (lighter), cool indigo when going deeper, neutral plum
// for a plain answer.
function transitionBg(action: TurnAction | null): string {
  switch (action) {
    case 'deeper':
      return 'linear-gradient(160deg, #3B2E7E 0%, #191140 100%)'
    case 'lighter':
      return 'linear-gradient(160deg, #C25A34 0%, #6E2A4C 100%)'
    default:
      return 'linear-gradient(160deg, #1E1630 0%, #2E2142 100%)'
  }
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

  // A little buzz as the phone is handed over (P5).
  useEffect(() => {
    haptic('pass')
  }, [haptic])

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      style={{ background: transitionBg(action) }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={() => {
        if (ready) onContinue()
      }}
    >
      <div
        className="phone-frame text-white"
        style={{ textShadow: '0 1px 12px rgba(0,0,0,0.28)' }}
      >
        {/* Go back — undo an accidental tap/swipe. Available immediately, and
            stops the tap from also continuing to the next player. */}
        <div className="flex px-4 pt-4">
          <motion.button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onUndo()
            }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-white/12 px-4 py-2 text-[14px] font-semibold text-white/85 backdrop-blur-sm"
          >
            ‹ Go back
          </motion.button>
        </div>

        {/* Centered hand-off */}
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          {/* What just happened */}
          <motion.div
            className="text-[26px] font-semibold tracking-[-0.01em] text-white/90"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {actionLabel(action)}
          </motion.div>

          {/* Who's next */}
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
          >
            <div className="text-[15px] font-medium text-white/55">
              Pass the phone to
            </div>
            <div className="mt-1 text-[36px] font-bold leading-tight tracking-[-0.01em]">
              {nextPlayerName}
            </div>
          </motion.div>

          <div className="mt-12 h-6">
            {ready ? (
              <motion.div
                className="text-[14px] font-semibold text-white/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              >
                Tap anywhere to continue
              </motion.div>
            ) : (
              <motion.div
                className="mx-auto h-1.5 w-24 overflow-hidden rounded-full bg-white/15"
                aria-hidden
              >
                <motion.div
                  className="h-full rounded-full bg-white/70"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: DWELL_MS / 1000, ease: 'linear' }}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
