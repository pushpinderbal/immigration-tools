import { useMemo, useState } from 'react'
import { LanguageTestInputs } from '../../components/LanguageTestInputs'
import { ScoreCard } from '../../components/ScoreCard'
import { Seo } from '../../components/Seo'
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

const EDUCATION_OPTIONS: ReadonlyArray<{ value: EducationLevel; label: string }> = [
  { value: 'less-than-secondary', label: 'Less than secondary' },
  { value: 'secondary', label: 'Secondary school' },
  { value: 'one-year', label: '1-year program' },
  { value: 'two-year', label: '2-year program' },
  { value: 'bachelor', label: "Bachelor's — 3+ years" },
  { value: 'two-plus', label: 'Two or more credentials' },
  { value: 'master', label: "Master's / professional degree" },
  { value: 'doctorate', label: 'Doctoral degree' },
]

const WORK_YEARS_OPTIONS = [
  { value: '0', label: 'None' },
  { value: '1', label: '1 year' },
  { value: '2', label: '2 years' },
  { value: '3', label: '3 years' },
  { value: '4', label: '4 years' },
  { value: '5', label: '5+ years' },
]

const CANADIAN_EDUCATION_OPTIONS: ReadonlyArray<{ value: CanadianEducation; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'one-two-years', label: '1–2 years' },
  { value: 'three-plus-years', label: '3+ years' },
]

const ENGLISH_TESTS = ['ielts', 'celpip', 'pte'] as const
const FRENCH_TESTS = ['tef', 'tcf'] as const
const ALL_TESTS = ['ielts', 'celpip', 'pte', 'tef', 'tcf'] as const

interface SpouseUi {
  education: EducationLevel
  test: LanguageTestState
  canadianWorkYears: WorkYears
}

interface CrsUiState {
  age: number
  hasAccompanyingSpouse: boolean
  education: EducationLevel
  firstOfficialLanguage: 'english' | 'french'
  english: LanguageTestState
  french: LanguageTestState
  canadianWorkYears: WorkYears
  foreignWorkYears: WorkYears
  spouse?: SpouseUi
  certificateOfQualification: boolean
  provincialNomination: boolean
  canadianEducation: CanadianEducation
  siblingInCanada: boolean
}

const DEFAULT_ENGLISH: LanguageTestState = {
  test: 'ielts',
  scores: { listening: 6, reading: 6, writing: 6, speaking: 6 },
}

const DEFAULT_FRENCH: LanguageTestState = { test: 'none', scores: emptyScores() }

const DEFAULT_SPOUSE: SpouseUi = {
  education: 'secondary',
  test: { test: 'none', scores: emptyScores() },
  canadianWorkYears: 0,
}

const DEFAULT_UI: CrsUiState = {
  age: 30,
  hasAccompanyingSpouse: false,
  education: 'bachelor',
  firstOfficialLanguage: 'english',
  english: DEFAULT_ENGLISH,
  french: DEFAULT_FRENCH,
  canadianWorkYears: 0,
  foreignWorkYears: 0,
  certificateOfQualification: false,
  provincialNomination: false,
  canadianEducation: 'none',
  siblingInCanada: false,
}

export function CrsTool() {
  const [ui, setUi] = useState<CrsUiState>(DEFAULT_UI)

  const score = useMemo(() => {
    const english = convertTestToClb(ui.english.test, ui.english.scores)
    const french = convertTestToClb(ui.french.test, ui.french.scores)
    const spouseLanguage = convertTestToClb(ui.spouse?.test.test ?? 'none', ui.spouse?.test.scores ?? emptyScores())

    const input: CrsInput = {
      age: ui.age,
      hasAccompanyingSpouse: ui.hasAccompanyingSpouse,
      education: ui.education,
      firstOfficialLanguage: ui.firstOfficialLanguage,
      english,
      french,
      canadianWorkYears: ui.canadianWorkYears,
      foreignWorkYears: ui.foreignWorkYears,
      spouse: ui.hasAccompanyingSpouse
        ? {
            education: ui.spouse?.education ?? DEFAULT_SPOUSE.education,
            language: spouseLanguage,
            canadianWorkYears: ui.spouse?.canadianWorkYears ?? 0,
          }
        : undefined,
      certificateOfQualification: ui.certificateOfQualification,
      provincialNomination: ui.provincialNomination,
      canadianEducation: ui.canadianEducation,
      siblingInCanada: ui.siblingInCanada,
    }
    return crsScore(input)
  }, [ui])

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
        title="CRS Calculator"
        description="Calculate your Express Entry Comprehensive Ranking System (CRS) score. Free, client-side calculator based on the official IRCC grid."
        path="/crs"
      />
      <h1 className="text-2xl font-semibold tracking-tight text-ink">CRS Calculator</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-muted">
        Estimate your Express Entry Comprehensive Ranking System (CRS) score based on the official IRCC grid.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="order-2 space-y-5 lg:order-1">
          <Section title="Profile">
            <Slider
              label="Age"
              min={17}
              max={60}
              value={ui.age}
              onChange={(v) => patch({ age: v })}
              format={(v) => (v >= 45 ? '45+' : String(v))}
            />
            <Field label="Accompanying spouse or partner">
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
            <div className="grid grid-cols-2 gap-3">
              <Field label="Highest education credentials">
                <Select
                  ariaLabel="Highest education credentials"
                  value={ui.education}
                  onChange={(v) => patch({ education: v as EducationLevel })}
                  options={EDUCATION_OPTIONS}
                />
              </Field>
              <Field label="Post-secondary education in Canada">
                <Select
                  ariaLabel="Post-secondary education in Canada"
                  value={ui.canadianEducation}
                  onChange={(v) => patch({ canadianEducation: v as CanadianEducation })}
                  options={CANADIAN_EDUCATION_OPTIONS}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Canadian work">
                <Select
                  ariaLabel="Canadian work experience"
                  value={String(ui.canadianWorkYears)}
                  onChange={(v) => patch({ canadianWorkYears: Number(v) as WorkYears })}
                  options={WORK_YEARS_OPTIONS}
                />
              </Field>
              <Field label="Foreign work">
                <Select
                  ariaLabel="Foreign work experience"
                  value={String(ui.foreignWorkYears)}
                  onChange={(v) => patch({ foreignWorkYears: Number(v) as WorkYears })}
                  options={WORK_YEARS_OPTIONS}
                />
              </Field>
            </div>
          </Section>

          <Section title="Official languages">
            <Field label="First official language">
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
              />
            ) : (
              <LanguageTestInputs
                title="French"
                allowedTests={FRENCH_TESTS}
                value={ui.french}
                onChange={(next) => patch({ french: next })}
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
                title={`${secondTitle} — second language`}
                allowedTests={secondTests}
                value={secondLang}
                onChange={(next) => patch({ [secondKey]: next })}
              />
            )}
          </Section>

          {ui.hasAccompanyingSpouse && (
            <Section title="Spouse or partner">
              <Field label="Highest education credentials">
                <Select
                  ariaLabel="Spouse highest education credentials"
                  value={ui.spouse?.education ?? DEFAULT_SPOUSE.education}
                  onChange={(v) => patchSpouse({ education: v as EducationLevel })}
                  options={EDUCATION_OPTIONS}
                />
              </Field>
              <LanguageTestInputs
                title="Official language"
                allowedTests={ALL_TESTS}
                value={ui.spouse?.test ?? DEFAULT_SPOUSE.test}
                onChange={(next) => patchSpouse({ test: next })}
              />
              <Field label="Canadian work">
                <Select
                  ariaLabel="Spouse Canadian work experience"
                  value={String(ui.spouse?.canadianWorkYears ?? 0)}
                  onChange={(v) => patchSpouse({ canadianWorkYears: Number(v) as WorkYears })}
                  options={WORK_YEARS_OPTIONS}
                />
              </Field>
            </Section>
          )}

          <Section title="Additional points">
            <div className="space-y-3">
              <CheckRow
                label="Provincial nomination"
                checked={ui.provincialNomination}
                onChange={(v) => patch({ provincialNomination: v })}
              />
              <CheckRow
                label="Sibling in Canada (citizen or PR, 18+)"
                checked={ui.siblingInCanada}
                onChange={(v) => patch({ siblingInCanada: v })}
              />
              <CheckRow
                label="Certificate of qualification (trade)"
                checked={ui.certificateOfQualification}
                onChange={(v) => patch({ certificateOfQualification: v })}
              />
              <Note>No points for LMIA-backed job offers.</Note>
            </div>
          </Section>
        </div>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-6 lg:self-start">
          <ScorePanel score={score} withSpouse={ui.hasAccompanyingSpouse} />
        </aside>
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
      label="Estimated CRS score"
      total={score.total}
      max={MAX_TOTAL}
      rows={rows}
      source="IRCC CRS criteria — updated Jun 2026"
    />
  )
}
