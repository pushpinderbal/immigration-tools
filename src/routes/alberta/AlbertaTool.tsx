import { useMemo, useState } from 'react'
import { EligibilityBanner } from '../../components/EligibilityBanner'
import { LanguageTestInputs } from '../../components/LanguageTestInputs'
import { ScoreCard } from '../../components/ScoreCard'
import { Seo } from '../../components/Seo'
import { ToolSidebar } from '../../components/ToolSidebar'
import { ToolTiles } from '../../components/ToolTiles'
import { CheckRow, Field, Section, Segmented, Select, Slider } from '../../components/ui'
import { convertTestToClb, emptyScores, overallClb } from '../../lib/crs/languages'
import type { LanguageTestState } from '../../lib/crs/languages'
import {
  AB_DOC,
  MAX_AGE,
  MAX_EDUCATION,
  MAX_EXPERIENCE,
  MAX_FAMILY,
  MAX_JOB_OFFER,
  MAX_LANGUAGE,
  MAX_LOCATION,
  MAX_REGULATED,
  MAX_TOTAL,
  albertaScore,
  eligibility,
} from '../../lib/alberta/score'
import type {
  AlbertaInput,
  CanadianExperience,
  EducationLevel,
  EducationLocation,
  ExperienceBand,
  JobLocation,
  SectorJobOffer,
} from '../../lib/alberta/score'

const EDUCATION_OPTIONS: ReadonlyArray<{ value: EducationLevel | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: 'doctorate', label: 'Doctorate' },
  { value: 'masters', label: "Master's degree" },
  { value: 'bachelor', label: "Bachelor's degree" },
  { value: 'trades', label: 'Trades certificate or diploma' },
  { value: 'diploma', label: 'Diploma or certificate' },
  { value: 'secondary', label: 'Secondary school or lower' },
]

const EDUCATION_LOCATION_OPTIONS: ReadonlyArray<{ value: EducationLocation | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: 'alberta', label: 'Completed in Alberta' },
  { value: 'other-province', label: 'Completed in another province or territory' },
  { value: 'none', label: 'Not completed in Canada' },
]

const EXPERIENCE_OPTIONS: ReadonlyArray<{ value: ExperienceBand | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: 'over-12', label: '12 or more months' },
  { value: '6-11', label: '6 to 11 months' },
  { value: 'less-6', label: 'Less than 6 months' },
]

const CANADIAN_EXPERIENCE_OPTIONS: ReadonlyArray<{ value: CanadianExperience; label: string }> = [
  { value: 'alberta', label: 'Alberta' },
  { value: 'other-province', label: 'Another province' },
  { value: 'none', label: 'None' },
]

const SECTOR_JOB_OFFER_OPTIONS: ReadonlyArray<{ value: SectorJobOffer | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: 'rural-renewal', label: 'Endorsement letter from a Rural Renewal designated community' },
  { value: 'tourism-hospitality', label: 'Tourism and Hospitality Stream (qualifying sector association employer)' },
  { value: 'law-enforcement', label: 'Law enforcement occupation (AACP member employer)' },
  { value: 'none', label: 'None' },
]

const JOB_LOCATION_OPTIONS: ReadonlyArray<{ value: JobLocation | ''; label: string }> = [
  { value: '', label: 'Select...' },
  { value: 'calgary-edmonton', label: 'Calgary or Edmonton CMA' },
  { value: 'rural-renewal', label: 'Rural Renewal designated community' },
  { value: 'other', label: 'Other Alberta community' },
]

const ENGLISH_TESTS = ['ielts', 'celpip', 'pte'] as const
const FRENCH_TESTS = ['tef', 'tcf'] as const

interface AlbertaUiState {
  education: EducationLevel | ''
  educationLocation: EducationLocation | ''
  english: LanguageTestState
  french: LanguageTestState
  bilingual: boolean
  totalExperience: ExperienceBand | ''
  canadianExperience: CanadianExperience
  age: number
  familyConnection: boolean
  permanentJobOffer: boolean
  sectorJobOffer: SectorJobOffer | ''
  jobLocation: JobLocation | ''
  regulatedOccupation: boolean
}

const DEFAULT_UI: AlbertaUiState = {
  education: '',
  educationLocation: '',
  english: { test: 'none', scores: emptyScores() },
  french: { test: 'none', scores: emptyScores() },
  bilingual: false,
  totalExperience: '',
  canadianExperience: 'none',
  age: 18,
  familyConnection: false,
  permanentJobOffer: false,
  sectorJobOffer: '',
  jobLocation: '',
  regulatedOccupation: false,
}

export function AlbertaTool() {
  const [ui, setUi] = useState<AlbertaUiState>(DEFAULT_UI)

  const input = useMemo<AlbertaInput>(() => {
    const englishClb = overallClb(convertTestToClb(ui.english.test, ui.english.scores))
    const frenchClb = overallClb(convertTestToClb(ui.french.test, ui.french.scores))
    return {
      education: (ui.education === '' ? 'secondary' : ui.education) as EducationLevel,
      educationLocation: (ui.educationLocation === '' ? 'none' : ui.educationLocation) as EducationLocation,
      englishClb,
      frenchClb,
      bilingual: ui.bilingual,
      totalExperience: (ui.totalExperience === '' ? 'less-6' : ui.totalExperience) as ExperienceBand,
      canadianExperience: ui.canadianExperience,
      age: ui.age,
      familyConnection: ui.familyConnection,
      permanentJobOffer: ui.permanentJobOffer,
      sectorJobOffer: (ui.sectorJobOffer === '' ? 'none' : ui.sectorJobOffer) as SectorJobOffer,
      jobLocation: (ui.jobLocation === '' ? 'calgary-edmonton' : ui.jobLocation) as JobLocation,
      regulatedOccupation: ui.regulatedOccupation,
    }
  }, [ui])

  const score = useMemo(() => albertaScore(input), [input])

  const eligibilityResult = useMemo(() => eligibility(input), [input])

  const patch = (p: Partial<AlbertaUiState>) => setUi((prev) => ({ ...prev, ...p }))

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-12 sm:px-6">
      <Seo
        title="Alberta AAIP Points Calculator | ImmiCalc"
        description="A straightforward AAIP points check for Alberta's Worker stream - a few simple questions, instant result."
        path="/alberta"
      />
      <ToolTiles current="alberta" />
      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">Alberta AAIP Points Calculator</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-muted">
        Alberta ranks Worker Expression of Interest candidates out of 100. Enter your details to see your points and
        how they add up.
      </p>

      <div className="mt-6">
        <EligibilityBanner eligible={eligibilityResult.eligible} reasons={eligibilityResult.reasons} />
      </div>

      <div className="mt-8 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Section title="Human capital" help={AB_DOC}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Highest level of education" help={AB_DOC}>
                <Select
                  ariaLabel="Highest level of education"
                  value={ui.education}
                  onChange={(v) => patch({ education: v as EducationLevel | '' })}
                  options={EDUCATION_OPTIONS}
                />
              </Field>
              <Field label="Location of education in Canada" help={AB_DOC}>
                <Select
                  ariaLabel="Location of education in Canada"
                  value={ui.educationLocation}
                  onChange={(v) => patch({ educationLocation: v as EducationLocation | '' })}
                  options={EDUCATION_LOCATION_OPTIONS}
                />
              </Field>
            </div>

            <div className="rounded-xl border border-line p-4">
              <LanguageTestInputs
                title="English"
                allowedTests={ENGLISH_TESTS}
                value={ui.english}
                onChange={(next) => patch({ english: next })}
                help={AB_DOC}
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
                  help={AB_DOC}
                />
              )}
              <CheckRow
                label="Bilingual (CLB/NCLC 4+ in both English and French)"
                checked={ui.bilingual}
                onChange={(v) => patch({ bilingual: v })}
                help={AB_DOC}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Total work experience" help={AB_DOC}>
                <Select
                  ariaLabel="Total work experience"
                  value={ui.totalExperience}
                  onChange={(v) => patch({ totalExperience: v as ExperienceBand | '' })}
                  options={EXPERIENCE_OPTIONS}
                />
              </Field>
              <Field label="Work experience in Canada" help={AB_DOC}>
                <Segmented
                  ariaLabel="Canadian work experience"
                  value={ui.canadianExperience}
                  onChange={(v) => patch({ canadianExperience: v as CanadianExperience })}
                  options={CANADIAN_EXPERIENCE_OPTIONS}
                />
              </Field>
            </div>

            <Slider
              label="Age"
              min={18}
              max={60}
              value={ui.age}
              onChange={(v) => patch({ age: v })}
              format={(v) => (v >= 50 ? '50+' : String(v))}
              help={AB_DOC}
            />
          </Section>

          <Section title="Economic factors" help={AB_DOC}>
            <CheckRow
              label="Family connection in Alberta (parent, child or sibling who is a citizen or PR, 18+)"
              checked={ui.familyConnection}
              onChange={(v) => patch({ familyConnection: v })}
              help={AB_DOC}
            />
            <CheckRow
              label="Permanent full-time job offer in Alberta"
              checked={ui.permanentJobOffer}
              onChange={(v) => patch({ permanentJobOffer: v })}
              help={AB_DOC}
            />
            <Field label="Job offer to work in select Alberta rural communities or sector" help={AB_DOC}>
              <Select
                ariaLabel="Job offer to work in select Alberta rural communities or sector"
                value={ui.sectorJobOffer}
                onChange={(v) => patch({ sectorJobOffer: v as SectorJobOffer | '' })}
                options={SECTOR_JOB_OFFER_OPTIONS}
              />
            </Field>
            <Field label="Alberta job offer location" help={AB_DOC}>
              <Select
                ariaLabel="Alberta job offer location"
                value={ui.jobLocation}
                onChange={(v) => patch({ jobLocation: v as JobLocation | '' })}
                options={JOB_LOCATION_OPTIONS}
              />
            </Field>
            <CheckRow
              label="Regulated occupation (Alberta job offer with recognized certification or licensure)"
              checked={ui.regulatedOccupation}
              onChange={(v) => patch({ regulatedOccupation: v })}
              help={AB_DOC}
            />
          </Section>
        </div>

        <ToolSidebar
          label="Estimated AAIP EOI score"
          total={score.total}
          max={MAX_TOTAL}
          breakdown={
            <ScoreCard
              variant="breakdown"
              rows={[
                { label: 'Education', value: score.education, max: MAX_EDUCATION },
                { label: 'Language', value: score.language, max: MAX_LANGUAGE },
                { label: 'Work experience', value: score.experience, max: MAX_EXPERIENCE },
                { label: 'Age', value: score.age, max: MAX_AGE },
                { label: 'Family connection', value: score.family, max: MAX_FAMILY },
                { label: 'Alberta job offer', value: score.jobOffer, max: MAX_JOB_OFFER },
                { label: 'Job offer location', value: score.location, max: MAX_LOCATION },
                { label: 'Regulated occupation', value: score.regulated, max: MAX_REGULATED },
              ]}
              source="Based on Alberta's official AAIP points grid"
            />
          }
        />
      </div>

    </div>
  )
}
