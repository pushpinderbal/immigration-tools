import { Children, isValidElement, type ReactNode } from 'react'

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
      className="help-link shrink-0"
    >
      ?
    </a>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('field-card', className)}>{children}</div>
  )
}

export function Section({ title, children, help }: { title: string; children: ReactNode; help?: string }) {
  return (
    <section className="field-card form-section" id={sectionId(title)} tabIndex={-1} aria-label={title}>
      <h2 className="section-heading">
        {title}
        {help && <HelpLink href={help} label={title} />}
      </h2>
      <div className="section-body space-y-5">{children}</div>
    </section>
  )
}

function sectionId(title: string) {
  return `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export function FormSections({ children }: { children: ReactNode }) {
  const sections = Children.toArray(children).filter(
    (child) => isValidElement<{ title: string }>(child) && child.type === Section,
  )
  return (
    <div className="space-y-5 min-w-0">
      <nav className="section-shortcuts" aria-label="Form sections">
        <span>Jump to</span>
        {sections.map((child) => {
          if (!isValidElement<{ title: string }>(child)) return null
          const { title } = child.props
          return <a key={title} href={`#${sectionId(title)}`}>{title}</a>
        })}
      </nav>
      {children}
    </div>
  )
}

export function Field({ label, children, help }: { label: string; children: ReactNode; help?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="field-label">
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
        className="select-control h-11 w-full cursor-pointer appearance-none px-3 pr-9 text-sm outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="select-chevron pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
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
  options: ReadonlyArray<{ value: T; label: ReactNode }>
  ariaLabel?: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="segmented-control"
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
              'segmented-option whitespace-nowrap',
              active && 'is-active',
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
      <span className="field-label">
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
          className="control h-11 w-full px-3 pr-12 font-mono text-sm tabular-nums outline-none"
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
        <span className="field-label">
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
    <label className="check-row flex cursor-pointer gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="check-control"
      />
      <span className="text-sm text-ink">{label}</span>
      {help && <HelpLink href={help} label={label} />}
    </label>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="note-copy">{children}</p>
}
