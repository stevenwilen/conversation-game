import { motion, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import type { Depth } from '../game/types'
import { DEPTH_THEME, depthBackground } from '../game/theme'

// Full-screen steering visuals behind the HUD, all driven by the card's drag
// `x`. Pulling left bleeds the WHOLE background toward the lighter depth and
// lights the left (Lighter) zone; pulling right does the same for Deeper. The
// zones are pronounced frosted panels at the edges — options, not decoration.

interface SteerLayerProps {
  x: MotionValue<number>
  depth: Depth
  canLighter: boolean
  canDeeper: boolean
}

const COMMIT = 110
const textShadow = { textShadow: '0 1px 12px rgba(0,0,0,0.4)' }

function EdgeChevrons({ dir }: { dir: 'left' | 'right' }) {
  const paths =
    dir === 'left'
      ? ['M13 6l-6 6 6 6', 'M19 6l-6 6 6 6']
      : ['M11 6l6 6-6 6', 'M5 6l6 6-6 6']
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ filter: 'drop-shadow(0 1px 8px rgba(0,0,0,0.4))' }}
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

export function SteerLayer({ x, depth, canLighter, canDeeper }: SteerLayerProps) {
  const lighter = canLighter ? DEPTH_THEME[(depth - 1) as Depth] : null
  const deeper = canDeeper ? DEPTH_THEME[(depth + 1) as Depth] : null
  const lighterBg = depthBackground((canLighter ? depth - 1 : depth) as Depth)
  const deeperBg = depthBackground((canDeeper ? depth + 1 : depth) as Depth)

  // Whole-screen bleed toward the target depth.
  const lighterTint = useTransform(x, [-COMMIT, -8, 0], [0.82, 0, 0])
  const deeperTint = useTransform(x, [0, 8, COMMIT], [0, 0, 0.82])
  // Zones are clearly visible at rest, brighten/swell toward, dim opposite.
  const lighterZone = useTransform(x, [-COMMIT, 0, COMMIT], [1, 0.85, 0.4])
  const deeperZone = useTransform(x, [-COMMIT, 0, COMMIT], [0.4, 0.85, 1])
  const lighterScale = useTransform(x, [-COMMIT, 0, COMMIT], [1.12, 1, 0.94])
  const deeperScale = useTransform(x, [-COMMIT, 0, COMMIT], [0.94, 1, 1.12])

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Full-screen background bleed */}
      <motion.div
        className="absolute inset-0"
        style={{ background: lighterBg, opacity: lighterTint }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ background: deeperBg, opacity: deeperTint }}
      />

      {/* Lighter zone (left edge) */}
      {lighter && (
        <motion.div
          className="absolute inset-y-0 left-0 flex items-center"
          style={{ opacity: lighterZone }}
        >
          <motion.div
            className="flex flex-col items-center gap-1.5 px-4 text-white"
            style={{ scale: lighterScale }}
          >
            <EdgeChevrons dir="left" />
            <div className="text-[16px] font-extrabold uppercase tracking-[0.14em]" style={textShadow}>
              Lighter
            </div>
            <div className="text-[12px] font-semibold text-white/85" style={textShadow}>
              {lighter.label}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Deeper zone (right edge) */}
      {deeper && (
        <motion.div
          className="absolute inset-y-0 right-0 flex items-center"
          style={{ opacity: deeperZone }}
        >
          <motion.div
            className="flex flex-col items-center gap-1.5 px-4 text-white"
            style={{ scale: deeperScale }}
          >
            <EdgeChevrons dir="right" />
            <div className="text-[16px] font-extrabold uppercase tracking-[0.14em]" style={textShadow}>
              Deeper
            </div>
            <div className="text-[12px] font-semibold text-white/85" style={textShadow}>
              {deeper.label}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
