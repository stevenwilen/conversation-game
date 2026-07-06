import { useEffect, useMemo, useReducer } from 'react'
import type {
  Depth,
  DeckId,
  Player,
  Screen,
  TurnAction,
} from './types'
import { FRIENDSHIP, pickCard } from './cards'

// Single source of truth for the game. A tiny state machine over the five
// screens, persisted to localStorage so a refresh resumes mid-game.
//
// Turn model (locked in CLAUDE.md): every completed action — answer, lighter,
// deeper — shows a transition and rotates the spotlight. Depth is a shared
// group state that carries to the next player. Steering (lighter/deeper) is NOT
// answering; it just sets the depth for whoever is next. A pending transition
// can be undone (e.g. an accidental tap) before continuing to the next player.

const STORAGE_KEY = 'cg:v1'

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
}

const initialState: GameState = {
  screen: 'start',
  players: [],
  spotlightIndex: 0,
  deck: 'friendship',
  depth: 1,
  card: '',
  lastAction: null,
  seenCoach: false,
  prevDepth: null,
}

type Action =
  | { type: 'OPEN_SETUP' }
  | { type: 'START'; players: Player[]; depth: Depth }
  | { type: 'ACT'; action: TurnAction }
  | { type: 'CONTINUE' }
  | { type: 'UNDO' }
  | { type: 'END' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'NEW_GAME' }
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

    case 'START':
      return {
        ...state,
        players: action.players,
        spotlightIndex: 0,
        depth: action.depth,
        card: pickCard(FRIENDSHIP, action.depth),
        lastAction: null,
        prevDepth: null,
        screen: 'playing',
      }

    case 'ACT': {
      let depth = state.depth
      if (action.action === 'lighter') depth = clampDepth(depth - 1)
      if (action.action === 'deeper') depth = clampDepth(depth + 1)
      return {
        ...state,
        depth,
        prevDepth: state.depth,
        lastAction: action.action,
        screen: 'transition',
      }
    }

    case 'CONTINUE': {
      const count = state.players.length
      const nextIndex = count > 0 ? (state.spotlightIndex + 1) % count : 0
      return {
        ...state,
        spotlightIndex: nextIndex,
        card: pickCard(FRIENDSHIP, state.depth, state.card),
        lastAction: null,
        prevDepth: null,
        screen: 'playing',
      }
    }

    case 'UNDO':
      // Revert an accidental action and return to the same card / same player,
      // restoring the depth from before the action.
      return {
        ...state,
        depth: state.prevDepth ?? state.depth,
        lastAction: null,
        prevDepth: null,
        screen: 'playing',
      }

    case 'END':
      return { ...state, screen: 'end' }

    case 'PLAY_AGAIN':
      return {
        ...state,
        spotlightIndex: 0,
        depth: 1,
        card: pickCard(FRIENDSHIP, 1),
        lastAction: null,
        prevDepth: null,
        screen: 'playing',
      }

    case 'NEW_GAME':
      return { ...state, screen: 'setup' }

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
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw) as Partial<GameState> | null
    if (!parsed || typeof parsed !== 'object') return initialState
    if (!Array.isArray(parsed.players)) return initialState
    const merged: GameState = { ...initialState, ...parsed }
    // If we resumed into gameplay without a card somehow, deal one.
    if (
      (merged.screen === 'playing' || merged.screen === 'transition') &&
      !merged.card
    ) {
      merged.card = pickCard(FRIENDSHIP, merged.depth)
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
      start: (players: Player[], depth: Depth) =>
        dispatch({ type: 'START', players, depth }),
      act: (turnAction: TurnAction) =>
        dispatch({ type: 'ACT', action: turnAction }),
      continueTurn: () => dispatch({ type: 'CONTINUE' }),
      undo: () => dispatch({ type: 'UNDO' }),
      end: () => dispatch({ type: 'END' }),
      playAgain: () => dispatch({ type: 'PLAY_AGAIN' }),
      newGame: () => dispatch({ type: 'NEW_GAME' }),
      dismissCoach: () => dispatch({ type: 'DISMISS_COACH' }),
      quit: () => dispatch({ type: 'QUIT' }),
    }),
    [],
  )

  return { state, spotlight, nextPlayer, actions }
}
