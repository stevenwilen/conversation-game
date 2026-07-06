import { DEPTHS } from '../game/types'
import type { Depth } from '../game/types'
import { DEPTH_THEME } from '../game/theme'

// Compact HUD pill showing the current depth. The background gradient already
// signals depth by color; this makes the exact level unmistakable.

interface DepthMeterProps {
  depth: Depth
}

export function DepthMeter({ depth }: DepthMeterProps) {
  const theme = DEPTH_THEME[depth]
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full bg-black/15 py-1.5 pl-2.5 pr-3.5 text-white backdrop-blur-sm">
      <div className="flex items-center gap-1">
        {DEPTHS.map((level) => (
          <span
            key={level}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: level === depth ? 16 : 7,
              background:
                level <= depth ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
            }}
          />
        ))}
      </div>
      <span className="text-[13px] font-semibold tracking-tight">
        {theme.label}
      </span>
    </div>
  )
}
