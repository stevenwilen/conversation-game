import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Depth, Player } from '../game/types'
import { DEPTHS } from '../game/types'
import { DEPTH_THEME } from '../game/theme'
import { FRIENDSHIP } from '../game/cards'

// Setup is allowed to have inputs — it's not gameplay. Kept light and chip-based
// rather than form-like. Deck is locked to Friendship; Pivot is shown as
// coming-soon because it stays disabled until multiple decks exist.

interface SetupScreenProps {
  onBack: () => void
  onStart: (players: Player[], startDepth: Depth) => void
}

export function SetupScreen({ onBack, onStart }: SetupScreenProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [name, setName] = useState('')
  const [startDepth, setStartDepth] = useState<Depth>(1)
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
      className="absolute inset-0 flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #FFE4C6 0%, #FFB9A2 100%)',
      }}
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

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-y-contain px-6 pb-4">
          <h1 className="mt-4 text-[34px] font-bold leading-tight tracking-[-0.01em]">
            Who's playing?
          </h1>
          <p className="mt-1.5 text-[15px] font-medium text-[var(--color-ink)]/55">
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
            <div className="mt-2.5 flex gap-3">
              <div className="flex-1 rounded-3xl bg-white/80 p-4 shadow-[0_10px_30px_-16px_rgba(20,16,26,0.5)] ring-2 ring-[var(--color-ink)]">
                <div className="text-[19px] font-bold">{FRIENDSHIP.name}</div>
                <div className="mt-1 text-[13px] font-medium leading-snug text-[var(--color-ink)]/55">
                  {FRIENDSHIP.tagline}
                </div>
              </div>
              <div className="flex w-24 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[var(--color-ink)]/20 p-3 text-center">
                <div className="text-[13px] font-semibold text-[var(--color-ink)]/40">
                  More soon
                </div>
                <div className="mt-1 text-[10px] font-medium leading-tight text-[var(--color-ink)]/35">
                  Pivot unlocks with more decks
                </div>
              </div>
            </div>
          </div>

          {/* Starting depth */}
          <div className="mt-7">
            <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)]/45">
              Start at
            </div>
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
            <div className="mt-2 text-[14px] font-medium text-[var(--color-ink)]/55">
              <span className="font-bold text-[var(--color-ink)]/75">
                {depthTheme.label}
              </span>{' '}
              — {depthTheme.blurb}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-6 pb-10 pt-3">
          <motion.button
            type="button"
            onClick={() => onStart(players, startDepth)}
            disabled={!canStart}
            whileTap={{ scale: canStart ? 0.96 : 1 }}
            className="w-full rounded-full bg-[var(--color-ink)] py-5 text-lg font-semibold text-white shadow-[0_18px_40px_-14px_rgba(20,16,26,0.55)] transition disabled:opacity-30"
          >
            {canStart ? 'Start game' : 'Add 2+ players'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
