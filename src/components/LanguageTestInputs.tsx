import { useMemo } from 'react'
import { convertTestToClb, emptyScores } from '../lib/crs/languages'
import type { LanguageTestId, LanguageTestState } from '../lib/crs/languages'
import { ABILITIES } from '../lib/crs/tables'
import type { LanguageAbility } from '../lib/crs/types'
import { HelpLink, Select } from './ui'

const TEST_LABELS: Record<Exclude<LanguageTestId, 'none'>, string> = {
  ielts: 'IELTS General',
  celpip: 'CELPIP General',
  pte: 'PTE Core',
  tef: 'TEF Canada',
  tcf: 'TCF Canada',
}

const IELTS_OPTIONS = [
  { value: '0.0', label: '-' },
  ...Array.from({ length: 18 }, (_, i) => {
    const v = 0.5 + i * 0.5
    return { value: v.toFixed(1), label: v.toFixed(1) }
  }),
]

const CELPIP_OPTIONS = [
  { value: '0', label: '-' },
  ...Array.from({ length: 12 }, (_, i) => {
    const v = 1 + i
    return { value: String(v), label: String(v) }
  }),
]

function AbilityInput({
  test,
  ability,
  score,
  onChange,
  ariaLabel,
}: {
  test: Exclude<LanguageTestId, 'none'>
  ability: LanguageAbility
  score: number
  onChange: (value: number) => void
  ariaLabel: string
}) {
  const base = 'control h-10 w-full px-2 font-mono text-xs tabular-nums outline-none'

  if (test === 'ielts' || test === 'celpip') {
    const options = test === 'ielts' ? IELTS_OPTIONS : CELPIP_OPTIONS
    return (
      <div className="ability-control"><Select
        ariaLabel={ariaLabel}
        value={test === 'ielts' ? score.toFixed(1) : String(score)}
        onChange={(v) => onChange(Number(v))}
        options={options}
      /><input type="range" className="slider ability-slider" aria-label={`${ariaLabel} slider`}
        min={0} max={test === 'ielts' ? 9 : 12} step={test === 'ielts' ? 0.5 : 1}
        value={score} style={{ '--range-fill': `${score / (test === 'ielts' ? 9 : 12) * 100}%` } as React.CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))} /></div>
    )
  }

  const isTcfWriting = test === 'tcf' && (ability === 'writing' || ability === 'speaking')
  const max = isTcfWriting ? 20 : test === 'pte' ? 90 : 699
  const min = 0

  return (
    <div className="ability-control"><input
      type="number"
      inputMode="decimal"
      aria-label={ariaLabel}
      value={score === 0 ? '' : String(score)}
      min={min}
      max={max}
      onChange={(e) => {
        const n = Number(e.target.value)
        onChange(Number.isFinite(n) ? n : 0)
      }}
      className={base}
    /><input type="range" className="slider ability-slider" aria-label={`${ariaLabel} slider`} min={min} max={max} step={1}
      value={Math.min(max, score)} style={{ '--range-fill': `${Math.max(0, Math.min(100, score / max * 100))}%` } as React.CSSProperties}
      onChange={(event) => onChange(Number(event.target.value))} /></div>
  )
}

export function LanguageTestInputs({
  title,
  allowedTests,
  value,
  onChange,
  help,
}: {
  title: string
  allowedTests: readonly Exclude<LanguageTestId, 'none'>[]
  value: LanguageTestState
  onChange: (next: LanguageTestState) => void
  help?: string
}) {
  const clb = useMemo(() => convertTestToClb(value.test, value.scores), [value])
  const scale = value.test === 'tef' || value.test === 'tcf' ? 'NCLC' : 'CLB'

  return (
    <div className="language-card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-ink">
          {title}
          {help && <HelpLink href={help} label={title} />}
        </h3>
        <div className="w-48">
          <Select
            ariaLabel={`${title} test`}
            value={value.test}
            onChange={(v) => {
              const test = v as LanguageTestId
              onChange({ test, scores: emptyScores() })
            }}
            options={[
              { value: 'none', label: 'Not taken' },
              ...allowedTests.map((t) => ({ value: t, label: TEST_LABELS[t] })),
            ]}
          />
        </div>
      </div>

      {value.test !== 'none' && (
          <div className="ability-grid">
            {ABILITIES.map((a) => (
              <div key={a} className="flex flex-col gap-1">
                <span className="ability-label">{a}</span>
                <AbilityInput
                  test={value.test as Exclude<LanguageTestId, 'none'>}
                  ability={a}
                  score={value.scores[a]}
                  ariaLabel={`${title} ${a}`}
                  onChange={(n) => onChange({ ...value, scores: { ...value.scores, [a]: n } })}
                />
                <span className="language-band font-mono">
                  {scale} {clb[a] === 0 ? '-' : clb[a]}
                </span>
              </div>
            ))}
          </div>
      )}
    </div>
  )
}
