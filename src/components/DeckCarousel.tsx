import { useLayoutEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, type PanInfo } from 'framer-motion'
import type { Deck, DeckId } from '../game/types'
import { DeckCard } from './DeckCard'

// Horizontal, swipeable deck picker. Each deck is a real card (DeckCard); the
// centered one is the selection, and neighbors peek at the edges so the swipe
// affordance is obvious. Selecting = whatever is centered, so there's no extra
// "confirm" tap. Tapping a side card or a dot also centers it.

const GAP = 18 // px between cards
// Fixed card width matching the question card's portrait proportions
// (~2.5:3.5 poker-card ratio) at the 300px card height, rather than a share of
// the (full-bleed) container width — otherwise the cards render landscape.
const CARD_WIDTH = 214
const SNAP = { type: 'spring' as const, stiffness: 320, damping: 34 }

interface DeckCarouselProps {
  decks: Deck[]
  selectedId: DeckId
  onSelect: (id: DeckId) => void
}

export function DeckCarousel({ decks, selectedId, onSelect }: DeckCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const x = useMotionValue(0)

  const index = Math.max(
    0,
    decks.findIndex((deck) => deck.id === selectedId),
  )

  // Clamp so the card never exceeds a narrow viewport (leaving room to peek).
  const cardWidth = width === 0 ? CARD_WIDTH : Math.min(CARD_WIDTH, width - 80)
  const step = cardWidth + GAP
  const sideInset = (width - cardWidth) / 2 // centers the active card

  // Measure the track and keep it in sync on resize / rotation.
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => setWidth(el.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Slide to the selected index whenever it (or the measured width) changes.
  useLayoutEffect(() => {
    if (width === 0) return
    const controls = animate(x, sideInset - index * step, SNAP)
    return controls.stop
  }, [index, width, step, sideInset, x])

  function handleDragEnd(_event: unknown, info: PanInfo) {
    const { offset, velocity } = info
    let next = index
    if (offset.x < -step / 3 || velocity.x < -400) next = index + 1
    else if (offset.x > step / 3 || velocity.x > 400) next = index - 1
    next = Math.max(0, Math.min(decks.length - 1, next))

    if (next !== index) {
      onSelect(decks[next].id)
    } else {
      // No change — spring back to center.
      animate(x, sideInset - index * step, SNAP)
    }
  }

  return (
    <div>
      {/* Vertical padding gives the card shadows room to render inside the clip
          region; horizontal clipping stays at the (full-bleed) edges so cards
          slide in and out cleanly. clientWidth is unaffected by py, so the
          peek/snap math stays correct. */}
      <div ref={containerRef} className="overflow-hidden py-6">
        <motion.div
          className="flex"
          style={{ x, gap: GAP }}
          drag="x"
          dragConstraints={{
            left: sideInset - (decks.length - 1) * step,
            right: sideInset,
          }}
          dragElastic={0.12}
          onDragEnd={handleDragEnd}
        >
          {decks.map((deck, i) => (
            <div key={deck.id} style={{ width: cardWidth, flexShrink: 0 }}>
              <DeckCard
                deck={deck}
                active={i === index}
                onClick={() => onSelect(deck.id)}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Page dots — active one stretches to a pill. */}
      <div className="mt-1 flex items-center justify-center gap-2">
        {decks.map((deck, i) => (
          <button
            key={deck.id}
            type="button"
            aria-label={`Show ${deck.name}`}
            onClick={() => onSelect(deck.id)}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: i === index ? 22 : 8,
              background:
                i === index ? 'var(--color-ink)' : 'rgba(26,20,32,0.18)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
