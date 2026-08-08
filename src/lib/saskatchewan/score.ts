/**
 * SINP EOI scoring - Saskatchewan International Skilled Worker.
 *
 * Sources: Saskatchewan Immigrant Nominee Program, "Assess Your Eligibility" / "SINP
 * International Skilled Worker Points Grid" (current official page) plus the official
 * sub-category pages for Occupation In-Demand, Saskatchewan Express Entry and Employment Offer.
 * https://www.saskatchewan.ca/residents/moving-to-saskatchewan/live-in-saskatchewan/by-immigrating/saskatchewan-immigrant-nominee-program/assess-your-eligibility
 *
 * Total = 110 points: Factor I (Labour Market Success) max 80 +
 * Factor II (Connection to Saskatchewan) max 30.
 */

export type EducationLevel =
  | 'masters-doctorate'
  | 'bachelor'
  | 'trade'
  | 'diploma'
  | 'certificate'

export type SubCategory = 'oid-ee' | 'employment-offer'

export interface SinpInput {
  /** Highest education / training credential. */
  education: EducationLevel
  /** Years of skilled work experience in the last 5 years (5 = 5 or more). */
  workYears: number
  /** Years of skilled work experience in the 6-10 years prior (5 = 5 or more, 0 = less than 1). */
  priorWorkYears: number
  /** Overall CLB of the first official language (lowest of the four abilities), 0 if none. */
  firstLanguageClb: number
  /** Overall CLB of the second official language (lowest of the four abilities), 0 if none. */
  secondLanguageClb: number
  /** Applicant age. */
  age: number
  /** SINP International Skilled Worker sub-category being scored. */
  subCategory: SubCategory
  /** Close family relative in Saskatchewan (OID/EE). */
  family: boolean
  /** 12+ months of work experience in Saskatchewan in the last 5 years (OID/EE). */
  skWorkExperience: boolean
  /** At least one full-time academic year of study in Saskatchewan (OID/EE). */
  skStudy: boolean
  /** High-skilled job offer from a Saskatchewan employer (Employment Offer). */
  jobOffer: boolean
}

export interface SinpBreakdown {
  education: number
  work: number
  workPrior: number
  language: number
  age: number
  connection: number
  total: number
}

export const MAX_EDUCATION = 23
export const MAX_WORK = 10
export const MAX_PRIOR_WORK = 5
export const MAX_LANGUAGE = 30
export const MAX_AGE = 12
export const MAX_FACTOR_I = 80
export const MAX_FAMILY = 20
export const MAX_SK_WORK = 5
export const MAX_SK_STUDY = 5
export const MAX_CONNECTION = 30
export const MAX_TOTAL = 110

export function educationPoints(level: EducationLevel): number {
  switch (level) {
    case 'masters-doctorate':
      return 23
    case 'bachelor':
    case 'trade':
      return 20
    case 'diploma':
      return 15
    case 'certificate':
      return 12
  }
}

export function workExperiencePoints(workYears: number): number {
  if (workYears >= 5) return 10
  if (workYears === 4) return 8
  if (workYears === 3) return 6
  if (workYears === 2) return 4
  if (workYears === 1) return 2
  return 0
}

export function priorWorkExperiencePoints(workYears: number): number {
  if (workYears >= 5) return 5
  if (workYears === 4) return 4
  if (workYears === 3) return 3
  if (workYears === 2) return 2
  return 0
}

export function firstLanguagePoints(clb: number): number {
  if (clb >= 8) return 20
  if (clb === 7) return 18
  if (clb === 6) return 16
  if (clb === 5) return 14
  if (clb === 4) return 12
  return 0
}

export function secondLanguagePoints(clb: number): number {
  if (clb >= 8) return 10
  if (clb === 7) return 8
  if (clb === 6) return 6
  if (clb === 5) return 4
  if (clb === 4) return 2
  return 0
}

export function agePoints(age: number): number {
  if (age < 18) return 0
  if (age <= 21) return 8
  if (age <= 34) return 12
  if (age <= 45) return 10
  if (age <= 50) return 8
  return 0
}

export function connectionPoints(input: SinpInput): number {
  if (input.subCategory === 'employment-offer') return input.jobOffer ? 30 : 0
  return (input.family ? 20 : 0) + (input.skWorkExperience ? 5 : 0) + (input.skStudy ? 5 : 0)
}

export function sinpScore(input: SinpInput): SinpBreakdown {
  const education = educationPoints(input.education)
  const work = workExperiencePoints(input.workYears)
  const workPrior = priorWorkExperiencePoints(input.priorWorkYears)
  const language = firstLanguagePoints(input.firstLanguageClb) + secondLanguagePoints(input.secondLanguageClb)
  const age = agePoints(input.age)
  const connection = connectionPoints(input)

  return {
    education,
    work,
    workPrior,
    language,
    age,
    connection,
    total: education + work + workPrior + language + age + connection,
  }
}

export interface Eligibility {
  eligible: boolean
  reasons: string[]
}

/** Minimum points on the SINP point assessment grid, required by all ISW sub-categories. */
export const MIN_EOI_POINTS = 60
/** Minimum overall CLB for the first official language (CLB 4 for OID and Employment Offer). */
export const MIN_FIRST_LANGUAGE_CLB = 4
/** Minimum years of skilled work experience required in the past 10 years. */
export const MIN_WORK_EXPERIENCE_YEARS = 1

/**
 * Eligibility for the SINP International Skilled Worker category, separate from points.
 * A candidate can score 60+ points yet still be ineligible for a sub-category, so these
 * criteria are checked on top of the EOI total. Only rules expressible with the existing
 * SinpInput fields are enforced here (occupation-specific and settlement-fund criteria are
 * not modelled).
 */
export function eligibility(input: SinpInput): Eligibility {
  const reasons: string[] = []
  const total = sinpScore(input).total

  if (total < MIN_EOI_POINTS) {
    reasons.push(
      `You must score at least ${MIN_EOI_POINTS} points on the SINP point assessment grid, but your estimated score is ${total}.`,
    )
  }

  if (input.firstLanguageClb < MIN_FIRST_LANGUAGE_CLB) {
    reasons.push(
      input.firstLanguageClb === 0
        ? `You need a first official language score of at least Canadian Language Benchmark (CLB) ${MIN_FIRST_LANGUAGE_CLB}, but you have not entered a qualifying language test.`
        : `Your first official language overall CLB of ${input.firstLanguageClb} is below the minimum of CLB ${MIN_FIRST_LANGUAGE_CLB}.`,
    )
  }

  if (input.workYears + input.priorWorkYears < MIN_WORK_EXPERIENCE_YEARS) {
    reasons.push(
      'You must have at least one year of full-time paid work experience in a skilled occupation within the past 10 years.',
    )
  }

  if (input.subCategory === 'employment-offer' && !input.jobOffer) {
    reasons.push(
      'You must have a permanent, full-time job offer from a Saskatchewan employer to apply under the Employment Offer sub-category.',
    )
  }

  return { eligible: reasons.length === 0, reasons }
}
