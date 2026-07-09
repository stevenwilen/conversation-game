import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Depth, DeckId, Player } from '../game/types'
import { DEPTHS } from '../game/types'
import { DEPTH_THEME, SETUP_BG } from '../game/theme'
import { DECKS } from '../game/cards'

// Setup is allowed to have inputs — it's not gameplay. Kept light and chip-based
// rather than form-like. The group picks one deck to play; in-game Pivot stays
// disabled for now, so the deck is chosen here and holds for the whole game.

interface SetupScreenProps {
  onBack: () => void
  onStart: (players: Player[], startDepth: Depth, deck: DeckId) => void
}

export function SetupScreen({ onBack, onStart }: SetupScreenProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [name, setName] = useState('')
  const [startDepth, setStartDepth] = useState<Depth>(1)
  const [showLevels, setShowLevels] = useState(false)
  const [deckId, setDeckId] = useState<DeckId>('social')
  const idRef = useRef(0)

  const canStart = players.length >= 2

  function addPlayer() {
    const trimmed = name.trim()
    if (!trimmed) return
    setPlayers((current) => [
      ...current,
      { id: String(idRef.current++), name: trimmed },
    ])
    setName('')
  }

  function removePlayer(id: string) {
    setPlayers((current) => current.filter((player) => player.id !== id))
  }

  const depthTheme = DEPTH_THEME[startDepth]

  return (
    <motion.div
      className="absolute inset-0 overflow-y-auto overscroll-y-contain"
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

        {/* Body — flows in the single page scroll (nothing pinned) */}
        <div className="px-6 pb-4">
          <h1 className="mt-4 text-[34px] font-bold leading-tight tracking-[-0.01em]">
            Who's playing?
          </h1>
          <p className="mt-1.5 text-balance text-[15px] font-medium text-[var(--color-ink)]/55">
            Everyone sharing the phone. Add at least two.
          </p>

          {/* Add player */}
          <form
            className="mt-5 flex gap-2.5"
            onSubmit={(event) => {
              event.preventDefault()
              addPlayer()
            }}
          >
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Add a name"
              maxLength={20}
              autoComplete="off"
              className="w-full rounded-2xl bg-white/70 px-4 py-3.5 text-[17px] font-medium text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-ink)]/40 focus:bg-white"
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.92 }}
              disabled={!name.trim()}
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-[var(--color-ink)] text-2xl font-light text-white disabled:opacity-30"
              aria-label="Add player"
            >
              +
            </motion.button>
          </form>

          {/* Player chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {players.length === 0 ? (
              <span className="text-[14px] font-medium text-[var(--color-ink)]/40">
                No one yet.
              </span>
            ) : (
              players.map((player) => (
                <motion.button
                  key={player.id}
                  type="button"
                  onClick={() => removePlayer(player.id)}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 rounded-full bg-white/75 py-2 pl-4 pr-3 text-[15px] font-semibold text-[var(--color-ink)]"
                >
                  {player.name}
                  <span className="text-[var(--color-ink)]/40">×</span>
                </motion.button>
              ))
            )}
          </div>

          {/* Deck */}
          <div className="mt-8">
            <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)]/45">
              Deck
            </div>
            <div className="mt-2.5 flex flex-col gap-2.5">
              {DECKS.map((deck) => {
                const selected = deck.id === deckId
                return (
                  <motion.button
                    key={deck.id}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDeckId(deck.id)}
                    className={`rounded-3xl p-4 text-left transition ${
                      selected
                        ? 'bg-white/85 shadow-[0_4px_12px_rgba(20,16,26,0.14)] ring-2 ring-[var(--color-ink)]'
                        : 'bg-white/55 ring-2 ring-transparent'
                    }`}
                  >
                    <div className="text-[19px] font-bold">{deck.name}</div>
                    <div className="mt-1 text-balance text-[13px] font-medium leading-snug text-[var(--color-ink)]/55">
                      {deck.tagline}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Starting level — defaults to Level 1 and reads as a done decision.
              The full picker is tucked behind "Change" so new players just start
              at the beginning, while people who know the game can pick a level. */}
          <div className="mt-7">
            <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)]/45">
              Starting level
            </div>

            {showLevels ? (
              <>
                <div className="mt-2.5 flex gap-2">
                  {DEPTHS.map((level) => {
                    const selected = level === startDepth
                    return (
                      <motion.button
                        key={level}
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setStartDepth(level)}
                        className={`flex h-12 flex-1 items-center justify-center rounded-2xl text-[17px] font-bold transition ${
                          selected
                            ? 'bg-[var(--color-ink)] text-white'
                            : 'bg-white/60 text-[var(--color-ink)]/60'
                        }`}
                      >
                        {level}
                      </motion.button>
                    )
                  })}
                </div>
                <div className="mt-2 text-balance text-[14px] font-medium text-[var(--color-ink)]/55">
                  <span className="font-bold text-[var(--color-ink)]/75">
                    {depthTheme.label}.
                  </span>{' '}
                  {depthTheme.blurb}
                </div>
              </>
            ) : (
              <div className="mt-2.5 flex items-center justify-between gap-3">
                <div className="text-balance text-[14px] font-medium text-[var(--color-ink)]/55">
                  <span className="font-bold text-[var(--color-ink)]/75">
                    Level {startDepth} · {depthTheme.label}.
                  </span>{' '}
                  {depthTheme.blurb}
                </div>
                <button
                  type="button"
                  onClick={() => setShowLevels(true)}
                  className="shrink-0 rounded-full bg-white/70 px-4 py-2 text-[13px] font-semibold text-[var(--color-ink)]/60"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* CTA — flows with the content, sits at the bottom without pinning */}
          <motion.button
            type="button"
            onClick={() => onStart(players, startDepth, deckId)}
            disabled={!canStart}
            whileTap={{ scale: canStart ? 0.96 : 1 }}
            className="mt-8 mb-10 w-full rounded-full bg-[var(--color-ink)] py-5 text-lg font-semibold text-white shadow-[0_6px_16px_rgba(20,16,26,0.28)] transition disabled:opacity-30"
          >
            {canStart ? 'Start game' : 'Add 2+ players'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
