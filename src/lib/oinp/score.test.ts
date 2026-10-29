import { describe, expect, it } from 'vitest'
import {
  canadianCredentialsPoints,
  earningsPoints,
  educationPoints,
  eligibility,
  languageAbilityPoints,
  legalStatusPoints,
  nocBroadPoints,
  officialLanguagesPoints,
  oinpScore,
  ontarioWorkPoints,
  regionPoints,
  teerPoints,
  tenureInPositionPoints,
  wagePoints,
  workExperiencePoints,
} from './score'
import type { OinpInput } from './score'

function base(overrides: Partial<OinpInput> = {}): OinpInput {
  return {
    teer: 2,
    nocBroad: 0,
    hourlyWage: 30,
    tenureInPosition: '13-24',
    ontarioWork: 'over-24',
    earnings: '50k-70k',
    legalStatus: 'work-permit',
    education: 'bachelor',
    canadianCredentials: 'one',
    englishClb: 7,
    frenchClb: 0,
    region: 'eastern',
    recentOntarioGraduate: false,
    ...overrides,
  }
}

describe('OINP Workforce Priority factor points (official grid)', () => {
  it('NOC TEER category', () => {
    expect(teerPoints(0)).toBe(9)
    expect(teerPoints(1)).toBe(9)
    expect(teerPoints(2)).toBe(6)
    expect(teerPoints(3)).toBe(6)
    expect(teerPoints(4)).toBe(0)
    expect(teerPoints(5)).toBe(0)
  })

  it('NOC broad occupational category', () => {
    expect(nocBroadPoints(3)).toBe(10)
    expect(nocBroadPoints(7)).toBe(8)
    expect(nocBroadPoints(2)).toBe(6)
    expect(nocBroadPoints(0)).toBe(4)
    expect(nocBroadPoints(1)).toBe(4)
    expect(nocBroadPoints(4)).toBe(4)
    expect(nocBroadPoints(8)).toBe(4)
    expect(nocBroadPoints(9)).toBe(4)
    expect(nocBroadPoints(5)).toBe(2)
    expect(nocBroadPoints(6)).toBe(2)
  })

  it('wage bands', () => {
    expect(wagePoints(40)).toBe(15)
    expect(wagePoints(39.99)).toBe(12)
    expect(wagePoints(35)).toBe(12)
    expect(wagePoints(34.99)).toBe(10)
    expect(wagePoints(25)).toBe(8)
    expect(wagePoints(24.99)).toBe(5)
    expect(wagePoints(20)).toBe(5)
    expect(wagePoints(19.99)).toBe(0)
  })

  it('tenure in job offer position', () => {
    expect(tenureInPositionPoints('over-24')).toBe(18)
    expect(tenureInPositionPoints('13-24')).toBe(15)
    expect(tenureInPositionPoints('6-12')).toBe(12)
    expect(tenureInPositionPoints('less-6')).toBe(0)
  })

  it('ontario work (fallback when <6 months in position)', () => {
    expect(ontarioWorkPoints('over-24')).toBe(12)
    expect(ontarioWorkPoints('13-24')).toBe(9)
    expect(ontarioWorkPoints('6-12')).toBe(6)
    expect(ontarioWorkPoints('less-6')).toBe(0)
  })

  it('work experience uses Ontario fallback only under 6 months in position', () => {
    expect(workExperiencePoints('over-24', 'less-6')).toBe(18)
    expect(workExperiencePoints('less-6', '13-24')).toBe(9)
    expect(workExperiencePoints('less-6', 'less-6')).toBe(0)
  })

  it('earnings history', () => {
    expect(earningsPoints('80k-plus')).toBe(10)
    expect(earningsPoints('over-70k')).toBe(8)
    expect(earningsPoints('50k-70k')).toBe(6)
    expect(earningsPoints('30k-50k')).toBe(4)
    expect(earningsPoints('under-30k')).toBe(0)
  })

  it('legal status', () => {
    expect(legalStatusPoints('work-permit')).toBe(10)
    expect(legalStatusPoints('study-permit')).toBe(5)
    expect(legalStatusPoints('none')).toBe(0)
  })

  it('highest education', () => {
    expect(educationPoints('doctorate')).toBe(10)
    expect(educationPoints('masters')).toBe(8)
    expect(educationPoints('above-bachelor')).toBe(6)
    expect(educationPoints('bachelor')).toBe(6)
    expect(educationPoints('ogcc')).toBe(5)
    expect(educationPoints('below-bachelor')).toBe(5)
    expect(educationPoints('college')).toBe(5)
    expect(educationPoints('apprenticeship')).toBe(5)
    expect(educationPoints('less-than-college')).toBe(0)
  })

  it('number of Canadian credentials', () => {
    expect(canadianCredentialsPoints('multiple')).toBe(10)
    expect(canadianCredentialsPoints('one')).toBe(5)
    expect(canadianCredentialsPoints('none')).toBe(0)
  })

  it('official language ability (lowest CLB across abilities)', () => {
    expect(languageAbilityPoints(9)).toBe(15)
    expect(languageAbilityPoints(10)).toBe(15)
    expect(languageAbilityPoints(8)).toBe(12)
    expect(languageAbilityPoints(7)).toBe(8)
    expect(languageAbilityPoints(6)).toBe(4)
    expect(languageAbilityPoints(5)).toBe(0)
    expect(languageAbilityPoints(0)).toBe(0)
  })

  it('knowledge of official languages (CLB 6 threshold for one or both)', () => {
    expect(officialLanguagesPoints(6, 6)).toBe(10)
    expect(officialLanguagesPoints(7, 8)).toBe(10)
    expect(officialLanguagesPoints(7, 5)).toBe(5)
    expect(officialLanguagesPoints(0, 6)).toBe(5)
    expect(officialLanguagesPoints(5, 0)).toBe(0)
    expect(officialLanguagesPoints(5, 5)).toBe(0)
    expect(officialLanguagesPoints(4, 4)).toBe(0)
    expect(officialLanguagesPoints(0, 0)).toBe(0)
  })

  it('regional immigration', () => {
    expect(regionPoints('northern')).toBe(15)
    expect(regionPoints('eastern')).toBe(10)
    expect(regionPoints('central')).toBe(10)
    expect(regionPoints('southwestern')).toBe(10)
    expect(regionPoints('gta-except-toronto')).toBe(5)
    expect(regionPoints('toronto')).toBe(0)
  })
})

describe('OINP total', () => {
  it('maximized profile includes the October 5 earnings tier', () => {
    const score = oinpScore(
      base({
        teer: 0,
        nocBroad: 3,
        hourlyWage: 45,
        tenureInPosition: 'over-24',
        earnings: '80k-plus',
        education: 'doctorate',
        canadianCredentials: 'multiple',
        englishClb: 9,
        frenchClb: 6,
        region: 'northern',
      }),
    )
    expect(score).toEqual({ labour: 72, education: 20, language: 25, region: 15, total: 132 })
  })

  it('typical mid profile', () => {
    const score = oinpScore(base())
    // labour: 6 (teer) + 4 (noc0) + 10 (wage) + 15 (13-24mo) + 6 (earnings) + 10 (work permit) = 51
    // education: 6 + 5 = 11
    // language: 8 (CLB7) + 5 (1 lang) = 13
    // region: 10
    expect(score).toEqual({ labour: 51, education: 11, language: 13, region: 10, total: 85 })
  })

  it('Toronto with study permit and no earnings', () => {
    const score = oinpScore(
      base({
        teer: 5,
        nocBroad: 6,
        hourlyWage: 18,
        tenureInPosition: 'less-6',
        ontarioWork: 'less-6',
        earnings: 'under-30k',
        legalStatus: 'study-permit',
        education: 'less-than-college',
        canadianCredentials: 'none',
        englishClb: 6,
        region: 'toronto',
      }),
    )
    // labour: 0 + 2 + 0 + 0 + 0 + 5 = 7
    // education: 0 + 0 = 0
    // language: 4 (CLB6) + 5 (1 lang) = 9
    // region: 0
    expect(score).toEqual({ labour: 7, education: 0, language: 9, region: 0, total: 16 })
  })

  it('language uses the higher of English/French tests', () => {
    const score = oinpScore(base({ englishClb: 6, frenchClb: 8 }))
    expect(score.language).toBe(22) // ability 12 (best CLB 8) + 2-language 10
  })

  it('recent Ontario graduate status is eligibility-only and adds 0 points', () => {
    const regular = oinpScore(base())
    const recentGrad = oinpScore(base({ recentOntarioGraduate: true }))
    expect(recentGrad.total).toBe(regular.total)
    expect(recentGrad).toEqual(regular)
  })

  it('a profile with one official language at CLB 5 earns 0 bilingualism points', () => {
    const score = oinpScore(base({ englishClb: 5 }))
    // language: ability 0 (CLB 5 or lower) + knowledge 0 (needs CLB 6+) = 0
    expect(score.language).toBe(0)
  })
})

describe('OINP Workforce Priority initial checks', () => {
  it('accepts a standard job-offer profile', () => {
    expect(eligibility(base())).toEqual({ eligible: true, reasons: [] })
  })
  it('requires three actual months for a recent graduate, rather than accepting every under-six-month profile', () => {
    expect(eligibility(base({ recentOntarioGraduate: true, tenureInPosition: 'less-6', positionMonths: 2 })).eligible).toBe(false)
    expect(eligibility(base({ recentOntarioGraduate: true, tenureInPosition: 'less-6', positionMonths: 3 })).eligible).toBe(true)
  })
  it('distinguishes eight and nine months inside the same TEER 4-5 scoring band', () => {
    expect(eligibility(base({ teer: 4, positionMonths: 8 })).eligible).toBe(false)
    expect(eligibility(base({ teer: 4, positionMonths: 9 })).eligible).toBe(true)
  })
  it('allows the permitted experience alternatives, with the transport exception', () => {
    expect(eligibility(base({ tenureInPosition: 'less-6', twoYearsSameNoc: true })).eligible).toBe(true)
    expect(eligibility(base({ tenureInPosition: 'less-6', licensedForPosition: true })).eligible).toBe(true)
    expect(eligibility(base({ tenureInPosition: 'less-6', licensedForPosition: true, transportOccupation: true })).eligible).toBe(false)
  })
  it('accepts visitor status and overseas applicants without awarding permit points', () => {
    expect(eligibility(base({ legalStatus: 'visitor' })).eligible).toBe(true)
    expect(eligibility(base({ legalStatus: 'outside-canada' })).eligible).toBe(true)
    expect(legalStatusPoints('visitor')).toBe(0)
    expect(eligibility(base({ legalStatus: 'none' })).eligible).toBe(false)
  })
  it('applies language floors for each job-offer route and the graduate exemption', () => {
    expect(eligibility(base({ englishClb: 5 })).eligible).toBe(false)
    expect(eligibility(base({ englishClb: 5, listedSkilledTrade: true })).eligible).toBe(true)
    expect(eligibility(base({ englishClb: 0, recentOntarioGraduate: true })).eligible).toBe(true)
    expect(eligibility(base({ teer: 4, positionMonths: 9, englishClb: 4 })).eligible).toBe(true)
  })
  it('scores physicians on cumulative Ontario practice without wage points', () => {
    const input = base({ pathway: 'physician', physicianRequirementsMet: true, teer: 5, nocBroad: 6,
      ontarioWork: 'over-24', tenureInPosition: 'less-6', hourlyWage: 100, earnings: '80k-plus',
      education: 'doctorate', canadianCredentials: 'multiple', englishClb: 9, frenchClb: 9, region: 'northern' })
    expect(oinpScore(input).total).toBe(117)
    expect(eligibility(input).eligible).toBe(true)
    expect(eligibility({ ...input, physicianRequirementsMet: false }).eligible).toBe(false)
    expect(oinpScore({ ...input, ontarioWork: '6-12' }).labour).toBe(oinpScore(input).labour - 6)
  })
})
