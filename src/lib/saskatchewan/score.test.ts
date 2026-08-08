import { describe, expect, it } from 'vitest'
import {
  agePoints,
  connectionPoints,
  educationPoints,
  eligibility,
  firstLanguagePoints,
  priorWorkExperiencePoints,
  secondLanguagePoints,
  sinpScore,
  workExperiencePoints,
} from './score'
import type { SinpInput } from './score'

function base(overrides: Partial<SinpInput> = {}): SinpInput {
  return {
    education: 'bachelor',
    workYears: 3,
    priorWorkYears: 2,
    firstLanguageClb: 7,
    secondLanguageClb: 0,
    age: 30,
    subCategory: 'oid-ee',
    family: true,
    skWorkExperience: false,
    skStudy: false,
    jobOffer: false,
    ...overrides,
  }
}

describe('SINP Factor I: Labour Market Success factor points (official grid)', () => {
  it('education and training', () => {
    expect(educationPoints('masters-doctorate')).toBe(23)
    expect(educationPoints('bachelor')).toBe(20)
    expect(educationPoints('trade')).toBe(20)
    expect(educationPoints('diploma')).toBe(15)
    expect(educationPoints('certificate')).toBe(12)
  })

  it('skilled work experience in the last 5 years', () => {
    expect(workExperiencePoints(5)).toBe(10)
    expect(workExperiencePoints(6)).toBe(10)
    expect(workExperiencePoints(4)).toBe(8)
    expect(workExperiencePoints(3)).toBe(6)
    expect(workExperiencePoints(2)).toBe(4)
    expect(workExperiencePoints(1)).toBe(2)
    expect(workExperiencePoints(0)).toBe(0)
  })

  it('skilled work experience in the 6-10 years prior', () => {
    expect(priorWorkExperiencePoints(5)).toBe(5)
    expect(priorWorkExperiencePoints(6)).toBe(5)
    expect(priorWorkExperiencePoints(4)).toBe(4)
    expect(priorWorkExperiencePoints(3)).toBe(3)
    expect(priorWorkExperiencePoints(2)).toBe(2)
    expect(priorWorkExperiencePoints(1)).toBe(0)
    expect(priorWorkExperiencePoints(0)).toBe(0)
  })

  it('first official language (overall CLB)', () => {
    expect(firstLanguagePoints(10)).toBe(20)
    expect(firstLanguagePoints(8)).toBe(20)
    expect(firstLanguagePoints(7)).toBe(18)
    expect(firstLanguagePoints(6)).toBe(16)
    expect(firstLanguagePoints(5)).toBe(14)
    expect(firstLanguagePoints(4)).toBe(12)
    expect(firstLanguagePoints(3)).toBe(0)
    expect(firstLanguagePoints(0)).toBe(0)
  })

  it('second official language (overall CLB)', () => {
    expect(secondLanguagePoints(9)).toBe(10)
    expect(secondLanguagePoints(8)).toBe(10)
    expect(secondLanguagePoints(7)).toBe(8)
    expect(secondLanguagePoints(6)).toBe(6)
    expect(secondLanguagePoints(5)).toBe(4)
    expect(secondLanguagePoints(4)).toBe(2)
    expect(secondLanguagePoints(3)).toBe(0)
    expect(secondLanguagePoints(0)).toBe(0)
  })

  it('age', () => {
    expect(agePoints(17)).toBe(0)
    expect(agePoints(18)).toBe(8)
    expect(agePoints(21)).toBe(8)
    expect(agePoints(22)).toBe(12)
    expect(agePoints(30)).toBe(12)
    expect(agePoints(34)).toBe(12)
    expect(agePoints(35)).toBe(10)
    expect(agePoints(45)).toBe(10)
    expect(agePoints(46)).toBe(8)
    expect(agePoints(50)).toBe(8)
    expect(agePoints(51)).toBe(0)
    expect(agePoints(60)).toBe(0)
  })
})

describe('SINP Factor II: Connection to Saskatchewan', () => {
  it('OID/EE: close family relative in Saskatchewan', () => {
    expect(connectionPoints(base({ family: true }))).toBe(20)
    expect(connectionPoints(base({ family: false }))).toBe(0)
  })

  it('OID/EE: past work and study in Saskatchewan add up', () => {
    expect(connectionPoints(base({ family: false, skWorkExperience: true }))).toBe(5)
    expect(connectionPoints(base({ family: false, skStudy: true }))).toBe(5)
    expect(connectionPoints(base({ family: true, skWorkExperience: true, skStudy: true }))).toBe(30)
  })

  it('Employment Offer: high-skilled job offer is worth the full 30', () => {
    expect(connectionPoints(base({ subCategory: 'employment-offer', jobOffer: true }))).toBe(30)
    expect(connectionPoints(base({ subCategory: 'employment-offer', jobOffer: false }))).toBe(0)
  })
})

describe('SINP total', () => {
  it('maximized profile', () => {
    const score = sinpScore(
      base({
        education: 'masters-doctorate',
        workYears: 5,
        priorWorkYears: 5,
        firstLanguageClb: 10,
        secondLanguageClb: 10,
        age: 30,
        subCategory: 'employment-offer',
        jobOffer: true,
      }),
    )
    // education 23 + work 10 + prior work 5 + language 30 + age 12 + connection 30
    expect(score).toEqual({
      education: 23,
      work: 10,
      workPrior: 5,
      language: 30,
      age: 12,
      connection: 30,
      total: 110,
    })
  })

  it('default profile', () => {
    const score = sinpScore(base())
    // education 20 (bachelor) + work 6 (3 yrs) + prior work 2 (2 yrs 6-10 ago)
    // + language 18 (CLB 7) + age 12 (30) + connection 20 (family) = 78
    expect(score).toEqual({ education: 20, work: 6, workPrior: 2, language: 18, age: 12, connection: 20, total: 78 })
  })

  it('no points with a minimal profile', () => {
    const score = sinpScore(
      base({
        education: 'certificate',
        workYears: 0,
        priorWorkYears: 0,
        firstLanguageClb: 0,
        age: 17,
        family: false,
      }),
    )
    // education 12 + connection 0 = 12
    expect(score).toEqual({ education: 12, work: 0, workPrior: 0, language: 0, age: 0, connection: 0, total: 12 })
  })

  it('awards second-language points when a second test at CLB 6 is added', () => {
    const score = sinpScore(base({ secondLanguageClb: 6 }))
    // language 18 (first CLB 7) + 6 (second CLB 6) = 24 → total 84
    expect(score).toEqual({ education: 20, work: 6, workPrior: 2, language: 24, age: 12, connection: 20, total: 84 })
  })
})

describe('SINP eligibility (official criteria, separate from points)', () => {
  it('marks the default profile as eligible', () => {
    expect(eligibility(base())).toEqual({ eligible: true, reasons: [] })
  })

  it('flags a score below 60 even when language and work requirements are met', () => {
    const input = base({ education: 'certificate', workYears: 1, priorWorkYears: 0, age: 20, family: false })
    // total 40 (below 60), but CLB 7 and 1 year of work are fine
    const result = eligibility(input)
    expect(result.eligible).toBe(false)
    expect(result.reasons).toHaveLength(1)
    expect(result.reasons[0]).toMatch(/at least 60 points/)
  })

  it('flags a first language below CLB 4 even with enough points', () => {
    const input = base({ firstLanguageClb: 3, secondLanguageClb: 5 })
    // total 64 (≥ 60) and 5 years of work, but first language CLB 3 is below 4
    const result = eligibility(input)
    expect(result.eligible).toBe(false)
    expect(result.reasons).toHaveLength(1)
    expect(result.reasons[0]).toMatch(/CLB 4/)
  })

  it('flags no first-language test even with enough points', () => {
    const input = base({ firstLanguageClb: 0, secondLanguageClb: 0, education: 'masters-doctorate', family: true })
    // total 63 (≥ 60) and 5 years of work, but no first-language test
    const result = eligibility(input)
    expect(result.eligible).toBe(false)
    expect(result.reasons).toHaveLength(1)
    expect(result.reasons[0]).toMatch(/language test/)
  })

  it('flags missing work experience even with a high score', () => {
    const input = base({
      education: 'masters-doctorate',
      workYears: 0,
      priorWorkYears: 0,
      firstLanguageClb: 8,
      secondLanguageClb: 8,
      family: true,
    })
    // total 85 (≥ 60), but no work experience in the past 10 years
    const result = eligibility(input)
    expect(result.eligible).toBe(false)
    expect(result.reasons).toHaveLength(1)
    expect(result.reasons[0]).toMatch(/one year of full-time paid work experience/)
  })

  it('flags an Employment Offer profile without a job offer even with a high score', () => {
    const input = base({
      subCategory: 'employment-offer',
      jobOffer: false,
      education: 'masters-doctorate',
      workYears: 5,
      priorWorkYears: 5,
      firstLanguageClb: 10,
      secondLanguageClb: 10,
    })
    // total 80 (≥ 60), but no job offer for the Employment Offer sub-category
    const result = eligibility(input)
    expect(result.eligible).toBe(false)
    expect(result.reasons).toHaveLength(1)
    expect(result.reasons[0]).toMatch(/job offer/)
  })

  it('accepts an Employment Offer profile with a job offer', () => {
    const input = base({ subCategory: 'employment-offer', jobOffer: true })
    expect(eligibility(input)).toEqual({ eligible: true, reasons: [] })
  })

  it('lists multiple reasons when several criteria fail', () => {
    const input = base({ workYears: 0, priorWorkYears: 0, firstLanguageClb: 3, family: false })
    // points (32 < 60), language (CLB 3) and work experience all fail
    const result = eligibility(input)
    expect(result.eligible).toBe(false)
    expect(result.reasons.length).toBeGreaterThanOrEqual(3)
    expect(result.reasons.join(' ')).toMatch(/at least 60 points/)
    expect(result.reasons.join(' ')).toMatch(/CLB 4/)
    expect(result.reasons.join(' ')).toMatch(/work experience/)
  })
})
