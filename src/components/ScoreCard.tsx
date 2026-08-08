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
    <div className="rounded-2xl border border-line bg-panel shadow-[0_1px_3px_rgb(15_23_42/0.06)]">
      {variant === 'full' && total !== undefined && max !== undefined && (
        <div className="border-b border-line p-5 sm:p-6">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
          <div className="flex items-baseline gap-2">
            <span
              role="status"
              aria-live="polite"
              className="font-mono text-7xl font-semibold leading-none tabular-nums text-accent"
            >
              {total}
            </span>
            <span className="font-mono text-sm tabular-nums text-muted">/ {max}</span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-bg">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${(total / max) * 100}%` }}
            />
          </div>
        </div>
      )}
      <dl className="divide-y divide-line">
        {rows.map((r) => {
          const pct = r.max ? (r.value / r.max) * 100 : 0
          return (
            <div key={r.label} className="px-5 py-3">
              <div className="flex items-center justify-between">
                <dt className="text-xs font-medium text-muted">{r.label}</dt>
                <dd className="font-mono text-sm tabular-nums text-ink">
                  {r.value}
                  {r.max !== undefined && <span className="text-muted"> / {r.max}</span>}
                </dd>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bg">
                <div
                  className="h-full rounded-full bg-accent/30 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </dl>
      <div className="border-t border-line px-5 py-3">
        <p className="text-[11px] leading-relaxed text-muted">{source}</p>
      </div>
    </div>
  )
}
