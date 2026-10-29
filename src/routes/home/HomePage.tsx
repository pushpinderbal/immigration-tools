import { ArrowRightIcon } from '../../components/icons'
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
        description="Calculate Canadian immigration points for Express Entry CRS and five provincial worker programs."
        path="/"
      />
      <section className="home-hero" aria-labelledby="home-title">
        <p className="home-overline">Federal and provincial programs</p>
        <h1 id="home-title" className="home-title">Immigration points.</h1>
        <p className="home-lede">Choose a program. Change your answers and compare the estimates.</p>
      </section>

      <div className="home-grid">
        <div className="home-options">
          <Link to="/crs" viewTransition style={{ viewTransitionName: 'tile-crs' }} className="route-primary">
            <span className="route-tag">Federal calculator</span>
            <h2 className="route-primary-title">Express Entry (CRS)</h2>
            <p className="route-primary-description">
              Federal ranking points for age, credentials, language and experience.
            </p>
            <span className="route-cta">
              Open calculator <ArrowRightIcon size={20} aria-hidden="true" />
            </span>
          </Link>

          <section className="routes-card" aria-labelledby="routes-title">
            <div className="routes-card-header">
              <h2 id="routes-title" className="routes-card-title">
                Provincial calculators
              </h2>

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
                      <ArrowRightIcon size={18} aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <Suspense fallback={<div className="map-card map-loading">Loading map of Canada...</div>}>
          <CanadaMap hovered={hoveredProvince} onHover={setHoveredProvince} />
        </Suspense>

      </div>
      <p className="home-guidance">
        Calculators currently cover selected worker programs in five provinces.{' '}
        <Link to="/programs" className="text-accent underline">See coverage and official guides for all provinces and territories</Link>.
      </p>
      <p className="home-guidance">
        Each program has its own scoring criteria and eligibility requirements.
      </p>
    </div>
  )
}
