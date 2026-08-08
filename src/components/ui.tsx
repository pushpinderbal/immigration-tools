import type { ReactNode } from 'react'

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function HelpLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${label}: official documentation`}
      title="Official documentation"
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-line text-[10px] font-semibold leading-none text-muted transition-colors hover:border-accent hover:text-accent"
    >
      ?
    </a>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('rounded-2xl border border-line bg-panel shadow-[0_1px_3px_rgb(15_23_42/0.06)]', className)}
    >
      {children}
    </div>
  )
}

export function Section({ title, children, help }: { title: string; children: ReactNode; help?: string }) {
  return (
    <Card>
      <h2 className="flex items-center gap-1.5 border-b border-line px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted sm:px-6">
        {title}
        {help && <HelpLink href={help} label={title} />}
      </h2>
      <div className="space-y-5 p-4 sm:p-6">{children}</div>
    </Card>
  )
}

export function Field({ label, children, help }: { label: string; children: ReactNode; help?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
        {label}
        {help && <HelpLink href={help} label={label} />}
      </span>
      {children}
    </div>
  )
}

export function Select({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  options: ReadonlyArray<{ value: string; label: string }>
  ariaLabel?: string
}) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-line bg-panel px-3 pr-9 text-sm text-ink outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T
  onChange: (value: T) => void
  options: ReadonlyArray<{ value: T; label: string }>
  ariaLabel?: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-grid auto-cols-fr grid-flow-col gap-1 rounded-lg border border-line bg-panel p-1"
    >
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-8 rounded-md text-xs font-medium transition-colors',
              active
                ? 'bg-accent text-white shadow-sm'
                : 'bg-transparent text-muted hover:bg-accent-soft hover:text-ink',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  help,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  help?: string
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
        {label}
        {help && <HelpLink href={help} label={label} />}
      </span>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-line bg-panel px-3 pr-12 font-mono text-sm tabular-nums text-ink outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {suffix && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted"
          >
            {suffix}
          </span>
        )}
      </div>
    </label>
  )
}

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  format,
  help,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  format?: (value: number) => string
  help?: string
}) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
          {label}
          {help && <HelpLink href={help} label={label} />}
        </span>
        <span className="font-mono text-2xl font-medium tabular-nums text-ink">
          {format ? format(value) : String(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider"
        style={{
          background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${pct}%, var(--color-line) ${pct}%, var(--color-line) 100%)`,
        }}
      />
    </div>
  )
}

export function CheckRow({
  label,
  checked,
  onChange,
  help,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  help?: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 cursor-pointer rounded accent-[var(--color-accent)]"
      />
      <span className="text-sm text-ink">{label}</span>
      {help && <HelpLink href={help} label={label} />}
    </label>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-xs italic leading-relaxed text-muted">{children}</p>
}
