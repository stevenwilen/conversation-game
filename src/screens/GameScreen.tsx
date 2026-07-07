import { useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import type { Depth } from '../game/types'
import { DEPTH_THEME, depthBackground } from '../game/theme'
import { CardSurface } from '../components/CardSurface'
import { SteerLayer } from '../components/SteerLayer'
import { DepthMeter } from '../components/DepthMeter'
import { CoachOverlay } from '../components/CoachOverlay'
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
  spotlightName: string
  seenCoach: boolean
  onAnswer: () => void
  onLighter: () => void
  onDeeper: () => void
  onEnd: () => void
  onDismissCoach: () => void
}

const COMMIT = 110
const ARMED = 96
const TAP_MAX_MS = 1000
const SPRING_BACK = { type: 'spring' as const, stiffness: 320, damping: 30 }

export function GameScreen({
  depth,
  card,
  topic,
  spotlightName,
  seenCoach,
  onAnswer,
  onLighter,
  onDeeper,
  onEnd,
  onDismissCoach,
}: GameScreenProps) {
  const theme = DEPTH_THEME[depth]
  const canLighter = depth > 1
  const canDeeper = depth < 5
  const haptic = useHaptics()

  const [steering, setSteering] = useState(false)
  const [armed, setArmed] = useState<'lighter' | 'deeper' | null>(null)
  const [flying, setFlying] = useState(false)
  const [showCoach, setShowCoach] = useState(!seenCoach)
  const pressStartRef = useRef(0)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-240, 240], [-11, 11])

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
    setSteering(false)
    setArmed(null)
    animate(x, 0, SPRING_BACK)
  }

  function handleTap() {
    if (steering) return
    if (performance.now() - pressStartRef.current > TAP_MAX_MS) return
    onAnswer()
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
      {/* Whole-screen steering bleed + edge zones, behind the HUD */}
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

        {/* Spotlight / steer title */}
        <div className="flex h-7 items-center justify-center px-5 pt-3">
          <AnimatePresence mode="wait">
            {steering ? (
              <motion.span
                key="steertitle"
                className="text-[15px] font-bold uppercase tracking-[0.16em] text-white/85"
                style={{ textShadow: '0 1px 12px rgba(0,0,0,0.3)' }}
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
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                </span>
                <span
                  className="max-w-[16rem] truncate text-[19px] font-bold tracking-tight text-white"
                  style={{ textShadow: '0 1px 14px rgba(0,0,0,0.25)' }}
                >
                  {spotlightName}
                  <span className="font-medium text-white/70">’s turn</span>
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Stage */}
        <main className="relative flex flex-1 flex-col px-5 pb-8 pt-2">
          <div className="flex flex-1 items-center justify-center">
            <div className="relative w-full">
              {/* Stacked deck (fades away when steering) */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                animate={{ opacity: steering ? 0 : 1 }}
                transition={{ duration: 0.25 }}
              >
                <div
                  className="absolute inset-0 rounded-[var(--radius-card)] bg-[var(--color-cream)] opacity-40 shadow-[0_18px_40px_-24px_rgba(20,16,26,0.5)]"
                  style={{ transform: 'translateY(22px) scale(0.92) rotate(2.5deg)' }}
                />
                <div
                  className="absolute inset-0 rounded-[var(--radius-card)] bg-[var(--color-cream)] opacity-70 shadow-[0_18px_40px_-24px_rgba(20,16,26,0.5)]"
                  style={{ transform: 'translateY(11px) scale(0.96) rotate(-2deg)' }}
                />
              </motion.div>

              {/* The one card: tap to answer, or drag to steer. While steering it
                  shrinks and goes blank, keeping only the topic tag. */}
              <motion.div
                className="relative z-10 w-full select-none"
                style={{ x, rotate }}
                drag={steering && !flying ? 'x' : false}
                dragConstraints={{
                  left: canLighter ? -600 : 0,
                  right: canDeeper ? 600 : 0,
                }}
                dragElastic={0.14}
                onDragEnd={handleDragEnd}
                onTapStart={() => {
                  pressStartRef.current = performance.now()
                }}
                onTap={handleTap}
                whileTap={steering ? undefined : { scale: 0.985 }}
                initial={{ opacity: 0, y: 26, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: steering ? 0.66 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              >
                <CardSurface
                  text={card}
                  topic={topic}
                  accent={theme.accent}
                  glow={theme.glow}
                  blank={steering}
                  footer={
                    steering ? null : (
                      <span className="text-[13px] font-medium text-[var(--color-ink)]/35">
                        Tap to answer
                      </span>
                    )
                  }
                />
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
                  style={{ textShadow: '0 1px 10px rgba(0,0,0,0.35)' }}
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
                  style={{ textShadow: '0 1px 10px rgba(0,0,0,0.25)' }}
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
                  style={{ textShadow: '0 1px 10px rgba(0,0,0,0.2)' }}
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
    </motion.div>
  )
}
