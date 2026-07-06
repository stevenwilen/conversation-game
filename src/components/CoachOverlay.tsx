import { motion } from 'framer-motion'

// One-time, first-card teaching layer (P2). Purely instructional — it changes
// no rules. Shown until the player dismisses it; a `seenCoach` flag in game
// state (persisted to localStorage) keeps it from ever reappearing.

interface CoachOverlayProps {
  onDismiss: () => void
}

const ROWS = [
  { icon: '👆', title: 'Tap', desc: 'Answer the card' },
  { icon: '←', title: 'Swipe left', desc: 'Go lighter' },
  { icon: '→', title: 'Swipe right', desc: 'Go deeper' },
  { icon: '✋', title: 'Hold or flip', desc: 'Open it to the group' },
]

export function CoachOverlay({ onDismiss }: CoachOverlayProps) {
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center px-6"
      style={{ background: 'rgba(10,7,16,0.55)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onDismiss}
    >
      <motion.div
        className="w-full max-w-sm rounded-[28px] bg-[var(--color-cream)] p-6 text-[var(--color-ink)] shadow-2xl"
        initial={{ opacity: 0, y: 26, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/45">
          How to play
        </div>
        <h2 className="mt-1 text-[25px] font-bold tracking-[-0.01em]">
          It's a card in your hand
        </h2>

        {/* Animated swipe demo */}
        <div className="relative my-5 h-24 overflow-hidden rounded-2xl bg-[var(--color-ink)]/5">
          <div className="absolute inset-y-0 left-3 flex items-center text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink)]/35">
            lighter
          </div>
          <div className="absolute inset-y-0 right-3 flex items-center text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink)]/35">
            deeper
          </div>
          <motion.div
            className="absolute left-1/2 top-1/2 h-16 w-24 rounded-xl bg-white shadow-md"
            style={{ x: '-50%', y: '-50%' }}
            animate={{ x: ['-50%', '-14%', '-86%', '-50%'], rotate: [0, 7, -7, 0] }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.35, 0.7, 1],
            }}
          />
        </div>

        <ul className="flex flex-col gap-2.5">
          {ROWS.map((row) => (
            <li key={row.title} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)]/8 text-lg">
                {row.icon}
              </span>
              <span className="text-[15px] leading-tight">
                <span className="font-bold">{row.title}</span>
                <span className="text-[var(--color-ink)]/55"> — {row.desc}</span>
              </span>
            </li>
          ))}
        </ul>

        <motion.button
          type="button"
          onClick={onDismiss}
          whileTap={{ scale: 0.96 }}
          className="mt-6 w-full rounded-full bg-[var(--color-ink)] py-4 text-base font-semibold text-white"
        >
          Got it
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
