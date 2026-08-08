import { useMemo, useState } from 'react'
import { EligibilityBanner } from '../../components/EligibilityBanner'
import { LanguageTestInputs } from '../../components/LanguageTestInputs'
import { ScoreCard } from '../../components/ScoreCard'
import { Seo } from '../../components/Seo'
import { ToolSidebar } from '../../components/ToolSidebar'
import { ToolTiles } from '../../components/ToolTiles'
import { CheckRow, Field, Note, Section, Select, Slider } from '../../components/ui'
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
const SECOND_LANGUAGE_TESTS = ['ielts', 'celpip', 'pte', 'tef', 'tcf'] as const

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
  english: LanguageTestState
  hasSecondLanguage: boolean
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
  english: { test: 'none', scores: emptyScores() },
  hasSecondLanguage: false,
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

  const input = useMemo<ManitobaInput>(() => {
    const englishClbs = convertTestToClb(ui.english.test, ui.english.scores)
    const secondClb = overallClb(convertTestToClb(ui.secondLanguage.test, ui.secondLanguage.scores))
    return {
      firstLanguageClbs: englishClbs,
      secondLanguage: ui.hasSecondLanguage && secondClb >= 5,
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

  const patch = (p: Partial<ManitobaUiState>) => setUi((prev) => ({ ...prev, ...p }))

  const addSecondLanguage = () => {
    patch({ secondLanguage: { test: 'tef', scores: emptyScores() } })
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-12 sm:px-6">
      <Seo
        title="Manitoba MPNP Points Calculator | ImmiCalc"
        description="Work out your Manitoba Provincial Nominee Program (MPNP) Expression of Interest (EOI) points with this free calculator. Runs entirely in your browser."
        path="/manitoba"
      />
      <ToolTiles current="manitoba" />
      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">Manitoba MPNP Points Calculator</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-muted">
        Manitoba ranks Skilled Worker candidates in its Expression of Interest pool out of 1000. Enter your details
        to see your points and how each factor adds up.
      </p>

      <div className="mt-6">
        <EligibilityBanner eligible={eligibilityResult.eligible} reasons={eligibilityResult.reasons} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Section title="Language" help={MB_LANGUAGE_DOC}>
            <LanguageTestInputs
              title="English (first official language)"
              allowedTests={ENGLISH_TESTS}
              value={ui.english}
              onChange={(next) => patch({ english: next })}
              help={MB_LANGUAGE_DOC}
            />
            <CheckRow
              label="Second official language (overall CLB 5+)"
              checked={ui.hasSecondLanguage}
              onChange={(v) => patch({ hasSecondLanguage: v })}
              help={MB_LANGUAGE_DOC}
            />
            {ui.secondLanguage.test === 'none' ? (
              <button
                type="button"
                onClick={addSecondLanguage}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line text-sm text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <span aria-hidden="true">+</span> Add second language test
              </button>
            ) : (
              <LanguageTestInputs
                title="Second official language"
                allowedTests={SECOND_LANGUAGE_TESTS}
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

          <Section title="Age and work experience" help={MB_DOC}>
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

          <Section title="Education" help={MB_DOC}>
            <Field label="Highest level of education" help={MB_DOC}>
              <Select
                ariaLabel="Highest level of education"
                value={ui.education}
                onChange={(v) => patch({ education: v as ManitobaEducation | '' })}
                options={EDUCATION_OPTIONS}
              />
            </Field>
          </Section>

          <Section title="Adaptability" help={MB_DOC}>
            <p className="text-sm font-medium text-ink">Connections to Manitoba</p>
            <div className="space-y-3">
              <CheckRow
                label="Close relative in Manitoba"
                checked={ui.closeRelative}
                onChange={(v) => patch({ closeRelative: v })}
                help={MB_DOC}
              />
              <CheckRow
                label="Previous authorized work experience in Manitoba (6+ months)"
                checked={ui.authorizedWork6Months}
                onChange={(v) => patch({ authorizedWork6Months: v })}
                help={MB_DOC}
              />
              <CheckRow
                label="Post-secondary program in Manitoba (2+ years)"
                checked={ui.postSecondary2Years}
                onChange={(v) => patch({ postSecondary2Years: v })}
                help={MB_DOC}
              />
              <CheckRow
                label="Post-secondary program in Manitoba (1 year)"
                checked={ui.postSecondary1Year}
                onChange={(v) => patch({ postSecondary1Year: v })}
                help={MB_DOC}
              />
              <CheckRow
                label="Close friend or distant relative in Manitoba"
                checked={ui.closeFriendOrDistantRelative}
                onChange={(v) => patch({ closeFriendOrDistantRelative: v })}
                help={MB_DOC}
              />
            </div>
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
              label="Immigration destination in Manitoba outside Winnipeg"
              checked={ui.regionalDevelopmentOutsideWinnipeg}
              onChange={(v) => patch({ regionalDevelopmentOutsideWinnipeg: v })}
              help={MB_DOC}
            />
          </Section>

          <Section title="Risk assessment" help={MB_DOC}>
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
              another province, is declared but does not affect your points.
            </Note>
          </Section>

          <Note>
            These points rank you in the MPNP pool. Entering the pool also requires a separate minimum score of 60
            out of 100 on Manitoba's eligibility grid, which this calculator does not compute.
          </Note>
        </div>

        <ToolSidebar
          label="Estimated MPNP EOI score"
          total={score.total}
          max={MAX_TOTAL}
          breakdown={<ManitobaScorePanel score={score} />}
        />
      </div>

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
