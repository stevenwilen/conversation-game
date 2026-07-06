import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { useHaptics } from '../hooks/useHaptics'

// The card is the hero object. It is handled, not clicked:
//   tap          -> answer / complete the turn
//   swipe left   -> lighter   (blocked at Depth 1 — the card won't drag there)
//   swipe right  -> deeper    (blocked at Depth 5 — the card won't drag there)
//
// A committed swipe must never also register as a tap, or the turn would be
// mislabelled "Answered". `committedRef` guards against that.

interface CardProps {
  text: string
  accent: string
  glow: string
  canLighter: boolean
  canDeeper: boolean
  nudge?: boolean
  onAnswer: () => void
  onLighter: () => void
  onDeeper: () => void
}

const SWIPE_DISTANCE = 90
const SWIPE_VELOCITY = 480

// Prompt-length-aware typography (P6). Short prompts stay big and punchy; long
// ones step down so they still breathe on a small iPhone.
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
  canLighter,
  canDeeper,
  nudge,
  onAnswer,
  onLighter,
  onDeeper,
}: CardProps) {
  const haptic = useHaptics()

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-9, 9])
  const committedRef = useRef(false)

  // Gentle one-time wiggle implying "you can swipe me" (P3). Only wiggles toward
  // directions that are actually available at this depth.
  useEffect(() => {
    if (!nudge) return
    const keyframes =
      canLighter && canDeeper
        ? [0, 22, -22, 0]
        : canDeeper
          ? [0, 26, 0]
          : canLighter
            ? [0, -26, 0]
            : [0]
    const controls = animate(x, keyframes, {
      duration: 1.2,
      ease: 'easeInOut',
    })
    return () => controls.stop()
  }, [nudge, canLighter, canDeeper, x])

  function handleDragEnd(
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) {
    const dx = info.offset.x
    const vx = info.velocity.x
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
    // Otherwise dragSnapToOrigin springs the card back into place.
  }

  function handleTap() {
    // A committed swipe already handled this gesture — don't also answer.
    if (committedRef.current) {
      committedRef.current = false
      return
    }
    onAnswer()
  }

  return (
    <div className="relative">
      {/* Stacked deck behind the active card (P3) */}
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

      {/* Active card. Drag is locked to available directions: no lighter at
          Depth 1, no deeper at Depth 5 — so the card won't even tilt that way. */}
      <motion.div
        className="relative z-10 flex touch-none select-none flex-col"
        style={{ x, rotate }}
        drag="x"
        dragSnapToOrigin
        dragElastic={{
          left: canLighter ? 0.55 : 0,
          right: canDeeper ? 0.55 : 0,
          top: 0,
          bottom: 0,
        }}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        whileTap={{ scale: 0.985 }}
        initial={{ opacity: 0, y: 26, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -18, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <motion.div
          className="relative flex min-h-[62dvh] flex-col justify-between rounded-[var(--radius-card)] bg-[var(--color-cream)] px-7 pb-7 pt-6"
          style={{
            boxShadow: `0 26px 60px -22px ${glow}, 0 6px 18px rgba(20,16,26,0.12)`,
          }}
        >
          {/* Deck label — quiet, top-left */}
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

          {/* Quiet reminder that the card is tappable. Tapping ends the turn
              (you tap once the question has been answered aloud), it doesn't
              answer for you — hence "when done", not "to answer". */}
          <div className="text-[13px] font-medium text-[var(--color-ink)]/35">
            Tap when done
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
