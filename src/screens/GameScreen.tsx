import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import type { Depth, DeckId } from '../game/types'
import { DEPTH_THEME, depthBackground } from '../game/theme'
import { DECKS } from '../game/cards'
import { CardSurface } from '../components/CardSurface'
import { DepthMeter } from '../components/DepthMeter'
import { CoachOverlay } from '../components/CoachOverlay'
import { PivotOverlay } from '../components/PivotOverlay'
import { useHaptics } from '../hooks/useHaptics'

// The card is handled directly — no separate steer mode:
//   tap         -> answer / complete the turn
//   swipe left  -> lighter (blocked at Depth 1 — the card won't drag there)
//   swipe right -> deeper  (blocked at Depth 5 — the card won't drag there)
// Pivoting to another topic is rare, so it lives in a small button below the
// card rather than in your way during a normal turn.

interface GameScreenProps {
  depth: Depth
  card: string
  topic: string
  deckId: DeckId
  spotlightName: string
  seenCoach: boolean
  onAnswer: () => void
  onLighter: () => void
  onDeeper: () => void
  onPivot: (deck: DeckId) => void
  onEnd: () => void
  onDismissCoach: () => void
}

const SWIPE_DISTANCE = 90
const SWIPE_VELOCITY = 480
// A press held longer than this counts as a hold, not a tap.
const TAP_MAX_MS = 1000

export function GameScreen({
  depth,
  card,
  topic,
  deckId,
  spotlightName,
  seenCoach,
  onAnswer,
  onLighter,
  onDeeper,
  onPivot,
  onEnd,
  onDismissCoach,
}: GameScreenProps) {
  const theme = DEPTH_THEME[depth]
  const canLighter = depth > 1
  const canDeeper = depth < 5
  const canPivot = DECKS.some((deck) => deck.id !== deckId)
  const haptic = useHaptics()

  const [showCoach, setShowCoach] = useState(!seenCoach)
  const [showPivot, setShowPivot] = useState(false)
  const [nudge, setNudge] = useState(false)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-9, 9])
  const committedRef = useRef(false)
  const pressStartRef = useRef(0)

  // One-time "you can swipe me" wiggle right after the coach is dismissed, only
  // toward directions that are actually available at this depth.
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
    const controls = animate(x, keyframes, { duration: 1.2, ease: 'easeInOut' })
    return () => controls.stop()
  }, [nudge, canLighter, canDeeper, x])

  function dismissCoach() {
    setShowCoach(false)
    onDismissCoach()
    setNudge(true)
  }

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
    // A press held longer than a second is a hold, not a tap — ignore it.
    if (performance.now() - pressStartRef.current > TAP_MAX_MS) return
    onAnswer()
  }

  return (
    <motion.div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{ background: depthBackground(depth) }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="phone-frame relative">
        {/* HUD */}
        <header className="flex items-center justify-between px-5 pt-4">
          <DepthMeter depth={depth} />
          <button
            type="button"
            onClick={onEnd}
            className="rounded-full bg-black/12 px-3 py-1.5 text-[12px] font-semibold text-white/75 backdrop-blur-sm"
          >
            End
          </button>
        </header>

        {/* Stage */}
        <main className="relative flex flex-1 flex-col px-5 pb-8 pt-3">
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            {/* Whose turn — sits right above the card */}
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
              <span
                className="max-w-[16rem] truncate text-[19px] font-bold tracking-tight text-white"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
              >
                {spotlightName}
                <span className="font-medium text-white/70">’s turn</span>
              </span>
            </div>

            <motion.div
              className="w-full touch-none select-none"
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
              onTapStart={() => {
                pressStartRef.current = performance.now()
              }}
              onTap={handleTap}
              whileTap={{ scale: 0.985 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <CardSurface
                text={card}
                topic={topic}
                accent={theme.accent}
                footer={
                  <span className="text-[13px] font-medium text-[var(--color-ink)]/35">
                    Tap to answer
                  </span>
                }
              />
            </motion.div>
          </div>

          {/* Gesture caption + the rare pivot action */}
          <div className="flex flex-col items-center gap-4 pt-6">
            <div
              className="flex select-none items-center gap-3 text-[13px] font-semibold text-white"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
            >
              <span style={{ opacity: canLighter ? 0.9 : 0.3 }}>‹ Lighter</span>
              <span className="text-white/35">·</span>
              <span className="opacity-90">Tap</span>
              <span className="text-white/35">·</span>
              <span style={{ opacity: canDeeper ? 0.9 : 0.3 }}>Deeper ›</span>
            </div>

            {canPivot && (
              <motion.button
                type="button"
                onClick={() => setShowPivot(true)}
                whileTap={{ scale: 0.96 }}
                className="rounded-full bg-white/15 px-5 py-2.5 text-[13px] font-semibold text-white backdrop-blur-sm"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
              >
                Pivot topic
              </motion.button>
            )}
          </div>
        </main>
      </div>

      {/* First-run coach */}
      <AnimatePresence>
        {showCoach && <CoachOverlay onDismiss={dismissCoach} />}
      </AnimatePresence>

      {/* Pivot picker (opened from the button) */}
      <AnimatePresence>
        {showPivot && (
          <PivotOverlay
            currentDeckId={deckId}
            depthLabel={theme.label}
            onPick={(deck) => {
              setShowPivot(false)
              onPivot(deck)
            }}
            onClose={() => setShowPivot(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
