import { motion } from 'framer-motion'
import type { Depth } from '../game/types'
import { DEPTH_THEME, depthBackground } from '../game/theme'
import { useDeviceFlip } from '../hooks/useDeviceFlip'
import { Card } from '../components/Card'
import { DepthMeter } from '../components/DepthMeter'
import { GestureHints } from '../components/GestureHints'

// The main event. The card is the hero; everything else is a quiet HUD.
// All turn actions are gestures on the card — no button grid.

interface GameScreenProps {
  depth: Depth
  card: string
  spotlightName: string
  motionEnabled: boolean
  onAnswer: () => void
  onLighter: () => void
  onDeeper: () => void
  onOpen: () => void
  onEnd: () => void
}

export function GameScreen({
  depth,
  card,
  spotlightName,
  motionEnabled,
  onAnswer,
  onLighter,
  onDeeper,
  onOpen,
  onEnd,
}: GameScreenProps) {
  const theme = DEPTH_THEME[depth]
  const canLighter = depth > 1
  const canDeeper = depth < 5

  // "Turn the phone around" -> open to group (real devices only).
  useDeviceFlip(motionEnabled, onOpen)

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
        {/* HUD */}
        <header className="flex items-center justify-between px-5 pt-4">
          <DepthMeter depth={depth} />

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/15 py-1.5 pl-2.5 pr-3.5 text-white backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <span className="max-w-[7.5rem] truncate text-[13px] font-semibold">
                {spotlightName}
              </span>
            </div>

            <button
              type="button"
              onClick={onEnd}
              className="rounded-full bg-black/15 px-3 py-1.5 text-[13px] font-semibold text-white backdrop-blur-sm"
            >
              End
            </button>
          </div>
        </header>

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
                onAnswer={onAnswer}
                onLighter={onLighter}
                onDeeper={onDeeper}
                onOpen={onOpen}
              />
            </div>
          </div>

          <div className="pt-6">
            <GestureHints canLighter={canLighter} canDeeper={canDeeper} />
          </div>
        </main>
      </div>
    </motion.div>
  )
}
