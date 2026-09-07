import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '../../components/Seo'

const CanadaMap = lazy(() => import('../../components/CanadaMap').then((m) => ({ default: m.CanadaMap })))

export function HomePage() {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null)
  return (
    <div className="home-page mx-auto w-full max-w-6xl px-4 sm:px-6">
      <Seo
        title="Immigration Tools | ImmiCalc"
        description="Estimate your Canadian immigration points for Express Entry CRS and five provincial programs. Free, private calculators with instant results."
        path="/"
      />
      <section className="home-hero" aria-labelledby="home-title">
        <h1 id="home-title" className="home-title">
          Your PR Journey.
          <br />
          <span>Start with your score.</span>
        </h1>
        <p className="home-lede">
          Estimate your immigration points for Express Entry or a provincial program. Choose a calculator below to see
          where you stand.
        </p>
        <div className="home-assurances" aria-label="Calculator benefits">
          <span>Free to use</span>
          <span>No sign-up</span>
          <span>No personal information collected</span>
        </div>
      </section>

      <div className="home-grid">
        <Suspense fallback={<div className="map-card map-loading">Loading map of Canada...</div>}>
          <CanadaMap hovered={hoveredProvince} onHover={setHoveredProvince} />
        </Suspense>
        <div className="home-options">
          <Link to="/crs" viewTransition style={{ viewTransitionName: 'tile-crs' }} className="route-primary">
            <span className="route-tag">Federal calculator</span>
            <h2 className="route-primary-title">Express Entry (CRS)</h2>
            <p className="route-primary-description">
              Estimate your ranking in the federal pool and see where you could gain points.
            </p>
            <span className="route-cta">
              Calculate my CRS score <span aria-hidden="true">↗</span>
            </span>
          </Link>

          <section className="routes-card" aria-labelledby="routes-title">
            <div className="routes-card-header">
              <h2 id="routes-title" className="routes-card-title">
                Provincial calculators
              </h2>
              <p>Have a province in mind? Start here.</p>
            </div>
            <ul className="routes-list">
              {[
                { to: '/oinp', name: 'Ontario', detail: 'OINP', code: 'ON' },
                { to: '/bc', name: 'British Columbia', detail: 'BC PNP', code: 'BC' },
                { to: '/saskatchewan', name: 'Saskatchewan', detail: 'SINP', code: 'SK' },
                { to: '/alberta', name: 'Alberta', detail: 'AAIP', code: 'AB' },
                { to: '/manitoba', name: 'Manitoba', detail: 'MPNP', code: 'MB' },
              ].map((route) => (
                <li key={route.to}>
                  <Link
                    to={route.to}
                    viewTransition
                    className={`route-list-link${hoveredProvince === route.code.toLowerCase() ? ' is-highlighted' : ''}`}
                    onMouseEnter={() => setHoveredProvince(route.code.toLowerCase())}
                    onMouseLeave={() => setHoveredProvince(null)}
                    onFocus={() => setHoveredProvince(route.code.toLowerCase())}
                    onBlur={() => setHoveredProvince(null)}
                  >
                    <img
                      className="province-flag"
                      src={`/flags/${route.code.toLowerCase()}.png`}
                      alt=""
                      width="36"
                      height="24"
                    />
                    <span className="route-name">
                      {route.name} <span className="route-detail">{route.detail}</span>
                    </span>
                    <span className="route-list-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <p className="home-guidance">
        Each calculator uses its own program’s scoring system. Scores from different programs are not directly
        comparable.
      </p>
    </div>
  )
}
