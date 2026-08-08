import { describe, expect, it } from 'vitest'
import {
  ADDITIONAL_CANADIAN_EDUCATION_TABLE,
  CANADIAN_WORK_TABLE,
  EDUCATION_TABLE,
  SPOUSE_CANADIAN_WORK_TABLE,
  SPOUSE_EDUCATION_TABLE,
  agePoints,
  certificateQualificationPoints,
  clbValues,
  educationCanadianWorkPoints,
  educationLanguagePoints,
  firstLanguagePointsPerAbility,
  foreignWorkCanadianWorkPoints,
  foreignWorkLanguagePoints,
  secondLanguagePointsPerAbility,
  spouseLanguagePointsPerAbility,
} from './tables'
import { additionalPoints, coreHumanCapitalPoints, crsScore, spousePoints, transferabilityPoints } from './score'
import type { CrsInput, EducationLevel, LanguageProficiency } from './types'

const ab = (l: number, r: number, w: number, s: number): LanguageProficiency => ({
  listening: l as LanguageProficiency['listening'],
  reading: r as LanguageProficiency['reading'],
  writing: w as LanguageProficiency['writing'],
  speaking: s as LanguageProficiency['speaking'],
})

const allClb = (c: number): LanguageProficiency => ab(c, c, c, c)

function base(overrides: Partial<CrsInput> = {}): CrsInput {
  return {
    age: 30,
    hasAccompanyingSpouse: false,
    education: 'bachelor',
    firstOfficialLanguage: 'english',
    english: allClb(7),
    french: allClb(0),
    canadianWorkYears: 0,
    foreignWorkYears: 0,
    certificateOfQualification: false,
    provincialNomination: false,
    canadianEducation: 'none',
    siblingInCanada: false,
    ...overrides,
  }
}

// ---- A. Core / human capital factors ----

describe('age points (official table)', () => {
  const rows: Array<[number, number, number]> = [
    [17, 0, 0],
    [18, 90, 99],
    [19, 95, 105],
    [20, 100, 110],
    [29, 100, 110],
    [30, 95, 105],
    [31, 90, 99],
    [32, 85, 94],
    [33, 80, 88],
    [34, 75, 83],
    [35, 70, 77],
    [36, 65, 72],
    [37, 60, 66],
    [38, 55, 61],
    [39, 50, 55],
    [40, 45, 50],
    [41, 35, 39],
    [42, 25, 28],
    [43, 15, 17],
    [44, 5, 6],
    [45, 0, 0],
    [60, 0, 0],
  ]
  for (const [age, withSpouse, withoutSpouse] of rows) {
    it(`age ${age}: ${withSpouse} / ${withoutSpouse}`, () => {
      expect(agePoints(age, true)).toBe(withSpouse)
      expect(agePoints(age, false)).toBe(withoutSpouse)
    })
  }
})

describe('education points (official table)', () => {
  const rows: Array<[EducationLevel, number, number]> = [
    ['less-than-secondary', 0, 0],
    ['secondary', 28, 30],
    ['one-year', 84, 90],
    ['two-year', 91, 98],
    ['bachelor', 112, 120],
    ['two-plus', 119, 128],
    ['master', 126, 135],
    ['doctorate', 140, 150],
  ]
  for (const [level, withSpouse, withoutSpouse] of rows) {
    it(`${level}: ${withSpouse} / ${withoutSpouse}`, () => {
      expect(EDUCATION_TABLE[level]).toEqual([withSpouse, withoutSpouse])
    })
  }
})

describe('first official language points per ability (official table)', () => {
  const rows: Array<[number, number, number]> = [
    [0, 0, 0],
    [4, 6, 6],
    [5, 6, 6],
    [6, 8, 9],
    [7, 16, 17],
    [8, 22, 23],
    [9, 29, 31],
    [10, 32, 34],
  ]
  for (const [clb, withSpouse, withoutSpouse] of rows) {
    it(`CLB ${clb}: ${withSpouse} / ${withoutSpouse}`, () => {
      expect(firstLanguagePointsPerAbility(clb as never, true)).toBe(withSpouse)
      expect(firstLanguagePointsPerAbility(clb as never, false)).toBe(withoutSpouse)
    })
  }
})

describe('second official language points per ability (official table)', () => {
  const rows: Array<[number, number]> = [
    [0, 0],
    [4, 0],
    [5, 1],
    [6, 1],
    [7, 3],
    [8, 3],
    [9, 6],
    [10, 6],
  ]
  for (const [clb, points] of rows) {
    it(`CLB ${clb}: ${points}`, () => {
      expect(secondLanguagePointsPerAbility(clb as never)).toBe(points)
    })
  }
})

describe('Canadian work experience points (official table)', () => {
  const rows: Array<[number, number, number]> = [
    [0, 0, 0],
    [1, 35, 40],
    [2, 46, 53],
    [3, 56, 64],
    [4, 63, 72],
    [5, 70, 80],
  ]
  for (const [years, withSpouse, withoutSpouse] of rows) {
    it(`${years} year(s): ${withSpouse} / ${withoutSpouse}`, () => {
      expect(CANADIAN_WORK_TABLE[years as never]).toEqual([withSpouse, withoutSpouse])
    })
  }
})

// ---- B. Spouse factors ----

describe('spouse education points (official table)', () => {
  const rows: Array<[EducationLevel, number]> = [
    ['less-than-secondary', 0],
    ['secondary', 2],
    ['one-year', 6],
    ['two-year', 7],
    ['bachelor', 8],
    ['two-plus', 9],
    ['master', 10],
    ['doctorate', 10],
  ]
  for (const [level, points] of rows) {
    it(`${level}: ${points}`, () => {
      expect(SPOUSE_EDUCATION_TABLE[level]).toBe(points)
    })
  }
})

describe('spouse official language points per ability (official table)', () => {
  const rows: Array<[number, number]> = [
    [0, 0],
    [4, 0],
    [5, 1],
    [6, 1],
    [7, 3],
    [8, 3],
    [9, 5],
    [10, 5],
  ]
  for (const [clb, points] of rows) {
    it(`CLB ${clb}: ${points}`, () => {
      expect(spouseLanguagePointsPerAbility(clb as never)).toBe(points)
    })
  }
})

describe('spouse Canadian work experience points (official table)', () => {
  const rows: Array<[number, number]> = [
    [0, 0],
    [1, 5],
    [2, 7],
    [3, 8],
    [4, 9],
    [5, 10],
  ]
  for (const [years, points] of rows) {
    it(`${years} year(s): ${points}`, () => {
      expect(SPOUSE_CANADIAN_WORK_TABLE[years as never]).toBe(points)
    })
  }
})

// ---- C. Skill transferability ----

describe('education + language transferability (official table)', () => {
  const clb7 = allClb(7)
  const clb9 = allClb(9)
  const below7 = ab(7, 7, 6, 7)

  it('secondary or less: 0', () => {
    expect(educationLanguagePoints('less-than-secondary', clbValues(clb7))).toBe(0)
    expect(educationLanguagePoints('secondary', clbValues(clb9))).toBe(0)
  })
  it('post-secondary 1 yr+ at CLB 7-8: 13', () => {
    for (const level of ['one-year', 'two-year', 'bachelor'] as const) {
      expect(educationLanguagePoints(level, clbValues(clb7))).toBe(13)
    }
  })
  it('post-secondary 1 yr+ at CLB 9+: 25', () => {
    for (const level of ['one-year', 'two-year', 'bachelor'] as const) {
      expect(educationLanguagePoints(level, clbValues(clb9))).toBe(25)
    }
  })
  it('two-plus / master / doctorate at CLB 7-8: 25; at CLB 9+: 50', () => {
    for (const level of ['two-plus', 'master', 'doctorate'] as const) {
      expect(educationLanguagePoints(level, clbValues(clb7))).toBe(25)
      expect(educationLanguagePoints(level, clbValues(clb9))).toBe(50)
    }
  })
  it('requires CLB 7 on all four abilities', () => {
    expect(educationLanguagePoints('bachelor', clbValues(below7))).toBe(0)
    expect(educationLanguagePoints('master', clbValues(below7))).toBe(0)
  })
})

describe('education + Canadian work transferability (official table)', () => {
  it('secondary or less: 0', () => {
    expect(educationCanadianWorkPoints('secondary', 5)).toBe(0)
  })
  it('post-secondary 1 yr+ with 1 yr Canadian work: 13; 2+ yrs: 25', () => {
    for (const level of ['one-year', 'two-year', 'bachelor'] as const) {
      expect(educationCanadianWorkPoints(level, 1)).toBe(13)
      expect(educationCanadianWorkPoints(level, 2)).toBe(25)
      expect(educationCanadianWorkPoints(level, 5)).toBe(25)
    }
  })
  it('two-plus / master / doctorate with 1 yr Canadian work: 25; 2+ yrs: 50', () => {
    for (const level of ['two-plus', 'master', 'doctorate'] as const) {
      expect(educationCanadianWorkPoints(level, 1)).toBe(25)
      expect(educationCanadianWorkPoints(level, 2)).toBe(50)
      expect(educationCanadianWorkPoints(level, 4)).toBe(50)
    }
  })
  it('no Canadian work: 0', () => {
    expect(educationCanadianWorkPoints('master', 0)).toBe(0)
  })
})

describe('foreign work + language transferability (official table)', () => {
  const clb7 = allClb(7)
  const clb9 = allClb(9)
  it('no foreign work: 0', () => {
    expect(foreignWorkLanguagePoints(0, clbValues(clb9))).toBe(0)
  })
  it('1-2 years at CLB 7-8: 13; at CLB 9+: 25', () => {
    expect(foreignWorkLanguagePoints(1, clbValues(clb7))).toBe(13)
    expect(foreignWorkLanguagePoints(2, clbValues(clb7))).toBe(13)
    expect(foreignWorkLanguagePoints(1, clbValues(clb9))).toBe(25)
  })
  it('3+ years at CLB 7-8: 25; at CLB 9+: 50', () => {
    expect(foreignWorkLanguagePoints(3, clbValues(clb7))).toBe(25)
    expect(foreignWorkLanguagePoints(5, clbValues(clb9))).toBe(50)
  })
  it('requires CLB 7+', () => {
    expect(foreignWorkLanguagePoints(3, clbValues(allClb(6)))).toBe(0)
  })
})

describe('foreign work + Canadian work transferability (official table)', () => {
  it('requires both foreign and Canadian work', () => {
    expect(foreignWorkCanadianWorkPoints(0, 2)).toBe(0)
    expect(foreignWorkCanadianWorkPoints(3, 0)).toBe(0)
  })
  it('1-2 years foreign + 1 yr Canadian: 13; + 2+ yrs: 25', () => {
    expect(foreignWorkCanadianWorkPoints(1, 1)).toBe(13)
    expect(foreignWorkCanadianWorkPoints(2, 1)).toBe(13)
    expect(foreignWorkCanadianWorkPoints(1, 2)).toBe(25)
  })
  it('3+ years foreign + 1 yr Canadian: 25; + 2+ yrs: 50', () => {
    expect(foreignWorkCanadianWorkPoints(3, 1)).toBe(25)
    expect(foreignWorkCanadianWorkPoints(5, 2)).toBe(50)
  })
})

describe('certificate of qualification + language (official table)', () => {
  it('no certificate: 0', () => {
    expect(certificateQualificationPoints(false, clbValues(allClb(9)))).toBe(0)
  })
  it('requires CLB 5+', () => {
    expect(certificateQualificationPoints(true, clbValues(allClb(4)))).toBe(0)
  })
  it('certificate + CLB 5-6: 25; + CLB 7+: 50', () => {
    expect(certificateQualificationPoints(true, clbValues(allClb(5)))).toBe(25)
    expect(certificateQualificationPoints(true, clbValues(allClb(6)))).toBe(25)
    expect(certificateQualificationPoints(true, clbValues(allClb(7)))).toBe(50)
  })
})

describe('transferability section caps', () => {
  it('education sub-category caps at 50', () => {
    const input = base({ education: 'master', english: allClb(9), canadianWorkYears: 2 })
    expect(transferabilityPoints(input)).toBe(50)
  })
  it('foreign work sub-category caps at 50 (1-2 yrs + CLB 9 + 2 yr Canadian work)', () => {
    const input = base({ education: 'secondary', english: allClb(9), foreignWorkYears: 1, canadianWorkYears: 2 })
    expect(transferabilityPoints(input)).toBe(50)
  })
  it('full 100 (master + CLB 9 + foreign work + 2 yr Canadian work)', () => {
    const input = base({
      education: 'master',
      english: allClb(9),
      foreignWorkYears: 3,
      canadianWorkYears: 2,
    })
    expect(transferabilityPoints(input)).toBe(100)
  })
  it('transferability never exceeds 100', () => {
    const input = base({
      education: 'doctorate',
      english: allClb(10),
      foreignWorkYears: 5,
      canadianWorkYears: 5,
      certificateOfQualification: true,
    })
    expect(transferabilityPoints(input)).toBe(100)
  })
})

// ---- D. Additional points ----

describe('additional points (official table)', () => {
  it('provincial nomination: 600', () => {
    expect(additionalPoints(base({ provincialNomination: true }))).toBe(600)
  })
  it('Canadian education: 15 / 30', () => {
    expect(ADDITIONAL_CANADIAN_EDUCATION_TABLE).toEqual({ none: 0, 'one-two-years': 15, 'three-plus-years': 30 })
    expect(additionalPoints(base({ canadianEducation: 'one-two-years' }))).toBe(15)
    expect(additionalPoints(base({ canadianEducation: 'three-plus-years' }))).toBe(30)
  })
  it('sibling in Canada: 15', () => {
    expect(additionalPoints(base({ siblingInCanada: true }))).toBe(15)
  })
  it('French NCLC 7+ with English CLB 4 or less: 25', () => {
    expect(additionalPoints(base({ french: allClb(7), english: allClb(4) }))).toBe(25)
  })
  it('French NCLC 7+ with English CLB 5+: 50', () => {
    expect(additionalPoints(base({ french: allClb(7), english: allClb(5) }))).toBe(50)
    expect(additionalPoints(base({ french: allClb(8), english: allClb(7) }))).toBe(50)
  })
  it('French below NCLC 7: no bonus', () => {
    expect(additionalPoints(base({ french: allClb(6), english: allClb(9) }))).toBe(0)
  })
  it('no English test but strong French: 25', () => {
    expect(additionalPoints(base({ french: allClb(9), english: allClb(0) }))).toBe(25)
  })
  it('caps at 600', () => {
    expect(additionalPoints(base({ provincialNomination: true, siblingInCanada: true, canadianEducation: 'three-plus-years', french: allClb(9) }))).toBe(600)
  })
  it('French bonus on top of other additional points', () => {
    expect(additionalPoints(base({ french: allClb(7), english: allClb(5), siblingInCanada: true, canadianEducation: 'three-plus-years' }))).toBe(95)
  })
})

// ---- Worked examples (verified against official CRS tool / CIC News walkthrough) ----

describe('worked examples', () => {
  it('single, age 26, bachelor, CLB 9 English, 3 yr Canadian work, 3+ yr Canadian study', () => {
    const input = base({
      age: 26,
      education: 'bachelor',
      english: allClb(9),
      canadianWorkYears: 3,
      canadianEducation: 'three-plus-years',
    })
    // Core: 110 (age) + 120 (edu) + 124 (CLB 9 x 4) + 64 (3 yr) = 418
    expect(coreHumanCapitalPoints(input)).toBe(418)
    // Transferability: education = 25 (language) + 25 (2+ yr Canadian work) = 50
    expect(transferabilityPoints(input)).toBe(50)
    // Additional: Canadian study = 30
    expect(additionalPoints(input)).toBe(30)
    expect(crsScore(input)).toEqual({ core: 418, spouse: 0, transferability: 50, additional: 30, total: 498 })
  })

  it('same but adds 1 year foreign work (2 yr Canadian work)', () => {
    const input = base({
      age: 26,
      education: 'bachelor',
      english: allClb(9),
      canadianWorkYears: 2,
      foreignWorkYears: 1,
      canadianEducation: 'three-plus-years',
    })
    // Core: 110 + 120 + 124 + 53 = 407
    expect(coreHumanCapitalPoints(input)).toBe(407)
    // Transferability: education 50 + foreign (25 lang + 25 cdn) 50 = 100
    expect(transferabilityPoints(input)).toBe(100)
    expect(crsScore(input).total).toBe(537)
  })

  it('single applicant with provincial nomination (IRCC walkthrough)', () => {
    const input = base({
      age: 28,
      education: 'master',
      english: allClb(9),
      canadianWorkYears: 3,
      provincialNomination: true,
    })
    // Core: 110 + 135 + 124 + 64 = 433
    expect(coreHumanCapitalPoints(input)).toBe(433)
    // Transferability: master + CLB 9 = 50
    expect(transferabilityPoints(input)).toBe(50)
    expect(crsScore(input)).toEqual({ core: 433, spouse: 0, transferability: 50, additional: 600, total: 1083 })
  })

  it('with accompanying spouse, all factors maxed', () => {
    const input = base({
      age: 29,
      hasAccompanyingSpouse: true,
      education: 'doctorate',
      english: allClb(10),
      french: allClb(10),
      canadianWorkYears: 5,
      foreignWorkYears: 5,
      certificateOfQualification: true,
      provincialNomination: true,
      canadianEducation: 'three-plus-years',
      siblingInCanada: true,
      spouse: {
        education: 'doctorate',
        language: allClb(10),
        canadianWorkYears: 5,
      },
    })
    // Core (with spouse, max 460): age 100 + edu 140 + lang 128 + 22 = 390... wait
    expect(coreHumanCapitalPoints(input)).toBe(460)
    expect(spousePoints(input)).toBe(40)
    expect(transferabilityPoints(input)).toBe(100)
    expect(additionalPoints(input)).toBe(600)
    expect(crsScore(input).total).toBe(1200)
  })

  it('second official language bonus adds up to 24 (single)', () => {
    const input = base({ english: allClb(7), french: allClb(9) })
    // 105 (age 30, single) + 120 + 68 (English CLB 7 x 4) + 24 (French CLB 9 x 4)
    expect(coreHumanCapitalPoints(input)).toBe(317)
  })

  it('core capped at 500 without spouse', () => {
    const input = base({ age: 24, education: 'doctorate', english: allClb(10), french: allClb(10), canadianWorkYears: 5 })
    // 110 + 150 + 136 + 24 + 80 = 500
    expect(coreHumanCapitalPoints(input)).toBe(500)
  })
})
