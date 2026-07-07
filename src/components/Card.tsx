import { useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import type { TurnPhase } from '../game/types'
import { useHaptics } from '../hooks/useHaptics'

// The card is the hero object, handled in three phases so the player must
// choose BEFORE speaking (see GameScreen):
//   decision  — tap the card to CLAIM & answer it; a swipe here doesn't steer,
//               it just resists and nudges you to choose "Steer instead" first
//   answering — claimed and locked; a Done control (in GameScreen) ends the turn
//   steer     — swipe left = lighter, right = deeper (direction-locked at 1 / 5)
//
// A committed swipe never also registers as a tap (`committedRef`), and a press
// held past TAP_MAX_MS isn't a tap either.

interface CardProps {
  text: string
  accent: string
  glow: string
  phase: TurnPhase
  canLighter: boolean
  canDeeper: boolean
  onClaim: () => void
  onLighter: () => void
  onDeeper: () => void
  onSteerBlocked: () => void
}

const SWIPE_DISTANCE = 90
const SWIPE_VELOCITY = 480
const TAP_MAX_MS = 1000

// Prompt-length-aware typography. Short prompts stay big; long ones step down.
function promptClass(length: number): string {
  if (length <= 60) return 'text-[30px] leading-[1.2] text-balance'
  if (length <= 110) return 'text-[26px] leading-[1.24] text-balance'
  if (length <= 165) return 'text-[22px] leading-[1.3] text-pretty'
  return 'text-[19px] leading-[1.34] text-pretty'
}

export function Card({
  text,
  accent,
  glow,
  phase,
  canLighter,
  canDeeper,
  onClaim,
  onLighter,
  onDeeper,
  onSteerBlocked,
}: CardProps) {
  const haptic = useHaptics()
  const committedRef = useRef(false)
  const pressStartRef = useRef(0)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-9, 9])

  const isSteer = phase === 'steer'
  const isAnswering = phase === 'answering'

  function handleDragEnd(
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) {
    const dx = info.offset.x
    const vx = info.velocity.x
    if (phase === 'decision') {
      // Swiping doesn't steer here — nudge them to choose "Steer instead" first.
      if (Math.abs(dx) > 44) onSteerBlocked()
      return
    }
    if (isSteer) {
      const goRight = dx > SWIPE_DISTANCE || vx > SWIPE_VELOCITY
      const goLeft = dx < -SWIPE_DISTANCE || vx < -SWIPE_VELOCITY
      if (goRight && canDeeper) {
        committedRef.current = true
        haptic('commit')
        onDeeper()
      } else if (goLeft && canLighter) {
        committedRef.current = true
        haptic('commit')
        onLighter()
      }
    }
  }

  function handleTap() {
    if (committedRef.current) {
      committedRef.current = false
      return
    }
    if (performance.now() - pressStartRef.current > TAP_MAX_MS) return
    // Tapping only does something in the decision phase — it claims the card.
    if (phase === 'decision') onClaim()
  }

  // Decision resists (tiny give, springs back); steer is direction-locked.
  const dragElastic = isSteer
    ? { left: canLighter ? 0.55 : 0, right: canDeeper ? 0.55 : 0, top: 0, bottom: 0 }
    : 0.06

  return (
    <div className="relative">
      {/* Stacked deck behind the active card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 rounded-[var(--radius-card)] bg-[var(--color-cream)] opacity-40 shadow-[0_18px_40px_-24px_rgba(20,16,26,0.5)]"
        style={{ transform: 'translateY(22px) scale(0.92) rotate(2.5deg)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 rounded-[var(--radius-card)] bg-[var(--color-cream)] opacity-70 shadow-[0_18px_40px_-24px_rgba(20,16,26,0.5)]"
        style={{ transform: 'translateY(11px) scale(0.96) rotate(-2deg)' }}
      />

      <motion.div
        className="relative z-10 flex touch-none select-none flex-col"
        style={{ x, rotate }}
        drag={isAnswering ? false : 'x'}
        dragSnapToOrigin
        dragElastic={dragElastic}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        onTapStart={() => {
          pressStartRef.current = performance.now()
        }}
        onTap={handleTap}
        whileTap={phase === 'decision' ? { scale: 0.985 } : undefined}
        initial={{ opacity: 0, y: 26, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -18, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <div
          className="relative flex min-h-[60dvh] flex-col justify-between rounded-[var(--radius-card)] bg-[var(--color-cream)] px-7 pb-7 pt-6"
          style={{
            boxShadow: `0 26px 60px -22px ${glow}, 0 6px 18px rgba(20,16,26,0.12)`,
          }}
        >
          {/* Deck label */}
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: accent }}
            />
            <span className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)]/45">
              Friendship
            </span>
          </div>

          {/* Prompt */}
          <p
            className={`py-6 font-semibold tracking-[-0.01em] text-[var(--color-ink)] ${promptClass(
              text.length,
            )}`}
          >
            {text}
          </p>

          {/* Phase footer */}
          <div className="flex h-7 items-center">
            {phase === 'decision' && (
              <span className="text-[13px] font-medium text-[var(--color-ink)]/35">
                Tap to answer this card
              </span>
            )}
            {isAnswering && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold"
                style={{ color: accent, background: `${accent}1f` }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 13l4 4 10-11" />
                </svg>
                Answering
              </span>
            )}
            {isSteer && (
              <span className="text-[13px] font-medium text-[var(--color-ink)]/35">
                Swipe to steer
              </span>
            )}
          </div>

          {/* Claimed ring — fades in when the card is being answered */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)]"
            style={{ boxShadow: `inset 0 0 0 2.5px ${accent}` }}
            initial={false}
            animate={{ opacity: isAnswering ? 1 : 0 }}
            transition={{ duration: 0.25 }}
          />
        </div>
      </motion.div>
    </div>
  )
}
