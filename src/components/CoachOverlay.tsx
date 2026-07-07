import { motion } from 'framer-motion'

// First-card teaching layer. Shown at the start of every game (a `seenCoach`
// flag dismisses it for the rest of that game). Teaches the core rule: choose
// before you speak — answer this card, or steer instead.

interface CoachOverlayProps {
  onDismiss: () => void
}

const ROWS = [
  { icon: '👆', title: 'Tap the card', desc: 'to answer it' },
  { icon: '⇄', title: 'Steer instead', desc: "don't answer — go lighter or deeper" },
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
          Choose before you speak
        </h2>
        <p className="mt-1.5 text-[14px] font-medium leading-snug text-[var(--color-ink)]/55">
          Read the card, then decide — answer it, or steer. You can't do both.
        </p>

        <ul className="mt-5 flex flex-col gap-3">
          {ROWS.map((row) => (
            <li key={row.title} className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)]/8 text-xl">
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
