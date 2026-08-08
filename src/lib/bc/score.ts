/**
 * BC PNP SIRS scoring - Skills Immigration / Express Entry BC points grid.
 *
 * Source: BC PNP "Skills Immigration Program Guide", Part 8 (effective May 28, 2026,
 * guide last updated June 10, 2026) (welcomebc.ca)
 * https://www.welcomebc.ca/immigrate-to-b-c/bc-pnp-si-program-guide-pdf
 *
 * Total = 200 points: Human Capital (max 120) + Economic (max 80).
 */

export type WorkExperienceBand = '5-plus' | '4-5' | '3-4' | '2-3' | '1-2' | 'less-1' | 'none'

export type EducationLevel =
  | 'doctorate'
  | 'masters'
  | 'postgrad'
  | 'bachelor'
  | 'associate'
  | 'diploma'
  | 'secondary'

export type EducationLocation = 'bc' | 'canada-outside-bc' | 'none'

export type AreaBand = 'area-1' | 'area-2' | 'area-3'

export interface BcInput {
  /** Directly related work experience band. */
  workExperience: WorkExperienceBand
  /** At least 1 year of directly related experience in Canada. */
  canadianExperience: boolean
  /** Currently working full-time in BC for the supporting employer in the job-offer occupation. */
  workingInBc: boolean
  /** Highest level of education. */
  education: EducationLevel
  /** Additional education: BC / Canada outside BC. */
  educationLocation: EducationLocation
  /** Eligible professional designation in B.C., stacks with the education location bonus. */
  professionalDesignation: boolean
  /** Overall CLB of the English test (lowest band across abilities), 0 if none. */
  englishClb: number
  /** Overall CLB of the French test (lowest band across abilities), 0 if none. */
  frenchClb: number
  /** Proficiency (CLB 4+) in both English and French. */
  bothLanguages: boolean
  /** Hourly wage of the BC job offer in dollars. */
  hourlyWage: number
  /** Area within BC of the job offer. */
  area: AreaBand
  /** Regional experience or regional alumni (only counts in Areas 2 and 3). */
  regionalExperience: boolean
}

export interface BcBreakdown {
  experience: number
  education: number
  language: number
  wage: number
  area: number
  total: number
}

export const MAX_EXPERIENCE = 40
export const MAX_EDUCATION = 40
export const MAX_LANGUAGE = 40
export const MAX_WAGE = 55
export const MAX_AREA = 25
export const MAX_HUMAN_CAPITAL = 120
export const MAX_ECONOMIC = 80
export const MAX_TOTAL = 200

export const BC_DOC = 'https://www.welcomebc.ca/immigrate-to-b-c/bc-pnp-si-program-guide-pdf'

export function workExperiencePoints(band: WorkExperienceBand): number {
  switch (band) {
    case '5-plus':
      return 20
    case '4-5':
      return 16
    case '3-4':
      return 12
    case '2-3':
      return 8
    case '1-2':
      return 4
    case 'less-1':
      return 1
    case 'none':
      return 0
  }
}

export function educationPoints(level: EducationLevel): number {
  switch (level) {
    case 'doctorate':
      return 27
    case 'masters':
      return 22
    case 'postgrad':
    case 'bachelor':
      return 15
    case 'associate':
    case 'diploma':
      return 5
    case 'secondary':
      return 0
  }
}

export function educationLocationPoints(location: EducationLocation): number {
  switch (location) {
    case 'bc':
      return 8
    case 'canada-outside-bc':
      return 6
    case 'none':
      return 0
  }
}

/** Eligible BC professional designation bonus, independent of the education location bonus. */
export function professionalDesignationPoints(has: boolean): number {
  return has ? 5 : 0
}

export function languagePoints(clb: number): number {
  if (clb >= 9) return 30
  if (clb === 8) return 25
  if (clb === 7) return 20
  if (clb === 6) return 15
  if (clb === 5) return 10
  if (clb === 4) return 5
  return 0
}

/** Both official languages bonus: requires the box checked and CLB 4+ on both tests. */
export function bothLanguagesPoints(englishClb: number, frenchClb: number, both: boolean): number {
  return both && englishClb >= 4 && frenchClb >= 4 ? 10 : 0
}

/** Points = clamp(floor(hourlyWage) - 15, 0, 55). $70+ = 55, $16 = 1, below $16 = 0. */
export function wagePoints(hourlyWage: number): number {
  return Math.max(0, Math.min(55, Math.floor(hourlyWage) - 15))
}

/** Area base points plus a +10 regional bonus that only counts outside Area 1. */
export function areaPoints(area: AreaBand, regionalExperience: boolean): number {
  const base = area === 'area-1' ? 0 : area === 'area-2' ? 5 : 15
  const regional = regionalExperience && area !== 'area-1' ? 10 : 0
  return base + regional
}

export function bcScore(input: BcInput): BcBreakdown {
  const experience =
    workExperiencePoints(input.workExperience) +
    (input.canadianExperience ? 10 : 0) +
    (input.workingInBc ? 10 : 0)

  const education =
    educationPoints(input.education) +
    educationLocationPoints(input.educationLocation) +
    professionalDesignationPoints(input.professionalDesignation)

  const bestClb = Math.max(input.englishClb, input.frenchClb)
  const language =
    languagePoints(bestClb) + bothLanguagesPoints(input.englishClb, input.frenchClb, input.bothLanguages)

  const wage = wagePoints(input.hourlyWage)

  const area = areaPoints(input.area, input.regionalExperience)

  return { experience, education, language, wage, area, total: experience + education + language + wage + area }
}

export interface Eligibility {
  eligible: boolean
  reasons: string[]
}

/** Hours per year used to annualize an hourly wage for the minimum income test (guide section 3.10). */
const HOURS_PER_YEAR = 40 * 52

/** 2024 Low-Income Cut-Off for a single-person household (guide section 3.10). */
const LICO_METRO_VANCOUVER_SINGLE = 31264
const LICO_REST_OF_BC_SINGLE = 26057

/** Bands that meet the Skilled Worker two-year experience minimum (guide section 4.1 (c)). */
const MIN_EXPERIENCE_BANDS: readonly WorkExperienceBand[] = ['2-3', '3-4', '4-5', '5-plus']

/**
 * Minimum hourly wage implied by the single-person LICO minimum income for an area.
 * The BC PNP applies the minimum income by family size, but the calculator does not
 * collect dependants, so the single-person floor is used as the general minimum.
 */
export function minimumIncomeWage(area: AreaBand): number {
  const lico = area === 'area-1' ? LICO_METRO_VANCOUVER_SINGLE : LICO_REST_OF_BC_SINGLE
  return Math.round((lico / HOURS_PER_YEAR) * 100) / 100
}

/**
 * Eligibility check separate from the registration score. A candidate can score
 * points yet still be ineligible. Uses the general requirements in Part 3 of the
 * Skills Immigration Program Guide plus the Skilled Worker experience minimum in
 * section 4.1. The CLB 4 language floor applies to NOC TEER 2, 3, 4 and 5
 * occupations, which the calculator assumes as the general case.
 */
export function eligibility(input: BcInput): Eligibility {
  const reasons: string[] = []

  const bestClb = Math.max(input.englishClb, input.frenchClb)
  if (bestClb < 4) {
    reasons.push('Your language test results are below the minimum requirement of CLB 4 in each of the four competencies.')
  }

  const wageFloor = minimumIncomeWage(input.area)
  if (input.hourlyWage < wageFloor) {
    reasons.push(
      `Your offered hourly wage of $${input.hourlyWage.toFixed(2)} is below the minimum income floor of $${wageFloor.toFixed(2)} per hour for your area of B.C.`,
    )
  }

  if (!MIN_EXPERIENCE_BANDS.includes(input.workExperience)) {
    reasons.push('You need at least two years of full-time (or full-time equivalent) directly related work experience.')
  }

  return { eligible: reasons.length === 0, reasons }
}
