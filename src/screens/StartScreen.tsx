import { motion } from 'framer-motion'
import { START_BG } from '../game/theme'

// First impression. Strong, warm, minimal — one clear way in.

interface StartScreenProps {
  onNewGame: () => void
}

export function StartScreen({ onNewGame }: StartScreenProps) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      style={{ background: START_BG }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="phone-frame px-8 pb-12 pt-16 text-white">
        {/* Title centered in the space above the CTA */}
        <div className="flex flex-1 flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-[15px] font-semibold uppercase tracking-[0.3em] text-white/80">
              Levels
            </div>
            <h1 className="mt-6 text-[52px] font-bold leading-[1.03] tracking-[-0.02em]">
              Choose the
              <br />
              conversation
              <br />
              you want.
            </h1>
            <p className="mt-6 max-w-[19rem] text-balance text-[17px] font-medium leading-snug text-white/85">
              One phone, passed around. No one gets put on the spot.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.button
            type="button"
            onClick={onNewGame}
            whileTap={{ scale: 0.96 }}
            className="w-full rounded-full bg-[var(--color-ink)] py-5 text-lg font-semibold text-white shadow-[0_6px_16px_rgba(20,16,26,0.28)]"
          >
            Start a game
          </motion.button>
          <p className="mt-4 text-center text-[13px] font-medium text-white/70">
            3 decks · 2+ players
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
