import { describe, expect, it } from 'vitest'
import { HIGH_WAGE_OCCUPATIONS } from './high-wage-occupations'
import { currentCrsRules, highWageExperiencePoints, highWageJobOfferPoints, labourMarketIntegrationPoints, maximumCrsScore } from './labour-market'
import { getCrsRecommendations } from './recommendations'
import { crsScore } from './score'
import type { CrsInput } from './types'

function profile(overrides: Partial<CrsInput> = {}): CrsInput {
  return {
    rules: 'from-2026-11-03', age: 30, hasAccompanyingSpouse: false, education: 'bachelor',
    firstOfficialLanguage: 'english', english: { listening: 7, reading: 7, writing: 7, speaking: 7 },
    french: { listening: 0, reading: 0, writing: 0, speaking: 0 }, canadianWorkYears: 1, foreignWorkYears: 0,
    certificateOfQualification: false, provincialNomination: false, canadianEducation: 'none', siblingInCanada: false,
    ...overrides,
  }
}

describe('November 3, 2026 Labour Market Integration factor (IRCC tables)', () => {
  it('selects the rule version at midnight in Toronto on the effective date', () => {
    expect(currentCrsRules(new Date('2026-11-03T04:59:59Z'))).toBe('before-2026-11-03')
    expect(currentCrsRules(new Date('2026-11-03T05:00:00Z'))).toBe('from-2026-11-03')
  })

  it('includes all 186 published NOCs, preserving leading zeroes', () => {
    const occupations = Object.entries(HIGH_WAGE_OCCUPATIONS)
    expect(occupations).toHaveLength(186)
    expect(occupations.filter(([, o]) => o.level === '2')).toHaveLength(31)
    expect(occupations.filter(([, o]) => o.level === '1.5')).toHaveLength(89)
    expect(occupations.filter(([, o]) => o.level === '1.3')).toHaveLength(66)
    expect(HIGH_WAGE_OCCUPATIONS['00011']?.level).toBe('2')
  })

  it.each([
    ['10010', 100, 70], ['21232', 70, 40], ['21234', 50, 20], ['60030', 0, 0],
  ])('NOC %s: offer %i, twelve-month experience %i', (noc, offer, experience) => {
    const input = profile({ qualifyingJobOffer: true, jobOfferNoc: noc, highWageWork: [{ noc, months: 12 }] })
    expect(highWageJobOfferPoints(input)).toBe(offer)
    expect(highWageExperiencePoints(input)).toBe(experience)
  })

  it('requires a qualifying offer, not just a listed NOC', () => {
    expect(highWageJobOfferPoints(profile({ jobOfferNoc: '10010' }))).toBe(0)
    expect(highWageJobOfferPoints(profile({ qualifyingJobOffer: true, jobOfferNoc: 'constructor' }))).toBe(0)
  })

  it('combines experience at or above each threshold and awards only the highest tier', () => {
    expect(highWageExperiencePoints(profile({ highWageWork: [{ noc: '10010', months: 6 }, { noc: '21232', months: 6 }] }))).toBe(40)
    expect(highWageExperiencePoints(profile({ highWageWork: [{ noc: '10010', months: 6 }, { noc: '21234', months: 6 }] }))).toBe(20)
    expect(highWageExperiencePoints(profile({ highWageWork: [{ noc: '10010', months: 11.5 }] }))).toBe(0)
    expect(highWageExperiencePoints(profile({ canadianWorkYears: 0, highWageWork: [{ noc: '10010', months: 12 }] }))).toBe(0)
  })

  it('ignores unknown NOCs, non-finite and negative durations', () => {
    expect(highWageExperiencePoints(profile({ highWageWork: [
      { noc: '99999', months: 12 }, { noc: '10010', months: -12 }, { noc: '10010', months: Infinity },
    ] }))).toBe(0)
  })

  it('replaces Canadian work duration with the higher option instead of adding an offer bonus', () => {
    const input = profile({ qualifyingJobOffer: true, jobOfferNoc: '10010' })
    const score = crsScore(input)
    const previous = crsScore({ ...input, rules: 'before-2026-11-03' })
    expect(score.core).toBe(previous.core - 40)
    expect(score.transferability).toBe(previous.transferability)
    expect(score.labourMarketIntegration).toBe(100)
    expect(score.total - previous.total).toBe(60)
  })

  it('chooses experience over an offer and applies both spouse duration tables', () => {
    const input = profile({ canadianWorkYears: 5, qualifyingJobOffer: true, jobOfferNoc: '10010', highWageWork: [{ noc: '10010', months: 12 }] })
    expect(labourMarketIntegrationPoints(input)).toBe(150)
    expect(labourMarketIntegrationPoints({ ...input, hasAccompanyingSpouse: true })).toBe(140)
  })

  it('keeps existing totals for non-high-wage work and ignores future fields under the earlier rules', () => {
    const input = profile({ canadianWorkYears: 3 })
    expect(crsScore(input).total).toBe(crsScore({ ...input, rules: 'before-2026-11-03' }).total)
    const legacy = profile({ rules: 'before-2026-11-03', qualifyingJobOffer: true, jobOfferNoc: '10010', highWageWork: [{ noc: '10010', months: 12 }] })
    expect(crsScore(legacy).labourMarketIntegration).toBe(0)
    expect(crsScore(legacy).total).toBe(crsScore({ ...legacy, qualifyingJobOffer: false, highWageWork: [] }).total)
  })

  it('preserves factor sums above the former maximum and caps additional points separately', () => {
    const input = profile({ age: 25, education: 'doctorate', english: { listening: 10, reading: 10, writing: 10, speaking: 10 },
      french: { listening: 10, reading: 10, writing: 10, speaking: 10 }, canadianWorkYears: 5, foreignWorkYears: 3,
      provincialNomination: true, highWageWork: [{ noc: '10010', months: 12 }] })
    expect(crsScore(input).total).toBe(1270)
    expect(crsScore(input).additional).toBe(600)
    expect(maximumCrsScore(input)).toBe(1270)
    expect(maximumCrsScore({ ...input, rules: 'before-2026-11-03' })).toBe(1200)
  })

  it('simulates recommendations using the selected rules without mutating the input', () => {
    const input = profile({ qualifyingJobOffer: true, jobOfferNoc: '10010',
      english: { listening: 10, reading: 10, writing: 10, speaking: 10 },
      french: { listening: 10, reading: 10, writing: 10, speaking: 10 },
      provincialNomination: true, canadianEducation: 'three-plus-years', siblingInCanada: true, certificateOfQualification: true })
    const before = structuredClone(input)
    const recommendation = getCrsRecommendations(input).find((r) => r.id === 'canadian-work')
    const gain = crsScore({ ...input, canadianWorkYears: 2 }).total - crsScore(input).total
    expect(recommendation?.potential ?? 0).toBe(gain)
    expect(input).toEqual(before)
  })
})
