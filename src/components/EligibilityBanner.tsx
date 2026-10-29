import { CaretDownIcon, CheckCircleIcon, WarningCircleIcon } from './icons'

export function EligibilityBanner({ eligible, reasons = [] }: { eligible: boolean; reasons?: string[] }) {
  return <details className={`eligibility-banner ${eligible ? 'is-eligible' : 'is-ineligible'}`}>
    <summary>
      {eligible ? <CheckCircleIcon size={17} aria-hidden="true" /> : <WarningCircleIcon size={17} aria-hidden="true" />}
      <span>{eligible ? 'Initial checks passed' : 'Requirements to review'}</span>
      {!eligible && <span className="eligibility-count">{reasons.length}</span>}
      <CaretDownIcon size={13} aria-hidden="true" />
    </summary>
    <div><p>Based on the answers entered. Review the full stream requirements before applying.</p>
      {reasons.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-4">{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>}
    </div>
  </details>
}
