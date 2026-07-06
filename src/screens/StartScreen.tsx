import { motion } from 'framer-motion'

// First impression. Strong, warm, minimal — one clear way in.

interface StartScreenProps {
  onNewGame: () => void
}

export function StartScreen({ onNewGame }: StartScreenProps) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      style={{
        background:
          'linear-gradient(160deg, #FFC58C 0%, #F87A9A 52%, #B77BE0 100%)',
      }}
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
            <div
              className="text-[15px] font-semibold uppercase tracking-[0.3em] text-white/80"
              style={{ textShadow: '0 1px 16px rgba(0,0,0,0.18)' }}
            >
              Game V1.0
            </div>
            <h1
              className="mt-6 text-[52px] font-bold leading-[1.03] tracking-[-0.02em]"
              style={{ textShadow: '0 2px 26px rgba(0,0,0,0.16)' }}
            >
              Choose the
              <br />
              conversation
              <br />
              you want.
            </h1>
            <p
              className="mt-6 max-w-[19rem] text-[17px] font-medium leading-snug text-white/85"
              style={{ textShadow: '0 1px 16px rgba(0,0,0,0.14)' }}
            >
              One phone, passed around. Go light, go deep, or steer — without
              anyone being put on the spot.
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
            className="w-full rounded-full bg-[var(--color-ink)] py-5 text-lg font-semibold text-white shadow-[0_18px_40px_-12px_rgba(20,16,26,0.55)]"
          >
            Start a game
          </motion.button>
          <p className="mt-4 text-center text-[13px] font-medium text-white/70">
            Deck: Friendship · 2+ players
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
