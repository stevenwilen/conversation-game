// Core domain types for the conversation game.
// Locked player-facing system = Deck + Depth + Spotlight choice (see CLAUDE.md).
// No enums on purpose: tsconfig uses `erasableSyntaxOnly`, so we model closed
// sets as string/number literal unions.

export type Depth = 1 | 2 | 3 | 4 | 5

export const DEPTHS: Depth[] = [1, 2, 3, 4, 5]

export type DeckId = 'social' | 'growingup' | 'hottakes'

export type Screen = 'start' | 'setup' | 'playing' | 'transition'

/** What the spotlight player did after the card. Answering is verbal; these are
 * the direction choices that pass the turn. */
export type TurnAction = 'stay' | 'lighter' | 'deeper' | 'pivot'

export interface Player {
  id: string
  name: string
}

export interface Deck {
  id: DeckId
  name: string
  tagline: string
  /** Solid identity color for the deck (used on the topic tiles). */
  color: string
  /** Prompts keyed by depth level. */
  cards: Record<Depth, string[]>
}
