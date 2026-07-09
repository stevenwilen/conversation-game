import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// First-run walkthrough. Shown at the start of every game (a new group might be
// on the phone). Three short, click-through steps — you advance with a button
// and the backdrop no longer dismisses, so it can't be blown past with one stray
// tap. "Skip" is there for anyone who already knows how to play.

interface CoachOverlayProps {
  onDismiss: () => void
}

const SLIDES = [
  {
    eyebrow: 'How to play',
    title: 'It’s your turn',
    body: 'Read the card and answer out loud — share as much or as little as you want.',
    demo: 'card' as const,
  },
  {
    eyebrow: 'Guide it',
    title: 'Steer the conversation',
    body: 'Swipe the card left to go lighter, right to go deeper. Tap it to stay at this level.',
    demo: 'swipe' as const,
  },
  {
    eyebrow: 'Change it up',
    title: 'Switch topics',
    body: 'Tap “Pivot topic” below the card to change decks, if the group agrees. You keep the same depth.',
    demo: 'pivot' as const,
  },
]

// A little cream card with faux prompt lines — the thing you answer.
function MiniCard() {
  return (
    <div className="relative flex h-[86px] w-28 flex-col justify-center gap-1.5 rounded-xl bg-[var(--color-cream)] px-3 shadow-[0_4px_12px_rgba(20,16,26,0.16)]">
      <div className="h-1.5 w-3/4 rounded-full bg-[var(--color-ink)]/20" />
      <div className="h-1.5 w-full rounded-full bg-[var(--color-ink)]/12" />
      <div className="h-1.5 w-1/2 rounded-full bg-[var(--color-ink)]/12" />
    </div>
  )
}

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 flex h-32 items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-ink)]/[0.05]">
      {children}
    </div>
  )
}

function Demo({ kind }: { kind: 'card' | 'swipe' | 'pivot' }) {
  if (kind === 'swipe') {
    return (
      <Stage>
        <span className="absolute left-4 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]/40">
          ‹ Lighter
        </span>
        <span className="absolute right-4 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]/40">
          Deeper ›
        </span>
        <motion.div
          className="relative"
          animate={{ x: [0, 34, 0, -34, 0], rotate: [0, 6, 0, -6, 0] }}
          transition={{
            duration: 3.4,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.28, 0.5, 0.78, 1],
          }}
        >
          <MiniCard />
          {/* fingertip on the card */}
          <span className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-ink)]/10 ring-2 ring-[var(--color-ink)]/15" />
        </motion.div>
      </Stage>
    )
  }
  if (kind === 'pivot') {
    return (
      <Stage>
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--color-ink)]/45"
          aria-hidden
        >
          <path d="M17 2l4 4-4 4" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <path d="M7 22l-4-4 4-4" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      </Stage>
    )
  }
  return (
    <Stage>
      <MiniCard />
    </Stage>
  )
}

export function CoachOverlay({ onDismiss }: CoachOverlayProps) {
  const [step, setStep] = useState(0)
  const slide = SLIDES[step]
  const isLast = step === SLIDES.length - 1

  function next() {
    if (isLast) onDismiss()
    else setStep((s) => s + 1)
  }

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center px-6"
      style={{ background: '#141019' }}
      // No enter-fade: rides the GameScreen's entrance. The backdrop does NOT
      // dismiss — you must use Skip or Next, so it can't be tapped past.
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="w-full max-w-sm rounded-[28px] bg-[var(--color-cream)] px-7 py-8 text-[var(--color-ink)] shadow-[0_10px_30px_-8px_rgba(20,16,26,0.3)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="min-h-[248px]"
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/45">
              {slide.eyebrow}
            </div>
            <h2 className="mt-1 text-balance text-[25px] font-bold tracking-[-0.01em]">
              {slide.title}
            </h2>
            <Demo kind={slide.demo} />
            <p className="mt-5 text-balance text-[15px] font-medium leading-snug text-[var(--color-ink)]/60">
              {slide.body}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress */}
        <div className="mt-6 flex items-center justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? 'w-5 bg-[var(--color-ink)]'
                  : 'w-1.5 bg-[var(--color-ink)]/20'
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onDismiss}
            className="px-2 py-2 text-[14px] font-semibold text-[var(--color-ink)]/45"
          >
            Skip
          </button>
          <motion.button
            type="button"
            onClick={next}
            whileTap={{ scale: 0.96 }}
            className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-[15px] font-semibold text-white"
          >
            {isLast ? 'Start playing' : 'Next'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
