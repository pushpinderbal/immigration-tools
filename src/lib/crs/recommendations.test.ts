import { describe, expect, it } from 'vitest'
import { getCrsRecommendations } from './recommendations'
import type { CrsInput, LanguageProficiency } from './types'

const allClb = (c: number): LanguageProficiency => ({
  listening: c as LanguageProficiency['listening'],
  reading: c as LanguageProficiency['reading'],
  writing: c as LanguageProficiency['writing'],
  speaking: c as LanguageProficiency['speaking'],
})

/** Mirrors the default state CrsTool starts with (age 30, single, bachelor, English CLB 7). */
function defaultInput(overrides: Partial<CrsInput> = {}): CrsInput {
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

describe('getCrsRecommendations', () => {
  it('default CRS input includes a provincial nomination suggestion worth 600 points', () => {
    const recommendations = getCrsRecommendations(defaultInput())
    const nomination = recommendations.find((r) => r.id === 'provincial-nomination')
    expect(nomination).toBeDefined()
    expect(nomination?.potential).toBe(600)
  })

  it('default CRS input includes a language improvement suggestion', () => {
    const recommendations = getCrsRecommendations(defaultInput())
    const language = recommendations.find((r) => r.id === 'first-language' || r.id === 'second-language')
    expect(language).toBeDefined()
    expect(language?.potential).toBeGreaterThan(0)
  })

  it('never returns an item with potential <= 0', () => {
    const inputs: CrsInput[] = [
      defaultInput(),
      defaultInput({
        hasAccompanyingSpouse: true,
        spouse: { education: 'secondary', language: allClb(0), canadianWorkYears: 0 },
      }),
      defaultInput({ age: 44 }),
      defaultInput({ english: allClb(9), foreignWorkYears: 3 }),
      defaultInput({ education: 'master', english: allClb(10), canadianWorkYears: 2, french: allClb(6) }),
    ]
    for (const input of inputs) {
      for (const r of getCrsRecommendations(input)) {
        expect(r.potential).toBeGreaterThan(0)
      }
    }
  })

  it('sorts recommendations by potential descending', () => {
    const recommendations = getCrsRecommendations(defaultInput())
    for (let i = 1; i < recommendations.length; i++) {
      const prev = recommendations[i - 1]
      const curr = recommendations[i]
      expect(prev!.potential).toBeGreaterThanOrEqual(curr!.potential)
    }
  })

  it('caps the list at six items', () => {
    expect(getCrsRecommendations(defaultInput()).length).toBeLessThanOrEqual(6)
  })

  it('returns an empty list for a fully maxed profile', () => {
    const recommendations = getCrsRecommendations(
      defaultInput({
        age: 45,
        education: 'doctorate',
        english: allClb(10),
        french: allClb(10),
        canadianWorkYears: 5,
        foreignWorkYears: 5,
        certificateOfQualification: true,
        provincialNomination: true,
        canadianEducation: 'three-plus-years',
        siblingInCanada: true,
      }),
    )
    expect(recommendations).toEqual([])
  })

  it('suggests improving the spouse profile when a spouse is present', () => {
    const recommendations = getCrsRecommendations(
      defaultInput({
        age: 20,
        hasAccompanyingSpouse: true,
        english: allClb(10),
        canadianWorkYears: 5,
        certificateOfQualification: true,
        canadianEducation: 'three-plus-years',
        spouse: { education: 'secondary', language: allClb(0), canadianWorkYears: 0 },
      }),
    )
    const spouse = recommendations.find((r) => r.id === 'spouse')
    expect(spouse).toBeDefined()
    expect(spouse?.potential).toBeGreaterThan(0)
  })

  it('adds an age-loss warning when the score drops next year', () => {
    const recommendations = getCrsRecommendations(
      defaultInput({
        age: 40,
        education: 'doctorate',
        english: allClb(10),
        french: allClb(10),
        canadianWorkYears: 5,
        foreignWorkYears: 5,
        certificateOfQualification: true,
        canadianEducation: 'three-plus-years',
        siblingInCanada: true,
      }),
    )
    const age = recommendations.find((r) => r.id === 'age-warning')
    expect(age).toBeDefined()
    expect(age?.potential).toBeGreaterThan(0)
    expect(age?.detail).toMatch(/drops by/)
  })

  it('does not mutate the input it is given', () => {
    const input = defaultInput()
    const snapshot = JSON.parse(JSON.stringify(input)) as CrsInput
    getCrsRecommendations(input)
    expect(input).toEqual(snapshot)
  })
})
