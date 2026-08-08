import { describe, expect, it } from 'vitest'
import {
  adaptabilityPoints,
  agePoints,
  connectionsPoints,
  demandPoints,
  educationPoints,
  eligibility,
  eligibilityAssessmentScore,
  experiencePoints,
  firstLanguagePoints,
  languageBandPoints,
  languagePoints,
  manitobaScore,
  riskPoints,
  secondLanguagePoints,
  workYearsPoints,
} from './score'
import type { ManitobaInput, ManitobaLanguageClbs } from './score'

function allClbs(clb: number): ManitobaLanguageClbs {
  return { listening: clb, reading: clb, writing: clb, speaking: clb }
}

function base(overrides: Partial<ManitobaInput> = {}): ManitobaInput {
  return {
    firstLanguageClbs: allClbs(7),
    secondLanguage: false,
    age: 30,
    workYears: 3,
    recognizedByLicensingBody: false,
    education: 'two-year',
    connections: {
      closeRelative: false,
      authorizedWork6Months: false,
      postSecondary2Years: false,
      postSecondary1Year: false,
      closeFriendOrDistantRelative: true,
    },
    demand: {
      ongoingEmploymentJobOffer: false,
      strategicInitiativeIta: false,
    },
    regionalDevelopmentOutsideWinnipeg: false,
    risk: {
      workExperienceOtherProvince: false,
      studiesOtherProvince: false,
    },
    ...overrides,
  }
}

describe('MPNP Factor 1: language proficiency', () => {
  it('first official language bands are per ability', () => {
    expect(languageBandPoints(10)).toBe(25)
    expect(languageBandPoints(8)).toBe(25)
    expect(languageBandPoints(7)).toBe(22)
    expect(languageBandPoints(6)).toBe(20)
    expect(languageBandPoints(5)).toBe(17)
    expect(languageBandPoints(4)).toBe(12)
    expect(languageBandPoints(3)).toBe(0)
    expect(languageBandPoints(0)).toBe(0)
  })

  it('first official language sums points across the four abilities', () => {
    expect(firstLanguagePoints(allClbs(10))).toBe(100)
    expect(firstLanguagePoints(allClbs(8))).toBe(100)
    expect(firstLanguagePoints(allClbs(7))).toBe(88)
    expect(firstLanguagePoints(allClbs(6))).toBe(80)
    expect(firstLanguagePoints(allClbs(5))).toBe(68)
    expect(firstLanguagePoints(allClbs(4))).toBe(48)
    expect(firstLanguagePoints(allClbs(3))).toBe(0)
    expect(
      firstLanguagePoints({ reading: 8, writing: 7, listening: 6, speaking: 5 }),
    ).toBe(84)
  })

  it('second official language at overall CLB 5+', () => {
    expect(secondLanguagePoints(true)).toBe(25)
    expect(secondLanguagePoints(false)).toBe(0)
  })

  it('combined language points', () => {
    expect(languagePoints(allClbs(7), true)).toBe(113)
    expect(languagePoints(allClbs(4), false)).toBe(48)
  })
})

describe('MPNP Factor 2: age', () => {
  it('age bands', () => {
    expect(agePoints(18)).toBe(20)
    expect(agePoints(19)).toBe(30)
    expect(agePoints(20)).toBe(40)
    expect(agePoints(21)).toBe(75)
    expect(agePoints(30)).toBe(75)
    expect(agePoints(45)).toBe(75)
    expect(agePoints(46)).toBe(40)
    expect(agePoints(47)).toBe(30)
    expect(agePoints(48)).toBe(20)
    expect(agePoints(49)).toBe(10)
    expect(agePoints(50)).toBe(0)
    expect(agePoints(60)).toBe(0)
  })
})

describe('MPNP Factor 3: work experience', () => {
  it('years in the last 5', () => {
    expect(workYearsPoints(0)).toBe(0)
    expect(workYearsPoints(1)).toBe(40)
    expect(workYearsPoints(2)).toBe(50)
    expect(workYearsPoints(3)).toBe(60)
    expect(workYearsPoints(4)).toBe(75)
    expect(workYearsPoints(5)).toBe(75)
  })

  it('licensing body recognition adds 100 up to the factor max', () => {
    expect(experiencePoints(3, true)).toBe(160)
    expect(experiencePoints(4, true)).toBe(175)
    expect(experiencePoints(1, true)).toBe(140)
    expect(experiencePoints(3, false)).toBe(60)
  })
})

describe('MPNP Factor 4: education', () => {
  it('education bands', () => {
    expect(educationPoints('master-or-doctorate')).toBe(125)
    expect(educationPoints('two-post-secondary')).toBe(115)
    expect(educationPoints('three-plus-year')).toBe(110)
    expect(educationPoints('two-year')).toBe(100)
    expect(educationPoints('one-year')).toBe(70)
    expect(educationPoints('trade-certificate')).toBe(70)
    expect(educationPoints('no-post-secondary')).toBe(0)
  })
})

describe('MPNP Factor 5: adaptability', () => {
  it('connections cap at 200', () => {
    expect(
      connectionsPoints({
        closeRelative: false,
        authorizedWork6Months: false,
        postSecondary2Years: false,
        postSecondary1Year: false,
        closeFriendOrDistantRelative: true,
      }),
    ).toBe(50)
    expect(
      connectionsPoints({
        closeRelative: true,
        authorizedWork6Months: true,
        postSecondary2Years: true,
        postSecondary1Year: true,
        closeFriendOrDistantRelative: true,
      }),
    ).toBe(200)
  })

  it('demand cap at 500', () => {
    expect(demandPoints({ ongoingEmploymentJobOffer: false, strategicInitiativeIta: false })).toBe(0)
    expect(demandPoints({ ongoingEmploymentJobOffer: true, strategicInitiativeIta: false })).toBe(500)
    expect(demandPoints({ ongoingEmploymentJobOffer: true, strategicInitiativeIta: true })).toBe(500)
  })

  it('adaptability caps the whole factor at 500', () => {
    const connections: ManitobaInput['connections'] = {
      closeRelative: true,
      authorizedWork6Months: true,
      postSecondary2Years: true,
      postSecondary1Year: true,
      closeFriendOrDistantRelative: true,
    }
    const demand: ManitobaInput['demand'] = {
      ongoingEmploymentJobOffer: true,
      strategicInitiativeIta: true,
    }
    // subtotal would be 200 + 500 + 50 = 750
    expect(adaptabilityPoints(connections, demand, true)).toBe(500)
    expect(adaptabilityPoints(connections, demand, false)).toBe(500)
  })
})

describe('MPNP Factor 6: risk assessment', () => {
  it('deductions', () => {
    expect(riskPoints({ workExperienceOtherProvince: false, studiesOtherProvince: false })).toBe(0)
    expect(riskPoints({ workExperienceOtherProvince: true, studiesOtherProvince: false })).toBe(-100)
    expect(riskPoints({ workExperienceOtherProvince: false, studiesOtherProvince: true })).toBe(-100)
    expect(riskPoints({ workExperienceOtherProvince: true, studiesOtherProvince: true })).toBe(-200)
  })
})

describe('MPNP total', () => {
  it('default input', () => {
    // language 88 (CLB 7 per ability x4) + age 75 + experience 60 + education 100 + adaptability 50 = 373
    expect(manitobaScore(base())).toEqual({
      language: 88,
      age: 75,
      experience: 60,
      education: 100,
      adaptability: 50,
      risk: 0,
      total: 373,
    })
  })

  it('maximized profile', () => {
    const score = manitobaScore(
      base({
        firstLanguageClbs: allClbs(10),
        secondLanguage: true,
        age: 30,
        workYears: 4,
        recognizedByLicensingBody: true,
        education: 'master-or-doctorate',
        connections: {
          closeRelative: true,
          authorizedWork6Months: true,
          postSecondary2Years: true,
          postSecondary1Year: true,
          closeFriendOrDistantRelative: true,
        },
        demand: { ongoingEmploymentJobOffer: true, strategicInitiativeIta: true },
        regionalDevelopmentOutsideWinnipeg: true,
      }),
    )
    // language 125 + age 75 + experience 175 + education 125 + adaptability 500 = 1000
    expect(score).toEqual({
      language: 125,
      age: 75,
      experience: 175,
      education: 125,
      adaptability: 500,
      risk: 0,
      total: 1000,
    })
  })

  it('risk deductions lower the total', () => {
    const score = manitobaScore(
      base({
        risk: { workExperienceOtherProvince: true, studiesOtherProvince: true },
      }),
    )
    // 373 - 200 = 173
    expect(score.risk).toBe(-200)
    expect(score.total).toBe(173)
  })
})

describe('MPNP eligibility', () => {
  it('default profile is eligible', () => {
    const result = eligibility(base())
    expect(result.eligible).toBe(true)
    expect(result.reasons).toEqual([])
  })

  it('fails when there is no connection to Manitoba', () => {
    const result = eligibility(
      base({
        connections: {
          closeRelative: false,
          authorizedWork6Months: false,
          postSecondary2Years: false,
          postSecondary1Year: false,
          closeFriendOrDistantRelative: false,
        },
      }),
    )
    expect(result.eligible).toBe(false)
    expect(result.reasons.some((r) => r.includes('connection to Manitoba'))).toBe(true)
  })

  it('fails when the language floor is not met', () => {
    const result = eligibility(base({ firstLanguageClbs: allClbs(3) }))
    expect(result.eligible).toBe(false)
    expect(result.reasons.some((r) => r.includes('CLB 4'))).toBe(true)
  })

  it('fails when the 60-point assessment is not met', () => {
    const result = eligibility(
      base({
        firstLanguageClbs: allClbs(4),
        age: 50,
        workYears: 1,
        education: 'no-post-secondary',
        connections: {
          closeRelative: false,
          authorizedWork6Months: false,
          postSecondary2Years: false,
          postSecondary1Year: false,
          closeFriendOrDistantRelative: false,
        },
        demand: { ongoingEmploymentJobOffer: false, strategicInitiativeIta: false },
      }),
    )
    expect(eligibilityAssessmentScore(base({ firstLanguageClbs: allClbs(4), age: 50, workYears: 1, education: 'no-post-secondary' }))).toBeLessThan(60)
    expect(result.eligible).toBe(false)
    expect(result.reasons.some((r) => r.includes('60'))).toBe(true)
  })
})
