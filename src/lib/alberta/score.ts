/**
 * AAIP Worker EOI scoring - Alberta Advantage Immigration Program.
 *
 * Source: Government of Alberta "Worker Stream Expression of Interest (EOI)
 * Points Grid" (updated August 7, 2025)
 * https://www.alberta.ca/system/files/im-worker-stream-expression-of-interest-points-grid.pdf
 * See also: https://www.alberta.ca/how-to-apply-to-aaip-worker-streams
 *
 * Eligibility: AAIP worker streams each set minimum eligibility criteria. The
 * common requirements derivable from the form (a full-time Alberta job offer, a
 * minimum language score, and minimum work experience) are implemented in
 * `eligibility`. Stream eligibility pages reviewed 2026-08-08:
 * https://www.alberta.ca/aaip-alberta-opportunity-stream-eligibility
 * https://www.alberta.ca/aaip-alberta-express-entry-stream-eligibility
 * https://www.alberta.ca/aaip-rural-renewal-stream-eligibility
 * https://www.alberta.ca/tourism-and-hospitality-stream-eligibility
 */

export type EducationLevel = 'doctorate' | 'masters' | 'bachelor' | 'trades' | 'diploma' | 'secondary'

export type EducationLocation = 'alberta' | 'other-province' | 'none'

export type ExperienceBand = 'over-12' | '6-11' | 'less-6'

export type CanadianExperience = 'alberta' | 'other-province' | 'none'

/** 6-point job offer to work in select Alberta rural communities or sector. */
export type SectorJobOffer = 'rural-renewal' | 'tourism-hospitality' | 'law-enforcement' | 'none'

export type JobLocation = 'calgary-edmonton' | 'rural-renewal' | 'other'

export interface AlbertaInput {
  education: EducationLevel
  educationLocation: EducationLocation
  /** Overall CLB/NCLC of the English test (lowest band across abilities), 0 if none. */
  englishClb: number
  /** Overall CLB/NCLC of the French test (lowest band across abilities), 0 if none. */
  frenchClb: number
  /** CLB/NCLC 4+ in both English and French. */
  bilingual: boolean
  totalExperience: ExperienceBand
  canadianExperience: CanadianExperience
  age: number
  familyConnection: boolean
  /** Permanent full-time job offer in Alberta (max 10). */
  permanentJobOffer: boolean
  /** 6-point rural or sector job offer (Rural Renewal endorsement, Tourism and Hospitality, or law enforcement). */
  sectorJobOffer: SectorJobOffer
  jobLocation: JobLocation
  regulatedOccupation: boolean
}

export interface AlbertaBreakdown {
  education: number
  language: number
  experience: number
  age: number
  family: number
  jobOffer: number
  location: number
  regulated: number
  total: number
}

export interface Eligibility {
  eligible: boolean
  /** Human sentences describing each unmet criterion when ineligible. */
  reasons: string[]
}

export const AB_MIN_CLB = 4
export const AB_MIN_EXPERIENCE_MONTHS = 12

export const AB_DOC = 'https://www.alberta.ca/how-to-apply-to-aaip-worker-streams'

export const AB_POINTS_GRID =
  'https://www.alberta.ca/system/files/im-worker-stream-expression-of-interest-points-grid.pdf'

export const MAX_EDUCATION = 22
export const MAX_LANGUAGE = 13
export const MAX_EXPERIENCE = 21
export const MAX_AGE = 5
export const MAX_FAMILY = 8
export const MAX_JOB_OFFER = 16
export const MAX_LOCATION = 5
export const MAX_REGULATED = 10
export const MAX_TOTAL = 100

export function educationPoints(level: EducationLevel): number {
  switch (level) {
    case 'doctorate':
      return 12
    case 'masters':
      return 10
    case 'bachelor':
    case 'trades':
      return 7
    case 'diploma':
      return 4
    case 'secondary':
      return 0
  }
}

export function educationLocationPoints(location: EducationLocation): number {
  switch (location) {
    case 'alberta':
      return 10
    case 'other-province':
      return 6
    case 'none':
      return 0
  }
}

export function englishLanguagePoints(clb: number): number {
  if (clb >= 6) return 10
  if (clb === 5) return 8
  if (clb === 4) return 5
  return 0
}

export function frenchLanguagePoints(clb: number): number {
  if (clb >= 6) return 8
  if (clb === 5) return 5
  if (clb === 4) return 3
  return 0
}

/** Bilingual bonus only counts when both languages reach CLB/NCLC 4+. */
export function bilingualPoints(englishClb: number, frenchClb: number, bilingual: boolean): number {
  return bilingual && englishClb >= 4 && frenchClb >= 4 ? 3 : 0
}

export function totalExperiencePoints(band: ExperienceBand): number {
  switch (band) {
    case 'over-12':
      return 11
    case '6-11':
      return 7
    case 'less-6':
      return 3
  }
}

export function canadianExperiencePoints(experience: CanadianExperience): number {
  switch (experience) {
    case 'alberta':
      return 10
    case 'other-province':
      return 6
    case 'none':
      return 0
  }
}

export function agePoints(age: number): number {
  if (age < 18) return 0
  if (age <= 20) return 3
  if (age <= 34) return 5
  if (age <= 49) return 4
  return 3
}

export function permanentJobOfferPoints(permanent: boolean): number {
  return permanent ? 10 : 0
}

export function sectorJobOfferPoints(offer: SectorJobOffer): number {
  return offer === 'none' ? 0 : 6
}

/** Permanent offer (10) and select rural or sector job offer (6) stack per the official grid (max 16). */
export function jobOfferPoints(permanent: boolean, sector: SectorJobOffer): number {
  return permanentJobOfferPoints(permanent) + sectorJobOfferPoints(sector)
}

export function jobLocationPoints(location: JobLocation): number {
  switch (location) {
    case 'rural-renewal':
    case 'other':
      return 5
    case 'calgary-edmonton':
      return 0
  }
}

export function albertaScore(input: AlbertaInput): AlbertaBreakdown {
  const education = educationPoints(input.education) + educationLocationPoints(input.educationLocation)

  const language =
    Math.max(englishLanguagePoints(input.englishClb), frenchLanguagePoints(input.frenchClb)) +
    bilingualPoints(input.englishClb, input.frenchClb, input.bilingual)

  const experience = totalExperiencePoints(input.totalExperience) + canadianExperiencePoints(input.canadianExperience)

  const age = agePoints(input.age)

  const family = input.familyConnection ? 8 : 0
  const jobOffer = jobOfferPoints(input.permanentJobOffer, input.sectorJobOffer)
  const location = jobLocationPoints(input.jobLocation)
  const regulated = input.regulatedOccupation ? 10 : 0

  return {
    education,
    language,
    experience,
    age,
    family,
    jobOffer,
    location,
    regulated,
    total: education + language + experience + age + family + jobOffer + location + regulated,
  }
}

/**
 * Eligibility determination for AAIP worker streams, separate from points.
 * A candidate can score well yet still fail the minimum eligibility criteria.
 *
 * Derived from the official stream eligibility pages (reviewed 2026-08-08):
 *
 * - A full-time Alberta job offer is required by the Alberta Opportunity,
 *   Rural Renewal and Tourism and Hospitality streams; the Express Entry
 *   stream requires one when invited based on a job offer. The form models
 *   this with `permanentJobOffer` or a select rural or sector job offer.
 * - A minimum language score applies to every stream: CLB/NCLC 5 for NOC
 *   TEER 0-3 and CLB/NCLC 4 for TEER 4-5 in the Opportunity and Rural Renewal
 *   streams, and CLB/NCLC 4 in the Tourism and Hospitality stream. The tool
 *   does not collect a NOC, so the common floor of CLB 4 is enforced.
 * - Minimum work experience: 12 months full-time within the last 18 months
 *   (Alberta) or 24 months within the last 30 (Canada or abroad) for the
 *   Opportunity stream, 12 months for Rural Renewal, and 6 consecutive months
 *   for Tourism and Hospitality. The common 12-month floor is enforced.
 */
export function eligibility(input: AlbertaInput): Eligibility {
  const reasons: string[] = []

  const hasJobOffer = input.permanentJobOffer || input.sectorJobOffer !== 'none'
  if (!hasJobOffer) {
    reasons.push(
      'AAIP worker streams require a full-time job offer or employment contract from an Alberta employer.',
    )
  }

  if (Math.max(input.englishClb, input.frenchClb) < AB_MIN_CLB) {
    reasons.push(`AAIP worker streams require a minimum of CLB ${AB_MIN_CLB} overall in English or French.`)
  }

  if (input.totalExperience !== 'over-12') {
    reasons.push(
      `AAIP worker streams require a minimum of ${AB_MIN_EXPERIENCE_MONTHS} months of full-time work experience.`,
    )
  }

  return { eligible: reasons.length === 0, reasons }
}
