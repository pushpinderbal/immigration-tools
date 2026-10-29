import { useMemo } from 'react'
import { useCalculatorForm } from '../../hooks/useCalculatorForm'
import { EligibilityBanner } from '../../components/EligibilityBanner'
import { LanguageTestInputs, OptionalLanguageTestInputs } from '../../components/LanguageTestInputs'
import { ScoreCard } from '../../components/ScoreCard'
import { Seo } from '../../components/Seo'
import { ToolSidebar } from '../../components/ToolSidebar'
import { ToolTiles } from '../../components/ToolTiles'
import { FormSections, CheckRow, Field, Note, Section, Segmented, Select, Slider } from '../../components/ui'
import { ENGLISH_TESTS, FRENCH_TESTS, convertTestToClb, emptyScores, overallClb } from '../../lib/crs/languages'
import type { LanguageTestState } from '../../lib/crs/languages'
import {
  MAX_AGE,
  MAX_CONNECTION,
  MAX_EDUCATION,
  MAX_FACTOR_I,
  MAX_LANGUAGE,
  MAX_PRIOR_WORK,
  MAX_TOTAL,
  MAX_WORK,
  eligibility,
  sinpScore,
} from '../../lib/saskatchewan/score'
import type { EducationLevel, Eligibility, SinpBreakdown, SinpInput, SubCategory } from '../../lib/saskatchewan/score'

const SASK_DOC =
  'https://www.saskatchewan.ca/residents/moving-to-saskatchewan/live-in-saskatchewan/by-immigrating/saskatchewan-immigrant-nominee-program/assess-your-eligibility'

const EDUCATION_OPTIONS: ReadonlyArray<{ value: EducationLevel | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: 'none', label: 'No qualifying credential or trade certification' },
  { value: 'masters-doctorate', label: "Master's degree or doctorate" },
  { value: 'bachelor', label: "Bachelor's degree or 3+ year degree" },
  { value: 'trade', label: 'Trade certification (journeyperson)' },
  { value: 'diploma', label: 'Diploma (2 to <3 year program)' },
  { value: 'certificate', label: 'Certificate / <2-year program' },
]

const WORK_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: '0', label: 'None' },
  { value: '1', label: '1 year' },
  { value: '2', label: '2 years' },
  { value: '3', label: '3 years' },
  { value: '4', label: '4 years' },
  { value: '5', label: '5+ years' },
]

const PRIOR_WORK_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: '0', label: 'Less than 1 year' },
  { value: '1', label: '1 year' },
  { value: '2', label: '2 years' },
  { value: '3', label: '3 years' },
  { value: '4', label: '4 years' },
  { value: '5', label: '5+ years' },
]

interface SinpUiState {
  firstOfficialLanguage: 'english' | 'french'
  education: EducationLevel | ''
  work: string
  priorWork: string
  age: number
  firstLanguage: LanguageTestState
  secondLanguage: LanguageTestState
  subCategory: SubCategory
  family: boolean
  skWorkExperience: boolean
  skStudy: boolean
  jobOffer: boolean
}

const DEFAULT_UI: SinpUiState = {
  firstOfficialLanguage: 'english',
  education: '',
  work: '',
  priorWork: '',
  age: 17,
  firstLanguage: { test: 'none', scores: emptyScores() },
  secondLanguage: { test: 'none', scores: emptyScores() },
  subCategory: 'oid-ee',
  family: false,
  skWorkExperience: false,
  skStudy: false,
  jobOffer: false,
}

function buildInput(ui: SinpUiState): SinpInput {
  const firstLanguageClb = overallClb(convertTestToClb(ui.firstLanguage.test, ui.firstLanguage.scores))
  const secondLanguageClb = overallClb(convertTestToClb(ui.secondLanguage.test, ui.secondLanguage.scores))
  return {
    education: (ui.education === '' ? 'none' : ui.education) as EducationLevel,
    workYears: Number(ui.work) || 0,
    priorWorkYears: Number(ui.priorWork) || 0,
    age: ui.age,
    firstLanguageClb,
    secondLanguageClb,
    subCategory: ui.subCategory,
    family: ui.family,
    skWorkExperience: ui.skWorkExperience,
    skStudy: ui.skStudy,
    jobOffer: ui.jobOffer,
  }
}

export function SaskatchewanTool() {
  const { values: ui, patch, hasStarted } = useCalculatorForm<SinpUiState>(DEFAULT_UI)

  const input = useMemo(() => buildInput(ui), [ui])
  const score = useMemo(() => sinpScore(input), [input])
  const eligibilityResult: Eligibility = useMemo(() => eligibility(input), [input])

  return (
    <div className="tool-page px-4 sm:px-6">
      <Seo
        title="SINP Points Calculator | ImmiCalc"
        description="A straightforward SINP points check for Saskatchewan's International Skilled Worker program - a few simple questions, instant result."
        path="/saskatchewan"
      />
      <ToolTiles current="saskatchewan" />
      <div className="tool-header">
        <p className="tool-kicker">Saskatchewan · Provincial program</p>
        <h1 className="tool-title mt-3">SINP Points Calculator</h1>
        <p className="tool-description">
          Saskatchewan scores International Skilled Worker candidates out of 110. Enter your details to see your
          points and how they add up.
        </p>
      </div>

      {hasStarted && (
        <div className="mt-4">
          <EligibilityBanner eligible={eligibilityResult.eligible} reasons={eligibilityResult.reasons} />
        </div>
      )}

      <div className="tool-workspace">
        <FormSections>
          <Note>
            Grid checked October 28, 2026. This score covers International Skilled Worker only.
            Occupation, licensing, funds, Express Entry eligibility and current intake restrictions require separate review.
            The official years 6 to 10 table lists points for two to five years, with no one-year row;
            this calculator awards no points for a single year in that older period. Confirm that case with SINP.
          </Note>
          <Section title="Labour market success" help={SASK_DOC}>
            <Field label="Highest level of education or training" help={SASK_DOC}>
              <Select
                ariaLabel="Highest level of education or training"
                value={ui.education}
                onChange={(v) => patch({ education: v as EducationLevel | '' })}
                options={EDUCATION_OPTIONS}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Skilled work experience (last 5 years)" help={SASK_DOC}>
                <Select
                  ariaLabel="Skilled work experience (last 5 years)"
                  value={ui.work}
                  onChange={(v) => patch({ work: v })}
                  options={WORK_OPTIONS}
                />
              </Field>
              <Field label="Skilled work experience (6-10 years prior)" help={SASK_DOC}>
                <Select
                  ariaLabel="Skilled work experience (6-10 years prior)"
                  value={ui.priorWork}
                  onChange={(v) => patch({ priorWork: v })}
                  options={PRIOR_WORK_OPTIONS}
                />
              </Field>
            </div>
            <Slider
              label="Age"
              min={17}
              max={60}
              value={ui.age}
              onChange={(v) => patch({ age: v })}
              format={(v) => String(v)}
              help={SASK_DOC}
            />
          </Section>

          <Section title="Language" help={SASK_DOC}>
            <Field label="First official language" help={SASK_DOC}>
              <Select ariaLabel="First official language" value={ui.firstOfficialLanguage}
                onChange={(v) => patch({ firstOfficialLanguage: v as 'english' | 'french', firstLanguage: { test: 'none', scores: emptyScores() }, secondLanguage: { test: 'none', scores: emptyScores() } })}
                options={[{ value: 'english', label: 'English' }, { value: 'french', label: 'French' }]} />
            </Field>
            <LanguageTestInputs
              title={`${ui.firstOfficialLanguage === 'english' ? 'English' : 'French'} (first official language)`}
              allowedTests={ui.firstOfficialLanguage === 'english' ? ENGLISH_TESTS : FRENCH_TESTS}
              value={ui.firstLanguage}
              onChange={(next) => patch({ firstLanguage: next })}
              help={SASK_DOC}
            />
            <OptionalLanguageTestInputs
              title={`${ui.firstOfficialLanguage === 'english' ? 'French' : 'English'} (second official language)`}
              addLabel="Add second language test"
              allowedTests={ui.firstOfficialLanguage === 'english' ? FRENCH_TESTS : ENGLISH_TESTS}
              value={ui.secondLanguage}
              onChange={(next) => patch({ secondLanguage: next })}
              help={SASK_DOC}
            />
            <Note>The language score uses the overall CLB of your first official language, with a smaller bonus for a second official language.</Note>
          </Section>

          <Section title="Connection to Saskatchewan" help={SASK_DOC}>
            <Field label="Sub-category" help={SASK_DOC}>
              <Segmented
                ariaLabel="SINP sub-category"
                value={ui.subCategory}
                onChange={(v) => patch({ subCategory: v })}
                options={[
                  { value: 'oid-ee', label: 'OID / Express Entry' },
                  { value: 'employment-offer', label: 'Employment Offer' },
                ]}
              />
            </Field>
            {ui.subCategory === 'oid-ee' ? (
              <div className="space-y-3">
                <CheckRow
                  label="Close family relative in Saskatchewan"
                  checked={ui.family}
                  onChange={(v) => patch({ family: v })}
                  help={SASK_DOC}
                />
                <CheckRow
                  label="12+ months of work experience in Saskatchewan (last 5 years)"
                  checked={ui.skWorkExperience}
                  onChange={(v) => patch({ skWorkExperience: v })}
                  help={SASK_DOC}
                />
                <CheckRow
                  label="At least one full-time academic year of study in Saskatchewan"
                  checked={ui.skStudy}
                  onChange={(v) => patch({ skStudy: v })}
                  help={SASK_DOC}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <CheckRow
                  label="High-skilled job offer from a Saskatchewan employer"
                  checked={ui.jobOffer}
                  onChange={(v) => patch({ jobOffer: v })}
                  help={SASK_DOC}
                />
              </div>
            )}
            <Note>You need at least 60 points to enter the SINP EOI pool.</Note>
          </Section>
        </FormSections>

        <ToolSidebar
          label="Estimated SINP EOI score"
          total={score.total}
          max={MAX_TOTAL}
          breakdown={<SaskatchewanScorePanel score={score} />}
        />
      </div>

    </div>
  )
}

function SaskatchewanScorePanel({ score }: { score: SinpBreakdown }) {
  const rows: Array<{ label: string; value: number; max?: number }> = [
    { label: 'Labour market', value: score.education + score.work + score.workPrior + score.language + score.age, max: MAX_FACTOR_I },
    { label: 'Education', value: score.education, max: MAX_EDUCATION },
    { label: 'Work experience (last 5 years)', value: score.work, max: MAX_WORK },
    { label: 'Work experience (6-10 years prior)', value: score.workPrior, max: MAX_PRIOR_WORK },
    { label: 'Language', value: score.language, max: MAX_LANGUAGE },
    { label: 'Age', value: score.age, max: MAX_AGE },
    { label: 'Connection to Saskatchewan', value: score.connection, max: MAX_CONNECTION },
  ]
  return (
    <ScoreCard variant="breakdown" rows={rows} source="Based on Saskatchewan's official SINP points grid" />
  )
}
