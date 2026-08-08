import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import canada from '@svg-maps/canada'
import { cn } from './ui'

const PROVINCE_ROUTES: Record<string, { to: string }> = {
  bc: { to: '/bc' },
  ab: { to: '/alberta' },
  sk: { to: '/saskatchewan' },
  mb: { to: '/manitoba' },
  on: { to: '/oinp' },
}

const PROVINCE_CODES: Record<string, string> = {
  ab: 'AB',
  bc: 'BC',
  mb: 'MB',
  nb: 'NB',
  nl: 'NL',
  ns: 'NS',
  nt: 'NT',
  nu: 'NU',
  on: 'ON',
  pe: 'PE',
  qc: 'QC',
  sk: 'SK',
  yt: 'YT',
}

/**
 * Polygon centroid of an SVG path. These map paths are a single closed
 * polygon of relative line segments (`m` start point, then relative pairs,
 * `z` to close), so we rebuild the absolute points and use the shoelace
 * formula. Good enough to sit a two-letter label on each province.
 */
function labelPosition(d: string): { x: number; y: number } {
  const nums = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)
  const pts: Array<{ x: number; y: number }> = [{ x: nums[0] ?? 0, y: nums[1] ?? 0 }]
  for (let i = 2; i + 1 < nums.length; i += 2) {
    const prev = pts[pts.length - 1]!
    pts.push({ x: prev.x + (nums[i] ?? 0), y: prev.y + (nums[i + 1] ?? 0) })
  }

  let twiceArea = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!
    const q = pts[(i + 1) % pts.length]!
    const f = p.x * q.y - q.x * p.y
    twiceArea += f
    cx += (p.x + q.x) * f
    cy += (p.y + q.y) * f
  }
  if (twiceArea === 0) return { x: 0, y: 0 }
  return { x: Math.round(cx / (3 * twiceArea)), y: Math.round(cy / (3 * twiceArea)) }
}

export function CanadaMap() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState<string | null>(null)

  const go = (to: string) => navigate(to, { viewTransition: true })

  const hoveredName = canada.locations.find((l) => l.id === hovered)?.name

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 shadow-[0_1px_3px_rgb(15_23_42/0.06)] sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Provincial calculators</h2>
        <p className="text-xs text-muted" aria-live="polite">
          {hoveredName ? `${hoveredName} - click to open` : 'Click a province'}
        </p>
      </div>

      <svg viewBox={canada.viewBox} role="img" aria-label="Map of Canada" className="mx-auto mt-4 block h-[min(64vh,520px)] w-auto">
        {canada.locations.map((loc) => {
          const entry = PROVINCE_ROUTES[loc.id]
          const pos = labelPosition(loc.path)
          return (
            <g key={loc.id}>
              <path
                d={loc.path}
                className={cn(
                  'transition-colors',
                  entry
                    ? 'cursor-pointer fill-accent-soft stroke-accent/60 hover:fill-accent hover:stroke-accent hover:brightness-95'
                    : 'fill-line/50 stroke-line',
                )}
                strokeWidth="1.5"
                strokeLinejoin="round"
                tabIndex={entry ? 0 : undefined}
                role={entry ? 'link' : undefined}
                aria-label={entry ? `${loc.name}: open calculator` : `${loc.name}: no calculator yet`}
                onClick={entry ? () => go(entry.to) : undefined}
                onKeyDown={
                  entry
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          go(entry.to)
                        }
                      }
                    : undefined
                }
                onMouseEnter={() => setHovered(loc.id)}
                onMouseLeave={() => setHovered((h) => (h === loc.id ? null : h))}
              >
                <title>{loc.name}</title>
              </path>
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={cn('pointer-events-none select-none font-semibold', entry ? 'fill-ink' : 'fill-muted/70')}
                style={{ fontSize: 20 }}
              >
                {PROVINCE_CODES[loc.id]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
