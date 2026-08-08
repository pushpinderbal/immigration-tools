import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { MapleLeaf } from '../../components/MapleLeaf'
import { Seo } from '../../components/Seo'

const CanadaMap = lazy(() => import('../../components/CanadaMap').then((m) => ({ default: m.CanadaMap })))

export function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-12 pb-16 sm:px-6">
      <Seo
        title="Immigration Tools | ImmiCalc"
        description="Quick, straightforward Canadian immigration point calculators for Express Entry CRS and the provincial programs. Answer a few simple questions and get an instant estimate - no sign-up."
        path="/"
      />
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Immigration Tools</h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          A straightforward check of your Canadian immigration points. Answer a few questions, get an instant
          estimate. Everything runs in your browser; nothing is stored or tracked.
        </p>
      </div>

      <div className="mt-12 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Suspense
          fallback={
            <div className="flex h-[min(64vh,520px)] items-center justify-center rounded-2xl border border-line bg-panel text-sm text-muted shadow-[0_1px_3px_rgb(15_23_42/0.06)]">
              Loading map...
            </div>
          }
        >
          <CanadaMap />
        </Suspense>

        <div className="space-y-6">
          <Link
            to="/crs"
            viewTransition
            style={{ viewTransitionName: 'tile-crs' }}
            className="group flex flex-col gap-4 rounded-2xl border border-line bg-panel p-6 shadow-[0_1px_3px_rgb(15_23_42/0.06)] transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_8px_24px_rgb(15_23_42/0.08)]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                <MapleLeaf className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Federal</span>
                <span className="block text-base font-semibold tracking-tight text-ink">Express Entry (CRS)</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Your rank in the federal pool, scored on age, education, language and experience.
            </p>
            <span className="flex items-center gap-1.5 text-sm font-medium text-accent">
              Open calculator
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
