import { Children, isValidElement, useEffect, useId, useRef, useState, type ReactNode, type ReactElement, type KeyboardEvent } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, CaretDownIcon, InfoIcon, PencilSimpleIcon } from './icons'
import { ScoreActionsSlot } from './CalculatorChrome'

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function HelpLink({ href, label }: { href: string; label: string }) {
  return <a href={href} target="_blank" rel="noreferrer" aria-label={`${label}: official documentation`}
    title="Official documentation" className="help-link"><InfoIcon size={17} aria-hidden="true" /></a>
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('field-card', className)}>{children}</div>
}

interface SectionProps {
  title: string
  children: ReactNode
  help?: string
  description?: string
  tabLabel?: string
  summary?: string
}

export function Section({ title, children, help, description }: SectionProps) {
  return <section className="form-section" id={sectionId(title)} aria-label={title}>
    <header className="section-header">
      <h2 className="section-heading">{title}</h2>
      {description && <p className="section-description">{description}</p>}
      {help && <a className="section-source" href={help} target="_blank" rel="noreferrer">Official scoring criteria <InfoIcon size={16} aria-hidden="true" /></a>}
    </header>
    <div className="section-body">{children}</div>
  </section>
}

function sectionId(title: string) {
  return `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export function FormSections({ children }: { children: ReactNode }) {
  const all = Children.toArray(children)
  const sections = all.filter((child): child is ReactElement<SectionProps> => isValidElement<SectionProps>(child) && child.type === Section)
  const notes = all.filter((child) => !isValidElement(child) || child.type !== Section)
  const [selected, setSelected] = useState<string | null>(null)
  const [direction, setDirection] = useState('forward')
  const activeIndex = Math.max(0, sections.findIndex((section) => section.props.title === selected))
  const active = sections[activeIndex]
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const baseId = useId()

  function activate(index: number, focus = false) {
    setDirection(index < activeIndex ? 'back' : 'forward')
    setSelected(sections[index]!.props.title)
    if (focus) tabRefs.current[index]?.focus()
  }
  function onTabKey(event: KeyboardEvent, index: number) {
    const keys: Record<string, number> = {
      ArrowRight: (index + 1) % sections.length,
      ArrowLeft: (index - 1 + sections.length) % sections.length,
      Home: 0, End: sections.length - 1,
    }
    if (keys[event.key] !== undefined) {
      event.preventDefault()
      activate(keys[event.key]!, true)
    }
  }

  return <div className="answer-workspace">
    <div className="answer-tabs" role="tablist" aria-label="Answer sections">
      {sections.map((section, index) => <button key={section.props.title} type="button" role="tab"
        id={`${baseId}-tab-${index}`} aria-selected={activeIndex === index} aria-controls={`${baseId}-panel-${index}`}
        tabIndex={activeIndex === index ? 0 : -1} ref={(element) => { tabRefs.current[index] = element }}
        onClick={() => activate(index)} onKeyDown={(event) => onTabKey(event, index)}>
        {section.props.tabLabel ?? section.props.title}
      </button>)}
    </div>
    <div className="answer-canvas" data-direction={direction}>
      {sections.map((section, index) => <div key={section.props.title} role="tabpanel"
        id={`${baseId}-panel-${index}`} aria-labelledby={`${baseId}-tab-${index}`} hidden={index !== activeIndex}>
        {section}
      </div>)}
    </div>
    {active && <div className="section-navigation" aria-label="Section navigation">
      <button type="button" disabled={activeIndex === 0} onClick={() => activate(activeIndex - 1, true)}><ArrowLeftIcon size={18} />Previous section</button>
      <span>{activeIndex + 1} / {sections.length}</span>
      <button type="button" disabled={activeIndex === sections.length - 1} onClick={() => activate(activeIndex + 1, true)}>Next section<ArrowRightIcon size={18} /></button>
    </div>}
    <div className="answer-receipt" aria-label="Your answers">
      <span className="receipt-label">Your answers</span>
      <div className="receipt-values">
        {sections.filter((section) => section.props.summary).map((section) => <button key={section.props.title} type="button"
          className={cn('receipt-answer', active?.props.title === section.props.title && 'is-current')}
          aria-label={`Edit ${section.props.tabLabel ?? section.props.title}`}
          onClick={() => activate(sections.indexOf(section), true)}>
          <span>{section.props.tabLabel ?? section.props.title}</span>
          <strong>{section.props.summary}</strong><PencilSimpleIcon size={15} aria-hidden="true" />
        </button>)}
      </div>
      <ScoreActionsSlot />
    </div>
    {notes.length > 0 && <details className="program-notes"><summary><InfoIcon size={16} />Program notes</summary><div>{notes}</div></details>}
  </div>
}

export function Field({ label, children, help }: { label: string; children: ReactNode; help?: string }) {
  return <div className="field"><span className="field-label">{label}{help && <HelpLink href={help} label={label} />}</span>{children}</div>
}

export function Select({ value, onChange, options, ariaLabel }: {
  value: string
  onChange: (value: string) => void
  options: ReadonlyArray<{ value: string; label: string }>
  ariaLabel?: string
}) {
  const years = options.filter((option) => option.value !== '')
  const isYears = years.length >= 4 && years.length <= 8 && years.every((option, index) => option.value === String(index)) && years.some((option) => /year/i.test(option.label))
  if (isYears) return <RangeControl label={ariaLabel ?? 'Years'} value={Number(value) || 0} min={0} max={years.length - 1}
    onChange={(next) => onChange(String(next))} format={(next) => next === years.length - 1 ? `${next}+` : String(next)} unit="years" />
  return <div className="select-wrap"><select aria-label={ariaLabel} value={value} onChange={(event) => onChange(event.target.value)} className="select-control">
    {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
  </select><CaretDownIcon size={17} className="select-chevron" aria-hidden="true" /></div>
}

export function Segmented<T extends string>({ value, onChange, options, ariaLabel }: {
  value: T; onChange: (value: T) => void; options: ReadonlyArray<{ value: T; label: ReactNode }>; ariaLabel?: string
}) {
  return <div role="group" aria-label={ariaLabel} className="segmented-control">
    {options.map((option) => <button key={option.value} type="button" aria-pressed={value === option.value}
      onClick={() => onChange(option.value)} className={cn('segmented-option', value === option.value && 'is-active')}>{option.label}</button>)}
  </div>
}

export function RangeControl({ label, value, onChange, min, max, step = 1, format, unit }: {
  label: string; value: number; onChange: (value: number) => void; min: number; max: number; step?: number;
  format?: (value: number) => string; unit?: string
}) {
  const [draft, setDraft] = useState(String(value))
  useEffect(() => setDraft(String(value)), [value])
  const normalize = (next: number) => Math.min(max, Math.max(min, Math.floor(next / step) * step))
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min || 1)) * 100))
  const tickValues = max - min <= 7 ? Array.from({ length: max - min + 1 }, (_, index) => min + index) : [min, Math.round((min + max) / 2), max]
  return <div className="range-control">
    <div className="range-value"><input type="number" inputMode="numeric" aria-label={`${label} value`} min={min} max={max} step={step}
      value={draft} style={{ width: `${Math.max(1.2, draft.length)}ch` }} onChange={(event) => {
        setDraft(event.target.value)
        if (event.target.value === '') return
        const next = Number(event.target.value)
        if (Number.isFinite(next) && next >= min && next <= max && Math.abs(next / step - Math.round(next / step)) < 0.00001) onChange(next)
      }} onBlur={() => {
        const parsed = Number(draft)
        const next = draft === '' || !Number.isFinite(parsed) ? value : normalize(parsed)
        setDraft(String(next))
        onChange(next)
      }} /><span>{format?.(value) === `${value}+` ? '+' : ''}{unit && ` ${unit}`}</span></div>
    <input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))}
      className="slider" style={{ '--range-fill': `${pct}%` } as React.CSSProperties} />
    <div className="range-ticks" aria-hidden="true">{tickValues.map((tick) => <span key={tick}>{format ? format(tick) : tick}</span>)}</div>
  </div>
}

export function NumberInput({ label, value, onChange, min, max, step, suffix, help }: {
  label: string; value: string; onChange: (value: string) => void; min?: number; max?: number; step?: number; suffix?: string; help?: string
}) {
  const wage = /hourly wage/i.test(label)
  return <label className={cn('field', wage && 'wage-field')}><span className="field-label">{label}{help && <HelpLink href={help} label={label} />}</span>
    <div className="number-wrap"><input type="number" inputMode="decimal" value={value} min={min} max={max} step={step}
      onChange={(event) => onChange(event.target.value)} className="control" />{suffix && <span className="input-suffix" aria-hidden="true">{suffix}</span>}</div>
    {wage && <input type="range" className="slider" aria-label={`${label} slider`} min={0} max={150} step={1} value={Math.min(150, Number(value) || 0)}
      onChange={(event) => onChange(event.target.value)} style={{ '--range-fill': `${Math.min(100, (Number(value) || 0) / 1.5)}%` } as React.CSSProperties} />}
  </label>
}

export function Slider({ label, value, onChange, min, max, format, help }: {
  label: string; value: number; onChange: (value: number) => void; min: number; max: number; format?: (value: number) => string; help?: string
}) {
  return <div className="field"><span className="field-label">{label}{help && <HelpLink href={help} label={label} />}</span>
    <RangeControl label={label} value={value} onChange={onChange} min={min} max={max} format={format} />
  </div>
}

export function CheckRow({ label, checked, onChange, help }: { label: string; checked: boolean; onChange: (checked: boolean) => void; help?: string }) {
  return <div className="boolean-field"><span className="field-label">{label}{help && <HelpLink href={help} label={label} />}</span>
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cn('boolean-answer', checked && 'is-checked')}>{checked ? 'Yes' : 'No'}</button></div>
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="note-copy">{children}</p>
}
