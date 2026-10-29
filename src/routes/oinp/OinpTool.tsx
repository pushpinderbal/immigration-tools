import { useMemo } from 'react'
import { useCalculatorForm } from '../../hooks/useCalculatorForm'
import { EligibilityBanner } from '../../components/EligibilityBanner'
import { LanguageTestInputs, OptionalLanguageTestInputs } from '../../components/LanguageTestInputs'
import { ScoreCard } from '../../components/ScoreCard'
import { Seo } from '../../components/Seo'
import { ToolSidebar } from '../../components/ToolSidebar'
import { ToolTiles } from '../../components/ToolTiles'
import { FormSections, CheckRow, Field, Note, NumberInput, Section, Select } from '../../components/ui'
import { ENGLISH_TESTS, FRENCH_TESTS, convertTestToClb, emptyScores, overallClb } from '../../lib/crs/languages'
import type { LanguageTestState } from '../../lib/crs/languages'
import {
  MAX_EDUCATION,
  MAX_LABOUR,
  MAX_LANGUAGE,
  MAX_REGION,
  MAX_TOTAL,
  MAX_PHYSICIAN_TOTAL,
  eligibility,
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

const OINP_DOC = 'https://www.ontario.ca/page/ontario-workforce-priority-stream'

const TEER_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: '0', label: 'TEER 0 or 1' },
  { value: '2', label: 'TEER 2 or 3' },
  { value: '4', label: 'TEER 4' },
  { value: '5', label: 'TEER 5' },
]

const NOC_BROAD_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '', label: 'Select...' },
  { value: '0', label: '0 - Management' },
  { value: '1', label: '1 - Business & finance' },
  { value: '2', label: '2 - Natural & applied sciences' },
  { value: '3', label: '3 - Health' },
  { value: '4', label: '4 - Education, law & social' },
  { value: '5', label: '5 - Art, culture & sport' },
  { value: '6', label: '6 - Sales & service' },
  { value: '7', label: '7 - Trades & transport' },
  { value: '8', label: '8 - Natural resources' },
  { value: '9', label: '9 - Manufacturing & utilities' },
]

const TENURE_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'over-24', label: 'Over 24 months' },
  { value: '13-24', label: '13-24 months' },
  { value: '6-12', label: '6-12 months' },
  { value: 'less-6', label: 'Less than 6 months' },
]

const EARNINGS_OPTIONS: ReadonlyArray<{ value: EarningsBand | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: '80k-plus', label: '$80k or more' },
  { value: 'over-70k', label: '$70k-$79,999' },
  { value: '50k-70k', label: '$50k-$69,999' },
  { value: '30k-50k', label: '$30k-$49,999' },
  { value: 'under-30k', label: 'Under $30k' },
]

const LEGAL_STATUS_OPTIONS: ReadonlyArray<{ value: LegalStatus | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: 'work-permit', label: 'Valid work permit' },
  { value: 'study-permit', label: 'Valid study permit' },
  { value: 'visitor', label: 'Valid visitor record / other lawful temporary status' },
  { value: 'outside-canada', label: 'Applying from outside Canada' },
  { value: 'none', label: 'In Canada without valid legal status' },
]

const EDUCATION_OPTIONS: ReadonlyArray<{ value: EducationLevel | ''; label: string }> = [
  { value: '', label: 'Select...' },
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

const CREDENTIALS_OPTIONS: ReadonlyArray<{ value: CanadianCredentials | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: 'multiple', label: 'More than one Canadian credential' },
  { value: 'one', label: 'One Canadian credential' },
  { value: 'none', label: 'None' },
]

const REGION_OPTIONS: ReadonlyArray<{ value: Region | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: 'northern', label: 'Northern Ontario' },
  { value: 'eastern', label: 'Eastern Ontario' },
  { value: 'central', label: 'Central Ontario (outside GTA)' },
  { value: 'southwestern', label: 'Southwestern Ontario' },
  { value: 'gta-except-toronto', label: 'GTA, outside Toronto' },
  { value: 'toronto', label: 'Toronto' },
]

interface OinpUiState {
  pathway: 'job-offer' | 'physician'
  physicianRequirementsMet: boolean
  positionMonths: string
  twoYearsSameNoc: boolean
  licensedForPosition: boolean
  transportOccupation: boolean
  listedSkilledTrade: boolean
  teer: string
  nocBroad: string
  hourlyWage: string
  tenureInPosition: string
  ontarioWork: string
  earnings: EarningsBand | ''
  legalStatus: LegalStatus | ''
  education: EducationLevel | ''
  canadianCredentials: CanadianCredentials | ''
  english: LanguageTestState
  french: LanguageTestState
  region: string
  recentOntarioGraduate: boolean
}

const DEFAULT_UI: OinpUiState = {
  pathway: 'job-offer',
  physicianRequirementsMet: false,
  positionMonths: '',
  twoYearsSameNoc: false,
  licensedForPosition: false,
  transportOccupation: false,
  listedSkilledTrade: false,
  teer: '',
  nocBroad: '',
  hourlyWage: '',
  tenureInPosition: '',
  ontarioWork: '',
  earnings: '',
  legalStatus: '',
  education: '',
  canadianCredentials: '',
  english: { test: 'none', scores: emptyScores() },
  french: { test: 'none', scores: emptyScores() },
  region: '',
  recentOntarioGraduate: false,
}

export function OinpTool() {
  const { values: ui, patch, hasStarted } = useCalculatorForm<OinpUiState>(DEFAULT_UI)

  const { score, eligibilityResult } = useMemo(() => {
    const englishClb = overallClb(convertTestToClb(ui.english.test, ui.english.scores))
    const frenchClb = overallClb(convertTestToClb(ui.french.test, ui.french.scores))
    const input: OinpInput = {
      pathway: ui.pathway,
      physicianRequirementsMet: ui.physicianRequirementsMet,
      positionMonths: ui.positionMonths === '' ? undefined : Number(ui.positionMonths),
      twoYearsSameNoc: ui.twoYearsSameNoc,
      licensedForPosition: ui.licensedForPosition,
      transportOccupation: ui.transportOccupation,
      listedSkilledTrade: ui.listedSkilledTrade,
      teer: (ui.teer === '' ? 5 : Number(ui.teer)) as TeerCategory,
      nocBroad: ui.nocBroad === '' ? null : Number(ui.nocBroad) as NocBroadCategory,
      hourlyWage: Number(ui.hourlyWage) || 0,
      tenureInPosition: (ui.tenureInPosition === '' ? 'less-6' : ui.tenureInPosition) as TenureBand,
      ontarioWork: (ui.ontarioWork === '' ? 'less-6' : ui.ontarioWork) as TenureBand,
      earnings: (ui.earnings === '' ? 'under-30k' : ui.earnings) as EarningsBand,
      legalStatus: (ui.legalStatus === '' ? 'none' : ui.legalStatus) as LegalStatus,
      education: (ui.education === '' ? 'less-than-college' : ui.education) as EducationLevel,
      canadianCredentials: (ui.canadianCredentials === '' ? 'none' : ui.canadianCredentials) as CanadianCredentials,
      englishClb,
      frenchClb,
      region: (ui.region === '' ? 'toronto' : ui.region) as Region,
      recentOntarioGraduate: ui.recentOntarioGraduate,
    }
    return { score: oinpScore(input), eligibilityResult: eligibility(input) }
  }, [ui])

  return (
    <div className="tool-page px-4 sm:px-6">
      <Seo
        title="OINP Points Calculator | ImmiCalc"
        description="Check your OINP Expression of Interest points with a few simple questions on your job offer, education, and language, and get an instant result."
        path="/oinp"
      />
      <ToolTiles current="oinp" />
      <div className="tool-header">
        <p className="tool-kicker">Ontario · Provincial program</p>
        <h1 className="tool-title mt-3">OINP Points Calculator</h1>
        <p className="tool-description">
          Ontario's Workforce Priority stream has a maximum of 132 points for job-offer applicants and 117 for
          self-employed physicians. Grid checked October 28, 2026, including the October 5 earnings update.
        </p>
      </div>

      {hasStarted && (
        <div className="mt-4">
          <EligibilityBanner eligible={eligibilityResult.eligible} reasons={eligibilityResult.reasons} />
        </div>
      )}

      <div className="tool-workspace">
        <FormSections>
          <Section title="Employment / labour market" help={OINP_DOC}>
            <Field label="Application pathway" help={OINP_DOC}>
              <Select ariaLabel="Application pathway" value={ui.pathway}
                onChange={(v) => patch({ pathway: v as OinpUiState['pathway'] })}
                options={[{ value: 'job-offer', label: 'Job offer' }, { value: 'physician', label: 'Self-employed physician' }]} />
            </Field>
            {ui.pathway === 'physician' && <>
              <CheckRow label="I have an OHIP billing number and eligible CPSO registration in good standing"
                checked={ui.physicianRequirementsMet} onChange={(v) => patch({ physicianRequirementsMet: v })} help={OINP_DOC} />
              <Note>Physicians receive health occupation and TEER 1 points. Wages are not scored. Select cumulative Ontario medical practice under Time working in Ontario. Region uses your OHIP practice address.</Note>
            </>}
            {ui.pathway === 'job-offer' && <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="NOC TEER category" help={OINP_DOC}>
                <Select
                  ariaLabel="NOC TEER category"
                  value={ui.teer}
                  onChange={(v) => patch({ teer: v })}
                  options={TEER_OPTIONS}
                />
              </Field>
              <Field label="NOC broad category" help={OINP_DOC}>
                <Select
                  ariaLabel="NOC broad occupational category"
                  value={ui.nocBroad}
                  onChange={(v) => patch({ nocBroad: v })}
                  options={NOC_BROAD_OPTIONS}
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberInput
                label="Hourly wage"
                value={ui.hourlyWage}
                onChange={(v) => patch({ hourlyWage: v })}
                suffix="$/hr"
                help={OINP_DOC}
              />
              <Field label="Time in job offer position" help={OINP_DOC}>
                <Select
                  ariaLabel="Time in job offer position"
                  value={ui.tenureInPosition}
                  onChange={(v) => patch({ tenureInPosition: v })}
                  options={TENURE_OPTIONS}
                />
              </Field>
            </div>
            {ui.tenureInPosition === 'less-6' && (
              <Field label="Time working in Ontario" help={OINP_DOC}>
                <Select
                  ariaLabel="Time working in Ontario"
                  value={ui.ontarioWork}
                  onChange={(v) => patch({ ontarioWork: v })}
                  options={TENURE_OPTIONS}
                />
              </Field>
            )}
            <CheckRow
              label="Recent Ontario graduate (within the last 3 years)"
              checked={ui.recentOntarioGraduate}
              onChange={(v) => patch({ recentOntarioGraduate: v })}
              help={OINP_DOC}
            />
            <Note>
              Recent Ontario graduates (eligible Ontario institution within the last 3 years) only need 3 months in
              the job offer position instead of 6. This is an eligibility rule and does not add EOI points.
            </Note>
            <NumberInput label="Qualifying months in job offer position" value={ui.positionMonths} min={0}
              onChange={(v) => patch({ positionMonths: v })} help={OINP_DOC} />
            <Note>For this eligibility check, use consecutive months within the last year for TEER 0 to 3, or cumulative months within the last two years for TEER 4 and 5. Leave blank to use the lower end of the scoring band above.</Note>
            <CheckRow label="I meet the permitted two-year same-NOC work experience alternative (last 5 years)"
              checked={ui.twoYearsSameNoc} onChange={(v) => patch({ twoYearsSameNoc: v })} help={OINP_DOC} />
            <CheckRow label="I hold the mandatory licence that exempts my occupation from the experience requirement"
              checked={ui.licensedForPosition} onChange={(v) => patch({ licensedForPosition: v })} help={OINP_DOC} />
            <CheckRow label="Job offer is NOC 73300 or 73301 (six-month experience exception)"
              checked={ui.transportOccupation} onChange={(v) => patch({ transportOccupation: v })} help={OINP_DOC} />
            <CheckRow label="Job offer is in Ontario's listed skilled trades (CLB 5 language minimum)"
              checked={ui.listedSkilledTrade} onChange={(v) => patch({ listedSkilledTrade: v })} help={OINP_DOC} />
            </>}
            {ui.pathway === 'physician' && <Field label="Cumulative medical practice in Ontario" help={OINP_DOC}>
              <Select ariaLabel="Time working in Ontario" value={ui.ontarioWork}
                onChange={(v) => patch({ ontarioWork: v })} options={TENURE_OPTIONS} />
            </Field>}
            <Note>Earnings must come from a single CRA Notice of Assessment issued in the last five years. Visitor status and applying from abroad award zero permit points.</Note>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Highest yearly earnings (last 5 yrs)" help={OINP_DOC}>
                <Select
                  ariaLabel="Highest yearly earnings"
                  value={ui.earnings}
                  onChange={(v) => patch({ earnings: v as EarningsBand | '' })}
                  options={EARNINGS_OPTIONS}
                />
              </Field>
              <Field label="Legal status in Canada" help={OINP_DOC}>
                <Select
                  ariaLabel="Legal status in Canada"
                  value={ui.legalStatus}
                  onChange={(v) => patch({ legalStatus: v as LegalStatus | '' })}
                  options={LEGAL_STATUS_OPTIONS}
                />
              </Field>
            </div>
          </Section>

          <Section title="Education" help={OINP_DOC}>
            <Field label="Highest level of education" help={OINP_DOC}>
              <Select
                ariaLabel="Highest level of education"
                value={ui.education}
                onChange={(v) => patch({ education: v as EducationLevel | '' })}
                options={EDUCATION_OPTIONS}
              />
            </Field>
            <Field label="Canadian education credentials" help={OINP_DOC}>
              <Select
                ariaLabel="Canadian education credentials"
                value={ui.canadianCredentials}
                onChange={(v) => patch({ canadianCredentials: v as CanadianCredentials | '' })}
                options={CREDENTIALS_OPTIONS}
              />
            </Field>
          </Section>

          <Section title="Language" help={OINP_DOC}>
            <LanguageTestInputs
              title="English"
              allowedTests={ENGLISH_TESTS}
              value={ui.english}
              onChange={(next) => patch({ english: next })}
              help={OINP_DOC}
            />
            <OptionalLanguageTestInputs
              title="French"
              addLabel="Add French test"
              allowedTests={FRENCH_TESTS}
              value={ui.french}
              onChange={(next) => patch({ french: next })}
              help={OINP_DOC}
            />
          </Section>

          <Section title="Regional immigration" help={OINP_DOC}>
            <Field label="Location of work in job offer" help={OINP_DOC}>
              <Select
                ariaLabel="Location of work in job offer"
                value={ui.region}
                onChange={(v) => patch({ region: v })}
                options={REGION_OPTIONS}
              />
            </Field>
          </Section>
        </FormSections>

        <ToolSidebar
          label="Estimated OINP EOI score"
          total={score.total}
          max={ui.pathway === 'physician' ? MAX_PHYSICIAN_TOTAL : MAX_TOTAL}
          breakdown={<OinpScorePanel score={score} physician={ui.pathway === 'physician'} />}
        />
      </div>

    </div>
  )
}

function OinpScorePanel({ score, physician }: { score: OinpBreakdown; physician: boolean }) {
  const rows: Array<{ label: string; value: number; max?: number }> = [
    { label: 'Labour market', value: score.labour, max: MAX_LABOUR - (physician ? 15 : 0) },
    { label: 'Education', value: score.education, max: MAX_EDUCATION },
    { label: 'Language', value: score.language, max: MAX_LANGUAGE },
    { label: 'Region', value: score.region, max: MAX_REGION },
  ]
  return (
    <ScoreCard
      variant="breakdown"
      rows={rows}
      source="Based on Ontario's official Ontario Workforce Priority stream EOI grid"
    />
  )
}
