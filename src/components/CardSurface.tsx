import type { ReactNode } from 'react'

// The cream card face (deck tag + prompt + a footer slot) for the tap-to-answer
// state. While steering, GameScreen swaps in a color-shifting panel instead, so
// this component only ever renders the answerable face.

interface CardSurfaceProps {
  text: string
  /** Deck name shown as the corner tag. */
  topic: string
  accent: string
  footer?: ReactNode
}

// Prompt-length-aware typography. Short prompts stay big; long ones step down.
function promptClass(length: number): string {
  if (length <= 60) return 'text-[30px] leading-[1.2] text-balance'
  if (length <= 110) return 'text-[26px] leading-[1.24] text-balance'
  if (length <= 165) return 'text-[22px] leading-[1.3] text-pretty'
  return 'text-[19px] leading-[1.34] text-pretty'
}

export function CardSurface({ text, topic, accent, footer }: CardSurfaceProps) {
  return (
    <div
      className="relative flex min-h-[58dvh] flex-col justify-between rounded-[var(--radius-card)] bg-[var(--color-cream)] px-7 pb-7 pt-6 shadow-[0_4px_14px_rgba(20,16,26,0.12)]"
    >
      <div className="flex items-center">
        <span
          className="text-[13px] font-bold uppercase tracking-[0.2em]"
          style={{ color: accent }}
        >
          {topic}
        </span>
      </div>

      <p
        className={`py-6 font-semibold tracking-[-0.01em] text-[var(--color-ink)] ${promptClass(
          text.length,
        )}`}
      >
        {text}
      </p>

      <div className="flex h-6 items-center">{footer}</div>
    </div>
  )
}
