import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Depth, DeckId, Player } from '../game/types'
import { DEPTHS } from '../game/types'
import { DEPTH_THEME, SETUP_BG } from '../game/theme'
import { DECKS } from '../game/cards'
import { DeckCarousel } from '../components/DeckCarousel'

// New-game setup, rebuilt as a single screen that reads "who → what → how deep
// → go". Players come first (the real decision), the deck is a swipeable card
// carousel that previews the game, and the starting level shows ONLY the
// recommended Level 1 by default — the full picker is tucked behind a quiet
// "Change" so the group isn't nudged to jump ahead. Not gameplay, so inputs are
// allowed, but it's kept chip- and card-based rather than form-like.

const MAX_PLAYERS = 8

// Warm, playful avatar colors, assigned by add-order. Purely decorative — the
// player-facing system stays Deck + Depth + Spotlight.
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

        {/* Scrolling body */}
        <div className="flex-1 px-6 pb-4">
          {/* ---- Who's playing ------------------------------------------- */}
          <div className="mt-5 flex items-end justify-between gap-3">
            <h1 className="text-[38px] font-extrabold leading-[1.02] tracking-[-0.02em]">
              Who's
              <br />
              playing?
            </h1>
            <span className="rounded-full bg-white/70 px-3 py-1 text-[13px] font-bold text-[var(--color-ink)]/55 shadow-[0_1px_4px_rgba(120,72,40,0.08)]">
              {players.length} of {MAX_PLAYERS}
            </span>
          </div>
          <p className="mt-3 text-balance text-[15px] font-medium text-[var(--color-ink)]/55">
            Pass the phone around and add everyone. Two or more.
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

          {/* Player chips — each tinted with its avatar color so the roster
              feels lively and personal, not like form tokens. */}
          <div className="mt-4 flex flex-wrap gap-2">
            {players.length === 0 ? (
              <span className="text-[14px] font-medium text-[var(--color-ink)]/40">
                Nobody yet — add the first player.
              </span>
            ) : (
              players.map((player, i) => {
                const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
                return (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-1.5 text-[15px] font-bold text-[var(--color-ink)]"
                    style={{ background: `${color}24` }}
                  >
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold text-white"
                      style={{ background: color }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="pl-0.5">{player.name}</span>
                    <button
                      type="button"
                      onClick={() => removePlayer(player.id)}
                      aria-label={`Remove ${player.name}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[16px] text-[var(--color-ink)]/40 transition hover:text-[var(--color-ink)]/75"
                    >
                      ×
                    </button>
                  </motion.div>
                )
              })
            )}
          </div>

          {/* ---- Topic (swipeable deck carousel) ------------------------- */}
          <div className="mt-9">
            <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)]/45">
              Topic
            </div>
            <div className="mt-3">
              <DeckCarousel
                decks={DECKS}
                selectedId={deckId}
                onSelect={setDeckId}
              />
            </div>
          </div>

          {/* ---- Starting level ------------------------------------------
              Shows ONLY the recommended level by default. The full picker is
              deliberately tucked behind a quiet "Change" so the group isn't
              nudged to skip ahead of Level 1. */}
          <div className="mt-9">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)]/45">
                Starting level
              </div>
              {!showLevels && (
                <button
                  type="button"
                  onClick={() => setShowLevels(true)}
                  className="text-[13px] font-semibold text-[var(--color-ink)]/45"
                >
                  Change ›
                </button>
              )}
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
                        onClick={() => {
                          setStartDepth(level)
                          setShowLevels(false)
                        }}
                        className={`flex h-12 flex-1 items-center justify-center rounded-2xl text-[17px] font-bold transition ${
                          selected
                            ? 'text-white'
                            : 'bg-white text-[var(--color-ink)]/55'
                        }`}
                        style={
                          selected ? { background: DEPTH_THEME[level].accent } : undefined
                        }
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
              <div
                className="mt-2.5 flex items-center gap-3.5 rounded-2xl px-4 py-3.5"
                style={{ background: `${depthTheme.accent}1A` }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold text-white"
                  style={{ background: depthTheme.accent }}
                >
                  {startDepth}
                </span>
                <div>
                  <div className="text-[16px] font-bold text-[var(--color-ink)]">
                    {depthTheme.label}
                  </div>
                  <div className="mt-0.5 text-[14px] font-medium text-[var(--color-ink)]/55">
                    {depthTheme.blurb}
                  </div>
                </div>
              </div>
            )}
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
            onClick={() => onStart(players, startDepth, deckId)}
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
