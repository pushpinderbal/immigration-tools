import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'

function useDirection(value: number): 'up' | 'down' | 'none' {
  const prev = useRef(value)
  const direction = value > prev.current ? 'up' : value < prev.current ? 'down' : 'none'
  useEffect(() => {
    prev.current = value
  }, [value])
  return direction
}

const DRIP_BURST_MS = 1500

/**
 * A pot that fills with water as the score climbs and drains when it falls.
 * Each change triggers a short burst of droplets: dripping into the opening
 * on the way up, leaking out the base on the way down. The burst lasts a
 * fixed time regardless of how many points moved.
 */
function ScorePot({ value, max }: { value: number; max: number }) {
  const direction = useDirection(value)
  const [burst, setBurst] = useState<'up' | 'down' | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (direction === 'up' || direction === 'down') {
      setBurst(direction)
      if (timer.current !== null) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setBurst(null), DRIP_BURST_MS)
    }
  }, [direction])

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const waterHeight = (pct / 100) * 32
  const waterTop = 52 - waterHeight

  return (
    <svg viewBox="0 0 64 64" className="h-28 w-20 shrink-0" aria-hidden="true">
      <defs>
        <clipPath id="score-pot-clip">
          <path d="M10 12 h44 l-3 32 c-1 8 -37 8 -38 0 Z" />
        </clipPath>
        <linearGradient id="score-pot-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <path d="M10 12 h44 l-3 32 c-1 8 -37 8 -38 0 Z" fill="var(--color-paper)" />
      <path
        d="M10 12 h44 l-3 32 c-1 8 -37 8 -38 0 Z"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse cx="32" cy="12" rx="22" ry="4" fill="none" stroke="var(--color-accent)" strokeWidth="2" />

      <g clipPath="url(#score-pot-clip)">
        <rect
          x="8"
          y={waterTop}
          width="48"
          height={waterHeight}
          fill="url(#score-pot-water)"
          style={{ transition: 'height 0.7s ease, y 0.7s ease' }}
        />
        <path d="M12 28h40M12 38h40" stroke="var(--color-panel)" strokeOpacity="0.38" strokeWidth="1" />
      </g>

      <path d="M56 18h4M56 28h4M56 38h4M56 48h4" stroke="var(--color-warn)" strokeWidth="1.25" />

      {burst === 'up' && (
        <>
          <ellipse className="drip-in" cx="25" cy="2" rx="2" ry="3" fill="var(--color-accent)" />
          <ellipse
            className="drip-in"
            cx="40"
            cy="2"
            rx="2"
            ry="3"
            fill="var(--color-accent)"
            style={{ animationDelay: '0.45s' }}
          />
        </>
      )}
      {burst === 'down' && (
        <>
          <ellipse className="drip-out" cx="27" cy="52" rx="2" ry="3" fill="var(--color-accent)" />
          <ellipse
            className="drip-out"
            cx="39"
            cy="52"
            rx="2"
            ry="3"
            fill="var(--color-accent)"
            style={{ animationDelay: '0.4s' }}
          />
        </>
      )}
    </svg>
  )
}

export function ToolSidebar({
  label,
  total,
  max,
  breakdown,
  draws,
}: {
  label: string
  total: number
  max: number
  breakdown: ReactNode
  draws?: ReactNode
}) {
  const [active, setActive] = useState<'breakdown' | 'draws' | null>(null)

  return (
    <div className="contents tool-sidebar lg:block lg:space-y-4 lg:sticky lg:top-6 lg:self-start">
      <div className="order-first sticky top-0 z-10">
        <div className="score-instrument p-4 pt-5 sm:p-5">
          <p className="score-instrument-label mb-4">{label}</p>
          <div className="flex items-center gap-3">
            <ScorePot value={total} max={max} />
            <div className="flex flex-col">
              <span role="status" aria-live="polite" className="score-total">
                {total}
              </span>
              <span className="score-max mt-2">of {max}</span>
            </div>
          </div>
          <p className="score-hint">Updates as you answer. Open your breakdown to explore each scoring factor.</p>
        </div>
      </div>

      <div className="score-actions order-first" role="group" aria-label="Score details">
        <button
          type="button"
          className="score-action"
          aria-label="Breakdown"
          aria-haspopup="dialog"
          onClick={() => setActive('breakdown')}
        >
          <span className="score-action-icon" aria-hidden="true">
            ▤
          </span>
          <span>
            <span className="score-action-title">Breakdown</span>
            <span className="score-action-description">See how your points add up</span>
          </span>
          <span aria-hidden="true">↗</span>
        </button>
        {draws !== undefined && (
          <button
            type="button"
            className="score-action"
            aria-label="Historical draws"
            aria-haspopup="dialog"
            onClick={() => setActive('draws')}
          >
            <span className="score-action-icon is-history" aria-hidden="true">
              ↗
            </span>
            <span>
              <span className="score-action-title">Historical draws</span>
              <span className="score-action-description">Explore recent invitation rounds</span>
            </span>
            <span aria-hidden="true">↗</span>
          </button>
        )}
      </div>

      <ScoreDetailsDialog
        open={active === 'breakdown'}
        onClose={() => setActive(null)}
        title="Score breakdown"
        label={label}
      >
        <p className="dialog-score">
          <strong>{total}</strong> / {max} points
        </p>
        <p className="details-intro">
          Your points, factor by factor. Return to the calculator to try different answers.
        </p>
        {breakdown}
      </ScoreDetailsDialog>
      {draws !== undefined && (
        <ScoreDetailsDialog
          open={active === 'draws'}
          onClose={() => setActive(null)}
          title="Draw history"
          label="Express Entry"
        >
          {draws}
        </ScoreDetailsDialog>
      )}
    </div>
  )
}

function ScoreDetailsDialog({
  open,
  onClose,
  title,
  label,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  label: string
  children: ReactNode
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="score-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose()
      }}
    >
      {open && (
        <>
          <header className="score-dialog-header">
            <div>
              <p className="section-kicker">{label}</p>
              <h2 id={titleId}>{title}</h2>
            </div>
            <button
              type="button"
              className="dialog-close"
              aria-label={`Close ${title.toLowerCase()}`}
              autoFocus
              onClick={onClose}
            >
              ×
            </button>
          </header>
          <div className="score-dialog-body">{children}</div>
        </>
      )}
    </dialog>
  )
}
