import type { ReactNode } from 'react'

// The cream card face (deck label + prompt + a footer slot). Shared by the
// tap-to-answer card and the steer-drag card so the object stays identical when
// it pulls back into steering mode.

interface CardSurfaceProps {
  text: string
  /** Deck name shown as the corner tag and the big back title. */
  topic: string
  accent: string
  glow: string
  /** Blank the prompt (used while steering) — keep only the topic tag. */
  blank?: boolean
  footer?: ReactNode
}

// Prompt-length-aware typography. Short prompts stay big; long ones step down.
function promptClass(length: number): string {
  if (length <= 60) return 'text-[30px] leading-[1.2] text-balance'
  if (length <= 110) return 'text-[26px] leading-[1.24] text-balance'
  if (length <= 165) return 'text-[22px] leading-[1.3] text-pretty'
  return 'text-[19px] leading-[1.34] text-pretty'
}

export function CardSurface({
  text,
  topic,
  accent,
  glow,
  blank,
  footer,
}: CardSurfaceProps) {
  return (
    <div
      className="relative flex min-h-[58dvh] flex-col justify-between rounded-[var(--radius-card)] bg-[var(--color-cream)] px-7 pb-7 pt-6"
      style={{
        boxShadow: `0 26px 60px -22px ${glow}, 0 6px 18px rgba(20,16,26,0.12)`,
      }}
    >
      {!blank && (
        <div className="flex items-center">
          <span
            className="text-[13px] font-bold uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            {topic}
          </span>
        </div>
      )}

      {blank ? (
        <div className="flex flex-1 items-center justify-center">
          <span className="whitespace-nowrap text-[56px] font-bold uppercase leading-none tracking-[-0.03em] text-[var(--color-ink)]/20">
            {topic}
          </span>
        </div>
      ) : (
        <p
          className={`py-6 font-semibold tracking-[-0.01em] text-[var(--color-ink)] ${promptClass(
            text.length,
          )}`}
        >
          {text}
        </p>
      )}

      <div className="flex h-6 items-center">{footer}</div>
    </div>
  )
}
