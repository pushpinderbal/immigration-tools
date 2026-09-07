import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '../../components/Seo'

const CanadaMap = lazy(() => import('../../components/CanadaMap').then((m) => ({ default: m.CanadaMap })))

export function HomePage() {
  return (
    <div className="home-page mx-auto w-full max-w-6xl px-4 sm:px-6">
      <Seo
        title="Immigration Tools | ImmiCalc"
        description="Calculate your Canadian immigration points for Express Entry CRS and the provincial programs (OINP, BC PNP, SINP, AAIP, MPNP). Answer a few simple questions and get an instant estimate."
        path="/"
      />

      <section className="home-hero" aria-labelledby="home-title">
        <div>
          <p className="home-eyebrow">IMMICALC / CANADIAN IMMIGRATION FIELD ATLAS</p>
          <h1 id="home-title" className="home-title">Immigration Tools</h1>
          <p className="home-lede">
            A clear field guide to the points that shape your next move. Choose a route, answer a few questions, and
            get an instant estimate in your browser.
          </p>
        </div>
        <aside className="home-hero-note" aria-label="Calculator field note">
          <p className="section-kicker">FIELD NOTE / 0001</p>
          <p className="home-note-value">06 live calculators</p>
          <p className="home-note-copy">
            Federal CRS plus five provincial programs. Your entries stay on this device.
          </p>
        </aside>
      </section>

      <div className="home-grid">
        <Suspense
          fallback={
            <div className="map-card flex h-[min(64vh,520px)] items-center justify-center text-sm text-muted">
              Loading field map...
            </div>
          }
        >
          <CanadaMap />
        </Suspense>

        <section className="routes-card" aria-labelledby="routes-title">
          <div className="routes-card-header">
            <div>
              <p className="section-kicker">ROUTE REGISTER / 06</p>
              <h2 id="routes-title" className="routes-card-title mt-2">Choose your route</h2>
            </div>
            <span className="coordinate-label">CAN / 2026<br />POINTS EDITION</span>
          </div>

          <Link
            to="/crs"
            viewTransition
            style={{ viewTransitionName: 'tile-crs' }}
            className="route-primary"
          >
            <span className="route-index">01 / FEDERAL</span>
            <span className="route-name block">Express Entry (CRS)</span>
            <span className="route-detail block">Comprehensive Ranking System estimate for the federal pool.</span>
            <span className="route-arrow" aria-hidden="true">↗</span>
          </Link>

          <div className="routes-list-heading">
            <h3 className="section-kicker">Provincial programs</h3>
            <span className="coordinate-label">05 FIELD ROUTES</span>
          </div>

          <ol className="routes-list">
            {[
              { to: '/oinp', name: 'OINP Points Calculator', detail: 'Ontario / employer job offer' },
              { to: '/bc', name: 'BC PNP Points Calculator', detail: 'British Columbia / skills' },
              { to: '/saskatchewan', name: 'SINP Calculator', detail: 'Saskatchewan / EOI' },
              { to: '/alberta', name: 'AAIP Calculator', detail: 'Alberta / worker streams' },
              { to: '/manitoba', name: 'MPNP Calculator', detail: 'Manitoba / EOI' },
            ].map((route, index) => (
              <li key={route.to}>
                <Link to={route.to} viewTransition className="route-list-link">
                  <span className="route-index" aria-hidden="true">{String(index + 2).padStart(2, '0')}</span>
                  <span>
                    <span className="route-name block">{route.name}</span>
                    <span className="route-detail block">{route.detail}</span>
                  </span>
                  <span className="font-mono text-sm text-muted" aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ol>

          <p className="privacy-note">
            <span className="privacy-note-mark" aria-hidden="true" />
            <span>
              Private by design. Scores are calculated locally and nothing is stored or tracked. Always verify a
              result against the official program page.
            </span>
          </p>
        </section>
      </div>
    </div>
  )
}
