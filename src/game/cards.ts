import type { Deck, DeckId, Depth } from './types'
import { socialCards } from '../data/social'
import { familyCards } from '../data/family'
import { debatesCards } from '../data/debates'

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
  name: 'Social',
  tagline: 'For the people who already know your worst jokes.',
  cards: groupByDepth(),
}

export const FAMILY: Deck = {
  id: 'family',
  name: 'Family',
  tagline: 'Home, and everything that came with it.',
  cards: familyCards,
}

export const DEBATE: Deck = {
  id: 'debate',
  name: 'Debate',
  tagline: 'Pick a side. Defend it. Stay friends.',
  cards: debatesCards,
}

export const DECKS: Deck[] = [SOCIAL, FAMILY, DEBATE]

/** Look up a deck by id, falling back to the first deck. */
export function deckById(id: DeckId): Deck {
  return DECKS.find((deck) => deck.id === id) ?? SOCIAL
}

/** Per-depth queues of the remaining shuffled prompts for the current cycle. */
export type DeckQueues = Record<Depth, string[]>

export function emptyQueues(): DeckQueues {
  return { 1: [], 2: [], 3: [], 4: [], 5: [] }
}

function shuffle(items: string[]): string[] {
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = result[i]
    result[i] = result[j]
    result[j] = tmp
  }
  return result
}

// Draw the next prompt for a depth from a shuffled queue: every question in the
// level appears once before any repeats. Refills with a fresh shuffle when the
// level is exhausted, avoiding an immediate repeat across that boundary.
export function dealCard(
  deck: Deck,
  queues: DeckQueues,
  depth: Depth,
  avoid?: string,
): { card: string; queues: DeckQueues } {
  let queue = (queues[depth] ?? []).slice()
  if (queue.length === 0) {
    queue = shuffle(deck.cards[depth])
    if (avoid && queue.length > 1 && queue[0] === avoid) {
      queue.push(queue.shift() as string)
    }
  }
  const card = queue.shift() as string
  return { card, queues: { ...queues, [depth]: queue } }
}
