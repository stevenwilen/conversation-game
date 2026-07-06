import type { Deck, Depth } from './types'
import { friendshipCards } from '../data/friendship'

// ---------------------------------------------------------------------------
// Friendship deck — the only deck in the first prototype.
// Content lives in src/data/friendship.ts (50 cards, 10 per depth). Here we
// group it into the runtime shape the game logic already uses (a string[] per
// depth). Tone / topic / sensitivity live behind the scenes in the source
// data; they never surface as player-facing controls.
// ---------------------------------------------------------------------------

function groupByDepth(): Record<Depth, string[]> {
  const grouped: Record<Depth, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] }
  for (const card of friendshipCards) {
    grouped[card.depth].push(card.text)
  }
  return grouped
}

export const FRIENDSHIP: Deck = {
  id: 'friendship',
  name: 'Friendship',
  tagline: 'For the people who already know your worst jokes.',
  cards: groupByDepth(),
}

export const DECKS: Deck[] = [FRIENDSHIP]

/** Pick a prompt for a depth, avoiding an immediate repeat when possible. */
export function pickCard(deck: Deck, depth: Depth, avoid?: string): string {
  const pool = deck.cards[depth]
  if (pool.length <= 1) return pool[0]
  let card = pool[Math.floor(Math.random() * pool.length)]
  let guard = 0
  while (card === avoid && guard++ < 8) {
    card = pool[Math.floor(Math.random() * pool.length)]
  }
  return card
}
