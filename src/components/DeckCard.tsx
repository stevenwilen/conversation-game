import type { Deck } from '../game/types'
import { DeckBackdropIcon } from './DeckBackdropIcon'

// A deck rendered as an actual topic card, not a feature tile: the deck's color
// IS the card surface, wrapped in an inset frame with playing-card corner
// indices, a centered emblem, the deck name, and card metadata. Flat colors
// only (no gradients/glows) so it still reads as a prototype. Used inside
// DeckCarousel; the centered/active card is full-strength while peeking
// neighbors dim and shrink.

function cardCount(deck: Deck): number {
  return Object.values(deck.cards).reduce((total, level) => total + level.length, 0)
}

interface DeckCardProps {
  deck: Deck
  active: boolean
  onClick?: () => void
}

export function DeckCard({ deck, active, onClick }: DeckCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="relative flex h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-[26px] px-7 text-center text-white transition-[transform,opacity] duration-300 ease-[var(--ease-soft)]"
      style={{
        background: deck.color,
        opacity: active ? 1 : 0.5,
        transform: active ? 'scale(1)' : 'scale(0.92)',
      }}
    >
      {/* Large faded backdrop motif for texture — a distinct icon from the
          foreground emblem, flat, no glow. */}
      <div className="pointer-events-none absolute -bottom-10 -right-8 text-white/10">
        <DeckBackdropIcon id={deck.id} size={210} />
      </div>

      {/* Title (nudged up to sit optically above the footer) */}
      <div className="relative -mt-4 flex flex-col items-center">
        <h3 className="text-[30px] font-extrabold leading-[1.05] tracking-[-0.015em]">
          {deck.name}
        </h3>
        <p className="mt-2 max-w-[15rem] text-balance text-[15px] font-medium leading-snug text-white/85">
          {deck.tagline}
        </p>
      </div>

      {/* Footer metadata */}
      <div className="absolute bottom-6 flex flex-col items-center gap-2.5">
        <span className="h-px w-8 bg-white/35" />
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
          {cardCount(deck)} cards
        </span>
      </div>
    </button>
  )
}
