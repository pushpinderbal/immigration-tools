import { HIGH_WAGE_OCCUPATIONS } from './high-wage-occupations'
import { CANADIAN_WORK_TABLE, MAX_TOTAL } from './tables'
import type { CrsInput, CrsRules } from './types'

export const CRS_CHANGES_DOC = 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/changes.html'
export const LMIF_EFFECTIVE_AT = '2026-11-03T00:00:00-05:00'
export const MAX_LMIF_WITH_SPOUSE = 140
export const MAX_LMIF_WITHOUT_SPOUSE = 150

function occupationForNoc(noc: string = '') {
  const code = noc.trim()
  return /^[0-9]{5}$/.test(code) ? HIGH_WAGE_OCCUPATIONS[code] : undefined
}

export function currentCrsRules(date: Date = new Date()): CrsRules {
  return date.getTime() >= Date.parse(LMIF_EFFECTIVE_AT) ? 'from-2026-11-03' : 'before-2026-11-03'
}

export function usesLabourMarketIntegration(input: CrsInput): boolean {
  return input.rules === 'from-2026-11-03'
}

/** Derived from the published factor maxima; IRCC has not published a new overall maximum. */
export function maximumCrsScore(input: CrsInput): number {
  return MAX_TOTAL + (usesLabourMarketIntegration(input) ? 70 : 0)
}

export function highWageExperiencePoints(input: CrsInput): number {
  if (input.canadianWorkYears < 1) return 0
  const months = { '1.3': 0, '1.5': 0, '2': 0 }
  for (const period of input.highWageWork ?? []) {
    const occupation = occupationForNoc(period.noc)
    if (occupation && Number.isFinite(period.months) && period.months > 0) {
      months[occupation.level] += period.months
    }
  }
  if (months['2'] >= 12) return 70
  if (months['2'] + months['1.5'] >= 12) return 40
  if (months['2'] + months['1.5'] + months['1.3'] >= 12) return 20
  return 0
}

export function highWageJobOfferPoints(input: CrsInput): number {
  if (!input.qualifyingJobOffer) return 0
  const occupation = occupationForNoc(input.jobOfferNoc)
  if (!occupation) return 0
  return { '1.3': 50, '1.5': 70, '2': 100 }[occupation.level]
}

/** Canadian work duration leaves core points. The offer and experience options never stack. */
export function labourMarketIntegrationPoints(input: CrsInput): number {
  if (!usesLabourMarketIntegration(input)) return 0
  const duration = CANADIAN_WORK_TABLE[input.canadianWorkYears][input.hasAccompanyingSpouse ? 0 : 1]
  return Math.max(duration + highWageExperiencePoints(input), highWageJobOfferPoints(input))
}
