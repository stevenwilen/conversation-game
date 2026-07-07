import { motion, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import type { Depth } from '../game/types'
import { DEPTH_THEME } from '../game/theme'

// The Lighter / Deeper options for the steer screen. They sit ABOVE the faded,
// color-shifting card so they stay completely visible over it, and react to the
// card's drag `x`: the target zone brightens and swells while the opposite one
// dims. The color bleed lives on the card itself now — here it's just options.
//
// At the ends of the range (depth 1 / depth 5) one direction has nowhere to go.
// Instead of leaving that side blank (unbalanced) or showing a live option that
// does nothing (misleading), that side shows a dimmed "you're at the Lightest /
// Deepest" limit marker — the layout stays balanced and it reads honestly.

interface SteerLayerProps {
  x: MotionValue<number>
  depth: Depth
  canLighter: boolean
  canDeeper: boolean
}

const COMMIT = 110
const textShadow = { textShadow: '0 1px 12px rgba(0,0,0,0.5)' }

// Directional chevrons for a live option (« Lighter / Deeper »).
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
      style={{ filter: 'drop-shadow(0 1px 8px rgba(0,0,0,0.5))' }}
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

// A chevron meeting a wall — signals "the range ends here, nothing further."
function LimitMark({ dir }: { dir: 'left' | 'right' }) {
  const paths =
    dir === 'left'
      ? ['M18 6l-6 6 6 6', 'M7 5v14']
      : ['M6 6l6 6-6 6', 'M17 5v14']
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

// The dimmed boundary marker shown on a side that has nowhere to go.
function LimitZone({ dir, label }: { dir: 'left' | 'right'; label: string }) {
  return (
    <div
      className={`absolute inset-y-0 flex items-center ${
        dir === 'left' ? 'left-0' : 'right-0'
      }`}
    >
      <div className="flex flex-col items-center gap-1.5 px-4 text-white/35">
        <LimitMark dir={dir} />
        <div className="text-[15px] font-bold uppercase tracking-[0.14em]" style={textShadow}>
          {dir === 'left' ? 'Lightest' : 'Deepest'}
        </div>
        <div className="text-[12px] font-semibold text-white/30" style={textShadow}>
          {label}
        </div>
      </div>
    </div>
  )
}

export function SteerLayer({ x, depth, canLighter, canDeeper }: SteerLayerProps) {
  const lighter = canLighter ? DEPTH_THEME[(depth - 1) as Depth] : null
  const deeper = canDeeper ? DEPTH_THEME[(depth + 1) as Depth] : null
  const current = DEPTH_THEME[depth]

  // Zones are clearly visible at rest, brighten/swell toward, dim opposite.
  const lighterZone = useTransform(x, [-COMMIT, 0, COMMIT], [1, 0.85, 0.4])
  const deeperZone = useTransform(x, [-COMMIT, 0, COMMIT], [0.4, 0.85, 1])
  const lighterScale = useTransform(x, [-COMMIT, 0, COMMIT], [1.12, 1, 0.94])
  const deeperScale = useTransform(x, [-COMMIT, 0, COMMIT], [0.94, 1, 1.12])

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {/* Lighter (left edge) — live option, or the Lightest limit at depth 1 */}
      {lighter ? (
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
      ) : (
        <LimitZone dir="left" label={current.label} />
      )}

      {/* Deeper (right edge) — live option, or the Deepest limit at depth 5 */}
      {deeper ? (
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
      ) : (
        <LimitZone dir="right" label={current.label} />
      )}
    </div>
  )
}
