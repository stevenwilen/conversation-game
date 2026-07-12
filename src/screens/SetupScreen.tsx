import { useRef, useState } from 'react'
import { motion, Reorder, useDragControls } from 'framer-motion'
import type { Depth, DeckId, Player } from '../game/types'
import { DEPTH_THEME, SETUP_BG } from '../game/theme'
import { DECKS } from '../game/cards'
import { DeckCarousel } from '../components/DeckCarousel'

// New-game setup, rebuilt as a single screen that reads "who → what → how deep
// → go". Players come first (the real decision) as a drag-to-reorder turn-order
// list that defaults to a random shuffle at start; the deck is a swipeable card
// carousel that previews the game; and the starting level shows only the
// recommended Level 1. Not gameplay, so inputs are allowed, but it's kept
// card-based rather than form-like.

const MAX_PLAYERS = 12

// Warm, playful avatar colors. Assigned by the player's stable id so a player's
// color never changes when the turn order is shuffled or dragged. Purely
// decorative — the player-facing system stays Deck + Depth + Spotlight.
const AVATAR_COLORS = [
  '#EE7A5F',
  '#47A98C',
  '#7C5BC9',
  '#E85C63',
  '#F2A65E',
  '#5AA9E6',
  '#E8739E',
  '#3F9E7C',
]

function avatarColor(player: Player): string {
  return AVATAR_COLORS[Number(player.id) % AVATAR_COLORS.length]
}

/** Fisher–Yates, returning a new array (turn order defaults to random). */
function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

// One draggable row in the turn-order list. Its own drag controls let ONLY the
// handle start a drag, so the remove button and page scroll aren't hijacked.
function PlayerRow({
  player,
  position,
  onRemove,
}: {
  player: Player
  position: number
  onRemove: (id: string) => void
}) {
  const controls = useDragControls()
  const color = avatarColor(player)
  return (
    <Reorder.Item
      value={player}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ scale: 1.03 }}
      className="flex items-center gap-2.5 rounded-2xl bg-white px-3 py-2.5 shadow-[0_2px_10px_rgba(120,72,40,0.08)]"
    >
      <span className="w-4 shrink-0 text-center text-[13px] font-bold text-[var(--color-ink)]/35">
        {position}
      </span>
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
        style={{ background: color }}
      >
        {player.name.charAt(0).toUpperCase()}
      </span>
      <span className="flex-1 truncate text-[16px] font-semibold text-[var(--color-ink)]">
        {player.name}
      </span>
      <button
        type="button"
        onClick={() => onRemove(player.id)}
        aria-label={`Remove ${player.name}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[17px] text-[var(--color-ink)]/40 transition hover:text-[var(--color-ink)]/75"
      >
        ×
      </button>
      <span
        onPointerDown={(event) => controls.start(event)}
        className="flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center text-[18px] leading-none text-[var(--color-ink)]/30"
        aria-label="Drag to reorder"
        role="button"
      >
        ⠿
      </span>
    </Reorder.Item>
  )
}

interface SetupScreenProps {
  onBack: () => void
  onStart: (players: Player[], startDepth: Depth, deck: DeckId) => void
}

export function SetupScreen({ onBack, onStart }: SetupScreenProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [name, setName] = useState('')
  const [startDepth, setStartDepth] = useState<Depth>(1)
  const [deckId, setDeckId] = useState<DeckId>('social')
  // Whether the group has set the turn order themselves (dragged or shuffled).
  // Until they do, the order is randomized when the game starts.
  const [orderChosen, setOrderChosen] = useState(false)
  const idRef = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const atCapacity = players.length >= MAX_PLAYERS
  const canStart = players.length >= 2

  function addPlayer() {
    const trimmed = name.trim()
    if (!trimmed || atCapacity) return
    setPlayers((current) => [
      ...current,
      { id: String(idRef.current++), name: trimmed },
    ])
    setName('')
    // Keep the keyboard up so names can be added back-to-back.
    inputRef.current?.focus()
  }

  function removePlayer(id: string) {
    setPlayers((current) => current.filter((player) => player.id !== id))
  }

  function shufflePlayers() {
    setPlayers((current) => shuffle(current))
    setOrderChosen(true)
  }

  function handleStart() {
    // Default to a random order; honor a hand-picked one.
    onStart(orderChosen ? players : shuffle(players), startDepth, deckId)
  }

  const depthTheme = DEPTH_THEME[startDepth]

  return (
    <motion.div
      className="absolute inset-0 overflow-y-auto overscroll-none"
      style={{ background: SETUP_BG }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="phone-frame text-[var(--color-ink)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="-ml-2 rounded-full px-3 py-2 text-[15px] font-semibold text-[var(--color-ink)]/60"
          >
            ‹ Back
          </button>
          <span className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/45">
            New game
          </span>
          <span className="w-14" />
        </div>

        {/* Scrolling body */}
        <div className="flex-1 px-6 pb-4">
          {/* ---- Who's playing ------------------------------------------- */}
          <div className="mt-5 flex items-center justify-between gap-3">
            <h1 className="whitespace-nowrap text-[36px] font-extrabold leading-[1.02] tracking-[-0.02em]">
              Who's playing?
            </h1>
            <span className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-[13px] font-bold text-[var(--color-ink)]/55 shadow-[0_1px_4px_rgba(120,72,40,0.08)]">
              {players.length} of {MAX_PLAYERS}
            </span>
          </div>

          {/* Add player */}
          <form
            className="mt-5 flex gap-2.5"
            onSubmit={(event) => {
              event.preventDefault()
              addPlayer()
            }}
          >
            <input
              ref={inputRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={atCapacity ? 'Full house' : 'Add a name'}
              maxLength={20}
              autoComplete="off"
              disabled={atCapacity}
              className="w-full rounded-2xl bg-white px-4 py-3.5 text-[17px] font-semibold text-[var(--color-ink)] shadow-[0_2px_10px_rgba(120,72,40,0.08)] outline-none transition placeholder:font-medium placeholder:text-[var(--color-ink)]/35 focus:shadow-[0_2px_14px_rgba(120,72,40,0.14)] disabled:opacity-50"
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.92 }}
              disabled={!name.trim() || atCapacity}
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-[var(--color-ink)] text-2xl font-light text-white shadow-[0_4px_12px_rgba(20,16,26,0.22)] transition disabled:opacity-30 disabled:shadow-none"
              aria-label="Add player"
            >
              +
            </motion.button>
          </form>

          {/* Turn order — the roster IS the play order. Drag ⠿ to arrange or
              Shuffle to randomize; if untouched, it's shuffled at start. */}
          {players.length === 0 ? (
            <p className="mt-4 text-[14px] font-medium text-[var(--color-ink)]/40">
              Nobody yet. Add the first player.
            </p>
          ) : (
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)]/45">
                  Turn order
                </span>
                <button
                  type="button"
                  onClick={shufflePlayers}
                  className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-[var(--color-ink)]/60 shadow-[0_1px_4px_rgba(120,72,40,0.08)]"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M16 3h5v5" />
                    <path d="M4 20 21 3" />
                    <path d="M21 16v5h-5" />
                    <path d="m15 15 6 6" />
                    <path d="M4 4l5 5" />
                  </svg>
                  Shuffle
                </button>
              </div>

              <Reorder.Group
                axis="y"
                values={players}
                onReorder={(next) => {
                  setPlayers(next)
                  setOrderChosen(true)
                }}
                className="mt-2.5 flex flex-col gap-2"
              >
                {players.map((player, i) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    position={i + 1}
                    onRemove={removePlayer}
                  />
                ))}
              </Reorder.Group>

              {!orderChosen && players.length >= 2 && (
                <p className="mt-2.5 text-[13px] font-medium text-[var(--color-ink)]/45">
                  Order is random at start — drag ⠿ or shuffle to set it.
                </p>
              )}
            </div>
          )}

          {/* ---- Topic (swipeable deck carousel) ------------------------- */}
          <div className="mt-9">
            <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)]/45">
              Topic
            </div>
            {/* Full-bleed (-mx-6) so the carousel's edge clip lands at the
                screen edge, letting neighbor cards peek naturally instead of
                being hard-cut in the gutter. */}
            <div className="mt-2 -mx-6">
              <DeckCarousel
                decks={DECKS}
                selectedId={deckId}
                onSelect={setDeckId}
              />
            </div>
          </div>

          {/* ---- Starting level ------------------------------------------
              A single line, defaulting to the recommended Level 1. "Change"
              simply advances the level (wrapping 5 -> 1) so it never nudges the
              group toward a picker of options. */}
          <div className="mt-8 flex h-11 items-center justify-between">
            <p className="text-[15px] font-medium text-[var(--color-ink)]/55">
              Starting at{' '}
              <span className="font-bold text-[var(--color-ink)]">
                Level {startDepth}
              </span>
              <span className="text-[var(--color-ink)]/45"> · {depthTheme.label}</span>
            </p>
            <button
              type="button"
              onClick={() => setStartDepth((current) => ((current % 5) + 1) as Depth)}
              className="shrink-0 text-[13px] font-semibold text-[var(--color-ink)]/45"
            >
              Change ›
            </button>
          </div>
        </div>

        {/* Sticky CTA — always reachable, content scrolls under it. */}
        <div
          className="sticky bottom-0 px-6 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          style={{
            background: `linear-gradient(to bottom, ${SETUP_BG}00, ${SETUP_BG} 44%)`,
          }}
        >
          <motion.button
            type="button"
            onClick={handleStart}
            disabled={!canStart}
            whileTap={{ scale: canStart ? 0.96 : 1 }}
            className="w-full rounded-full bg-[var(--color-ink)] py-5 text-lg font-semibold text-white shadow-[0_6px_16px_rgba(20,16,26,0.28)] transition disabled:opacity-30"
          >
            {canStart ? 'Start game' : 'Add 2+ players'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
