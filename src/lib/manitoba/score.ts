/**
 * MPNP EOI scoring - Manitoba Provincial Nominee Program, Skilled Worker streams.
 *
 * Source: Manitoba "Expression of Interest" (Immigrate Manitoba, updated 2026-04-20)
 * https://immigratemanitoba.com/mpnp/apply/eoi/
 *
 * Six factors, out of 1000 points:
 *   Factor 1 Language proficiency (max 125)
 *   Factor 2 Age (max 75)
 *   Factor 3 Work experience (max 175)
 *   Factor 4 Education (max 125)
 *   Factor 5 Adaptability (max 500)
 *   Factor 6 Risk assessment (deductions down to -200)
 *
 * Language points are awarded per ability band (reading, writing, listening,
 * speaking), not on the overall CLB: 25 per band at CLB 8+, down to 0 at
 * CLB 3 or lower. Second official language is a flat 25 at overall CLB 5+.
 */

export type ManitobaLanguageAbility = 'listening' | 'reading' | 'writing' | 'speaking'

export type ManitobaLanguageClbs = Record<ManitobaLanguageAbility, number>

export type ManitobaEducation =
  | 'master-or-doctorate'
  | 'two-post-secondary'
  | 'three-plus-year'
  | 'two-year'
  | 'one-year'
  | 'trade-certificate'
  | 'no-post-secondary'

export interface ManitobaConnections {
  closeRelative: boolean
  authorizedWork6Months: boolean
  postSecondary2Years: boolean
  postSecondary1Year: boolean
  closeFriendOrDistantRelative: boolean
}

export interface ManitobaDemand {
  ongoingEmploymentJobOffer: boolean
  strategicInitiativeIta: boolean
}

export interface ManitobaRisk {
  workExperienceOtherProvince: boolean
  studiesOtherProvince: boolean
}

export interface ManitobaInput {
  /** CLB/NCLC band of the first official language for each ability, 0 if no result. */
  firstLanguageClbs: ManitobaLanguageClbs
  /** Declared second official language with an overall CLB/NCLC of 5 or higher. */
  secondLanguage: boolean
  age: number
  /** Years of work experience during the last 5 years. 4 means 4 or more. */
  workYears: number
  recognizedByLicensingBody: boolean
  education: ManitobaEducation
  connections: ManitobaConnections
  demand: ManitobaDemand
  regionalDevelopmentOutsideWinnipeg: boolean
  risk: ManitobaRisk
}

export interface ManitobaBreakdown {
  language: number
  age: number
  experience: number
  education: number
  adaptability: number
  risk: number
  total: number
}

export const MAX_LANGUAGE = 125
export const MAX_AGE = 75
export const MAX_EXPERIENCE = 175
export const MAX_EDUCATION = 125
export const MAX_ADAPTABILITY = 500
export const MAX_CONNECTIONS = 200
export const MAX_DEMAND = 500
export const MAX_RISK = 200
export const MAX_TOTAL = 1000

export const MB_DOC = 'https://immigratemanitoba.com/mpnp/apply/eoi/'
export const MB_LANGUAGE_DOC = 'https://immigratemanitoba.com/mpnp/policies/language-proficiency/'

// --- Factor 1: Language proficiency ---

export function languageBandPoints(clb: number): number {
  if (clb >= 8) return 25
  if (clb === 7) return 22
  if (clb === 6) return 20
  if (clb === 5) return 17
  if (clb === 4) return 12
  return 0
}

export function firstLanguagePoints(clbs: ManitobaLanguageClbs): number {
  return (
    languageBandPoints(clbs.reading) +
    languageBandPoints(clbs.writing) +
    languageBandPoints(clbs.listening) +
    languageBandPoints(clbs.speaking)
  )
}

export function secondLanguagePoints(secondLanguage: boolean): number {
  return secondLanguage ? 25 : 0
}

export function languagePoints(firstLanguageClbs: ManitobaLanguageClbs, secondLanguage: boolean): number {
  const total = firstLanguagePoints(firstLanguageClbs) + secondLanguagePoints(secondLanguage)
  return Math.min(MAX_LANGUAGE, total)
}

// --- Factor 2: Age ---

export function agePoints(age: number): number {
  if (age >= 21 && age <= 45) return 75
  if (age === 20 || age === 46) return 40
  if (age === 19 || age === 47) return 30
  if (age === 18 || age === 48) return 20
  if (age === 49) return 10
  return 0
}

// --- Factor 3: Work experience ---

export function workYearsPoints(years: number): number {
  if (years >= 4) return 75
  if (years === 3) return 60
  if (years === 2) return 50
  if (years === 1) return 40
  return 0
}

export function experiencePoints(workYears: number, recognizedByLicensingBody: boolean): number {
  const points = workYearsPoints(workYears) + (recognizedByLicensingBody ? 100 : 0)
  return Math.min(MAX_EXPERIENCE, points)
}

// --- Factor 4: Education ---

export function educationPoints(education: ManitobaEducation): number {
  switch (education) {
    case 'master-or-doctorate':
      return 125
    case 'two-post-secondary':
      return 115
    case 'three-plus-year':
      return 110
    case 'two-year':
      return 100
    case 'one-year':
      return 70
    case 'trade-certificate':
      return 70
    case 'no-post-secondary':
      return 0
  }
}

// --- Factor 5: Adaptability ---

export function connectionsPoints(connections: ManitobaConnections): number {
  let total = 0
  if (connections.closeRelative) total += 200
  if (connections.authorizedWork6Months) total += 100
  if (connections.postSecondary2Years) total += 100
  if (connections.postSecondary1Year) total += 50
  if (connections.closeFriendOrDistantRelative) total += 50
  return Math.min(MAX_CONNECTIONS, total)
}

export function demandPoints(demand: ManitobaDemand): number {
  let total = 0
  if (demand.ongoingEmploymentJobOffer) total += 500
  if (demand.strategicInitiativeIta) total += 500
  return Math.min(MAX_DEMAND, total)
}

export function adaptabilityPoints(
  connections: ManitobaConnections,
  demand: ManitobaDemand,
  regionalDevelopmentOutsideWinnipeg: boolean,
): number {
  const subtotal =
    connectionsPoints(connections) +
    demandPoints(demand) +
    (regionalDevelopmentOutsideWinnipeg ? 50 : 0)
  return Math.min(MAX_ADAPTABILITY, subtotal)
}

// --- Factor 6: Risk assessment (deductions) ---

export function riskPoints(risk: ManitobaRisk): number {
  let total = 0
  if (risk.workExperienceOtherProvince) total -= 100
  if (risk.studiesOtherProvince) total -= 100
  return total
}

export function manitobaScore(input: ManitobaInput): ManitobaBreakdown {
  const language = languagePoints(input.firstLanguageClbs, input.secondLanguage)
  const age = agePoints(input.age)
  const experience = experiencePoints(input.workYears, input.recognizedByLicensingBody)
  const education = educationPoints(input.education)
  const adaptability = adaptabilityPoints(
    input.connections,
    input.demand,
    input.regionalDevelopmentOutsideWinnipeg,
  )
  const risk = riskPoints(input.risk)

  return {
    language,
    age,
    experience,
    education,
    adaptability,
    risk,
    total: language + age + experience + education + adaptability + risk,
  }
}

// --- Eligibility determination ---
//
// Separate from the 1000-point EOI ranking: candidates must score at least
// 60 out of 100 on the MPNP eligibility assessment grid and hold a
// connection to Manitoba. Source: MPNP EOI eligibility grid
// (immigratemanitoba.com/mpnp/apply/eoi/, updated 2026-04-20).

export const MIN_ELIGIBILITY_SCORE = 60

export interface ManitobaEligibility {
  eligible: boolean
  reasons: string[]
}

function overallClb(clbs: ManitobaLanguageClbs): number {
  return Math.min(clbs.listening, clbs.reading, clbs.writing, clbs.speaking)
}

function eligibilityLanguagePoints(clbs: ManitobaLanguageClbs, secondLanguage: boolean): number {
  const clb = overallClb(clbs)
  const first = clb >= 8 ? 20 : clb === 7 ? 18 : clb === 6 ? 16 : clb === 5 ? 14 : clb === 4 ? 12 : 0
  const second = secondLanguage ? 5 : 0
  return first + second
}

function eligibilityAgePoints(age: number): number {
  if (age >= 21 && age <= 45) return 10
  if (age === 20 || age === 46) return 8
  if (age === 19 || age === 47) return 6
  if (age === 18 || age === 48) return 4
  if (age === 49) return 2
  return 0
}

function eligibilityWorkPoints(workYears: number): number {
  if (workYears >= 4) return 15
  if (workYears === 3) return 12
  if (workYears === 2) return 10
  if (workYears === 1) return 8
  return 0
}

function eligibilityEducationPoints(education: ManitobaEducation): number {
  switch (education) {
    case 'master-or-doctorate':
      return 25
    case 'two-post-secondary':
      return 23
    case 'three-plus-year':
    case 'two-year':
      return 20
    case 'one-year':
    case 'trade-certificate':
      return 14
    case 'no-post-secondary':
      return 0
  }
}

function eligibilityAdaptabilityPoints(
  connections: ManitobaConnections,
  demand: ManitobaDemand,
  regionalDevelopmentOutsideWinnipeg: boolean,
): number {
  let total = 0
  if (connections.closeRelative) total += 20
  if (connections.authorizedWork6Months) total += 12
  if (connections.postSecondary2Years) total += 12
  if (connections.postSecondary1Year) total += 10
  if (connections.closeFriendOrDistantRelative) total += 10
  if (demand.strategicInitiativeIta) total += 20
  if (regionalDevelopmentOutsideWinnipeg) total += 5
  return Math.min(25, total)
}

export function eligibilityAssessmentScore(input: ManitobaInput): number {
  return (
    eligibilityLanguagePoints(input.firstLanguageClbs, input.secondLanguage) +
    eligibilityAgePoints(input.age) +
    eligibilityWorkPoints(input.workYears) +
    eligibilityEducationPoints(input.education) +
    eligibilityAdaptabilityPoints(input.connections, input.demand, input.regionalDevelopmentOutsideWinnipeg)
  )
}

export function hasManitobaConnection(input: ManitobaInput): boolean {
  const c = input.connections
  return (
    c.closeRelative ||
    c.authorizedWork6Months ||
    c.postSecondary2Years ||
    c.postSecondary1Year ||
    c.closeFriendOrDistantRelative ||
    input.demand.strategicInitiativeIta ||
    input.demand.ongoingEmploymentJobOffer
  )
}

export function eligibility(input: ManitobaInput): ManitobaEligibility {
  const reasons: string[] = []

  const clb = overallClb(input.firstLanguageClbs)
  if (clb < 4) {
    reasons.push('MPNP requires a minimum of CLB 4 in your first official language.')
  }

  if (!hasManitobaConnection(input)) {
    reasons.push(
      'Skilled Worker streams require an established connection to Manitoba: close family, previous work or study in the province, or an invitation under a strategic initiative.',
    )
  }

  const assessment = eligibilityAssessmentScore(input)
  if (assessment < MIN_ELIGIBILITY_SCORE) {
    reasons.push(
      `You scored ${assessment} out of 100 on the MPNP eligibility assessment, but you need at least ${MIN_ELIGIBILITY_SCORE}.`,
    )
  }

  return { eligible: reasons.length === 0, reasons }
}
