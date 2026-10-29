import { CheckRow, Field, Note, NumberInput, Select } from '../../components/ui'
import { HIGH_WAGE_DOC, HIGH_WAGE_OCCUPATIONS } from '../../lib/crs/high-wage-occupations'
import { CRS_CHANGES_DOC } from '../../lib/crs/labour-market'
import type { CrsInput } from '../../lib/crs/types'
import { PlusIcon } from '../../components/icons'

type LabourMarketFields = Pick<CrsInput, 'jobOfferNoc' | 'qualifyingJobOffer' | 'highWageWork'>

const NOC_OPTIONS = [
  { value: '', label: 'None / occupation not listed' },
  ...Object.entries(HIGH_WAGE_OCCUPATIONS)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([noc, occupation]) => ({ value: noc, label: `${noc} - ${occupation.title}` })),
]

export function HighWageFields({ input, onChange }: {
  input: CrsInput
  onChange: (changes: LabourMarketFields) => void
}) {
  const periods = input.highWageWork ?? []
  return (
    <>

      <Field label="Job offer occupation (NOC)" help={HIGH_WAGE_DOC}>
        <Select ariaLabel="Job offer occupation (NOC)" value={input.jobOfferNoc ?? ''}
          onChange={(jobOfferNoc) => onChange({ jobOfferNoc })} options={NOC_OPTIONS} />
      </Field>
      <CheckRow label="My offer meets IRCC's qualifying job offer requirements"
        checked={input.qualifyingJobOffer ?? false}
        onChange={(qualifyingJobOffer) => onChange({ qualifyingJobOffer })} help={CRS_CHANGES_DOC} />
      <details className="program-notes"><summary>Job offer criteria</summary><div>      <Note>
        Generally, the offer must be for full-time, continuous work in Canada for at least one year after permanent
        residence. Special provisions apply to skilled trades and certain physicians. IRCC assesses whether the offer is genuine.
      </Note></div></details>
      <p className="text-sm font-semibold">Qualifying Canadian work in high-wage occupations</p>

      {periods.map((period, index) => (
        <div key={index} className="work-period">
          <Field label={`Work occupation ${index + 1} (NOC)`} help={HIGH_WAGE_DOC}>
            <Select ariaLabel={`Work occupation ${index + 1} (NOC)`} value={period.noc}
              options={NOC_OPTIONS} onChange={(noc) => onChange({
                highWageWork: periods.map((p, i) => i === index ? { ...p, noc } : p),
              })} />
          </Field>
          <NumberInput label={`Qualifying months ${index + 1}`} value={String(period.months)} min={0} step={0.5}
            help={CRS_CHANGES_DOC} onChange={(value) => onChange({
              highWageWork: periods.map((p, i) => i === index ? { ...p, months: Math.max(0, Number(value) || 0) } : p),
            })} />
          <button type="button" className="text-sm text-accent underline" aria-label={`Remove work period ${index + 1}`}
            onClick={() => onChange({ highWageWork: periods.filter((_, i) => i !== index) })}>Remove period</button>
        </div>
      ))}
      <button type="button" className="add-language flex w-full items-center justify-center gap-2 text-sm"
        onClick={() => onChange({ highWageWork: [...periods, { noc: '', months: 0 }] })}><PlusIcon size={18} aria-hidden="true" />Add Canadian work period</button>
      {periods.some((p) => p.months > 0) && input.canadianWorkYears === 0 && (
        <Note>Select at least one completed year of Canadian work experience in Experience to claim high-wage experience points.</Note>
      )}
      <details className="program-notes"><summary>How high-wage points are calculated</summary><div>      <Note>
        From November 3, 2026, IRCC uses the occupation's published NOC wage level, regardless of your personal salary.
        You receive the higher of Canadian work duration plus qualifying high-wage experience, or a qualifying job offer.
        These options do not stack. An LMIA is not required under these rules.
      </Note>      <Note>
        Add non-overlapping full-time-equivalent months of eligible Canadian work within the last 10 years.
        Count no more than 30 hours per week across concurrent jobs. Enter your total completed Canadian work years
        in Experience as well. Different NOCs can combine to reach 12 months at a qualifying wage level.
      </Note></div></details>
    </>
  )
}
