/**
 * CRS (Comprehensive Ranking System) - domain types.
 * Pure data, no framework dependencies.
 */

/** Canadian Language Benchmark level per ability. `0` = no test result / below CLB 4. */
export type Clb = 0 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type LanguageAbility = 'listening' | 'reading' | 'writing' | 'speaking'

export type LanguageProficiency = Record<LanguageAbility, Clb>

export type EducationLevel =
  | 'less-than-secondary'
  | 'secondary'
  | 'one-year'
  | 'two-year'
  | 'bachelor'
  | 'two-plus'
  | 'master'
  | 'doctorate'

/** Years of skilled work experience. `5` means five years or more. */
export type WorkYears = 0 | 1 | 2 | 3 | 4 | 5

export type CanadianEducation = 'none' | 'one-two-years' | 'three-plus-years'

export interface SpouseProfile {
  education: EducationLevel
  language: LanguageProficiency
  canadianWorkYears: WorkYears
}

export interface CrsInput {
  age: number
  /** Accompanying spouse/common-law partner who is not a citizen or PR of Canada. */
  hasAccompanyingSpouse: boolean
  education: EducationLevel
  firstOfficialLanguage: 'english' | 'french'
  english: LanguageProficiency
  french: LanguageProficiency
  canadianWorkYears: WorkYears
  foreignWorkYears: WorkYears
  spouse?: SpouseProfile
  certificateOfQualification: boolean
  provincialNomination: boolean
  canadianEducation: CanadianEducation
  siblingInCanada: boolean
}

export interface CrsBreakdown {
  core: number
  spouse: number
  transferability: number
  additional: number
  total: number
}
