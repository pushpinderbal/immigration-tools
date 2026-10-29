import { ToolWorkspace } from '../../components/CalculatorChrome'
import { useMemo, useState } from 'react'
import { EligibilityBanner } from '../../components/EligibilityBanner'
import { LanguageTestInputs } from '../../components/LanguageTestInputs'
import { ScoreCard } from '../../components/ScoreCard'
import { Seo } from '../../components/Seo'
import { ToolSidebar } from '../../components/ToolSidebar'
import { ToolTiles } from '../../components/ToolTiles'
import { FormSections, CheckRow, Field, Note, Section, Select, Slider } from '../../components/ui'
import { convertTestToClb, emptyScores, overallClb } from '../../lib/crs/languages'
import type { LanguageTestState } from '../../lib/crs/languages'
import {
  eligibility,
  MAX_ADAPTABILITY,
  MAX_AGE,
  MAX_EDUCATION,
  MAX_EXPERIENCE,
  MAX_LANGUAGE,
  MAX_TOTAL,
  manitobaScore,
  MB_DOC,
  MB_LANGUAGE_DOC,
} from '../../lib/manitoba/score'
import type { ManitobaBreakdown, ManitobaEducation, ManitobaInput } from '../../lib/manitoba/score'

const ENGLISH_TESTS = ['ielts', 'celpip', 'pte'] as const
const FRENCH_TESTS = ['tef', 'tcf'] as const

const WORK_YEARS_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: '0', label: 'Less than 1 year' },
  { value: '1', label: '1 year' },
  { value: '2', label: '2 years' },
  { value: '3', label: '3 years' },
  { value: '4', label: '4+ years' },
]

const EDUCATION_OPTIONS: ReadonlyArray<{ value: ManitobaEducation | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: 'master-or-doctorate', label: "Master's or doctorate degree" },
  { value: 'two-post-secondary', label: 'Two post-secondary programs (2+ years each)' },
  { value: 'three-plus-year', label: 'One post-secondary program (3+ years)' },
  { value: 'two-year', label: 'One post-secondary program (2 years)' },
  { value: 'one-year', label: 'One-year post-secondary program' },
  { value: 'trade-certificate', label: 'Trade certificate' },
  { value: 'no-post-secondary', label: 'No formal post-secondary education' },
]

interface ManitobaUiState {
  firstOfficialLanguage: 'english' | 'french'
  occupationTeer: string
  firstLanguage: LanguageTestState
  secondLanguage: LanguageTestState
  age: number
  workYears: string
  recognizedByLicensingBody: boolean
  education: ManitobaEducation | ''
  closeRelative: boolean
  authorizedWork6Months: boolean
  postSecondary2Years: boolean
  postSecondary1Year: boolean
  closeFriendOrDistantRelative: boolean
  ongoingEmploymentJobOffer: boolean
  strategicInitiativeIta: boolean
  regionalDevelopmentOutsideWinnipeg: boolean
  workExperienceOtherProvince: boolean
  studiesOtherProvince: boolean
}

const DEFAULT_UI: ManitobaUiState = {
  firstOfficialLanguage: 'english',
  occupationTeer: '',
  firstLanguage: { test: 'none', scores: emptyScores() },
  secondLanguage: { test: 'none', scores: emptyScores() },
  age: 18,
  workYears: '',
  recognizedByLicensingBody: false,
  education: '',
  closeRelative: false,
  authorizedWork6Months: false,
  postSecondary2Years: false,
  postSecondary1Year: false,
  closeFriendOrDistantRelative: false,
  ongoingEmploymentJobOffer: false,
  strategicInitiativeIta: false,
  regionalDevelopmentOutsideWinnipeg: false,
  workExperienceOtherProvince: false,
  studiesOtherProvince: false,
}

export function ManitobaTool() {
  const [ui, setUi] = useState<ManitobaUiState>(DEFAULT_UI)
  const [hasStarted, setHasStarted] = useState(false)

  const input = useMemo<ManitobaInput>(() => {
    const firstLanguageClbs = convertTestToClb(ui.firstLanguage.test, ui.firstLanguage.scores)
    const secondClb = overallClb(convertTestToClb(ui.secondLanguage.test, ui.secondLanguage.scores))
    return {
      occupationTeer: (ui.occupationTeer === '' ? 4 : Number(ui.occupationTeer)) as ManitobaInput['occupationTeer'],
      firstLanguageClbs,
      secondLanguage: secondClb >= 5,
      age: ui.age,
      workYears: Number(ui.workYears) || 0,
      recognizedByLicensingBody: ui.recognizedByLicensingBody,
      education: (ui.education === '' ? 'no-post-secondary' : ui.education) as ManitobaEducation,
      connections: {
        closeRelative: ui.closeRelative,
        authorizedWork6Months: ui.authorizedWork6Months,
        postSecondary2Years: ui.postSecondary2Years,
        postSecondary1Year: ui.postSecondary1Year,
        closeFriendOrDistantRelative: ui.closeFriendOrDistantRelative,
      },
      demand: {
        ongoingEmploymentJobOffer: ui.ongoingEmploymentJobOffer,
        strategicInitiativeIta: ui.strategicInitiativeIta,
      },
      regionalDevelopmentOutsideWinnipeg: ui.regionalDevelopmentOutsideWinnipeg,
      risk: {
        workExperienceOtherProvince: ui.workExperienceOtherProvince,
        studiesOtherProvince: ui.studiesOtherProvince,
      },
    }
  }, [ui])

  const score = useMemo(() => manitobaScore(input), [input])

  const eligibilityResult = useMemo(() => eligibility(input), [input])

  const patch = (p: Partial<ManitobaUiState>) => {
    setHasStarted(true)
    setUi((prev) => ({ ...prev, ...p }))
  }

  const addSecondLanguage = () => {
    patch({ secondLanguage: { test: ui.firstOfficialLanguage === 'english' ? 'tef' : 'ielts', scores: emptyScores() } })
  }

  return (
    <div className="tool-page px-4 sm:px-6">
      <Seo
        title="Manitoba MPNP Points Calculator | ImmiCalc"
        description="Calculate Manitoba MPNP EOI ranking points and selected Skilled Worker checks."
        path="/manitoba"
      />
      <ToolTiles current="manitoba" />
      <div className="tool-header">
        <p className="tool-kicker">Manitoba · Provincial program</p>
        <h1 className="tool-title mt-3">Manitoba MPNP Points Calculator</h1>
        <p className="tool-description">
          Manitoba ranks Skilled Worker candidates in its Expression of Interest pool out of 1000. Enter your details
          to see your points and how each factor adds up.
        </p>
      </div>

      {hasStarted && (
        <div className="mt-6">
          <EligibilityBanner eligible={eligibilityResult.eligible} reasons={eligibilityResult.reasons} />
        </div>
      )}

      <ToolWorkspace>
        <FormSections>
          <Section title="Language results" tabLabel="Language" help={MB_LANGUAGE_DOC} description="First and second official language results." summary={ui.firstLanguage.test === 'none' ? 'Not entered' : `${ui.firstOfficialLanguage === 'english' ? 'English' : 'French'} results`}>
            <Field label="First official language" help={MB_LANGUAGE_DOC}>
              <Select ariaLabel="First official language" value={ui.firstOfficialLanguage}
                onChange={(v) => patch({ firstOfficialLanguage: v as 'english' | 'french', firstLanguage: { test: 'none', scores: emptyScores() }, secondLanguage: { test: 'none', scores: emptyScores() } })}
                options={[{ value: 'english', label: 'English' }, { value: 'french', label: 'French' }]} />
            </Field>
            <Field label="Occupation TEER (language requirement)" help={MB_LANGUAGE_DOC}>
              <Select ariaLabel="Occupation TEER (language requirement)" value={ui.occupationTeer}
                onChange={(v) => patch({ occupationTeer: v })}
                options={[{ value: '', label: 'Select...' }, { value: '0', label: 'TEER 0 to 3' }, { value: '4', label: 'TEER 4 or 5' }]} />
            </Field>
            <LanguageTestInputs
              title={`${ui.firstOfficialLanguage === 'english' ? 'English' : 'French'} (first official language)`}
              allowedTests={ui.firstOfficialLanguage === 'english' ? ENGLISH_TESTS : FRENCH_TESTS}
              value={ui.firstLanguage}
              onChange={(next) => patch({ firstLanguage: next })}
              help={MB_LANGUAGE_DOC}
            />

            {ui.secondLanguage.test === 'none' ? (
              <button
                type="button"
                onClick={addSecondLanguage}
                className="add-language flex w-full items-center justify-center gap-2 text-sm"
              >
                <span aria-hidden="true">+</span> Add second language test
              </button>
            ) : (
              <LanguageTestInputs
                title="Second official language"
                allowedTests={ui.firstOfficialLanguage === 'english' ? FRENCH_TESTS : ENGLISH_TESTS}
                value={ui.secondLanguage}
                onChange={(next) => patch({ secondLanguage: next })}
                help={MB_LANGUAGE_DOC}
              />
            )}
            <Note>
              Language points are awarded for each ability band (reading, writing, listening, speaking)
              separately. The second official language is a flat 25 points at overall CLB 5 or higher.
            </Note>
          </Section>

          <Section title="Age and work experience" tabLabel="Experience" help={MB_DOC} description="Age, completed work and licensing." summary={`${ui.age} years / ${ui.workYears || 0} years work`}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Slider
                label="Age"
                min={18}
                max={60}
                value={ui.age}
                onChange={(v) => patch({ age: v })}
                format={(v) => (v >= 50 ? '50+' : String(v))}
                help={MB_DOC}
              />
              <Field label="Work experience in the last 5 years" help={MB_DOC}>
                <Select
                  ariaLabel="Work experience in the last 5 years"
                  value={ui.workYears}
                  onChange={(v) => patch({ workYears: v })}
                  options={WORK_YEARS_OPTIONS}
                />
              </Field>
            </div>
            <CheckRow
              label="Experience fully recognized by the Manitoba licensing body"
              checked={ui.recognizedByLicensingBody}
              onChange={(v) => patch({ recognizedByLicensingBody: v })}
              help={MB_DOC}
            />
          </Section>

          <Section title="Education" help={MB_DOC} description="Highest completed credential." summary={EDUCATION_OPTIONS.find((o) => o.value === ui.education)?.label.replace('Select...', 'Not entered')}>
            <Field label="Highest level of education" help={MB_DOC}>
              <Select
                ariaLabel="Highest level of education"
                value={ui.education}
                onChange={(v) => patch({ education: v as ManitobaEducation | '' })}
                options={EDUCATION_OPTIONS}
              />
            </Field>
          </Section>

          <Section title="Manitoba connections" tabLabel="Connections" help={MB_DOC} description="Family, employment and regional connections." summary={ui.closeRelative ? 'Family' : ui.ongoingEmploymentJobOffer ? 'Employment' : ui.closeFriendOrDistantRelative ? 'Friend or relative' : 'Edit connections'}>
            <p className="text-sm font-medium text-ink">Connections to Manitoba</p>
            <Field label="Highest-scoring connection to Manitoba" help={MB_DOC}>
              <Select ariaLabel="Highest-scoring connection to Manitoba"
                value={ui.closeRelative ? 'family' : ui.authorizedWork6Months ? 'work' : ui.postSecondary2Years ? 'study-2' : ui.postSecondary1Year ? 'study-1' : ui.closeFriendOrDistantRelative ? 'friend' : 'none'}
                onChange={(value) => patch({ closeRelative: value === 'family', authorizedWork6Months: value === 'work',
                  postSecondary2Years: value === 'study-2', postSecondary1Year: value === 'study-1', closeFriendOrDistantRelative: value === 'friend' })}
                options={[
                  { value: 'none', label: 'No connection' }, { value: 'family', label: 'Close relative in Manitoba' },
                  { value: 'work', label: 'Previous authorized work, 6+ months' }, { value: 'study-2', label: 'Manitoba study, 2+ years' },
                  { value: 'study-1', label: 'Manitoba study, 1 year' }, { value: 'friend', label: 'Close friend or distant relative' },
                ]} />
            </Field>
            <Note>Connections to Manitoba are capped at 200 points.</Note>
            <p className="text-sm font-medium text-ink">Manitoba demand</p>
            <div className="space-y-3">
              <CheckRow
                label="Ongoing employment in Manitoba (6+ months) with a long-term job offer from the same employer"
                checked={ui.ongoingEmploymentJobOffer}
                onChange={(v) => patch({ ongoingEmploymentJobOffer: v })}
                help={MB_DOC}
              />
              <CheckRow
                label="Invitation to Apply under a Strategic Initiative"
                checked={ui.strategicInitiativeIta}
                onChange={(v) => patch({ strategicInitiativeIta: v })}
                help={MB_DOC}
              />
            </div>
            <Note>Manitoba demand is capped at 500 points.</Note>
            <p className="text-sm font-medium text-ink">Regional development</p>
            <CheckRow
              label="Existing connection to a community outside the Manitoba Capital Region"
              checked={ui.regionalDevelopmentOutsideWinnipeg}
              onChange={(v) => patch({ regionalDevelopmentOutsideWinnipeg: v })}
              help={MB_DOC}
            />
          </Section>

          <Section title="Other provinces" tabLabel="Other provinces" help={MB_DOC} description="Previous work and study outside Manitoba.">
            <div className="space-y-3">
              <CheckRow
                label="Work experience in another province"
                checked={ui.workExperienceOtherProvince}
                onChange={(v) => patch({ workExperienceOtherProvince: v })}
                help={MB_DOC}
              />
              <CheckRow
                label="Studies in another province"
                checked={ui.studiesOtherProvince}
                onChange={(v) => patch({ studiesOtherProvince: v })}
                help={MB_DOC}
              />
            </div>
            <Note>
              A close relative in another province with no close relative in Manitoba, or a previous application to
              another province, receives zero points in this grid.
            </Note>
          </Section>

          <Note>
            Grid checked October 28, 2026. The 60-out-of-100 assessment applies to Skilled Worker Overseas and is
            calculated separately from this ranking score. Ongoing Manitoba employment with a long-term offer is
            checked as a Skilled Worker in Manitoba profile. Employer, occupation and settlement requirements still apply.
          </Note>
        </FormSections>

        <ToolSidebar
          label="Estimated MPNP EOI score"
          total={score.total}
          max={MAX_TOTAL}
          breakdown={<ManitobaScorePanel score={score} />}
        />
      </ToolWorkspace>

    </div>
  )
}

function ManitobaScorePanel({ score }: { score: ManitobaBreakdown }) {
  const rows: Array<{ label: string; value: number; max?: number }> = [
    { label: 'Language', value: score.language, max: MAX_LANGUAGE },
    { label: 'Age', value: score.age, max: MAX_AGE },
    { label: 'Work experience', value: score.experience, max: MAX_EXPERIENCE },
    { label: 'Education', value: score.education, max: MAX_EDUCATION },
    { label: 'Adaptability', value: score.adaptability, max: MAX_ADAPTABILITY },
    { label: 'Risk assessment', value: score.risk },
  ]
  return (
    <ScoreCard
      variant="breakdown"
      rows={rows}
      source="Based on Manitoba's official MPNP EOI points grid"
    />
  )
}
