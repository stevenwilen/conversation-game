import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Depth } from '../game/types'
import { DEPTH_THEME, depthBackground } from '../game/theme'
import { Card } from '../components/Card'
import { DepthMeter } from '../components/DepthMeter'
import { GestureHints } from '../components/GestureHints'
import { CoachOverlay } from '../components/CoachOverlay'

// The main event. The card is the hero; everything else is a quiet HUD.
// All turn actions are gestures on the card — no button grid.

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

  const [showCoach, setShowCoach] = useState(!seenCoach)
  const [nudge, setNudge] = useState(false)

  function dismissCoach() {
    setShowCoach(false)
    onDismissCoach()
    setNudge(true) // one-time "you can swipe me" wiggle right after teaching
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
        {/* HUD: depth left, End isolated top-right so it can't be fat-fingered */}
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

        {/* Spotlight — the loudest piece of state (P4) */}
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

        {/* Card stage */}
        <main className="relative flex flex-1 flex-col px-5 pb-8 pt-3">
          <div className="flex flex-1 items-center">
            <div className="w-full">
              <Card
                text={card}
                accent={theme.accent}
                glow={theme.glow}
                canLighter={canLighter}
                canDeeper={canDeeper}
                nudge={nudge}
                onAnswer={onAnswer}
                onLighter={onLighter}
                onDeeper={onDeeper}
              />
            </div>
          </div>

          <div className="pt-6">
            <GestureHints canLighter={canLighter} canDeeper={canDeeper} />
          </div>
        </main>
      </div>

      {/* First-run gesture coach (P2) */}
      <AnimatePresence>
        {showCoach && <CoachOverlay onDismiss={dismissCoach} />}
      </AnimatePresence>
    </motion.div>
  )
}
