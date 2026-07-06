import { motion } from 'framer-motion'
import { END_BG } from '../game/theme'

// Calm, warm close. No scores, no stats — just a good note to end on and an
// easy way back in.

interface EndScreenProps {
  onPlayAgain: () => void
  onNewPlayers: () => void
  onHome: () => void
}

export function EndScreen({
  onPlayAgain,
  onNewPlayers,
  onHome,
}: EndScreenProps) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      style={{ background: END_BG }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="phone-frame px-8 pb-12 pt-16 text-white">
        {/* Heading centered in the space above the buttons */}
        <div className="flex flex-1 flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              className="text-[52px] font-bold leading-[1.05] tracking-[-0.02em]"
              style={{ textShadow: '0 2px 26px rgba(0,0,0,0.16)' }}
            >
              Good talk.
            </h1>
            <p
              className="mt-5 max-w-[19rem] text-[17px] font-medium leading-snug text-white/85"
              style={{ textShadow: '0 1px 16px rgba(0,0,0,0.14)' }}
            >
              However deep you went, you got there together. Come back when you
              want to go further.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.button
            type="button"
            onClick={onPlayAgain}
            whileTap={{ scale: 0.96 }}
            className="w-full rounded-full bg-[var(--color-ink)] py-5 text-lg font-semibold text-white shadow-[0_18px_40px_-12px_rgba(20,16,26,0.55)]"
          >
            Play again
          </motion.button>
          <motion.button
            type="button"
            onClick={onNewPlayers}
            whileTap={{ scale: 0.96 }}
            className="w-full rounded-full bg-white/20 py-4 text-base font-semibold text-white backdrop-blur-sm"
          >
            New players
          </motion.button>
          <button
            type="button"
            onClick={onHome}
            className="mt-1 w-full py-2 text-center text-[14px] font-medium text-white/75"
          >
            Back to start
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
