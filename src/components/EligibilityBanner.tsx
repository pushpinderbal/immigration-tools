export function EligibilityBanner({ eligible, reasons }: { eligible: boolean; reasons?: string[] }) {
  const notes = reasons ?? []

  if (eligible) {
    return (
      <div className="eligibility-banner is-eligible" aria-live="polite">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eligibility-icon is-eligible">
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12.5 2.5 2.5 4.5-5" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-ink">You appear eligible</p>
          {notes.length > 0 && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted">{notes.join(' ')}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="eligibility-banner is-ineligible" aria-live="polite">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eligibility-icon is-ineligible">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <div>
        <p className="text-sm font-semibold text-ink">Not eligible yet</p>
        <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted">
          {notes.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
