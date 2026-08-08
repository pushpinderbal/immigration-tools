import { useMemo, useState } from 'react'
import { LanguageTestInputs } from '../../components/LanguageTestInputs'
import { ScoreCard } from '../../components/ScoreCard'
import { Seo } from '../../components/Seo'
import { Field, NumberInput, Section, Select } from '../../components/ui'
import { convertTestToClb, emptyScores, overallClb } from '../../lib/crs/languages'
import type { LanguageTestState } from '../../lib/crs/languages'
import {
  MAX_EDUCATION,
  MAX_LABOUR,
  MAX_LANGUAGE,
  MAX_REGION,
  MAX_TOTAL,
  oinpScore,
} from '../../lib/oinp/score'
import type {
  CanadianCredentials,
  EarningsBand,
  EducationLevel,
  LegalStatus,
  NocBroadCategory,
  OinpBreakdown,
  OinpInput,
  Region,
  TeerCategory,
  TenureBand,
} from '../../lib/oinp/score'

const TEER_OPTIONS = [
  { value: '0', label: 'TEER 0 or 1' },
  { value: '2', label: 'TEER 2 or 3' },
  { value: '4', label: 'TEER 4' },
  { value: '5', label: 'TEER 5' },
]

const NOC_BROAD_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '0', label: '0 — Management' },
  { value: '1', label: '1 — Business & finance' },
  { value: '2', label: '2 — Natural & applied sciences' },
  { value: '3', label: '3 — Health' },
  { value: '4', label: '4 — Education, law & social' },
  { value: '5', label: '5 — Art, culture & sport' },
  { value: '6', label: '6 — Sales & service' },
  { value: '7', label: '7 — Trades & transport' },
  { value: '8', label: '8 — Natural resources' },
  { value: '9', label: '9 — Manufacturing & utilities' },
]

const TENURE_OPTIONS = [
  { value: 'over-24', label: 'Over 24 months' },
  { value: '13-24', label: '13–24 months' },
  { value: '6-12', label: '6–12 months' },
  { value: 'less-6', label: 'Less than 6 months' },
]

const EARNINGS_OPTIONS: ReadonlyArray<{ value: EarningsBand; label: string }> = [
  { value: 'over-70k', label: '$70k or more' },
  { value: '50k-70k', label: '$50k–$69,999' },
  { value: '30k-50k', label: '$30k–$49,999' },
  { value: 'under-30k', label: 'Under $30k' },
]

const LEGAL_STATUS_OPTIONS: ReadonlyArray<{ value: LegalStatus; label: string }> = [
  { value: 'work-permit', label: 'Valid work permit' },
  { value: 'study-permit', label: 'Valid study permit' },
  { value: 'none', label: 'No valid work or study permit' },
]

const EDUCATION_OPTIONS: ReadonlyArray<{ value: EducationLevel; label: string }> = [
  { value: 'doctorate', label: 'Doctorate / professional medical degree' },
  { value: 'masters', label: "Master's degree" },
  { value: 'above-bachelor', label: 'Certificate/diploma above bachelor level' },
  { value: 'bachelor', label: "Bachelor's degree or equivalent" },
  { value: 'ogcc', label: 'Ontario College Graduate Certificate' },
  { value: 'below-bachelor', label: 'Certificate/diploma below bachelor level' },
  { value: 'college', label: 'College / CEGEP certificate or diploma' },
  { value: 'apprenticeship', label: 'Apprenticeship or trades certificate' },
  { value: 'less-than-college', label: 'Less than college or trades certificate' },
]

const CREDENTIALS_OPTIONS: ReadonlyArray<{ value: CanadianCredentials; label: string }> = [
  { value: 'multiple', label: 'More than one Canadian credential' },
  { value: 'one', label: 'One Canadian credential' },
  { value: 'none', label: 'None' },
]

const REGION_OPTIONS: ReadonlyArray<{ value: Region; label: string }> = [
  { value: 'northern', label: 'Northern Ontario' },
  { value: 'eastern', label: 'Eastern Ontario' },
  { value: 'central', label: 'Central Ontario (outside GTA)' },
  { value: 'southwestern', label: 'Southwestern Ontario' },
  { value: 'gta-except-toronto', label: 'GTA, outside Toronto' },
  { value: 'toronto', label: 'Toronto' },
]

const ENGLISH_TESTS = ['ielts', 'celpip', 'pte'] as const
const FRENCH_TESTS = ['tef', 'tcf'] as const

interface OinpUiState {
  teer: string
  nocBroad: string
  hourlyWage: string
  tenureInPosition: string
  ontarioWork: string
  earnings: EarningsBand
  legalStatus: LegalStatus
  education: EducationLevel
  canadianCredentials: CanadianCredentials
  english: LanguageTestState
  french: LanguageTestState
  region: string
}

const DEFAULT_UI: OinpUiState = {
  teer: '2',
  nocBroad: '0',
  hourlyWage: '30',
  tenureInPosition: '6-12',
  ontarioWork: '13-24',
  earnings: '30k-50k',
  legalStatus: 'work-permit',
  education: 'bachelor',
  canadianCredentials: 'one',
  english: { test: 'ielts', scores: { listening: 6, reading: 6, writing: 6, speaking: 6 } },
  french: { test: 'none', scores: emptyScores() },
  region: 'eastern',
}

export function OinpTool() {
  const [ui, setUi] = useState<OinpUiState>(DEFAULT_UI)

  const score = useMemo(() => {
    const englishClb = overallClb(convertTestToClb(ui.english.test, ui.english.scores))
    const frenchClb = overallClb(convertTestToClb(ui.french.test, ui.french.scores))
    const input: OinpInput = {
      teer: Number(ui.teer) as TeerCategory,
      nocBroad: Number(ui.nocBroad) as NocBroadCategory,
      hourlyWage: Number(ui.hourlyWage) || 0,
      tenureInPosition: ui.tenureInPosition as TenureBand,
      ontarioWork: ui.ontarioWork as TenureBand,
      earnings: ui.earnings,
      legalStatus: ui.legalStatus,
      education: ui.education,
      canadianCredentials: ui.canadianCredentials,
      englishClb,
      frenchClb,
      region: ui.region as Region,
    }
    return oinpScore(input)
  }, [ui])

  const patch = (p: Partial<OinpUiState>) => setUi((prev) => ({ ...prev, ...p }))

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-12 sm:px-6">
      <Seo
        title="OINP Points Calculator"
        description="Calculate your Ontario Workforce Priority stream Expression of Interest (EOI) points. Free, client-side calculator based on the official OINP grid."
        path="/oinp"
      />
      <h1 className="text-2xl font-semibold tracking-tight text-ink">OINP Points Calculator</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-muted">
        Estimate your Ontario Workforce Priority stream EOI points based on the official OINP grid.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="order-2 space-y-5 lg:order-1">
          <Section title="Employment / labour market">
            <div className="grid grid-cols-2 gap-3">
              <Field label="NOC TEER category">
                <Select
                  ariaLabel="NOC TEER category"
                  value={ui.teer}
                  onChange={(v) => patch({ teer: v })}
                  options={TEER_OPTIONS}
                />
              </Field>
              <Field label="NOC broad category">
                <Select
                  ariaLabel="NOC broad occupational category"
                  value={ui.nocBroad}
                  onChange={(v) => patch({ nocBroad: v })}
                  options={NOC_BROAD_OPTIONS}
                />
              </Field>
            </div>
            <div className="max-w-48">
              <NumberInput
                label="Hourly wage"
                value={ui.hourlyWage}
                onChange={(v) => patch({ hourlyWage: v })}
                suffix="$/hr"
              />
            </div>
            <Field label="Time in job offer position">
              <Select
                ariaLabel="Time in job offer position"
                value={ui.tenureInPosition}
                onChange={(v) => patch({ tenureInPosition: v })}
                options={TENURE_OPTIONS}
              />
            </Field>
            {ui.tenureInPosition === 'less-6' && (
              <Field label="Time working in Ontario">
                <Select
                  ariaLabel="Time working in Ontario"
                  value={ui.ontarioWork}
                  onChange={(v) => patch({ ontarioWork: v })}
                  options={TENURE_OPTIONS}
                />
              </Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Highest yearly earnings (last 5 yrs)">
                <Select
                  ariaLabel="Highest yearly earnings"
                  value={ui.earnings}
                  onChange={(v) => patch({ earnings: v as EarningsBand })}
                  options={EARNINGS_OPTIONS}
                />
              </Field>
              <Field label="Legal status">
                <Select
                  ariaLabel="Legal status"
                  value={ui.legalStatus}
                  onChange={(v) => patch({ legalStatus: v as LegalStatus })}
                  options={LEGAL_STATUS_OPTIONS}
                />
              </Field>
            </div>
          </Section>

          <Section title="Education">
            <Field label="Highest education credentials">
              <Select
                ariaLabel="Highest education credentials"
                value={ui.education}
                onChange={(v) => patch({ education: v as EducationLevel })}
                options={EDUCATION_OPTIONS}
              />
            </Field>
            <Field label="Canadian education credentials">
              <Select
                ariaLabel="Canadian education credentials"
                value={ui.canadianCredentials}
                onChange={(v) => patch({ canadianCredentials: v as CanadianCredentials })}
                options={CREDENTIALS_OPTIONS}
              />
            </Field>
          </Section>

          <Section title="Language">
            <LanguageTestInputs
              title="English"
              allowedTests={ENGLISH_TESTS}
              value={ui.english}
              onChange={(next) => patch({ english: next })}
            />
            {ui.french.test === 'none' ? (
              <button
                type="button"
                onClick={() => patch({ french: { test: 'tef', scores: emptyScores() } })}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line text-sm text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <span aria-hidden="true">+</span> Add French test
              </button>
            ) : (
              <LanguageTestInputs
                title="French"
                allowedTests={FRENCH_TESTS}
                value={ui.french}
                onChange={(next) => patch({ french: next })}
              />
            )}
          </Section>

          <Section title="Regional immigration">
            <Field label="Location of work in job offer">
              <Select
                ariaLabel="Location of work in job offer"
                value={ui.region}
                onChange={(v) => patch({ region: v })}
                options={REGION_OPTIONS}
              />
            </Field>
          </Section>
        </div>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-6 lg:self-start">
          <OinpScorePanel score={score} />
        </aside>
      </div>
    </div>
  )
}

function OinpScorePanel({ score }: { score: OinpBreakdown }) {
  const rows: Array<{ label: string; value: number; max?: number }> = [
    { label: 'Labour market', value: score.labour, max: MAX_LABOUR },
    { label: 'Education', value: score.education, max: MAX_EDUCATION },
    { label: 'Language', value: score.language, max: MAX_LANGUAGE },
    { label: 'Region', value: score.region, max: MAX_REGION },
  ]
  return (
    <ScoreCard
      label="Estimated OINP EOI score"
      total={score.total}
      max={MAX_TOTAL}
      rows={rows}
      source="Ontario Workforce Priority stream — updated Aug 2026"
    />
  )
}
