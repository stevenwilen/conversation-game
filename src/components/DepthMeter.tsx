import { DEPTHS } from '../game/types'
import type { Depth } from '../game/types'
import { DEPTH_THEME } from '../game/theme'

// Depth HUD (P4). The background gradient signals depth by color; this pill
// makes the exact level readable at a glance: filled pips + the level name +
// an "n/5" position so players always know how deep the group is.

interface DepthMeterProps {
  depth: Depth
}

export function DepthMeter({ depth }: DepthMeterProps) {
  const theme = DEPTH_THEME[depth]
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full bg-black/20 py-1.5 pl-3 pr-3.5 text-white backdrop-blur-sm">
      <div className="flex items-end gap-[3px]">
        {DEPTHS.map((level) => (
          <span
            key={level}
            className="w-[4px] rounded-full transition-all duration-300"
            style={{
              // Rising bars make "deeper" feel like a climb, not just a color.
              height: 6 + level * 2,
              background:
                level <= depth ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.32)',
            }}
          />
        ))}
      </div>
      <span className="flex items-baseline gap-1.5 leading-none">
        <span className="text-[14px] font-bold tracking-tight">
          {theme.label}
        </span>
        <span className="text-[12px] font-semibold text-white/55">
          {depth}/5
        </span>
      </span>
    </div>
  )
}
