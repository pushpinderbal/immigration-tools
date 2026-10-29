/**
 * OINP EOI scoring - Ontario Workforce Priority stream.
 *
 * Source: Ontario.ca "Ontario Workforce Priority stream" (earnings updated 2026-10-05, checked 2026-10-28)
 * https://www.ontario.ca/page/ontario-workforce-priority-stream
 *
 * Revalidated 2026-10-28 against the current official grid. The Workforce
 * Priority stream is Ontario's single active OINP stream (all eight former
 * streams closed June 26, 2026). Field of study and location of study are NOT
 * scored. The "1 official language" bilingualism points require CLB/NCLC 6 in
 * at least one official language (not CLB 5).
 *
 * `recentOntarioGraduate` is an eligibility determination, not a scoring
 * factor. A recent Ontario graduate (eligible Ontario institution within the
 * last 3 years, with a qualifying credential) only needs 3 months in the job
 * offer position instead of 6, but earns no extra EOI points.
 *
 * Eligibility: besides points, candidates must meet the stream's work
 * experience and legal status requirements. The job offer position requires 6
 * months of consecutive full-time work for TEER 0-3 (3 months for recent
 * Ontario graduates) or 9 months of cumulative full-time work for TEER 4-5.
 * Applicants applying from within Canada must hold valid legal status. See
 * `eligibility()`.
 */

export type TeerCategory = 0 | 1 | 2 | 3 | 4 | 5

export type NocBroadCategory = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type TenureBand = 'over-24' | '13-24' | '6-12' | 'less-6'

export type EarningsBand = '80k-plus' | 'over-70k' | '50k-70k' | '30k-50k' | 'under-30k'

export type LegalStatus = 'work-permit' | 'study-permit' | 'visitor' | 'outside-canada' | 'none'

export type EducationLevel =
  | 'doctorate'
  | 'masters'
  | 'above-bachelor'
  | 'bachelor'
  | 'ogcc'
  | 'below-bachelor'
  | 'college'
  | 'apprenticeship'
  | 'less-than-college'

export type CanadianCredentials = 'none' | 'one' | 'multiple'

export type Region = 'northern' | 'eastern' | 'central' | 'southwestern' | 'gta-except-toronto' | 'toronto'

export interface OinpInput {
  pathway?: 'job-offer' | 'physician'
  physicianRequirementsMet?: boolean
  /** Exact qualifying months for thresholds falling inside scoring bands. */
  positionMonths?: number
  twoYearsSameNoc?: boolean
  licensedForPosition?: boolean
  transportOccupation?: boolean
  listedSkilledTrade?: boolean
  teer: TeerCategory
  nocBroad: NocBroadCategory | null
  hourlyWage: number
  tenureInPosition: TenureBand
  ontarioWork: TenureBand
  earnings: EarningsBand
  legalStatus: LegalStatus
  education: EducationLevel
  canadianCredentials: CanadianCredentials
  /** Overall CLB/NCLC of the English test (lowest band across abilities), 0 if none. */
  englishClb: number
  /** Overall CLB/NCLC of the French test (lowest band across abilities), 0 if none. */
  frenchClb: number
  region: Region
  /**
   * Recent Ontario graduate (eligible Ontario institution within the last 3
   * years). Eligibility-only: reduces the required work experience in the job
   * offer position from 6 months to 3 months. Awards 0 EOI points.
   */
  recentOntarioGraduate: boolean
}

export interface OinpBreakdown {
  labour: number
  education: number
  language: number
  region: number
  total: number
}

export interface Eligibility {
  eligible: boolean
  /** Human-readable sentences describing each unmet requirement. */
  reasons: string[]
}

export const MAX_LABOUR = 72
export const MAX_EDUCATION = 20
export const MAX_LANGUAGE = 25
export const MAX_REGION = 15
export const MAX_TOTAL = 132
export const MAX_PHYSICIAN_TOTAL = 117

export function teerPoints(teer: TeerCategory): number {
  if (teer <= 1) return 9
  if (teer <= 3) return 6
  return 0
}

export function nocBroadPoints(noc: NocBroadCategory | null): number {
  if (noc === null) return 0
  switch (noc) {
    case 3:
      return 10
    case 7:
      return 8
    case 2:
      return 6
    case 0:
    case 1:
    case 4:
    case 8:
    case 9:
      return 4
    case 5:
    case 6:
      return 2
  }
}

export function wagePoints(hourlyWage: number): number {
  if (hourlyWage >= 40) return 15
  if (hourlyWage >= 35) return 12
  if (hourlyWage >= 30) return 10
  if (hourlyWage >= 25) return 8
  if (hourlyWage >= 20) return 5
  return 0
}

export function tenureInPositionPoints(band: TenureBand): number {
  switch (band) {
    case 'over-24':
      return 18
    case '13-24':
      return 15
    case '6-12':
      return 12
    case 'less-6':
      return 0
  }
}

export function ontarioWorkPoints(band: TenureBand): number {
  switch (band) {
    case 'over-24':
      return 12
    case '13-24':
      return 9
    case '6-12':
      return 6
    case 'less-6':
      return 0
  }
}

/** Less than 6 months in the job offer position → points come from Ontario work instead. */
export function workExperiencePoints(tenureInPosition: TenureBand, ontarioWork: TenureBand): number {
  return tenureInPosition === 'less-6' ? ontarioWorkPoints(ontarioWork) : tenureInPositionPoints(tenureInPosition)
}

export function earningsPoints(band: EarningsBand): number {
  switch (band) {
    case '80k-plus':
      return 10
    case 'over-70k':
      return 8
    case '50k-70k':
      return 6
    case '30k-50k':
      return 4
    case 'under-30k':
      return 0
  }
}

export function legalStatusPoints(status: LegalStatus): number {
  switch (status) {
    case 'work-permit':
      return 10
    case 'study-permit':
      return 5
    case 'visitor':
    case 'outside-canada':
    case 'none':
      return 0
  }
}

export function educationPoints(level: EducationLevel): number {
  switch (level) {
    case 'doctorate':
      return 10
    case 'masters':
      return 8
    case 'above-bachelor':
    case 'bachelor':
      return 6
    case 'ogcc':
    case 'below-bachelor':
    case 'college':
    case 'apprenticeship':
      return 5
    case 'less-than-college':
      return 0
  }
}

export function canadianCredentialsPoints(count: CanadianCredentials): number {
  switch (count) {
    case 'multiple':
      return 10
    case 'one':
      return 5
    case 'none':
      return 0
  }
}

export function languageAbilityPoints(bestClb: number): number {
  if (bestClb >= 9) return 15
  if (bestClb === 8) return 12
  if (bestClb === 7) return 8
  if (bestClb === 6) return 4
  return 0
}

/** Knowledge of official languages: 10 for both at CLB/NCLC 6+, 5 for one at CLB/NCLC 6+. */
export function officialLanguagesPoints(englishClb: number, frenchClb: number): number {
  if (englishClb >= 6 && frenchClb >= 6) return 10
  if (englishClb >= 6 || frenchClb >= 6) return 5
  return 0
}

export function regionPoints(region: Region): number {
  switch (region) {
    case 'northern':
      return 15
    case 'eastern':
    case 'central':
    case 'southwestern':
      return 10
    case 'gta-except-toronto':
      return 5
    case 'toronto':
      return 0
  }
}

export function oinpScore(input: OinpInput): OinpBreakdown {
  const physician = input.pathway === 'physician'
  const labour =
    teerPoints(physician ? 1 : input.teer) +
    nocBroadPoints(physician ? 3 : input.nocBroad) +
    (physician ? 0 : wagePoints(input.hourlyWage)) +
    (physician ? tenureInPositionPoints(input.ontarioWork) : workExperiencePoints(input.tenureInPosition, input.ontarioWork)) +
    earningsPoints(input.earnings) +
    legalStatusPoints(input.legalStatus)

  const education = educationPoints(input.education) + canadianCredentialsPoints(input.canadianCredentials)

  const bestClb = Math.max(input.englishClb, input.frenchClb)
  const language = languageAbilityPoints(bestClb) + officialLanguagesPoints(input.englishClb, input.frenchClb)

  const region = regionPoints(input.region)

  // recentOntarioGraduate is an eligibility determination only and awards 0 points.
  return { labour, education, language, region, total: labour + education + language + region }
}

/** Initial checks only; employer, education, licensing and job-offer requirements also apply. */
export function eligibility(input: OinpInput): Eligibility {
  const reasons: string[] = []
  if (input.pathway === 'physician') {
    if (!input.physicianRequirementsMet) {
      reasons.push('Self-employed physicians need an OHIP billing number and an eligible CPSO certificate in good standing (independent, academic or provisional practice).')
    }
    return { eligible: reasons.length === 0, reasons }
  }

  const months = input.positionMonths ?? {
    'less-6': 0, '6-12': 6, '13-24': 13, 'over-24': 25,
  }[input.tenureInPosition]
  const minimum = input.teer >= 4 ? 9 : input.transportOccupation ? 6 : input.recentOntarioGraduate ? 3 : 6
  const alternative = input.teer <= 3 && !input.transportOccupation &&
    (input.twoYearsSameNoc || input.licensedForPosition)
  if (months < minimum && !alternative) {
    reasons.push(input.teer >= 4
      ? 'TEER 4 and 5 job offers require at least 9 months of cumulative full-time work experience in the job offer position, gained within 2 years before you apply.'
      : `TEER 0 to 3 job offers require at least ${minimum} months of consecutive full-time work experience in the job offer position within the last year, or a permitted alternative where applicable.`)
  }

  if (input.legalStatus === 'none') {
    reasons.push('You must have valid legal status in Canada when applying from within Canada. A visitor record or maintained status may qualify; applicants outside Canada do not need Canadian temporary status.')
  }
  const minimumClb = input.teer >= 4 ? 4 : input.listedSkilledTrade ? 5 : 6
  if (!(input.teer <= 3 && input.recentOntarioGraduate) && Math.max(input.englishClb, input.frenchClb) < minimumClb) {
    reasons.push(`Your job offer requires at least CLB/NCLC ${minimumClb} across all four abilities, unless an applicable recent Ontario graduate exemption is met.`)
  }
  return { eligible: reasons.length === 0, reasons }
}
