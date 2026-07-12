import { motion } from 'framer-motion'
import type { DeckId } from '../game/types'
import { DECKS } from '../game/cards'

// Pivot picker. Opens when you hold the middle of the card while steering. Lists
// every OTHER topic and reminds you that the current depth carries over — same
// modal style as the "how to play" coach, on the dark steer backdrop.

interface PivotOverlayProps {
  currentDeckId: DeckId
  depthLabel: string
  onPick: (deck: DeckId) => void
  onClose: () => void
}

export function PivotOverlay({
  currentDeckId,
  depthLabel,
  onPick,
  onClose,
}: PivotOverlayProps) {
  const others = DECKS.filter((deck) => deck.id !== currentDeckId)

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center px-6"
      style={{ background: '#141019' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
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
          Pivot
        </div>
        <h2 className="mt-2 text-balance text-[25px] font-bold tracking-[-0.01em]">
          Switch to another topic
        </h2>
        <p className="mt-3 text-balance text-[14px] font-medium leading-snug text-[var(--color-ink)]/55">
          Pivot only if the group agrees. Whichever you pick, you stay at the
          same depth ({depthLabel}).
        </p>

        <ul className="mt-7 flex flex-col gap-3">
          {others.map((deck) => (
            <li key={deck.id}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onPick(deck.id)}
                style={{ background: deck.color }}
                className="w-full rounded-2xl px-5 py-5 text-center text-[19px] font-bold text-white"
              >
                {deck.name}
              </motion.button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-2 text-center text-[14px] font-semibold text-[var(--color-ink)]/50"
        >
          Never mind
        </button>
      </motion.div>
    </motion.div>
  )
}
