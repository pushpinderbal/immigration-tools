import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Segmented } from './ui'

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
    <svg viewBox="0 0 64 64" className="h-24 w-16 shrink-0" aria-hidden="true">
      <defs>
        <clipPath id="score-pot-clip">
          <path d="M10 12 h44 l-3 32 c-1 8 -37 8 -38 0 Z" />
        </clipPath>
        <linearGradient id="score-pot-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <path
        d="M10 12 h44 l-3 32 c-1 8 -37 8 -38 0 Z"
        fill="none"
        stroke="var(--color-line)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <ellipse cx="32" cy="12" rx="22" ry="4" fill="none" stroke="var(--color-line)" strokeWidth="2.5" />

      <g clipPath="url(#score-pot-clip)">
        <rect
          x="8"
          y={waterTop}
          width="48"
          height={waterHeight}
          fill="url(#score-pot-water)"
          style={{ transition: 'height 0.7s ease, y 0.7s ease' }}
        />
      </g>

      {burst === 'up' && (
        <>
          <ellipse className="drip-in" cx="25" cy="2" rx="2" ry="3" fill="var(--color-accent)" />
          <ellipse className="drip-in" cx="40" cy="2" rx="2" ry="3" fill="var(--color-accent)" style={{ animationDelay: '0.45s' }} />
        </>
      )}
      {burst === 'down' && (
        <>
          <ellipse className="drip-out" cx="27" cy="52" rx="2" ry="3" fill="var(--color-accent)" />
          <ellipse className="drip-out" cx="39" cy="52" rx="2" ry="3" fill="var(--color-accent)" style={{ animationDelay: '0.4s' }} />
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
  const [tab, setTab] = useState<'breakdown' | 'draws'>('breakdown')
  const hasDraws = draws !== undefined

  return (
    <div className="no-scrollbar space-y-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto lg:pb-1">
      <div className="lg:sticky lg:top-0 lg:z-10">
        <div className="rounded-2xl border border-line bg-panel p-5 shadow-[0_1px_3px_rgb(15_23_42/0.06)]">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
          <div className="flex items-center gap-4">
            <ScorePot value={total} max={max} />
            <div className="flex flex-col">
              <span
                role="status"
                aria-live="polite"
                className="font-mono text-5xl font-semibold leading-none tabular-nums text-accent"
              >
                {total}
              </span>
              <span className="mt-1 font-mono text-sm tabular-nums text-muted">of {max}</span>
            </div>
          </div>
        </div>
      </div>

      {hasDraws ? (
        <Segmented
          ariaLabel="Sidebar"
          value={tab}
          onChange={(v) => setTab(v)}
          options={[
            { value: 'breakdown', label: 'Breakdown' },
            { value: 'draws', label: 'Historical draws' },
          ]}
        />
      ) : (
        <Segmented
          ariaLabel="Sidebar"
          value="breakdown"
          onChange={() => {}}
          options={[{ value: 'breakdown', label: 'Points breakdown' }]}
        />
      )}

      {hasDraws && tab === 'draws' ? draws : breakdown}
    </div>
  )
}
