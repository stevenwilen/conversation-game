import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import type { Depth, DeckId } from '../game/types'
import { DEPTH_THEME, depthBackground } from '../game/theme'
import { DECKS } from '../game/cards'
import { CardSurface } from '../components/CardSurface'
import { SteerLayer } from '../components/SteerLayer'
import { DepthMeter } from '../components/DepthMeter'
import { CoachOverlay } from '../components/CoachOverlay'
import { PivotOverlay } from '../components/PivotOverlay'
import { useHaptics } from '../hooks/useHaptics'

// Answer and Steer are separated and both feel physical:
//   - TAP the card = answer & pass.
//   - "Steer instead" flips the SAME card to its back (you're not answering it)
//     and pulls it back into a steering mode. Drag left (Lighter) / right
//     (Deeper): the whole screen bleeds toward the target depth and the edge
//     zones light up. Past the threshold it commits and the card flies off.
// `steering` is local UI state and resets each turn.

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

const COMMIT = 110
const ARMED = 96
const TAP_MAX_MS = 1000
// How long to hold the middle of the card (without dragging) to open Pivot.
const HOLD_MS = 550
const SPRING_BACK = { type: 'spring' as const, stiffness: 320, damping: 30 }

// A repeat/swap glyph for the hold-to-pivot target.
function PivotIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

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

  const [steering, setSteering] = useState(false)
  const [armed, setArmed] = useState<'lighter' | 'deeper' | null>(null)
  const [flying, setFlying] = useState(false)
  const [showCoach, setShowCoach] = useState(!seenCoach)
  const [showPivot, setShowPivot] = useState(false)
  const [pivotArmed, setPivotArmed] = useState(false)
  const pressStartRef = useRef(0)
  const pivotTimerRef = useRef<number | null>(null)

  // Clear any pending hold timer if the screen unmounts (e.g. a turn ends).
  useEffect(
    () => () => {
      if (pivotTimerRef.current !== null) {
        window.clearTimeout(pivotTimerRef.current)
      }
    },
    [],
  )

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-240, 240], [-11, 11])
  // While steering, the card itself carries the depth color and bleeds toward
  // the target depth as you drag — the dark room behind it stays put.
  const cardLighterTint = useTransform(x, [-COMMIT, -8, 0], [1, 0, 0])
  const cardDeeperTint = useTransform(x, [0, 8, COMMIT], [0, 0, 1])
  const lighterBg = depthBackground((canLighter ? depth - 1 : depth) as Depth)
  const deeperBg = depthBackground((canDeeper ? depth + 1 : depth) as Depth)

  useMotionValueEvent(x, 'change', (v) => {
    const next =
      v <= -ARMED && canLighter
        ? 'lighter'
        : v >= ARMED && canDeeper
          ? 'deeper'
          : null
    setArmed((prev) => (prev === next ? prev : next))
  })

  function dismissCoach() {
    setShowCoach(false)
    onDismissCoach()
  }

  function exitSteer() {
    clearPivotHold()
    setSteering(false)
    setArmed(null)
    animate(x, 0, SPRING_BACK)
  }

  function handleTap() {
    if (steering) return
    if (performance.now() - pressStartRef.current > TAP_MAX_MS) return
    onAnswer()
  }

  // Pivot is a hold on the middle of the card while steering: press and stay
  // still and the ring fills; drag left/right instead and the hold is cancelled.
  function clearPivotHold() {
    if (pivotTimerRef.current !== null) {
      window.clearTimeout(pivotTimerRef.current)
      pivotTimerRef.current = null
    }
    setPivotArmed(false)
  }

  function startPivotHold() {
    if (!steering || flying || !canPivot) return
    setPivotArmed(true)
    pivotTimerRef.current = window.setTimeout(() => {
      pivotTimerRef.current = null
      setPivotArmed(false)
      animate(x, 0, SPRING_BACK)
      setShowPivot(true)
    }, HOLD_MS)
  }

  function handlePivot(deck: DeckId) {
    setShowPivot(false)
    onPivot(deck)
  }

  function commit(dir: 'lighter' | 'deeper') {
    if (flying) return
    setFlying(true)
    haptic('commit')
    const target =
      dir === 'lighter' ? -window.innerWidth * 1.15 : window.innerWidth * 1.15
    animate(x, target, { duration: 0.34, ease: [0.4, 0, 0.2, 1] }).then(() => {
      if (dir === 'lighter') onLighter()
      else onDeeper()
    })
  }

  function handleDragEnd(
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) {
    clearPivotHold()
    if (flying) return
    const dx = info.offset.x
    if (dx <= -COMMIT && canLighter) commit('lighter')
    else if (dx >= COMMIT && canDeeper) commit('deeper')
    else animate(x, 0, SPRING_BACK)
  }

  const helper =
    armed === 'lighter'
      ? 'Release for Lighter'
      : armed === 'deeper'
        ? 'Release for Deeper'
        : 'Drag the topic left or right'

  return (
    <motion.div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{ background: depthBackground(depth) }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Dark "empty room" that fades in while steering, so the colored card
          and the Lighter/Deeper options pop against it. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: '#141019' }}
        initial={false}
        animate={{ opacity: steering ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Lighter / Deeper options — rendered above the card (z-20) so they stay
          completely visible even over it. */}
      {steering && (
        <SteerLayer
          x={x}
          depth={depth}
          canLighter={canLighter}
          canDeeper={canDeeper}
        />
      )}

      <div className="phone-frame relative z-10">
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
        <main className="relative flex flex-1 flex-col px-5 pb-8 pt-2">
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            {/* Turn title — sits right above the card, not up under the HUD.
                Whose turn it is, or the steer prompt while steering. */}
            <AnimatePresence mode="wait">
              {steering ? (
                <motion.span
                  key="steertitle"
                  className="text-[15px] font-bold uppercase tracking-[0.16em] text-white/85"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  Steer the conversation
                </motion.span>
              ) : (
                <motion.span
                  key="spotlight"
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  <span
                    className="max-w-[16rem] truncate text-[19px] font-bold tracking-tight text-white"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                  >
                    {spotlightName}
                    <span className="font-medium text-white/70">’s turn</span>
                  </span>
                </motion.span>
              )}
            </AnimatePresence>
            <div className="relative w-full">
              {/* The one card: tap to answer, or drag to steer. While steering
                  it shrinks and takes on the depth color, keeping the deck tag. */}
              <motion.div
                className="relative z-10 w-full select-none"
                style={{ x, rotate }}
                drag={steering && !flying ? 'x' : false}
                dragConstraints={{
                  left: canLighter ? -600 : 0,
                  right: canDeeper ? 600 : 0,
                }}
                dragElastic={0.14}
                onDragStart={clearPivotHold}
                onDragEnd={handleDragEnd}
                onPointerDown={startPivotHold}
                onPointerUp={clearPivotHold}
                onPointerCancel={clearPivotHold}
                onTapStart={() => {
                  pressStartRef.current = performance.now()
                }}
                onTap={handleTap}
                whileTap={steering ? undefined : { scale: 0.985 }}
                initial={{ opacity: 0, y: 16 }}
                animate={{
                  opacity: steering ? 0.8 : 1,
                  y: 0,
                  scale: steering ? 0.66 : 1,
                }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                {steering ? (
                  // Color-shifting panel: takes the depth color and bleeds toward
                  // the target depth with the drag. Topic sits at the top so the
                  // center is free for the hold-to-pivot target.
                  <div
                    className="relative flex min-h-[58dvh] flex-col overflow-hidden rounded-[var(--radius-card)] px-7 py-8"
                    style={{ background: depthBackground(depth) }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: lighterBg, opacity: cardLighterTint }}
                    />
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: deeperBg, opacity: cardDeeperTint }}
                    />
                    <span className="relative text-center text-[20px] font-bold uppercase tracking-[0.18em] text-white/45">
                      {topic}
                    </span>
                    {canPivot && (
                      <div className="relative flex flex-1 flex-col items-center justify-center gap-2.5 text-white/85">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40">
                          <motion.span
                            aria-hidden
                            className="absolute inset-[3px] rounded-full bg-white/25"
                            initial={{ scale: 0 }}
                            animate={{ scale: pivotArmed ? 1 : 0 }}
                            transition={{
                              duration: pivotArmed ? HOLD_MS / 1000 : 0.15,
                              ease: 'linear',
                            }}
                          />
                          <span className="relative">
                            <PivotIcon />
                          </span>
                        </div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.16em]">
                          Hold to pivot
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
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
                )}
              </motion.div>
            </div>
          </div>

          {/* Steer helper (swaps to "Release for …" past the threshold) */}
          <div className="flex h-6 items-center justify-center pt-1">
            <AnimatePresence mode="wait">
              {steering && (
                <motion.span
                  key={armed ?? 'drag'}
                  className={`font-semibold text-white ${armed ? 'text-[14px]' : 'text-[13px] text-white/75'}`}
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {helper}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* One control */}
          <div className="flex min-h-[48px] items-center justify-center pt-4">
            <AnimatePresence mode="wait">
              {steering ? (
                <motion.button
                  key="back"
                  type="button"
                  onClick={exitSteer}
                  className="text-[13px] font-semibold text-white/60"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  ‹ Back to card
                </motion.button>
              ) : (
                <motion.button
                  key="steer"
                  type="button"
                  onClick={() => setSteering(true)}
                  whileTap={{ scale: 0.96 }}
                  className="rounded-full bg-white/15 px-5 py-2.5 text-[14px] font-semibold text-white backdrop-blur-sm"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Steer instead ⇄
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* First-run coach */}
      <AnimatePresence>
        {showCoach && <CoachOverlay onDismiss={dismissCoach} />}
      </AnimatePresence>

      {/* Pivot picker (held the middle of the card) */}
      <AnimatePresence>
        {showPivot && (
          <PivotOverlay
            currentDeckId={deckId}
            depthLabel={theme.label}
            onPick={handlePivot}
            onClose={() => setShowPivot(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
