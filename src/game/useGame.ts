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
// Turn model (locked in CLAUDE.md): every completed action — answer, open,
// lighter, deeper — shows a transition and rotates the spotlight. Depth is a
// shared group state that carries to the next player. Steering (lighter/deeper)
// is NOT answering; it just sets the depth for whoever is next.

const STORAGE_KEY = 'cg:v1'

export interface GameState {
  screen: Screen
  players: Player[]
  spotlightIndex: number
  deck: DeckId
  depth: Depth
  card: string
  lastAction: TurnAction | null
}

const initialState: GameState = {
  screen: 'start',
  players: [],
  spotlightIndex: 0,
  deck: 'friendship',
  depth: 1,
  card: '',
  lastAction: null,
}

type Action =
  | { type: 'OPEN_SETUP' }
  | { type: 'START'; players: Player[]; depth: Depth }
  | { type: 'ACT'; action: TurnAction }
  | { type: 'CONTINUE' }
  | { type: 'END' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'NEW_GAME' }
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
        screen: 'playing',
      }

    case 'ACT': {
      let depth = state.depth
      if (action.action === 'lighter') depth = clampDepth(depth - 1)
      if (action.action === 'deeper') depth = clampDepth(depth + 1)
      return { ...state, depth, lastAction: action.action, screen: 'transition' }
    }

    case 'CONTINUE': {
      const count = state.players.length
      const nextIndex = count > 0 ? (state.spotlightIndex + 1) % count : 0
      return {
        ...state,
        spotlightIndex: nextIndex,
        card: pickCard(FRIENDSHIP, state.depth, state.card),
        lastAction: null,
        screen: 'playing',
      }
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
        screen: 'playing',
      }

    case 'NEW_GAME':
      return { ...state, screen: 'setup' }

    case 'QUIT':
      return { ...initialState }

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
      end: () => dispatch({ type: 'END' }),
      playAgain: () => dispatch({ type: 'PLAY_AGAIN' }),
      newGame: () => dispatch({ type: 'NEW_GAME' }),
      quit: () => dispatch({ type: 'QUIT' }),
    }),
    [],
  )

  return { state, spotlight, nextPlayer, actions }
}
