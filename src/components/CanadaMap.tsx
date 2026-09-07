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

export function CanadaMap({
  hovered,
  onHover: setHovered,
}: {
  hovered: string | null
  onHover: (id: string | null) => void
}) {
  const navigate = useNavigate()

  const go = (to: string) => navigate(to, { viewTransition: true })

  const hoveredName = canada.locations.find((l) => l.id === hovered)?.name

  return (
    <section className="map-card" aria-labelledby="map-title">
      <div className="map-card-header">
        <div>
          <p className="section-kicker">Explore Canada</p>
          <h2 id="map-title" className="map-card-title mt-2">
            Where do you see yourself?
          </h2>
          <p className="map-description">Select a highlighted province to estimate your points.</p>
        </div>
      </div>

      <div className="map-stage">
        <svg
          viewBox={canada.viewBox}
          role="img"
          aria-label="Map of Canada"
          className="mx-auto mt-4 block h-auto max-h-[min(64vh,520px)] w-full"
        >
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
                      ? 'map-province cursor-pointer fill-accent-soft stroke-accent/70'
                      : 'fill-mineral/80 stroke-line',
                    entry && hovered === loc.id && 'is-highlighted',
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
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(loc.id)}
                  onBlur={() => setHovered(null)}
                >
                  <title>{loc.name}</title>
                </path>
                {entry && (
                  <image
                    href={`/flags/${loc.id}.png`}
                    x={pos.x - 27}
                    y={pos.y - 16}
                    width="54"
                    height="32"
                    preserveAspectRatio="xMidYMid meet"
                    className="map-flag pointer-events-none"
                    aria-hidden="true"
                  />
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <p className="map-selection" aria-live="polite">
        {hoveredName
          ? `${hoveredName} · ${PROVINCE_ROUTES[hovered ?? ''] ? 'Open calculator ↗' : 'No calculator available yet'}`
          : 'Five provinces. A place to start.'}
      </p>
      <div className="map-legend" aria-label="Map legend">
        <span className="map-legend-item">
          <span className="map-legend-swatch" aria-hidden="true" />
          Calculator available
        </span>
        <span className="map-legend-item">
          <span className="map-legend-swatch is-muted" aria-hidden="true" />
          Not available yet
        </span>
      </div>
    </section>
  )
}
