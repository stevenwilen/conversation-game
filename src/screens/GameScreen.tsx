import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Depth, TurnPhase } from '../game/types'
import { DEPTH_THEME, depthBackground } from '../game/theme'
import { Card } from '../components/Card'
import { DepthMeter } from '../components/DepthMeter'
import { GestureHints } from '../components/GestureHints'
import { CoachOverlay } from '../components/CoachOverlay'

// The main event. The player must choose before speaking, so a turn runs
// through three phases (decision -> answering | steer). The card stays the hero;
// each phase shows exactly ONE small control, never a button grid. The phase is
// local UI state and resets to 'decision' every turn (GameScreen remounts).

interface GameScreenProps {
  depth: Depth
  card: string
  spotlightName: string
  seenCoach: boolean
  onAnswer: () => void
  onLighter: () => void
  onDeeper: () => void
  onEnd: () => void
  onDismissCoach: () => void
}

function instructionFor(phase: TurnPhase): string {
  if (phase === 'answering') return 'You claimed this card'
  if (phase === 'steer') return "Steering — you won't answer this"
  return 'Choose before speaking'
}

export function GameScreen({
  depth,
  card,
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

  const [phase, setPhase] = useState<TurnPhase>('decision')
  const [blocked, setBlocked] = useState(false)
  const blockedTimer = useRef<number | undefined>(undefined)
  const [showCoach, setShowCoach] = useState(!seenCoach)

  useEffect(() => () => window.clearTimeout(blockedTimer.current), [])

  function showBlockedHint() {
    setBlocked(true)
    window.clearTimeout(blockedTimer.current)
    blockedTimer.current = window.setTimeout(() => setBlocked(false), 1700)
  }

  function dismissCoach() {
    setShowCoach(false)
    onDismissCoach()
  }

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      style={{ background: depthBackground(depth) }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="phone-frame">
        {/* HUD: depth left, End isolated top-right */}
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

        {/* Spotlight */}
        <div className="flex items-center justify-center gap-2 px-5 pt-3">
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
        </div>

        {/* Instruction — the "choose before speaking" rule, per phase */}
        <div className="flex h-5 items-center justify-center px-5 pt-2">
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/70"
              style={{ textShadow: '0 1px 12px rgba(0,0,0,0.25)' }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {instructionFor(phase)}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Card stage */}
        <main className="relative flex flex-1 flex-col px-5 pb-8 pt-2">
          <div className="flex flex-1 items-center">
            <div className="w-full">
              <Card
                text={card}
                accent={theme.accent}
                glow={theme.glow}
                phase={phase}
                canLighter={canLighter}
                canDeeper={canDeeper}
                onClaim={() => setPhase('answering')}
                onLighter={onLighter}
                onDeeper={onDeeper}
                onSteerBlocked={showBlockedHint}
              />
            </div>
          </div>

          {/* One control per phase — never a button grid */}
          <div className="flex min-h-[76px] flex-col items-center justify-center gap-2 pt-5">
            <AnimatePresence mode="wait">
              {phase === 'decision' && (
                <motion.div
                  key="decision"
                  className="flex flex-col items-center gap-2"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex h-4 items-center">
                    <AnimatePresence>
                      {blocked && (
                        <motion.span
                          className="text-[12px] font-semibold text-white/85"
                          style={{ textShadow: '0 1px 10px rgba(0,0,0,0.3)' }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Swiping is off here — tap “Steer instead”
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => setPhase('steer')}
                    whileTap={{ scale: 0.96 }}
                    className="rounded-full bg-white/15 px-5 py-2.5 text-[14px] font-semibold text-white backdrop-blur-sm"
                    style={{ textShadow: '0 1px 10px rgba(0,0,0,0.2)' }}
                  >
                    Steer instead ⇄
                  </motion.button>
                </motion.div>
              )}

              {phase === 'answering' && (
                <motion.button
                  key="answering"
                  type="button"
                  onClick={onAnswer}
                  whileTap={{ scale: 0.96 }}
                  className="rounded-full bg-white px-10 py-3.5 text-[15px] font-bold text-[var(--color-ink)] shadow-[0_16px_40px_-14px_rgba(20,16,26,0.5)]"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  Done
                </motion.button>
              )}

              {phase === 'steer' && (
                <motion.div
                  key="steer"
                  className="flex flex-col items-center gap-3"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <GestureHints canLighter={canLighter} canDeeper={canDeeper} />
                  <button
                    type="button"
                    onClick={() => setPhase('decision')}
                    className="text-[13px] font-semibold text-white/65"
                    style={{ textShadow: '0 1px 10px rgba(0,0,0,0.25)' }}
                  >
                    ‹ Back to card
                  </button>
                </motion.div>
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
