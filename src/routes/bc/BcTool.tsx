import { useMemo, useState } from 'react'
import { EligibilityBanner } from '../../components/EligibilityBanner'
import { LanguageTestInputs } from '../../components/LanguageTestInputs'
import { ScoreCard } from '../../components/ScoreCard'
import { Seo } from '../../components/Seo'
import { ToolSidebar } from '../../components/ToolSidebar'
import { ToolTiles } from '../../components/ToolTiles'
import { CheckRow, Field, Note, NumberInput, Section, Select } from '../../components/ui'
import { convertTestToClb, emptyScores, overallClb } from '../../lib/crs/languages'
import type { LanguageTestState } from '../../lib/crs/languages'
import {
  BC_DOC,
  MAX_AREA,
  MAX_EDUCATION,
  MAX_EXPERIENCE,
  MAX_LANGUAGE,
  MAX_TOTAL,
  MAX_WAGE,
  bcScore,
  eligibility,
} from '../../lib/bc/score'
import type {
  AreaBand,
  BcBreakdown,
  BcInput,
  EducationLevel,
  EducationLocation,
  WorkExperienceBand,
} from '../../lib/bc/score'

const WORK_EXPERIENCE_OPTIONS: ReadonlyArray<{ value: WorkExperienceBand | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: '5-plus', label: '5+ years' },
  { value: '4-5', label: '4 to under 5 years' },
  { value: '3-4', label: '3 to under 4 years' },
  { value: '2-3', label: '2 to under 3 years' },
  { value: '1-2', label: '1 to under 2 years' },
  { value: 'less-1', label: 'Under 1 year' },
  { value: 'none', label: 'None' },
]

const EDUCATION_OPTIONS: ReadonlyArray<{ value: EducationLevel | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: 'doctorate', label: 'Doctoral degree' },
  { value: 'masters', label: "Master's degree" },
  { value: 'postgrad', label: 'Post-graduate certificate or diploma' },
  { value: 'bachelor', label: "Bachelor's degree" },
  { value: 'associate', label: 'Associate degree' },
  { value: 'diploma', label: 'Post-secondary diploma or certificate' },
  { value: 'secondary', label: 'Secondary school or less' },
]

const EDUCATION_LOCATION_OPTIONS: ReadonlyArray<{ value: EducationLocation | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: 'none', label: 'None' },
  { value: 'bc', label: 'Post-secondary education in BC' },
  { value: 'canada-outside-bc', label: 'Post-secondary education in Canada (outside BC)' },
]

const AREA_OPTIONS: ReadonlyArray<{ value: AreaBand | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: 'area-1', label: 'Area 1 (Metro Vancouver Regional District)' },
  { value: 'area-2', label: 'Area 2 (Squamish, Abbotsford, Agassiz, Mission, Chilliwack)' },
  { value: 'area-3', label: 'Area 3 (all other areas of BC)' },
]

const ENGLISH_TESTS = ['ielts', 'celpip', 'pte'] as const
const FRENCH_TESTS = ['tef', 'tcf'] as const

interface BcUiState {
  workExperience: WorkExperienceBand | ''
  canadianExperience: boolean
  workingInBc: boolean
  education: EducationLevel | ''
  educationLocation: EducationLocation | ''
  professionalDesignation: boolean
  english: LanguageTestState
  french: LanguageTestState
  bothLanguages: boolean
  hourlyWage: string
  area: AreaBand | ''
  regionalExperience: boolean
}

const DEFAULT_UI: BcUiState = {
  workExperience: '',
  canadianExperience: false,
  workingInBc: false,
  education: '',
  educationLocation: '',
  professionalDesignation: false,
  english: { test: 'none', scores: emptyScores() },
  french: { test: 'none', scores: emptyScores() },
  bothLanguages: false,
  hourlyWage: '',
  area: '',
  regionalExperience: false,
}

export function BcTool() {
  const [ui, setUi] = useState<BcUiState>(DEFAULT_UI)

  const { score, eligibilityResult } = useMemo(() => {
    const englishClb = overallClb(convertTestToClb(ui.english.test, ui.english.scores))
    const frenchClb = overallClb(convertTestToClb(ui.french.test, ui.french.scores))
    const input: BcInput = {
      workExperience: (ui.workExperience === '' ? 'none' : ui.workExperience) as WorkExperienceBand,
      canadianExperience: ui.canadianExperience,
      workingInBc: ui.workingInBc,
      education: (ui.education === '' ? 'secondary' : ui.education) as EducationLevel,
      educationLocation: (ui.educationLocation === '' ? 'none' : ui.educationLocation) as EducationLocation,
      professionalDesignation: ui.professionalDesignation,
      englishClb,
      frenchClb,
      bothLanguages: ui.bothLanguages,
      hourlyWage: Number(ui.hourlyWage) || 0,
      area: (ui.area === '' ? 'area-1' : ui.area) as AreaBand,
      regionalExperience: ui.regionalExperience,
    }
    return { score: bcScore(input), eligibilityResult: eligibility(input) }
  }, [ui])

  const patch = (p: Partial<BcUiState>) => setUi((prev) => ({ ...prev, ...p }))

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-12 sm:px-6">
      <Seo
        title="BC PNP Points Calculator | ImmiCalc"
        description="Get a straightforward BC PNP points estimate for Skills Immigration and Express Entry BC - a few simple questions, instant result."
        path="/bc"
      />
      <ToolTiles current="bc" />
      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">BC PNP Points Calculator</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-muted">
        BC scores Skills Immigration and Express Entry BC candidates out of 200. Enter your details to see your points
        and how they add up.
      </p>

      <div className="mt-6">
        <EligibilityBanner eligible={eligibilityResult.eligible} reasons={eligibilityResult.reasons} />
      </div>

      <div className="mt-8 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Section title="Work experience" help={BC_DOC}>
            <Field label="Directly related work experience" help={BC_DOC}>
              <Select
                ariaLabel="Directly related work experience"
                value={ui.workExperience}
                onChange={(v) => patch({ workExperience: v as WorkExperienceBand | '' })}
                options={WORK_EXPERIENCE_OPTIONS}
              />
            </Field>
            <div className="space-y-3">
              <CheckRow
                label="At least 1 year of directly related experience in Canada"
                checked={ui.canadianExperience}
                onChange={(v) => patch({ canadianExperience: v })}
                help={BC_DOC}
              />
              <CheckRow
                label="Currently working full-time in BC for the supporting employer"
                checked={ui.workingInBc}
                onChange={(v) => patch({ workingInBc: v })}
                help={BC_DOC}
              />
            </div>
          </Section>

          <Section title="Education" help={BC_DOC}>
            <Field label="Highest level of education" help={BC_DOC}>
              <Select
                ariaLabel="Highest level of education"
                value={ui.education}
                onChange={(v) => patch({ education: v as EducationLevel | '' })}
                options={EDUCATION_OPTIONS}
              />
            </Field>
            <Field label="Additional education" help={BC_DOC}>
              <Select
                ariaLabel="Additional education"
                value={ui.educationLocation}
                onChange={(v) => patch({ educationLocation: v as EducationLocation | '' })}
                options={EDUCATION_LOCATION_OPTIONS}
              />
            </Field>
            <CheckRow
              label="Eligible professional designation in B.C."
              checked={ui.professionalDesignation}
              onChange={(v) => patch({ professionalDesignation: v })}
              help={BC_DOC}
            />
          </Section>

          <Section title="Language" help={BC_DOC}>
            <LanguageTestInputs
              title="English"
              allowedTests={ENGLISH_TESTS}
              value={ui.english}
              onChange={(next) => patch({ english: next })}
              help={BC_DOC}
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
                help={BC_DOC}
              />
            )}
            <CheckRow
              label="Proficiency (CLB 4+) in both English and French"
              checked={ui.bothLanguages}
              onChange={(v) => patch({ bothLanguages: v })}
              help={BC_DOC}
            />
            <Note>The language score uses the overall CLB (lowest band across skills) of your best English or French test.</Note>
          </Section>

          <Section title="Economic factors" help={BC_DOC}>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberInput
                label="Hourly wage of BC job offer"
                value={ui.hourlyWage}
                onChange={(v) => patch({ hourlyWage: v })}
                suffix="$/hr"
                help={BC_DOC}
              />
              <Field label="Area within BC" help={BC_DOC}>
                <Select
                  ariaLabel="Area within BC"
                  value={ui.area}
                  onChange={(v) => patch({ area: v as AreaBand | '' })}
                  options={AREA_OPTIONS}
                />
              </Field>
            </div>
            {ui.area !== 'area-1' && (
              <CheckRow
                label="Regional experience or regional alumni"
                checked={ui.regionalExperience}
                onChange={(v) => patch({ regionalExperience: v })}
                help={BC_DOC}
              />
            )}
            <Note>Wage points rise one point per dollar above $15 per hour, capped at 55.</Note>
          </Section>
        </div>

        <ToolSidebar
          label="Estimated BC PNP EOI score"
          total={score.total}
          max={MAX_TOTAL}
          breakdown={<BcScorePanel score={score} />}
        />
      </div>

    </div>
  )
}

function BcScorePanel({ score }: { score: BcBreakdown }) {
  const rows: Array<{ label: string; value: number; max?: number }> = [
    { label: 'Work experience', value: score.experience, max: MAX_EXPERIENCE },
    { label: 'Education', value: score.education, max: MAX_EDUCATION },
    { label: 'Language', value: score.language, max: MAX_LANGUAGE },
    { label: 'Wage', value: score.wage, max: MAX_WAGE },
    { label: 'Area', value: score.area, max: MAX_AREA },
  ]
  return <ScoreCard variant="breakdown" rows={rows} source="Based on BC's official Skills Immigration points grid" />
}
