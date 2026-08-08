import { describe, expect, it } from 'vitest'
import {
  areaPoints,
  BC_DOC,
  bcScore,
  bothLanguagesPoints,
  educationLocationPoints,
  educationPoints,
  eligibility,
  languagePoints,
  minimumIncomeWage,
  professionalDesignationPoints,
  wagePoints,
  workExperiencePoints,
} from './score'
import type { BcInput } from './score'

function base(overrides: Partial<BcInput> = {}): BcInput {
  return {
    workExperience: '2-3',
    canadianExperience: false,
    workingInBc: false,
    education: 'bachelor',
    educationLocation: 'none',
    professionalDesignation: false,
    englishClb: 7,
    frenchClb: 0,
    bothLanguages: false,
    hourlyWage: 30,
    area: 'area-3',
    regionalExperience: false,
    ...overrides,
  }
}

describe('BC PNP SIRS factor points (official grid)', () => {
  it('directly related work experience bands', () => {
    expect(workExperiencePoints('5-plus')).toBe(20)
    expect(workExperiencePoints('4-5')).toBe(16)
    expect(workExperiencePoints('3-4')).toBe(12)
    expect(workExperiencePoints('2-3')).toBe(8)
    expect(workExperiencePoints('1-2')).toBe(4)
    expect(workExperiencePoints('less-1')).toBe(1)
    expect(workExperiencePoints('none')).toBe(0)
  })

  it('highest level of education', () => {
    expect(educationPoints('doctorate')).toBe(27)
    expect(educationPoints('masters')).toBe(22)
    expect(educationPoints('postgrad')).toBe(15)
    expect(educationPoints('bachelor')).toBe(15)
    expect(educationPoints('associate')).toBe(5)
    expect(educationPoints('diploma')).toBe(5)
    expect(educationPoints('secondary')).toBe(0)
  })

  it('additional education (single select)', () => {
    expect(educationLocationPoints('bc')).toBe(8)
    expect(educationLocationPoints('canada-outside-bc')).toBe(6)
    expect(educationLocationPoints('none')).toBe(0)
  })

  it('eligible BC professional designation stacks with the education location bonus', () => {
    expect(professionalDesignationPoints(true)).toBe(5)
    expect(professionalDesignationPoints(false)).toBe(0)
  })

  it('language proficiency by overall CLB', () => {
    expect(languagePoints(10)).toBe(30)
    expect(languagePoints(9)).toBe(30)
    expect(languagePoints(8)).toBe(25)
    expect(languagePoints(7)).toBe(20)
    expect(languagePoints(6)).toBe(15)
    expect(languagePoints(5)).toBe(10)
    expect(languagePoints(4)).toBe(5)
    expect(languagePoints(3)).toBe(0)
    expect(languagePoints(0)).toBe(0)
  })

  it('both official languages requires CLB 4+ on both tests', () => {
    expect(bothLanguagesPoints(7, 5, true)).toBe(10)
    expect(bothLanguagesPoints(9, 4, true)).toBe(10)
    expect(bothLanguagesPoints(7, 3, true)).toBe(0)
    expect(bothLanguagesPoints(7, 0, true)).toBe(0)
    expect(bothLanguagesPoints(7, 6, false)).toBe(0)
  })

  it('hourly wage uses clamp(floor(wage) - 15, 0, 55)', () => {
    expect(wagePoints(100)).toBe(55)
    expect(wagePoints(70)).toBe(55)
    expect(wagePoints(69.99)).toBe(54)
    expect(wagePoints(40)).toBe(25)
    expect(wagePoints(30)).toBe(15)
    expect(wagePoints(16)).toBe(1)
    expect(wagePoints(15.99)).toBe(0)
    expect(wagePoints(15)).toBe(0)
  })

  it('area within BC with regional bonus only outside Area 1', () => {
    expect(areaPoints('area-1', false)).toBe(0)
    expect(areaPoints('area-1', true)).toBe(0)
    expect(areaPoints('area-2', false)).toBe(5)
    expect(areaPoints('area-2', true)).toBe(15)
    expect(areaPoints('area-3', false)).toBe(15)
    expect(areaPoints('area-3', true)).toBe(25)
  })
})

describe('BC PNP SIRS total', () => {
  it('exports the official documentation URL', () => {
    expect(BC_DOC).toBe('https://www.welcomebc.ca/immigrate-to-b-c/bc-pnp-si-program-guide-pdf')
  })

  it('default mid profile', () => {
    const score = bcScore(base())
    // experience 8 (2-3yrs) + education 15 (bachelor) + language 20 (CLB 7)
    // + wage 15 ($30/hr) + area 15 (Area 3) = 73
    expect(score).toEqual({ experience: 8, education: 15, language: 20, wage: 15, area: 15, total: 73 })
  })

  it('work experience additional points cap the factor at 40', () => {
    const score = bcScore(base({ workExperience: '5-plus', canadianExperience: true, workingInBc: true }))
    // experience 20 + 10 + 10 = 40
    expect(score.experience).toBe(40)
    expect(score.total).toBe(105)
  })

  it('maximized profile', () => {
    const score = bcScore(
      base({
        workExperience: '5-plus',
        canadianExperience: true,
        workingInBc: true,
        education: 'doctorate',
        educationLocation: 'bc',
        professionalDesignation: true,
        englishClb: 9,
        frenchClb: 9,
        bothLanguages: true,
        hourlyWage: 80,
        area: 'area-3',
        regionalExperience: true,
      }),
    )
    // experience 20+10+10 = 40; education 27+8+5 = 40; language 30+10 = 40;
    // wage 55; area 15+10 = 25 → total 200
    expect(score).toEqual({ experience: 40, education: 40, language: 40, wage: 55, area: 25, total: 200 })
  })

  it('minimum profile scores zero', () => {
    const score = bcScore(
      base({
        workExperience: 'none',
        education: 'secondary',
        educationLocation: 'none',
        professionalDesignation: false,
        englishClb: 0,
        frenchClb: 0,
        hourlyWage: 10,
        area: 'area-1',
        regionalExperience: false,
      }),
    )
    expect(score).toEqual({ experience: 0, education: 0, language: 0, wage: 0, area: 0, total: 0 })
  })

  it('language uses the higher of English or French overall CLB', () => {
    const score = bcScore(base({ englishClb: 6, frenchClb: 8 }))
    // ability 25 (best CLB 8) + 0 (no French CLB 4 bonus unless box checked) = 25
    expect(score.language).toBe(25)
    expect(score.total).toBe(78)
  })
})

describe('BC PNP eligibility (Skills Immigration general requirements)', () => {
  it('the default mid profile is eligible', () => {
    // CLB 7, 2-3 years experience, $30/hr in Area 3 all meet the minimums
    const result = eligibility(base())
    expect(result.eligible).toBe(true)
    expect(result.reasons).toEqual([])
  })

  it('fails when language is below CLB 4', () => {
    const result = eligibility(base({ englishClb: 3, frenchClb: 0 }))
    expect(result.eligible).toBe(false)
    expect(result.reasons.join(' ')).toMatch(/below the minimum requirement of CLB 4/)
  })

  it('uses the better of English or French for the language floor', () => {
    const result = eligibility(base({ englishClb: 3, frenchClb: 5 }))
    expect(result.eligible).toBe(true)
  })

  it('fails when work experience is below the two-year minimum', () => {
    const result = eligibility(base({ workExperience: '1-2' }))
    expect(result.eligible).toBe(false)
    expect(result.reasons.join(' ')).toMatch(/at least two years/)
  })

  it('accepts two-plus years of directly related work experience', () => {
    expect(eligibility(base({ workExperience: '2-3' })).eligible).toBe(true)
    expect(eligibility(base({ workExperience: '5-plus' })).eligible).toBe(true)
  })

  it('fails when the hourly wage is below the single-person minimum income floor', () => {
    const result = eligibility(base({ hourlyWage: 10, area: 'area-1' }))
    expect(result.eligible).toBe(false)
    expect(result.reasons.join(' ')).toMatch(/minimum income floor/)
  })

  it('applies the higher Metro Vancouver wage floor in Area 1', () => {
    expect(minimumIncomeWage('area-1')).toBe(15.03)
    expect(minimumIncomeWage('area-2')).toBe(12.53)
    expect(minimumIncomeWage('area-3')).toBe(12.53)
    // $13/hr clears the rest-of-BC floor but not the Metro Vancouver floor
    expect(eligibility(base({ hourlyWage: 13, area: 'area-1' })).eligible).toBe(false)
    expect(eligibility(base({ hourlyWage: 13, area: 'area-3' })).eligible).toBe(true)
  })

  it('reports one reason per unmet requirement', () => {
    const result = eligibility(base({ englishClb: 3, workExperience: 'less-1', hourlyWage: 8, area: 'area-1' }))
    expect(result.eligible).toBe(false)
    expect(result.reasons).toHaveLength(3)
  })

  it('scoring points do not guarantee eligibility', () => {
    // High wage and strong education, but no work experience and CLB below 4
    const input = base({ workExperience: 'none', englishClb: 3, frenchClb: 0 })
    const score = bcScore(input)
    const result = eligibility(input)
    expect(score.total).toBeGreaterThan(0)
    expect(result.eligible).toBe(false)
  })
})
