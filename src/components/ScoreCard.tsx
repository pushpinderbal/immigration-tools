export function ScoreCard({
  label,
  total,
  max,
  rows,
  source,
  variant = 'full',
}: {
  label?: string
  total?: number
  max?: number
  rows: Array<{ label: string; value: number; max?: number }>
  source: string
  variant?: 'full' | 'breakdown'
}) {
  return (
    <div className="score-card score-breakdown">
      {variant === 'full' && total !== undefined && max !== undefined && (
        <div className="score-summary border-b border-line p-5 sm:p-6">
          <p className="score-instrument-label mb-4">{label}</p>
          <div className="flex items-baseline gap-2">
            <span
              role="status"
              aria-live="polite"
              className="score-total"
            >
              {total}
            </span>
            <span className="score-max">/ {max}</span>
          </div>
          <div className="score-breakdown-bar mt-5" aria-hidden="true">
            <div
              className="score-breakdown-fill"
              style={{ width: `${Math.max(0, Math.min(100, (total / max) * 100))}%` }}
            />
          </div>
        </div>
      )}
      <dl className="divide-y divide-line">
        {rows.map((r) => {
          const pct = r.max ? Math.max(0, Math.min(100, (r.value / r.max) * 100)) : 0
          return (
            <div key={r.label} className="score-breakdown-row">
              <div className="flex items-center justify-between">
                <dt className="text-xs font-medium text-muted">{r.label}</dt>
                <dd className="font-mono text-sm tabular-nums text-ink">
                  {r.value}
                  {r.max !== undefined && <span className="text-muted"> / {r.max}</span>}
                </dd>
              </div>
              <div className="score-breakdown-bar mt-2" aria-hidden="true">
                <div className="score-breakdown-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </dl>
      <p className="score-source">{source}</p>
    </div>
  )
}
