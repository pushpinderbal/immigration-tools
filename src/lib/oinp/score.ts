/**
 * OINP EOI scoring — Ontario Workforce Priority stream.
 *
 * Source: Ontario.ca "Ontario Workforce Priority stream" (updated 2026-08-04)
 * https://www.ontario.ca/page/ontario-workforce-priority-stream
 */

export type TeerCategory = 0 | 1 | 2 | 3 | 4 | 5

export type NocBroadCategory = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type TenureBand = 'over-24' | '13-24' | '6-12' | 'less-6'

export type EarningsBand = 'over-70k' | '50k-70k' | '30k-50k' | 'under-30k'

export type LegalStatus = 'work-permit' | 'study-permit' | 'none'

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
  teer: TeerCategory
  nocBroad: NocBroadCategory
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
}

export interface OinpBreakdown {
  labour: number
  education: number
  language: number
  region: number
  total: number
}

export const MAX_LABOUR = 70
export const MAX_EDUCATION = 20
export const MAX_LANGUAGE = 25
export const MAX_REGION = 15
export const MAX_TOTAL = 130

export function teerPoints(teer: TeerCategory): number {
  if (teer <= 1) return 9
  if (teer <= 3) return 6
  return 0
}

export function nocBroadPoints(noc: NocBroadCategory): number {
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

/** 2 official languages requires CLB/NCLC 6+ across both tests. */
export function officialLanguagesPoints(englishClb: number, frenchClb: number): number {
  if (englishClb >= 6 && frenchClb >= 6) return 10
  if (Math.max(englishClb, frenchClb) >= 5) return 5
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
  const labour =
    teerPoints(input.teer) +
    nocBroadPoints(input.nocBroad) +
    wagePoints(input.hourlyWage) +
    workExperiencePoints(input.tenureInPosition, input.ontarioWork) +
    earningsPoints(input.earnings) +
    legalStatusPoints(input.legalStatus)

  const education = educationPoints(input.education) + canadianCredentialsPoints(input.canadianCredentials)

  const bestClb = Math.max(input.englishClb, input.frenchClb)
  const language = languageAbilityPoints(bestClb) + officialLanguagesPoints(input.englishClb, input.frenchClb)

  const region = regionPoints(input.region)

  return { labour, education, language, region, total: labour + education + language + region }
}
