// Ambient gesture caption beneath the card — never a row of buttons. Teaches
// the three handling gestures at a glance; the steer hints dim when unavailable
// (e.g. can't go lighter at Depth 1, or deeper at Depth 5).

interface GestureHintsProps {
  canLighter: boolean
  canDeeper: boolean
}

const shadow = { textShadow: '0 1px 14px rgba(0,0,0,0.22)' }

export function GestureHints({ canLighter, canDeeper }: GestureHintsProps) {
  return (
    <div
      className="flex select-none flex-col items-center gap-1.5 text-white"
      style={shadow}
    >
      <div className="flex items-center gap-3 text-[13px] font-semibold">
        <span
          className="transition-opacity duration-300"
          style={{ opacity: canLighter ? 0.9 : 0.28 }}
        >
          ‹ lighter
        </span>
        <span className="text-white/35">·</span>
        <span className="opacity-90">tap to answer</span>
        <span className="text-white/35">·</span>
        <span
          className="transition-opacity duration-300"
          style={{ opacity: canDeeper ? 0.9 : 0.28 }}
        >
          deeper ›
        </span>
      </div>
      <div className="text-[12px] font-medium text-white/70">
        hold or turn the phone to open to the group
      </div>
    </div>
  )
}
