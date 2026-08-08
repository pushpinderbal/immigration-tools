export function EligibilityBanner({ eligible, reasons }: { eligible: boolean; reasons?: string[] }) {
  const notes = reasons ?? []

  if (eligible) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-accent/40 bg-accent-soft px-4 py-3">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0 text-accent">
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12.5 2.5 2.5 4.5-5" />
        </svg>
        <div>
          <p className="text-sm font-medium text-ink">You appear eligible</p>
          {notes.length > 0 && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted">{notes.join(' ')}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-warn/40 bg-warn-soft px-4 py-3">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0 text-warn">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <div>
        <p className="text-sm font-medium text-ink">Not eligible yet</p>
        <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted">
          {notes.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
