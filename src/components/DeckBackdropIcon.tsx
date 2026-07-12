import type { DeckId } from '../game/types'

// Large watermark icons that sit behind the deck cards — deliberately DIFFERENT
// from the small DeckIcon emblem so the background reads as texture rather than
// a repeat of the foreground mark. One motif per deck: a group of people for
// Social Life, a star for Growing Up, a lightning bolt for Hot Takes. Drawn on
// a 24x24 grid, stroked in currentColor.
const BACKDROP: Record<DeckId, React.ReactNode> = {
  social: (
    <>
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.2A3 3 0 0 1 17 11" />
      <path d="M15.8 14.2A6.5 6.5 0 0 1 21.5 20" />
    </>
  ),
  growingup: (
    <path d="M12 3l2.6 5.7 6.2.6-4.7 4.1 1.4 6.1L12 16.9 6.5 19.6l1.4-6.1L3.2 9.3l6.2-.6L12 3Z" />
  ),
  hottakes: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
}

export function DeckBackdropIcon({ id, size = 210 }: { id: DeckId; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {BACKDROP[id]}
    </svg>
  )
}
