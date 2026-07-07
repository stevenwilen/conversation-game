// Core domain types for the conversation game.
// Locked player-facing system = Deck + Depth + Spotlight choice (see CLAUDE.md).
// No enums on purpose: tsconfig uses `erasableSyntaxOnly`, so we model closed
// sets as string/number literal unions.

export type Depth = 1 | 2 | 3 | 4 | 5

export const DEPTHS: Depth[] = [1, 2, 3, 4, 5]

export type DeckId = 'friendship'

export type Screen = 'start' | 'setup' | 'playing' | 'transition' | 'end'

/** What the spotlight player did with the card. */
export type TurnAction = 'answer' | 'lighter' | 'deeper'

// The spotlight player must choose before speaking. A turn moves through these
// sub-states on the game screen (local UI state, not persisted):
//   decision  — reading the card; tap to claim & answer, or choose to steer
//   answering — the card is claimed; steering is locked; a Done control ends it
//   steer     — not answering; swipe left = lighter, right = deeper
export type TurnPhase = 'decision' | 'answering' | 'steer'

export interface Player {
  id: string
  name: string
}

export interface Deck {
  id: DeckId
  name: string
  tagline: string
  /** Prompts keyed by depth level. */
  cards: Record<Depth, string[]>
}
