import { useEffect, useMemo, useReducer } from 'react'
import type {
  Depth,
  DeckId,
  Player,
  Screen,
  TurnAction,
} from './types'
import { dealCard, deckById } from './cards'

// Single source of truth for the game. A tiny state machine over the five
// screens, persisted to localStorage so a refresh resumes mid-game.
//
// Turn model (locked in CLAUDE.md): every completed action — stay, lighter,
// deeper, pivot — shows a transition and rotates the spotlight. Depth is a
// shared group state that carries to the next player. A pending transition can
// be undone (e.g. an accidental tap) before continuing to the next player.
// Cards never repeat within a game (see `seen`).

// Bump this to invalidate older saved games so a new version starts fresh and
// overrides any state left over from a previous version.
const STORAGE_KEY = 'cg:v3'
const LEGACY_KEYS = ['cg:v1', 'cg:v2']

export interface GameState {
  screen: Screen
  players: Player[]
  spotlightIndex: number
  deck: DeckId
  depth: Depth
  card: string
  lastAction: TurnAction | null
  /** Has the one-time first-card gesture coach been dismissed? Persisted. */
  seenCoach: boolean
  /** Depth before the pending action, so the transition can be undone. */
  prevDepth: Depth | null
  /** Deck before a pending pivot, so the transition can be undone. */
  prevDeck: DeckId | null
  /** Every card text shown this game, so none repeats until forced. */
  seen: string[]
}

const initialState: GameState = {
  screen: 'start',
  players: [],
  spotlightIndex: 0,
  deck: 'social',
  depth: 1,
  card: '',
  lastAction: null,
  seenCoach: false,
  prevDepth: null,
  prevDeck: null,
  seen: [],
}

type Action =
  | { type: 'OPEN_SETUP' }
  | { type: 'START'; players: Player[]; depth: Depth; deck: DeckId }
  | { type: 'ACT'; action: TurnAction }
  | { type: 'PIVOT'; deck: DeckId }
  | { type: 'CONTINUE' }
  | { type: 'UNDO' }
  | { type: 'DISMISS_COACH' }
  | { type: 'QUIT' }

function clampDepth(value: number): Depth {
  if (value < 1) return 1
  if (value > 5) return 5
  return value as Depth
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'OPEN_SETUP':
      return { ...state, screen: 'setup' }

    case 'START': {
      const card = dealCard(deckById(action.deck), action.depth, []) ?? ''
      return {
        ...state,
        players: action.players,
        spotlightIndex: 0,
        deck: action.deck,
        depth: action.depth,
        card,
        seen: card ? [card] : [],
        // Show the gesture coach at the start of every game, not just the first.
        seenCoach: false,
        lastAction: null,
        prevDepth: null,
        screen: 'playing',
      }
    }

    case 'ACT': {
      let depth = state.depth
      if (action.action === 'lighter') depth = clampDepth(depth - 1)
      if (action.action === 'deeper') depth = clampDepth(depth + 1)
      return {
        ...state,
        depth,
        prevDepth: state.depth,
        prevDeck: state.deck,
        lastAction: action.action,
        screen: 'transition',
      }
    }

    case 'PIVOT':
      // Switch to another deck but keep the current depth. It sets up the new
      // topic and passes to the next player. `seen` carries over, so pivoting
      // never brings back a card already shown this game.
      return {
        ...state,
        deck: action.deck,
        prevDepth: state.depth,
        prevDeck: state.deck,
        lastAction: 'pivot',
        screen: 'transition',
      }

    case 'CONTINUE': {
      const count = state.players.length
      const nextIndex = count > 0 ? (state.spotlightIndex + 1) % count : 0
      const card = dealCard(deckById(state.deck), state.depth, state.seen) ?? ''
      return {
        ...state,
        spotlightIndex: nextIndex,
        card,
        seen: card ? [...state.seen, card] : state.seen,
        lastAction: null,
        prevDepth: null,
        prevDeck: null,
        screen: 'playing',
      }
    }

    case 'UNDO':
      // Revert an accidental action and return to the same card / same player,
      // restoring the depth and deck from before the action.
      return {
        ...state,
        depth: state.prevDepth ?? state.depth,
        deck: state.prevDeck ?? state.deck,
        lastAction: null,
        prevDepth: null,
        prevDeck: null,
        screen: 'playing',
      }

    case 'DISMISS_COACH':
      return { ...state, seenCoach: true }

    case 'QUIT':
      // Reset everything except the "already learned the gestures" flag.
      return { ...initialState, seenCoach: state.seenCoach }

    default:
      return state
  }
}

function loadInitial(): GameState {
  try {
    // Drop superseded saves so this version overrides any older stored game.
    for (const key of LEGACY_KEYS) localStorage.removeItem(key)
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw) as Partial<GameState> | null
    if (!parsed || typeof parsed !== 'object') return initialState
    if (!Array.isArray(parsed.players)) return initialState
    const merged: GameState = { ...initialState, ...parsed }
    if (!Array.isArray(merged.seen)) merged.seen = []
    // If we resumed into gameplay without a card somehow, deal one.
    if (
      (merged.screen === 'playing' || merged.screen === 'transition') &&
      !merged.card
    ) {
      const card = dealCard(deckById(merged.deck), merged.depth, merged.seen)
      if (card) {
        merged.card = card
        merged.seen = [...merged.seen, card]
      }
    }
    return merged
  } catch {
    return initialState
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage can be unavailable (private mode); the game still works.
    }
  }, [state])

  const spotlight = state.players[state.spotlightIndex] ?? null
  const nextPlayer =
    state.players.length > 0
      ? state.players[(state.spotlightIndex + 1) % state.players.length]
      : null

  const actions = useMemo(
    () => ({
      openSetup: () => dispatch({ type: 'OPEN_SETUP' }),
      start: (players: Player[], depth: Depth, deck: DeckId) =>
        dispatch({ type: 'START', players, depth, deck }),
      act: (turnAction: TurnAction) =>
        dispatch({ type: 'ACT', action: turnAction }),
      pivot: (deck: DeckId) => dispatch({ type: 'PIVOT', deck }),
      continueTurn: () => dispatch({ type: 'CONTINUE' }),
      undo: () => dispatch({ type: 'UNDO' }),
      dismissCoach: () => dispatch({ type: 'DISMISS_COACH' }),
      quit: () => dispatch({ type: 'QUIT' }),
    }),
    [],
  )

  const deckName = deckById(state.deck).name

  return { state, spotlight, nextPlayer, deckName, actions }
}
