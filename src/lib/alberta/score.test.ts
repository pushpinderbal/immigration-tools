import { describe, expect, it } from 'vitest'
import {
  agePoints,
  albertaScore,
  bilingualPoints,
  canadianExperiencePoints,
  educationLocationPoints,
  educationPoints,
  eligibility,
  englishLanguagePoints,
  frenchLanguagePoints,
  jobLocationPoints,
  jobOfferPoints,
  permanentJobOfferPoints,
  sectorJobOfferPoints,
  totalExperiencePoints,
} from './score'
import type { AlbertaInput } from './score'

function base(overrides: Partial<AlbertaInput> = {}): AlbertaInput {
  return {
    education: 'bachelor',
    educationLocation: 'none',
    englishClb: 6,
    frenchClb: 0,
    bilingual: false,
    totalExperience: 'over-12',
    canadianExperience: 'none',
    age: 30,
    familyConnection: false,
    permanentJobOffer: false,
    sectorJobOffer: 'none',
    jobLocation: 'calgary-edmonton',
    regulatedOccupation: false,
    ...overrides,
  }
}

describe('AAIP Worker EOI factor points (official grid)', () => {
  it('highest education level', () => {
    expect(educationPoints('doctorate')).toBe(12)
    expect(educationPoints('masters')).toBe(10)
    expect(educationPoints('bachelor')).toBe(7)
    expect(educationPoints('trades')).toBe(7)
    expect(educationPoints('diploma')).toBe(4)
    expect(educationPoints('secondary')).toBe(0)
  })

  it('location of education in Canada', () => {
    expect(educationLocationPoints('alberta')).toBe(10)
    expect(educationLocationPoints('other-province')).toBe(6)
    expect(educationLocationPoints('none')).toBe(0)
  })

  it('English proficiency', () => {
    expect(englishLanguagePoints(6)).toBe(10)
    expect(englishLanguagePoints(7)).toBe(10)
    expect(englishLanguagePoints(5)).toBe(8)
    expect(englishLanguagePoints(4)).toBe(5)
    expect(englishLanguagePoints(3)).toBe(0)
    expect(englishLanguagePoints(0)).toBe(0)
  })

  it('French proficiency', () => {
    expect(frenchLanguagePoints(6)).toBe(8)
    expect(frenchLanguagePoints(7)).toBe(8)
    expect(frenchLanguagePoints(5)).toBe(5)
    expect(frenchLanguagePoints(4)).toBe(3)
    expect(frenchLanguagePoints(3)).toBe(0)
    expect(frenchLanguagePoints(0)).toBe(0)
  })

  it('bilingual bonus needs CLB/NCLC 4+ in both languages', () => {
    expect(bilingualPoints(6, 6, true)).toBe(3)
    expect(bilingualPoints(5, 4, true)).toBe(3)
    expect(bilingualPoints(6, 0, true)).toBe(0)
    expect(bilingualPoints(6, 6, false)).toBe(0)
  })

  it('total work experience', () => {
    expect(totalExperiencePoints('over-12')).toBe(11)
    expect(totalExperiencePoints('6-11')).toBe(7)
    expect(totalExperiencePoints('less-6')).toBe(3)
  })

  it('Canadian work experience', () => {
    expect(canadianExperiencePoints('alberta')).toBe(10)
    expect(canadianExperiencePoints('other-province')).toBe(6)
    expect(canadianExperiencePoints('none')).toBe(0)
  })

  it('age bands', () => {
    expect(agePoints(17)).toBe(0)
    expect(agePoints(18)).toBe(3)
    expect(agePoints(20)).toBe(3)
    expect(agePoints(21)).toBe(5)
    expect(agePoints(34)).toBe(5)
    expect(agePoints(35)).toBe(4)
    expect(agePoints(49)).toBe(4)
    expect(agePoints(50)).toBe(3)
    expect(agePoints(60)).toBe(3)
  })

  it('permanent full-time job offer in Alberta', () => {
    expect(permanentJobOfferPoints(true)).toBe(10)
    expect(permanentJobOfferPoints(false)).toBe(0)
  })

  it('select rural community or sector job offers each award 6 points', () => {
    expect(sectorJobOfferPoints('rural-renewal')).toBe(6)
    expect(sectorJobOfferPoints('tourism-hospitality')).toBe(6)
    expect(sectorJobOfferPoints('law-enforcement')).toBe(6)
    expect(sectorJobOfferPoints('none')).toBe(0)
  })

  it('permanent and rural or sector job offer points stack to the 16-point total', () => {
    expect(jobOfferPoints(true, 'rural-renewal')).toBe(16)
    expect(jobOfferPoints(true, 'none')).toBe(10)
    expect(jobOfferPoints(false, 'law-enforcement')).toBe(6)
    expect(jobOfferPoints(false, 'none')).toBe(0)
  })

  it('Alberta job offer location', () => {
    expect(jobLocationPoints('calgary-edmonton')).toBe(0)
    expect(jobLocationPoints('rural-renewal')).toBe(5)
    expect(jobLocationPoints('other')).toBe(5)
  })
})

describe('AAIP Worker EOI total', () => {
  it('default input scores the human capital baseline', () => {
    const score = albertaScore(base())
    // education: 7 (bachelor) + 0 = 7
    // language: 10 (English CLB 6) + 0 = 10
    // experience: 11 (12+ months) + 0 = 11
    // age: 5
    // economic factors: 0
    expect(score).toEqual({
      education: 7,
      language: 10,
      experience: 11,
      age: 5,
      family: 0,
      jobOffer: 0,
      location: 0,
      regulated: 0,
      total: 33,
    })
  })

  it('maximized profile hits the official top of every factor', () => {
    const score = albertaScore(
      base({
        education: 'doctorate',
        educationLocation: 'alberta',
        englishClb: 6,
        frenchClb: 6,
        bilingual: true,
        totalExperience: 'over-12',
        canadianExperience: 'alberta',
        age: 30,
        familyConnection: true,
        permanentJobOffer: true,
        sectorJobOffer: 'rural-renewal',
        jobLocation: 'rural-renewal',
        regulatedOccupation: true,
      }),
    )
    // human capital 69 (education 22 + language 13 + experience 21 + age 5 + family 8)
    // + economic 31 (job offer 16 + location 5 + regulated 10)
    expect(score).toEqual({
      education: 22,
      language: 13,
      experience: 21,
      age: 5,
      family: 8,
      jobOffer: 16,
      location: 5,
      regulated: 10,
      total: 100,
    })
  })

  it('language awards the higher of English or French points', () => {
    const score = albertaScore(base({ englishClb: 5, frenchClb: 6, bilingual: true }))
    // max(8 English, 8 French) + 3 bilingual = 11
    expect(score.language).toBe(11)
    expect(score.total).toBe(34)
  })

  it('permanent offer and rural endorsement stack with a rural location and regulated occupation', () => {
    const score = albertaScore(
      base({
        permanentJobOffer: true,
        sectorJobOffer: 'rural-renewal',
        jobLocation: 'rural-renewal',
        regulatedOccupation: true,
      }),
    )
    // jobOffer 16 + location 5 + regulated 10
    expect(score).toMatchObject({ jobOffer: 16, location: 5, regulated: 10, total: 64 })
  })
})

describe('AAIP worker stream eligibility (separate from points)', () => {
  it('default input is ineligible because it lacks a job offer despite scoring points', () => {
    const result = eligibility(base())
    expect(result.eligible).toBe(false)
    expect(result.reasons).toHaveLength(1)
    expect(result.reasons[0]).toMatch(/full-time job offer/)
  })

  it('is eligible with a permanent full-time Alberta job offer and no other blockers', () => {
    const result = eligibility(base({ permanentJobOffer: true }))
    expect(result.eligible).toBe(true)
    expect(result.reasons).toEqual([])
  })

  it('a select rural or sector job offer also satisfies the job offer requirement', () => {
    expect(eligibility(base({ sectorJobOffer: 'rural-renewal' })).eligible).toBe(true)
    expect(eligibility(base({ sectorJobOffer: 'tourism-hospitality' })).eligible).toBe(true)
    expect(eligibility(base({ sectorJobOffer: 'law-enforcement' })).eligible).toBe(true)
  })

  it('fails when the best language result is below CLB 4', () => {
    const result = eligibility(base({ permanentJobOffer: true, englishClb: 3, frenchClb: 0 }))
    expect(result.eligible).toBe(false)
    expect(result.reasons[0]).toMatch(/CLB 4/)
  })

  it('a French result of CLB 4 or better satisfies the language requirement', () => {
    const result = eligibility(base({ permanentJobOffer: true, englishClb: 0, frenchClb: 4 }))
    expect(result.eligible).toBe(true)
  })

  it('fails when total work experience is below 12 months', () => {
    const result = eligibility(base({ permanentJobOffer: true, totalExperience: '6-11' }))
    expect(result.eligible).toBe(false)
    expect(result.reasons[0]).toMatch(/12 months/)
  })

  it('reports every unmet criterion in a single evaluation', () => {
    const result = eligibility(base({ englishClb: 2, frenchClb: 0, totalExperience: 'less-6' }))
    expect(result.eligible).toBe(false)
    expect(result.reasons).toHaveLength(3)
    expect(result.reasons[0]).toMatch(/full-time job offer/)
    expect(result.reasons[1]).toMatch(/CLB 4/)
    expect(result.reasons[2]).toMatch(/12 months/)
  })
})
