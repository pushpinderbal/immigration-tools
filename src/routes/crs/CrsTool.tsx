import { ChromeSlot, ToolWorkspace } from '../../components/CalculatorChrome'
import { useMemo, useState } from 'react'
import { LanguageTestInputs } from '../../components/LanguageTestInputs'
import { Recommendations } from '../../components/Recommendations'
import { ScoreCard } from '../../components/ScoreCard'
import { Seo } from '../../components/Seo'
import { ToolSidebar } from '../../components/ToolSidebar'
import { ToolTiles } from '../../components/ToolTiles'
import { DrawFeed } from '../../components/DrawFeed'
import { FormSections, CheckRow, Field, Note, Section, Segmented, Select, Slider } from '../../components/ui'
import { convertTestToClb, emptyScores, overallClb } from '../../lib/crs/languages'
import type { LanguageTestState } from '../../lib/crs/languages'
import { HighWageFields } from './HighWageFields'
import { CRS_CHANGES_DOC, currentCrsRules, maximumCrsScore, usesLabourMarketIntegration, MAX_LMIF_WITH_SPOUSE, MAX_LMIF_WITHOUT_SPOUSE } from '../../lib/crs/labour-market'
import { crsScore } from '../../lib/crs/score'
import {
  MAX_ADDITIONAL,
  MAX_CORE_WITH_SPOUSE,
  MAX_CORE_WITHOUT_SPOUSE,
  MAX_SPOUSE,
  MAX_TRANSFERABILITY,
} from '../../lib/crs/tables'
import type { CrsBreakdown, CrsInput, CrsRules, EducationLevel, WorkYears } from '../../lib/crs/types'
import type { CanadianEducation } from '../../lib/crs/types'

const IRCC_GRID =
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html'
const IRCC_LANGUAGE =
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-test.html'

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
  rules: CrsRules
  jobOfferNoc: string
  qualifyingJobOffer: boolean
  highWageWork: NonNullable<CrsInput['highWageWork']>
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
  rules: 'before-2026-11-03',
  jobOfferNoc: '',
  qualifyingJobOffer: false,
  highWageWork: [],
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
  const [ui, setUi] = useState<CrsUiState>(() => ({ ...DEFAULT_UI, rules: currentCrsRules() }))

  const input = useMemo<CrsInput>(() => {
    const english = convertTestToClb(ui.english.test, ui.english.scores)
    const french = convertTestToClb(ui.french.test, ui.french.scores)
    const spouseLanguage = convertTestToClb(ui.spouse?.test.test ?? 'none', ui.spouse?.test.scores ?? emptyScores())

    return {
      rules: ui.rules,
      jobOfferNoc: ui.jobOfferNoc,
      qualifyingJobOffer: ui.qualifyingJobOffer,
      highWageWork: ui.highWageWork,
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
            education: (ui.spouse?.education || 'less-than-secondary') as EducationLevel,
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

  const languageSummary = ui.firstOfficialLanguage === 'english'
    ? `English CLB ${overallClb(input.english) || '-'}`
    : `French NCLC ${overallClb(input.french) || '-'}`

  return (
    <div className="tool-page px-4 sm:px-6">
      <Seo title="CRS Calculator | ImmiCalc" description="Calculate Express Entry CRS points and compare changes to age, education, language and work experience." path="/crs" />
      <ToolTiles current="crs" />
      <ChromeSlot name="rules">
        <Field label="Scoring rules" help={CRS_CHANGES_DOC}>
          <Select ariaLabel="Scoring rules" value={ui.rules} onChange={(rules) => patch({ rules: rules as CrsRules })}
            options={[
              { value: 'before-2026-11-03', label: 'Through Nov 2, 2026' },
              { value: 'from-2026-11-03', label: 'From Nov 3, 2026' },
            ]} />
        </Field>
      </ChromeSlot>
      <div className="tool-header"><h1>CRS Calculator</h1><p>Express Entry</p></div>
      <ToolWorkspace>
        <FormSections>
          <Section title="Your profile" tabLabel="Profile" help={IRCC_GRID} description="Age and accompanying partner."
            summary={`${ui.age} years / ${ui.hasAccompanyingSpouse ? 'With partner' : 'Alone'}`}>
            <div className="answer-columns">
              <Slider label="Age" min={17} max={60} value={ui.age} onChange={(age) => patch({ age })} help={IRCC_GRID} />
              <Field label="Accompanying spouse or partner" help={IRCC_GRID}>
                <Segmented ariaLabel="Accompanying spouse" value={ui.hasAccompanyingSpouse ? 'yes' : 'no'} onChange={setSpouseFlag}
                  options={[{ value: 'no', label: 'Applying alone' }, { value: 'yes', label: 'With a partner' }]} />
                <Note>Include a partner who will accompany you and needs permanent residence.</Note>
              </Field>
            </div>
          </Section>
          <Section title="Education" help={IRCC_GRID} description="Completed credentials and Canadian study."
            summary={EDUCATION_OPTIONS.find((option) => option.value === ui.education)?.label.replace('Select...', 'Not entered')}>
            <div className="answer-columns">
              <Field label="Highest level of education" help={IRCC_GRID}>
                <Select ariaLabel="Highest level of education" value={ui.education}
                  onChange={(education) => patch({ education: education as EducationLevel | '' })} options={EDUCATION_OPTIONS} />
              </Field>
              <Field label="Post-secondary education in Canada" help={IRCC_GRID}>
                <Select ariaLabel="Post-secondary education in Canada" value={ui.canadianEducation}
                  onChange={(canadianEducation) => patch({ canadianEducation: canadianEducation as CanadianEducation | '' })} options={CANADIAN_EDUCATION_OPTIONS} />
              </Field>
            </div>
            <Note>Foreign credentials require an Educational Credential Assessment to claim education points.</Note>
          </Section>
          <Section title="Language results" tabLabel="Language" help={IRCC_LANGUAGE} description="Test results for each ability." summary={languageSummary}>
            <Field label="First official language" help={IRCC_LANGUAGE}>
              <Segmented ariaLabel="First official language" value={ui.firstOfficialLanguage} onChange={setFirstLanguage}
                options={[{ value: 'english', label: 'English' }, { value: 'french', label: 'French' }]} />
            </Field>
            {ui.firstOfficialLanguage === 'english'
              ? <LanguageTestInputs title="English" allowedTests={ENGLISH_TESTS} value={ui.english} onChange={(english) => patch({ english })} help={IRCC_LANGUAGE} />
              : <LanguageTestInputs title="French" allowedTests={FRENCH_TESTS} value={ui.french} onChange={(french) => patch({ french })} help={IRCC_LANGUAGE} />}
            {secondLang.test === 'none'
              ? <button type="button" onClick={addSecondLanguage} className="add-language">Add {secondTitle} test</button>
              : <LanguageTestInputs title={`${secondTitle} (second language)`} allowedTests={secondTests} value={secondLang}
                  onChange={(next) => patch({ [secondKey]: next })} help={IRCC_LANGUAGE} />}
          </Section>
          <Section title="Work experience" tabLabel="Experience" help={IRCC_GRID} description="Completed years of skilled work."
            summary={`${input.canadianWorkYears} Canada / ${input.foreignWorkYears} abroad`}>
            <div className="answer-columns">
              <Field label="Canadian work experience" help={IRCC_GRID}>
                <Select ariaLabel="Canadian work experience" value={String(ui.canadianWorkYears)}
                  onChange={(value) => patch({ canadianWorkYears: Number(value) as WorkYears })} options={WORK_YEARS_OPTIONS} />
              </Field>
              <Field label="Foreign work experience" help={IRCC_GRID}>
                <Select ariaLabel="Foreign work experience" value={String(ui.foreignWorkYears)}
                  onChange={(value) => patch({ foreignWorkYears: Number(value) as WorkYears })} options={WORK_YEARS_OPTIONS} />
              </Field>
            </div>
            <Note>Count completed years in TEER 0, 1, 2 or 3 occupations. Five means five or more years.</Note>
          </Section>
          {ui.hasAccompanyingSpouse && <Section title="Spouse or partner" tabLabel="Partner" help={IRCC_GRID} description="Your accompanying partner's credentials, language and Canadian work.">
            <div className="answer-columns">
              <Field label="Partner education" help={IRCC_GRID}>
                <Select ariaLabel="Spouse highest level of education" value={ui.spouse?.education ?? ''}
                  onChange={(education) => patchSpouse({ education: education as EducationLevel | '' })} options={EDUCATION_OPTIONS} />
              </Field>
              <Field label="Partner Canadian work experience" help={IRCC_GRID}>
                <Select ariaLabel="Spouse Canadian work experience" value={String(ui.spouse?.canadianWorkYears ?? '')}
                  onChange={(value) => patchSpouse({ canadianWorkYears: Number(value) as WorkYears })} options={WORK_YEARS_OPTIONS} />
              </Field>
            </div>
            <LanguageTestInputs title="Official language" allowedTests={ALL_TESTS} value={ui.spouse?.test ?? DEFAULT_SPOUSE.test}
              onChange={(test) => patchSpouse({ test })} help={IRCC_LANGUAGE} />
          </Section>}
          {usesLabourMarketIntegration(input) && <Section title="High-wage work" tabLabel="High-wage" help={CRS_CHANGES_DOC}
            description="Qualifying job offers and Canadian work in listed occupations.">
            <HighWageFields input={input} onChange={(changes) => patch(changes)} />
            <Note>The 1270 maximum is the sum of the published factor maxima. IRCC's overall grid update is pending.</Note>
          </Section>}
          <Section title="Additional factors" tabLabel="Additional" help={IRCC_GRID} description="Nomination, family and trade qualifications."
            summary={`${[ui.provincialNomination, ui.siblingInCanada, ui.certificateOfQualification].filter(Boolean).length} selected`}>
            <CheckRow label="Provincial nomination" checked={ui.provincialNomination} onChange={(provincialNomination) => patch({ provincialNomination })} help={IRCC_GRID} />
            <CheckRow label="Sibling in Canada (citizen or PR, 18+)" checked={ui.siblingInCanada} onChange={(siblingInCanada) => patch({ siblingInCanada })} help={IRCC_GRID} />
            <CheckRow label="Certificate of qualification (trade)" checked={ui.certificateOfQualification} onChange={(certificateOfQualification) => patch({ certificateOfQualification })} help={IRCC_GRID} />
          </Section>
          <Section title="Score scenarios" tabLabel="Scenarios" description="Calculated changes from one adjustment at a time.">
            <Recommendations input={input} currentTotal={score.total} />
          </Section>
          <Note>Rules checked October 28, 2026. Job offers earn zero CRS points from March 25, 2025 through November 2, 2026. The high-wage rules take effect November 3, 2026. Program eligibility is assessed separately.</Note>
        </FormSections>
        <ToolSidebar label="Estimated CRS score" total={score.total} max={maximumCrsScore(input)}
          breakdown={<ScorePanel score={score} withSpouse={ui.hasAccompanyingSpouse} usesLmif={usesLabourMarketIntegration(input)} />} draws={<DrawFeed />} />
      </ToolWorkspace>
    </div>
  )
}

function ScorePanel({ score, withSpouse, usesLmif }: { score: CrsBreakdown; withSpouse: boolean; usesLmif: boolean }) {
  const rows: Array<{ label: string; value: number; max?: number }> = [
    { label: 'Core', value: score.core, max: (withSpouse ? MAX_CORE_WITH_SPOUSE : MAX_CORE_WITHOUT_SPOUSE) - (usesLmif ? (withSpouse ? 70 : 80) : 0) },
    { label: 'Spouse', value: score.spouse, max: withSpouse ? MAX_SPOUSE : undefined },
    { label: 'Transferability', value: score.transferability, max: MAX_TRANSFERABILITY },
    { label: 'Additional', value: score.additional, max: MAX_ADDITIONAL },
  ]
  if (usesLmif) rows.push({ label: 'Labour market integration', value: score.labourMarketIntegration, max: withSpouse ? MAX_LMIF_WITH_SPOUSE : MAX_LMIF_WITHOUT_SPOUSE })
  return (
    <ScoreCard
      variant="breakdown"
      rows={rows}
      source="Based on IRCC's official CRS grid"
    />
  )
}
