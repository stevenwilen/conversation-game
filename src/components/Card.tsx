import { motion, useMotionValue, useTransform } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { useLongPress } from '../hooks/useLongPress'

// The card is the hero object. It is handled, not clicked:
//   tap          -> answer / stay
//   swipe left   -> lighter
//   swipe right  -> deeper
//   long-press   -> open to the group (fallback for the phone-flip gesture)
//
// Directional "stamps" fade in as the card is dragged, so the steer is legible
// without any buttons on screen.

interface CardProps {
  text: string
  accent: string
  glow: string
  canLighter: boolean
  canDeeper: boolean
  onAnswer: () => void
  onLighter: () => void
  onDeeper: () => void
  onOpen: () => void
}

const SWIPE_DISTANCE = 90
const SWIPE_VELOCITY = 480

export function Card({
  text,
  accent,
  glow,
  canLighter,
  canDeeper,
  onAnswer,
  onLighter,
  onDeeper,
  onOpen,
}: CardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-9, 9])
  const lighterOpacity = useTransform(x, [-110, -28, 0], [1, 0, 0])
  const deeperOpacity = useTransform(x, [0, 28, 110], [0, 0, 1])

  const { firedRef, cancel, handlers } = useLongPress(onOpen, { delay: 480 })

  function handleDragEnd(
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) {
    const dx = info.offset.x
    const vx = info.velocity.x
    const goRight = dx > SWIPE_DISTANCE || vx > SWIPE_VELOCITY
    const goLeft = dx < -SWIPE_DISTANCE || vx < -SWIPE_VELOCITY
    if (goRight && canDeeper) onDeeper()
    else if (goLeft && canLighter) onLighter()
    // Otherwise dragSnapToOrigin springs the card back into place.
  }

  function handleTap() {
    // Suppress the tap that fires right after a long-press "open to group".
    if (firedRef.current) {
      firedRef.current = false
      return
    }
    onAnswer()
  }

  return (
    <motion.div
      className="relative flex touch-none select-none flex-col"
      style={{ x, rotate }}
      drag="x"
      dragSnapToOrigin
      dragElastic={0.55}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={cancel}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      whileTap={{ scale: 0.985 }}
      initial={{ opacity: 0, y: 22, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -18, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      {...handlers}
    >
      <div
        className="relative flex min-h-[62dvh] flex-col justify-between rounded-[var(--radius-card)] bg-[var(--color-cream)] px-7 pb-7 pt-6"
        style={{ boxShadow: `0 26px 60px -22px ${glow}, 0 6px 18px rgba(20,16,26,0.12)` }}
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
        <p className="text-pretty py-6 text-[28px] font-semibold leading-[1.22] tracking-[-0.01em] text-[var(--color-ink)]">
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
      </div>
    </motion.div>
  )
}
