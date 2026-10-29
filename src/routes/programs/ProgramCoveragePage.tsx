import { Link } from 'react-router-dom'
import { Seo } from '../../components/Seo'
import { PROGRAM_COVERAGE, PROGRAMS_REVIEWED } from '../../lib/program-coverage'

export function ProgramCoveragePage() {
  return (
    <div className="coverage-page">
      <Seo title="Program coverage and official guides | ImmiCalc" path="/programs"
        description="See which Canadian provincial and territorial worker programs have calculators, their limits, and official guides for other programs." />
      <Link to="/" className="back-link">← All calculators</Link>
      <div className="coverage-header">
        <p className="tool-kicker">Reviewed {PROGRAMS_REVIEWED}</p>
        <h1 className="tool-title mt-3">Program coverage and official guides</h1>
        <p className="tool-description">
          Calculators cover selected worker programs in five provinces. Each program uses its own rules.
          Each official guide lists the full requirements. Coverage focuses on worker programs.
        </p>
      </div>
      <ul className="coverage-list">
        {PROGRAM_COVERAGE.map((entry) => (
          <li key={entry.code}>
            <div><p>{'calculator' in entry ? 'Calculator available' : 'Official guidance only'}</p><h2>{entry.name}</h2><p>{entry.program}</p></div>
            <p>{entry.detail}</p>
            <div className="coverage-links">
              {'calculator' in entry && <Link to={entry.calculator}>Open calculator</Link>}
              <a href={entry.source} target="_blank" rel="noreferrer">Official guide</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
