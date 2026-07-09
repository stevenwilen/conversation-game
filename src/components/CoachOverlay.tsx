import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DECKS } from '../game/cards'
import { DeckIcon } from './DeckIcon'

// First-run walkthrough. Shown at the start of every game (a new group might be
// on the phone). Three short, click-through steps — you advance with the button
// and the backdrop does not dismiss, so it can't be blown past with one tap.

interface CoachOverlayProps {
  onDismiss: () => void
}

const SLIDES = [
  {
    eyebrow: 'How to play',
    title: 'It’s your turn',
    body: 'Read the card and answer out loud. Share as much or as little as you want.',
    demo: 'card' as const,
  },
  {
    eyebrow: 'Guide it',
    title: 'Steer the conversation',
    body: 'Swipe left to keep it light, right to go deeper and more personal. Tap the card to stay here.',
    demo: 'swipe' as const,
  },
  {
    eyebrow: 'Change it up',
    title: 'Switch topics',
    body: 'Tap Pivot topic below the card to switch decks, if the group agrees. You keep the same level.',
    demo: 'pivot' as const,
  },
]

// The cream prompt card, with a colored tag and faux text lines.
function MiniCard() {
  return (
    <div className="flex h-[84px] w-[66px] flex-col gap-1.5 rounded-xl bg-[var(--color-cream)] p-2.5 shadow-[0_6px_14px_rgba(20,16,26,0.22)]">
      <div className="h-1.5 w-7 rounded-full bg-[#EE7A5F]" />
      <div className="mt-0.5 h-1.5 w-full rounded-full bg-[var(--color-ink)]/18" />
      <div className="h-1.5 w-4/5 rounded-full bg-[var(--color-ink)]/12" />
      <div className="h-1.5 w-3/5 rounded-full bg-[var(--color-ink)]/12" />
    </div>
  )
}

const LOOP = {
  duration: 3.4,
  repeat: Infinity,
  ease: 'easeInOut' as const,
  times: [0, 0.28, 0.5, 0.78, 1],
}

// Card slides between a warm (lighter) and cool (deeper) room — the background
// tints to the depth color as it moves, the way the real game does.
function SwipeDemo() {
  return (
    <div className="relative mt-5 h-40 overflow-hidden rounded-2xl">
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundColor: ['#EC6E85', '#7C5BC9', '#EC6E85', '#F79457', '#EC6E85'],
        }}
        transition={LOOP}
      />
      <span className="absolute left-2.5 top-2.5 rounded-full bg-[var(--color-ink)]/65 px-2.5 py-1 text-[11px] font-bold text-white">
        ‹ Keep it light
      </span>
      <span className="absolute right-2.5 top-2.5 rounded-full bg-[var(--color-ink)]/65 px-2.5 py-1 text-[11px] font-bold text-white">
        Get personal ›
      </span>
      <div className="relative flex h-full items-center justify-center">
        <motion.div
          className="relative"
          animate={{ x: [0, 34, 0, -34, 0], rotate: [0, 6, 0, -6, 0] }}
          transition={LOOP}
        >
          <MiniCard />
          <span className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-ink)]/10 ring-2 ring-[var(--color-ink)]/15" />
        </motion.div>
      </div>
    </div>
  )
}

// The active topic swaps on a loop while the "Pivot topic" button pulses, so it
// reads as "tap Pivot, the topic changes."
function PivotDemo() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setI((v) => (v + 1) % DECKS.length)
    }, 1500)
    return () => window.clearInterval(timer)
  }, [])
  const deck = DECKS[i]
  return (
    <div className="mt-5 flex h-40 flex-col items-center justify-center gap-4 rounded-2xl bg-[var(--color-ink)]/[0.05]">
      <div className="relative h-[62px] w-[62px]">
        <AnimatePresence>
          <motion.div
            key={deck.id}
            className="absolute inset-0 flex items-center justify-center rounded-2xl text-white"
            style={{ background: deck.color }}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
            transition={{ duration: 0.35 }}
          >
            <DeckIcon id={deck.id} size={30} />
          </motion.div>
        </AnimatePresence>
      </div>
      <motion.div
        className="rounded-full bg-[var(--color-ink)] px-4 py-1.5 text-[12px] font-semibold text-white"
        animate={{ scale: [1, 0.9, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.1, 0.22] }}
      >
        Pivot topic
      </motion.div>
    </div>
  )
}

function Demo({ kind }: { kind: 'card' | 'swipe' | 'pivot' }) {
  if (kind === 'swipe') return <SwipeDemo />
  if (kind === 'pivot') return <PivotDemo />
  return (
    <div
      className="mt-5 flex h-40 items-center justify-center rounded-2xl"
      style={{ background: '#F79457' }}
    >
      <MiniCard />
    </div>
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
      // dismiss — you advance with the button.
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
            className="min-h-[296px]"
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

        {/* One centered control */}
        <div className="mt-5 flex justify-center">
          <motion.button
            type="button"
            onClick={next}
            whileTap={{ scale: 0.96 }}
            className="rounded-full bg-[var(--color-ink)] px-10 py-3 text-[15px] font-semibold text-white"
          >
            {isLast ? 'Start playing' : 'Next'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
