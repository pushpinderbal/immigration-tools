import { useMemo, useState } from 'react'
import { LanguageTestInputs } from '../../components/LanguageTestInputs'
import { Recommendations } from '../../components/Recommendations'
import { ScoreCard } from '../../components/ScoreCard'
import { Seo } from '../../components/Seo'
import { ToolSidebar } from '../../components/ToolSidebar'
import { ToolTiles } from '../../components/ToolTiles'
import { DrawFeed } from '../../components/DrawFeed'
import { CheckRow, Field, Note, Section, Segmented, Select, Slider } from '../../components/ui'
import { convertTestToClb, emptyScores } from '../../lib/crs/languages'
import type { LanguageTestState } from '../../lib/crs/languages'
import { crsScore } from '../../lib/crs/score'
import {
  MAX_ADDITIONAL,
  MAX_CORE_WITH_SPOUSE,
  MAX_CORE_WITHOUT_SPOUSE,
  MAX_SPOUSE,
  MAX_TOTAL,
  MAX_TRANSFERABILITY,
} from '../../lib/crs/tables'
import type { CrsBreakdown, CrsInput, EducationLevel, WorkYears } from '../../lib/crs/types'
import type { CanadianEducation } from '../../lib/crs/types'

const IRCC_GRID =
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/criteria-comprehensive-ranking-system/grid.html'
const IRCC_LANGUAGE =
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-requirements.html'

const EDUCATION_OPTIONS: ReadonlyArray<{ value: EducationLevel | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: 'less-than-secondary', label: 'Less than secondary' },
  { value: 'secondary', label: 'Secondary school' },
  { value: 'one-year', label: '1-year program' },
  { value: 'two-year', label: '2-year program' },
  { value: 'bachelor', label: "Bachelor's (3+ years)" },
  { value: 'two-plus', label: 'Two or more credentials' },
  { value: 'master', label: "Master's / professional degree" },
  { value: 'doctorate', label: 'Doctoral degree' },
]

const WORK_YEARS_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: '0', label: 'None' },
  { value: '1', label: '1 year' },
  { value: '2', label: '2 years' },
  { value: '3', label: '3 years' },
  { value: '4', label: '4 years' },
  { value: '5', label: '5+ years' },
]

const CANADIAN_EDUCATION_OPTIONS: ReadonlyArray<{ value: CanadianEducation | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: 'none', label: 'None' },
  { value: 'one-two-years', label: '1-2 years' },
  { value: 'three-plus-years', label: '3+ years' },
]

const ENGLISH_TESTS = ['ielts', 'celpip', 'pte'] as const
const FRENCH_TESTS = ['tef', 'tcf'] as const
const ALL_TESTS = ['ielts', 'celpip', 'pte', 'tef', 'tcf'] as const

interface SpouseUi {
  education: EducationLevel | ''
  test: LanguageTestState
  canadianWorkYears: WorkYears | ''
}

interface CrsUiState {
  age: number
  hasAccompanyingSpouse: boolean
  education: EducationLevel | ''
  firstOfficialLanguage: 'english' | 'french'
  english: LanguageTestState
  french: LanguageTestState
  canadianWorkYears: WorkYears | ''
  foreignWorkYears: WorkYears | ''
  spouse?: SpouseUi
  certificateOfQualification: boolean
  provincialNomination: boolean
  canadianEducation: CanadianEducation | ''
  siblingInCanada: boolean
}

const DEFAULT_FRENCH: LanguageTestState = { test: 'none', scores: emptyScores() }

const DEFAULT_SPOUSE: SpouseUi = {
  education: '',
  test: { test: 'none', scores: emptyScores() },
  canadianWorkYears: '',
}

const DEFAULT_UI: CrsUiState = {
  age: 17,
  hasAccompanyingSpouse: false,
  education: '',
  firstOfficialLanguage: 'english',
  english: { test: 'none', scores: emptyScores() },
  french: DEFAULT_FRENCH,
  canadianWorkYears: '',
  foreignWorkYears: '',
  certificateOfQualification: false,
  provincialNomination: false,
  canadianEducation: '',
  siblingInCanada: false,
}

export function CrsTool() {
  const [ui, setUi] = useState<CrsUiState>(DEFAULT_UI)

  const input = useMemo<CrsInput>(() => {
    const english = convertTestToClb(ui.english.test, ui.english.scores)
    const french = convertTestToClb(ui.french.test, ui.french.scores)
    const spouseLanguage = convertTestToClb(ui.spouse?.test.test ?? 'none', ui.spouse?.test.scores ?? emptyScores())

    return {
      age: ui.age,
      hasAccompanyingSpouse: ui.hasAccompanyingSpouse,
      education: (ui.education === '' ? 'less-than-secondary' : ui.education) as EducationLevel,
      firstOfficialLanguage: ui.firstOfficialLanguage,
      english,
      french,
      canadianWorkYears: (ui.canadianWorkYears === '' ? 0 : Number(ui.canadianWorkYears)) as WorkYears,
      foreignWorkYears: (ui.foreignWorkYears === '' ? 0 : Number(ui.foreignWorkYears)) as WorkYears,
      spouse: ui.hasAccompanyingSpouse
        ? {
            education: (ui.spouse?.education || 'secondary') as EducationLevel,
            language: spouseLanguage,
            canadianWorkYears: Number(ui.spouse?.canadianWorkYears ?? 0) as WorkYears,
          }
        : undefined,
      certificateOfQualification: ui.certificateOfQualification,
      provincialNomination: ui.provincialNomination,
      canadianEducation: (ui.canadianEducation === '' ? 'none' : ui.canadianEducation) as CanadianEducation,
      siblingInCanada: ui.siblingInCanada,
    }
  }, [ui])

  const score = useMemo(() => crsScore(input), [input])

  const patch = (p: Partial<CrsUiState>) => setUi((prev) => ({ ...prev, ...p }))

  const setFirstLanguage = (v: 'english' | 'french') => {
    setUi((prev) => {
      const demoted = v === 'english' ? 'french' : 'english'
      return { ...prev, firstOfficialLanguage: v, [demoted]: { test: 'none', scores: emptyScores() } }
    })
  }

  const secondLang = ui.firstOfficialLanguage === 'french' ? ui.english : ui.french
  const secondKey = ui.firstOfficialLanguage === 'french' ? 'english' : 'french'
  const secondTitle = ui.firstOfficialLanguage === 'french' ? 'English' : 'French'
  const secondTests = ui.firstOfficialLanguage === 'french' ? ENGLISH_TESTS : FRENCH_TESTS

  const addSecondLanguage = () => {
    patch({ [secondKey]: { test: secondTests[0], scores: emptyScores() } })
  }

  const setSpouseFlag = (v: 'no' | 'yes') => {
    setUi((prev) => ({
      ...prev,
      hasAccompanyingSpouse: v === 'yes',
      spouse: v === 'yes' ? (prev.spouse ?? DEFAULT_SPOUSE) : undefined,
    }))
  }

  const patchSpouse = (p: Partial<SpouseUi>) => {
    setUi((prev) => ({ ...prev, spouse: { ...(prev.spouse ?? DEFAULT_SPOUSE), ...p } }))
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-12 sm:px-6">
      <Seo
        title="CRS Calculator | ImmiCalc"
        description="Work out your Express Entry Comprehensive Ranking System (CRS) score with this free calculator. Runs entirely in your browser."
        path="/crs"
      />
      <ToolTiles current="crs" />
      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">CRS Calculator</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-muted">
        Express Entry ranks every candidate out of 1200. Enter your details and see your score, with a breakdown of
        how each factor was awarded.
      </p>

      <div className="mt-8 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Section title="Profile" help={IRCC_GRID}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Slider
                label="Age"
                min={17}
                max={60}
                value={ui.age}
                onChange={(v) => patch({ age: v })}
                format={(v) => (v >= 45 ? '45+' : String(v))}
                help={IRCC_GRID}
              />
              <Field label="Accompanying spouse or partner" help={IRCC_GRID}>
                <Segmented
                  ariaLabel="Accompanying spouse"
                  value={ui.hasAccompanyingSpouse ? 'yes' : 'no'}
                  onChange={setSpouseFlag}
                  options={[
                    { value: 'no', label: 'No' },
                    { value: 'yes', label: 'Yes' },
                  ]}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Highest level of education" help={IRCC_GRID}>
                <Select
                  ariaLabel="Highest level of education"
                  value={ui.education}
                  onChange={(v) => patch({ education: v as EducationLevel | '' })}
                  options={EDUCATION_OPTIONS}
                />
              </Field>
              <Field label="Post-secondary education in Canada" help={IRCC_GRID}>
                <Select
                  ariaLabel="Post-secondary education in Canada"
                  value={ui.canadianEducation}
                  onChange={(v) => patch({ canadianEducation: v as CanadianEducation | '' })}
                  options={CANADIAN_EDUCATION_OPTIONS}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Canadian work experience" help={IRCC_GRID}>
                <Select
                  ariaLabel="Canadian work experience"
                  value={String(ui.canadianWorkYears)}
                  onChange={(v) => patch({ canadianWorkYears: v === '' ? '' : (Number(v) as WorkYears) })}
                  options={WORK_YEARS_OPTIONS}
                />
              </Field>
              <Field label="Foreign work experience" help={IRCC_GRID}>
                <Select
                  ariaLabel="Foreign work experience"
                  value={String(ui.foreignWorkYears)}
                  onChange={(v) => patch({ foreignWorkYears: v === '' ? '' : (Number(v) as WorkYears) })}
                  options={WORK_YEARS_OPTIONS}
                />
              </Field>
            </div>
          </Section>

          <Section title="Language" help={IRCC_LANGUAGE}>
            <Field label="First official language" help={IRCC_LANGUAGE}>
              <Segmented
                ariaLabel="First official language"
                value={ui.firstOfficialLanguage}
                onChange={setFirstLanguage}
                options={[
                  { value: 'english', label: 'English' },
                  { value: 'french', label: 'French' },
                ]}
              />
            </Field>
            {ui.firstOfficialLanguage === 'english' ? (
              <LanguageTestInputs
                title="English"
                allowedTests={ENGLISH_TESTS}
                value={ui.english}
                onChange={(next) => patch({ english: next })}
                help={IRCC_LANGUAGE}
              />
            ) : (
              <LanguageTestInputs
                title="French"
                allowedTests={FRENCH_TESTS}
                value={ui.french}
                onChange={(next) => patch({ french: next })}
                help={IRCC_LANGUAGE}
              />
            )}
            {secondLang.test === 'none' ? (
              <button
                type="button"
                onClick={addSecondLanguage}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line text-sm text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <span aria-hidden="true">+</span> Add {secondTitle} test
              </button>
            ) : (
              <LanguageTestInputs
                title={`${secondTitle} (second language)`}
                allowedTests={secondTests}
                value={secondLang}
                onChange={(next) => patch({ [secondKey]: next })}
                help={IRCC_LANGUAGE}
              />
            )}
          </Section>

          {ui.hasAccompanyingSpouse && (
            <Section title="Spouse or partner" help={IRCC_GRID}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Highest level of education" help={IRCC_GRID}>
                  <Select
                    ariaLabel="Spouse highest level of education"
                    value={ui.spouse?.education ?? ''}
                    onChange={(v) => patchSpouse({ education: v as EducationLevel | '' })}
                    options={EDUCATION_OPTIONS}
                  />
                </Field>
                <Field label="Canadian work experience" help={IRCC_GRID}>
                  <Select
                    ariaLabel="Spouse Canadian work experience"
                    value={String(ui.spouse?.canadianWorkYears ?? '')}
                    onChange={(v) =>
                      patchSpouse({ canadianWorkYears: v === '' ? '' : (Number(v) as WorkYears) })
                    }
                    options={WORK_YEARS_OPTIONS}
                  />
                </Field>
              </div>
              <LanguageTestInputs
                title="Official language"
                allowedTests={ALL_TESTS}
                value={ui.spouse?.test ?? DEFAULT_SPOUSE.test}
                onChange={(next) => patchSpouse({ test: next })}
                help={IRCC_LANGUAGE}
              />
            </Section>
          )}

          <Section title="Additional points" help={IRCC_GRID}>
            <div className="space-y-3">
              <CheckRow
                label="Provincial nomination"
                checked={ui.provincialNomination}
                onChange={(v) => patch({ provincialNomination: v })}
                help={IRCC_GRID}
              />
              <CheckRow
                label="Sibling in Canada (citizen or PR, 18+)"
                checked={ui.siblingInCanada}
                onChange={(v) => patch({ siblingInCanada: v })}
                help={IRCC_GRID}
              />
              <CheckRow
                label="Certificate of qualification (trade)"
                checked={ui.certificateOfQualification}
                onChange={(v) => patch({ certificateOfQualification: v })}
                help={IRCC_GRID}
              />
              <Note>No points for LMIA-backed job offers.</Note>
            </div>
          </Section>

          <Recommendations input={input} currentTotal={score.total} />
        </div>

        <ToolSidebar
          label="Estimated CRS score"
          total={score.total}
          max={MAX_TOTAL}
          breakdown={<ScorePanel score={score} withSpouse={ui.hasAccompanyingSpouse} />}
          draws={<DrawFeed />}
        />
      </div>
    </div>
  )
}

function ScorePanel({ score, withSpouse }: { score: CrsBreakdown; withSpouse: boolean }) {
  const rows: Array<{ label: string; value: number; max?: number }> = [
    { label: 'Core', value: score.core, max: withSpouse ? MAX_CORE_WITH_SPOUSE : MAX_CORE_WITHOUT_SPOUSE },
    { label: 'Spouse', value: score.spouse, max: withSpouse ? MAX_SPOUSE : undefined },
    { label: 'Transferability', value: score.transferability, max: MAX_TRANSFERABILITY },
    { label: 'Additional', value: score.additional, max: MAX_ADDITIONAL },
  ]
  return (
    <ScoreCard
      variant="breakdown"
      rows={rows}
      source="Based on IRCC's official CRS grid"
    />
  )
}
