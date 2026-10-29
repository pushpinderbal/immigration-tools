import { ToolWorkspace } from '../../components/CalculatorChrome'
import { useMemo, useState } from 'react'
import { EligibilityBanner } from '../../components/EligibilityBanner'
import { LanguageTestInputs } from '../../components/LanguageTestInputs'
import { ScoreCard } from '../../components/ScoreCard'
import { Seo } from '../../components/Seo'
import { ToolSidebar } from '../../components/ToolSidebar'
import { ToolTiles } from '../../components/ToolTiles'
import { FormSections, CheckRow, Field, Note, NumberInput, Section, Select } from '../../components/ui'
import { convertTestToClb, emptyScores, overallClb } from '../../lib/crs/languages'
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

const ENGLISH_TESTS = ['ielts', 'celpip', 'pte'] as const
const FRENCH_TESTS = ['tef', 'tcf'] as const

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
  const [ui, setUi] = useState<OinpUiState>(DEFAULT_UI)
  const [hasStarted, setHasStarted] = useState(false)

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

  const patch = (p: Partial<OinpUiState>) => {
    setHasStarted(true)
    setUi((prev) => ({ ...prev, ...p }))
  }

  return (
    <div className="tool-page px-4 sm:px-6">
      <Seo
        title="OINP Points Calculator | ImmiCalc"
        description="Calculate Ontario Workforce Priority points for job-offer applicants and self-employed physicians."
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

      <ToolWorkspace>
        <FormSections>
          <Section title="Job offer" tabLabel="Job offer" help={OINP_DOC} description="Application pathway, occupation and offered wage."
            summary={ui.pathway === 'physician' ? 'Physician' : ui.hourlyWage ? `$${ui.hourlyWage}/hr` : 'Not entered'}>
            <Field label="Application pathway" help={OINP_DOC}>
              <Select ariaLabel="Application pathway" value={ui.pathway} onChange={(pathway) => patch({ pathway: pathway as OinpUiState['pathway'] })}
                options={[{ value: 'job-offer', label: 'Job offer' }, { value: 'physician', label: 'Self-employed physician' }]} />
            </Field>
            {ui.pathway === 'physician' ? <>
              <CheckRow label="I have an OHIP billing number and eligible CPSO registration in good standing"
                checked={ui.physicianRequirementsMet} onChange={(physicianRequirementsMet) => patch({ physicianRequirementsMet })} help={OINP_DOC} />
              <Note>Physician scoring uses TEER 1, health occupations and cumulative Ontario medical practice.</Note>
            </> : <>
              <div className="answer-columns">
                <Field label="NOC TEER category" help={OINP_DOC}>
                  <Select ariaLabel="NOC TEER category" value={ui.teer} onChange={(teer) => patch({ teer })} options={TEER_OPTIONS} />
                </Field>
                <Field label="NOC broad category" help={OINP_DOC}>
                  <Select ariaLabel="NOC broad occupational category" value={ui.nocBroad} onChange={(nocBroad) => patch({ nocBroad })} options={NOC_BROAD_OPTIONS} />
                </Field>
              </div>
              <NumberInput label="Hourly wage" value={ui.hourlyWage} onChange={(hourlyWage) => patch({ hourlyWage })} suffix="$/hr" min={0} help={OINP_DOC} />
            </>}
          </Section>
          <Section title="Ontario experience" tabLabel="Experience" help={OINP_DOC} description="Time in your position and other Ontario work."
            summary={TENURE_OPTIONS.find((o) => o.value === (ui.pathway === 'physician' ? ui.ontarioWork : ui.tenureInPosition))?.label.replace('Select...', 'Not entered')}>
            {ui.pathway === 'job-offer' ? <>
              <Field label="Time in job offer position" help={OINP_DOC}>
                <Select ariaLabel="Time in job offer position" value={ui.tenureInPosition} onChange={(tenureInPosition) => patch({ tenureInPosition })} options={TENURE_OPTIONS} />
              </Field>
              {ui.tenureInPosition === 'less-6' && <Field label="Time working in Ontario" help={OINP_DOC}>
                <Select ariaLabel="Time working in Ontario" value={ui.ontarioWork} onChange={(ontarioWork) => patch({ ontarioWork })} options={TENURE_OPTIONS} />
              </Field>}
              <Note>Under six months in the offered position, the grid uses general Ontario work experience.</Note>
            </> : <Field label="Cumulative medical practice in Ontario" help={OINP_DOC}>
              <Select ariaLabel="Time working in Ontario" value={ui.ontarioWork} onChange={(ontarioWork) => patch({ ontarioWork })} options={TENURE_OPTIONS} />
            </Field>}
          </Section>
          <Section title="Earnings and status" tabLabel="Earnings" help={OINP_DOC} description="Canadian earnings history and current legal status.">
            <div className="answer-columns">
              <Field label="Highest yearly earnings (last 5 yrs)" help={OINP_DOC}>
                <Select ariaLabel="Highest yearly earnings" value={ui.earnings} onChange={(earnings) => patch({ earnings: earnings as EarningsBand | '' })} options={EARNINGS_OPTIONS} />
              </Field>
              <Field label="Legal status in Canada" help={OINP_DOC}>
                <Select ariaLabel="Legal status in Canada" value={ui.legalStatus} onChange={(legalStatus) => patch({ legalStatus: legalStatus as LegalStatus | '' })} options={LEGAL_STATUS_OPTIONS} />
              </Field>
            </div>
            <Note>Use one CRA Notice of Assessment issued in the last five years.</Note>
          </Section>
          <Section title="Education" help={OINP_DOC} description="Highest completed credential and Canadian study." summary={EDUCATION_OPTIONS.find((o) => o.value === ui.education)?.label.replace('Select...', 'Not entered')}>
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

          <Section title="Language results" tabLabel="Language" help={OINP_DOC} description="English and French test results." summary={ui.english.test === 'none' && ui.french.test === 'none' ? 'Not entered' : 'Results entered'}>
            <LanguageTestInputs
              title="English"
              allowedTests={ENGLISH_TESTS}
              value={ui.english}
              onChange={(next) => patch({ english: next })}
              help={OINP_DOC}
            />
            {ui.french.test === 'none' ? (
              <button
                type="button"
                onClick={() => patch({ french: { test: 'tef', scores: emptyScores() } })}
                className="add-language flex w-full items-center justify-center gap-2 text-sm"
              >
                <span aria-hidden="true">+</span> Add French test
              </button>
            ) : (
              <LanguageTestInputs
                title="French"
                allowedTests={FRENCH_TESTS}
                value={ui.french}
                onChange={(next) => patch({ french: next })}
                help={OINP_DOC}
              />
            )}
          </Section>

          <Section title="Ontario location" tabLabel="Location" help={OINP_DOC} description="Work location or OHIP practice address." summary={REGION_OPTIONS.find((o) => o.value === ui.region)?.label.replace('Select...', 'Not entered')}>
            <Field label="Location of work in job offer" help={OINP_DOC}>
              <Select
                ariaLabel="Location of work in job offer"
                value={ui.region}
                onChange={(v) => patch({ region: v })}
                options={REGION_OPTIONS}
              />
            </Field>
          </Section>

          {ui.pathway === 'job-offer' && <Section title="Applicant requirements" tabLabel="Requirements" help={OINP_DOC}
            description="Experience thresholds and permitted alternatives.">
            <NumberInput label="Qualifying months in job offer position" value={ui.positionMonths} min={0} onChange={(positionMonths) => patch({ positionMonths })} help={OINP_DOC} />
            <Note>Use consecutive months within the last year for TEER 0 to 3, or cumulative months within the last two years for TEER 4 and 5. An empty field uses the lower end of your scoring band.</Note>
            <CheckRow label="Recent Ontario graduate (within the last 3 years)" checked={ui.recentOntarioGraduate}
              onChange={(recentOntarioGraduate) => patch({ recentOntarioGraduate })} help={OINP_DOC} />
            <details className="program-notes"><summary>Experience alternatives and occupation rules</summary><div>
              <CheckRow label="I meet the permitted two-year same-NOC work experience alternative (last 5 years)"
                checked={ui.twoYearsSameNoc} onChange={(twoYearsSameNoc) => patch({ twoYearsSameNoc })} help={OINP_DOC} />
              <CheckRow label="I hold the mandatory licence that exempts my occupation from the experience requirement"
                checked={ui.licensedForPosition} onChange={(licensedForPosition) => patch({ licensedForPosition })} help={OINP_DOC} />
              <CheckRow label="Job offer is NOC 73300 or 73301 (six-month experience exception)"
                checked={ui.transportOccupation} onChange={(transportOccupation) => patch({ transportOccupation })} help={OINP_DOC} />
              <CheckRow label="Job offer is in Ontario's listed skilled trades (CLB 5 language minimum)"
                checked={ui.listedSkilledTrade} onChange={(listedSkilledTrade) => patch({ listedSkilledTrade })} help={OINP_DOC} />
            </div></details>
          </Section>}
          <Note>Grid checked October 28, 2026, including the October 5 earnings update. Initial checks cover selected applicant requirements. The official guide lists employer, occupation and invitation requirements.</Note>
        </FormSections>

        <ToolSidebar
          label="Estimated OINP EOI score"
          total={score.total}
          max={ui.pathway === 'physician' ? MAX_PHYSICIAN_TOTAL : MAX_TOTAL}
          breakdown={<OinpScorePanel score={score} physician={ui.pathway === 'physician'} />}
        />
      </ToolWorkspace>

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
