import { useEffect } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { useLongPress } from '../hooks/useLongPress'
import { useHaptics } from '../hooks/useHaptics'

// The card is the hero object. It is handled, not clicked:
//   tap          -> answer / stay
//   swipe left   -> lighter
//   swipe right  -> deeper
//   long-press   -> open to the group (fallback for the phone-flip gesture)
//
// Feedback layers: directional stamps on drag, a filling ring on hold (P1), a
// stacked deck + settle + first-card nudge for physicality (P3), prompt-length
// aware type (P6), and haptics on commit (P5).

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
  onOpen: () => void
}

const SWIPE_DISTANCE = 90
const SWIPE_VELOCITY = 480
const RING_R = 30
const RING_C = 2 * Math.PI * RING_R

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
  onOpen,
}: CardProps) {
  const haptic = useHaptics()

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-9, 9])
  const lighterOpacity = useTransform(x, [-110, -28, 0], [1, 0, 0])
  const deeperOpacity = useTransform(x, [0, 28, 110], [0, 0, 1])

  const { firedRef, progress, cancel, wasHeld, handlers } = useLongPress(
    () => {
      haptic('open')
      onOpen()
    },
    { delay: 480 },
  )

  // Hold-to-open ring (P1), all driven by the same progress value that fires it.
  const holdDash = useTransform(progress, (p) => RING_C * (1 - p))
  const holdOpacity = useTransform(progress, [0, 0.03, 1], [0, 1, 1])
  const holdScrim = useTransform(progress, [0, 1], [0, 0.18])
  const holdScale = useTransform(progress, [0, 1], [1, 0.975])

  // Gentle one-time wiggle implying "you can swipe me" (P3).
  useEffect(() => {
    if (!nudge) return
    const controls = animate(x, [0, 24, -24, 0], {
      duration: 1.2,
      ease: 'easeInOut',
      times: [0, 0.34, 0.68, 1],
    })
    return () => controls.stop()
  }, [nudge, x])

  function handleDragEnd(
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) {
    const dx = info.offset.x
    const vx = info.velocity.x
    const goRight = dx > SWIPE_DISTANCE || vx > SWIPE_VELOCITY
    const goLeft = dx < -SWIPE_DISTANCE || vx < -SWIPE_VELOCITY
    if (goRight && canDeeper) {
      haptic('commit')
      onDeeper()
    } else if (goLeft && canLighter) {
      haptic('commit')
      onLighter()
    }
    // Otherwise dragSnapToOrigin springs the card back into place.
  }

  function handleTap() {
    // Suppress the tap that fires right after a long-press "open to group".
    if (firedRef.current) {
      firedRef.current = false
      return
    }
    // A deliberate hold that was released early is a cancel, not an answer.
    if (wasHeld()) return
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

      {/* Active card */}
      <motion.div
        className="relative z-10 flex touch-none select-none flex-col"
        style={{ x, rotate }}
        drag="x"
        dragSnapToOrigin
        dragElastic={0.55}
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={cancel}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        whileTap={{ scale: 0.985 }}
        initial={{ opacity: 0, y: 26, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -18, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        {...handlers}
      >
        <motion.div
          className="relative flex min-h-[62dvh] flex-col justify-between overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-cream)] px-7 pb-7 pt-6"
          style={{
            scale: holdScale,
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

          {/* Quiet reminder that the card is tappable */}
          <div className="text-[13px] font-medium text-[var(--color-ink)]/35">
            Tap to answer
          </div>

          {/* Drag stamps */}
          <motion.div
            style={{ opacity: lighterOpacity, color: accent, borderColor: accent }}
            className="pointer-events-none absolute left-5 top-5 rotate-[-11deg] rounded-xl border-2 px-3 py-1 text-sm font-extrabold uppercase tracking-widest"
          >
            Lighter
          </motion.div>
          <motion.div
            style={{ opacity: deeperOpacity, color: accent, borderColor: accent }}
            className="pointer-events-none absolute right-5 top-5 rotate-[11deg] rounded-xl border-2 px-3 py-1 text-sm font-extrabold uppercase tracking-widest"
          >
            Deeper
          </motion.div>

          {/* Hold-to-open feedback (P1): dim scrim + filling ring */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-10 rounded-[var(--radius-card)] bg-[var(--color-ink)]"
            style={{ opacity: holdScrim }}
          />
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3"
            style={{ opacity: holdOpacity }}
          >
            <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden>
              <circle
                cx="38"
                cy="38"
                r={RING_R}
                fill="none"
                stroke="var(--color-ink)"
                strokeOpacity="0.12"
                strokeWidth="5"
              />
              <motion.circle
                cx="38"
                cy="38"
                r={RING_R}
                fill="none"
                stroke={accent}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                transform="rotate(-90 38 38)"
                style={{ strokeDashoffset: holdDash }}
              />
            </svg>
            <span
              className="text-[13px] font-bold uppercase tracking-[0.16em]"
              style={{ color: accent }}
            >
              Open to group
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
