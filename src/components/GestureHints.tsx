// Ambient steer cues shown only in the Steer phase — never a row of buttons.
// Each side dims when that direction isn't available (no lighter at Depth 1, no
// deeper at Depth 5).

interface GestureHintsProps {
  canLighter: boolean
  canDeeper: boolean
}

const shadow = { textShadow: '0 1px 14px rgba(0,0,0,0.22)' }

export function GestureHints({ canLighter, canDeeper }: GestureHintsProps) {
  return (
    <div
      className="flex select-none items-center gap-3 text-[13px] font-semibold text-white"
      style={shadow}
    >
      <span
        className="transition-opacity duration-300"
        style={{ opacity: canLighter ? 0.9 : 0.28 }}
      >
        ‹ swipe lighter
      </span>
      <span className="text-white/35">·</span>
      <span
        className="transition-opacity duration-300"
        style={{ opacity: canDeeper ? 0.9 : 0.28 }}
      >
        swipe deeper ›
      </span>
    </div>
  )
}
