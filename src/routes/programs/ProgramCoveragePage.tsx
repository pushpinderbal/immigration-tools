import { Link } from 'react-router-dom'
import { Seo } from '../../components/Seo'
import { PROGRAM_COVERAGE, PROGRAMS_REVIEWED } from '../../lib/program-coverage'

export function ProgramCoveragePage() {
  return (
    <div className="tool-page px-4 sm:px-6">
      <Seo title="Program coverage and official guides | ImmiCalc" path="/programs"
        description="See which Canadian provincial and territorial worker programs have calculators, their limits, and official guides for other programs." />
      <Link to="/" className="back-link">← All calculators</Link>
      <div className="tool-header">
        <p className="tool-kicker">Reviewed {PROGRAMS_REVIEWED}</p>
        <h1 className="tool-title mt-3">Program coverage and official guides</h1>
        <p className="tool-description">
          Calculators cover selected worker programs in five provinces. Each program uses its own rules.
          These estimates do not confirm eligibility, an invitation or nomination. Business and entrepreneur grids are not covered.
        </p>
      </div>
      <ul className="my-8 grid gap-4 sm:grid-cols-2">
        {PROGRAM_COVERAGE.map((entry) => (
          <li key={entry.code} className="rounded-2xl border border-line p-5">
            <p className="text-xs text-muted">{'calculator' in entry ? 'Calculator available' : 'Official guidance only'}</p>
            <h2 className="mt-2 text-lg font-semibold">{entry.name}</h2>
            <p className="mt-1 text-sm font-medium">{entry.program}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{entry.detail}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-accent underline">
              {'calculator' in entry && <Link to={entry.calculator}>Open calculator</Link>}
              <a href={entry.source} target="_blank" rel="noreferrer">Official guide</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
