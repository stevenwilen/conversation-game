import type { Deck } from '../game/types'
import { DeckIcon } from './DeckIcon'

// A deck shown as a real game card (cream face, deck-color icon badge, name,
// tagline, card-count footer) so the group feels the game before starting.
// Used inside DeckCarousel; the centered/active card sits full-strength while
// the peeking neighbors dim and shrink to signal "swipe me".

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
      className="flex h-[336px] w-full flex-col justify-between rounded-[var(--radius-card)] bg-[var(--color-cream)] px-7 pb-7 pt-7 text-left transition-[transform,opacity,box-shadow] duration-300 ease-[var(--ease-soft)]"
      style={{
        opacity: active ? 1 : 0.5,
        transform: active ? 'scale(1)' : 'scale(0.93)',
        boxShadow: active
          ? '0 12px 28px rgba(20,16,26,0.18)'
          : '0 4px 14px rgba(20,16,26,0.10)',
      }}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl text-white"
        style={{ background: deck.color }}
      >
        <DeckIcon id={deck.id} size={34} />
      </div>

      <div>
        <h3 className="text-[28px] font-bold leading-[1.1] tracking-[-0.01em] text-[var(--color-ink)]">
          {deck.name}
        </h3>
        <p className="mt-2 text-balance text-[15px] font-medium leading-snug text-[var(--color-ink)]/55">
          {deck.tagline}
        </p>
      </div>

      <div
        className="text-[12px] font-bold uppercase tracking-[0.18em]"
        style={{ color: deck.color }}
      >
        {cardCount(deck)} cards · 5 levels
      </div>
    </button>
  )
}
