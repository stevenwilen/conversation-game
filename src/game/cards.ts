import type { Deck, DeckId, Depth } from './types'
import { socialCards } from '../data/social'
import { growingUpCards } from '../data/growingUp'
import { hotTakesCards } from '../data/hotTakes'

// ---------------------------------------------------------------------------
// Social deck — the only deck in the first prototype.
// Content lives in src/data/social.ts (50 cards, 10 per depth). Here we
// group it into the runtime shape the game logic already uses (a string[] per
// depth). Tone / topic / sensitivity live behind the scenes in the source
// data; they never surface as player-facing controls.
// ---------------------------------------------------------------------------

function groupByDepth(): Record<Depth, string[]> {
  const grouped: Record<Depth, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] }
  for (const card of socialCards) {
    grouped[card.depth].push(card.text)
  }
  return grouped
}

export const SOCIAL: Deck = {
  id: 'social',
  name: 'Social Life',
  tagline: 'For the people who already know your worst jokes.',
  cards: groupByDepth(),
}

export const GROWING_UP: Deck = {
  id: 'growingup',
  name: 'Growing Up',
  tagline: 'Back when everything felt like a big deal.',
  cards: growingUpCards,
}

export const HOT_TAKES: Deck = {
  id: 'hottakes',
  name: 'Hot Takes',
  tagline: 'Say the thing you usually keep to yourself.',
  cards: hotTakesCards,
}

export const DECKS: Deck[] = [SOCIAL, GROWING_UP, HOT_TAKES]

/** Look up a deck by id, falling back to the first deck. */
export function deckById(id: DeckId): Deck {
  return DECKS.find((deck) => deck.id === id) ?? SOCIAL
}

// Draw a prompt for a depth that hasn't been shown yet this game. `seen` is
// every card text already shown (across all depths and decks), so nothing
// repeats within a game. Returns null once a level is exhausted — the game then
// shows an "out of cards here" state that steers the group deeper/lighter or to
// another topic rather than recycling.
export function dealCard(
  deck: Deck,
  depth: Depth,
  seen: string[],
): string | null {
  const unseen = deck.cards[depth].filter((text) => !seen.includes(text))
  if (unseen.length === 0) return null
  return unseen[Math.floor(Math.random() * unseen.length)]
}
