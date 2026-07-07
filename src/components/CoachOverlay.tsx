import { motion } from 'framer-motion'

// First-card teaching layer. Shown at the start of every game (a `seenCoach`
// flag dismisses it for the rest of that game). Teaches the core rule: choose
// before you speak — answer this card, or steer instead.

interface CoachOverlayProps {
  onDismiss: () => void
}

const ROWS = [
  { icon: '👆', title: 'Tap the card', desc: 'to answer it' },
  { icon: '⇄', title: 'Steer instead', desc: 'to go lighter or deeper' },
]

export function CoachOverlay({ onDismiss }: CoachOverlayProps) {
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center px-6"
      style={{ background: '#141019' }}
      // No separate enter-fade: the overlay rides the GameScreen's own entrance
      // so it's present with the game instead of fading in a beat later. Still
      // fades on exit when dismissed.
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onDismiss}
    >
      <motion.div
        className="w-full max-w-sm rounded-[28px] bg-[var(--color-cream)] px-7 py-9 text-[var(--color-ink)] shadow-[0_10px_30px_-8px_rgba(20,16,26,0.3)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/45">
          How to play
        </div>
        <h2 className="mt-2 text-balance text-[25px] font-bold tracking-[-0.01em]">
          Choose before you speak
        </h2>
        <p className="mt-3 text-balance text-[14px] font-medium leading-snug text-[var(--color-ink)]/55">
          Read the card, then choose: answer it or steer. Not both.
        </p>

        <ul className="mt-9 flex flex-col gap-6">
          {ROWS.map((row) => (
            <li key={row.title} className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)]/8 text-xl">
                {row.icon}
              </span>
              <span className="text-pretty text-[15px] leading-tight">
                <span className="font-bold">{row.title}</span>{' '}
                <span className="text-[var(--color-ink)]/55">{row.desc}</span>
              </span>
            </li>
          ))}
        </ul>

        <motion.button
          type="button"
          onClick={onDismiss}
          whileTap={{ scale: 0.96 }}
          className="mt-9 w-full rounded-full bg-[var(--color-ink)] py-4 text-base font-semibold text-white"
        >
          Got it
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
