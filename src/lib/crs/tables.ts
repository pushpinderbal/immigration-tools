/**
 * CRS point tables.
 *
 * Source: IRCC, "Comprehensive Ranking System (CRS) criteria"
 * https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html
 * Page updated 2026-06-22.
 *
 * Notes on the current rules:
 *  - Job offer (arranged employment) points were removed by IRCC on 2025-03-25 and
 *    are intentionally absent.
 *  - Skill transferability: the education sub-category and the foreign work
 *    sub-category each cap at 50 points (the two tables within each sub-category
 *    add together up to that cap); the whole section caps at 100 points.
 */

import type { Clb, EducationLevel, LanguageAbility, WorkYears } from './types'

export const MAX_CORE_WITH_SPOUSE = 460
export const MAX_CORE_WITHOUT_SPOUSE = 500
export const MAX_SPOUSE = 40
export const MAX_TRANSFERABILITY = 100
export const MAX_ADDITIONAL = 600
export const MAX_TOTAL = 1200

export const ABILITIES: readonly LanguageAbility[] = ['listening', 'reading', 'writing', 'speaking']

// --- A. Core / human capital factors ---

/** [with spouse, without spouse] per exact age; anything < 18 or >= 45 scores 0. */
const AGE_TABLE: ReadonlyMap<number, readonly [withSpouse: number, withoutSpouse: number]> = new Map([
  [18, [90, 99]],
  [19, [95, 105]],
  [20, [100, 110]],
  [21, [100, 110]],
  [22, [100, 110]],
  [23, [100, 110]],
  [24, [100, 110]],
  [25, [100, 110]],
  [26, [100, 110]],
  [27, [100, 110]],
  [28, [100, 110]],
  [29, [100, 110]],
  [30, [95, 105]],
  [31, [90, 99]],
  [32, [85, 94]],
  [33, [80, 88]],
  [34, [75, 83]],
  [35, [70, 77]],
  [36, [65, 72]],
  [37, [60, 66]],
  [38, [55, 61]],
  [39, [50, 55]],
  [40, [45, 50]],
  [41, [35, 39]],
  [42, [25, 28]],
  [43, [15, 17]],
  [44, [5, 6]],
])

export function agePoints(age: number, withSpouse: boolean): number {
  const row = AGE_TABLE.get(age)
  if (!row) return 0
  return withSpouse ? row[0] : row[1]
}

/** [with spouse, without spouse] by education level. */
export const EDUCATION_TABLE: Readonly<Record<EducationLevel, readonly [withSpouse: number, withoutSpouse: number]>> = {
  'less-than-secondary': [0, 0],
  secondary: [28, 30],
  'one-year': [84, 90],
  'two-year': [91, 98],
  bachelor: [112, 120],
  'two-plus': [119, 128],
  master: [126, 135],
  doctorate: [140, 150],
}

/** First official language points, per ability, by CLB. */
export function firstLanguagePointsPerAbility(clb: Clb, withSpouse: boolean): number {
  switch (clb) {
    case 0:
      return 0
    case 4:
    case 5:
      return 6
    case 6:
      return withSpouse ? 8 : 9
    case 7:
      return withSpouse ? 16 : 17
    case 8:
      return withSpouse ? 22 : 23
    case 9:
      return withSpouse ? 29 : 31
    case 10:
      return withSpouse ? 32 : 34
  }
}

/** Second official language bonus, per ability, by CLB. */
export function secondLanguagePointsPerAbility(clb: Clb): number {
  if (clb >= 9) return 6
  if (clb >= 7) return 3
  if (clb >= 5) return 1
  return 0
}

/** [with spouse, without spouse] by years of Canadian skilled work. */
export const CANADIAN_WORK_TABLE: Readonly<Record<WorkYears, readonly [withSpouse: number, withoutSpouse: number]>> = {
  0: [0, 0],
  1: [35, 40],
  2: [46, 53],
  3: [56, 64],
  4: [63, 72],
  5: [70, 80],
}

// --- B. Spouse or common-law partner factors ---

export const SPOUSE_EDUCATION_TABLE: Readonly<Record<EducationLevel, number>> = {
  'less-than-secondary': 0,
  secondary: 2,
  'one-year': 6,
  'two-year': 7,
  bachelor: 8,
  'two-plus': 9,
  master: 10,
  doctorate: 10,
}

export function spouseLanguagePointsPerAbility(clb: Clb): number {
  if (clb >= 9) return 5
  if (clb >= 7) return 3
  if (clb >= 5) return 1
  return 0
}

export const SPOUSE_CANADIAN_WORK_TABLE: Readonly<Record<WorkYears, number>> = {
  0: 0,
  1: 5,
  2: 7,
  3: 8,
  4: 9,
  5: 10,
}

// --- C. Skill transferability factors ---

/**
 * Education + official language proficiency (requires CLB 7+ on all four
 * first-official-language abilities). Returns points from the CLB 7-8 column or
 * the CLB 9+ column.
 */
export function educationLanguagePoints(
  education: EducationLevel,
  firstLanguageClb: readonly Clb[],
): number {
  if (firstLanguageClb.some((c) => c < 7)) return 0
  const allNine = firstLanguageClb.every((c) => c >= 9)
  switch (education) {
    case 'less-than-secondary':
    case 'secondary':
      return 0
    case 'one-year':
    case 'two-year':
    case 'bachelor':
      return allNine ? 25 : 13
    case 'two-plus':
    case 'master':
    case 'doctorate':
      return allNine ? 50 : 25
  }
}

/** Education + Canadian work experience. */
export function educationCanadianWorkPoints(
  education: EducationLevel,
  canadianWorkYears: WorkYears,
): number {
  switch (education) {
    case 'less-than-secondary':
    case 'secondary':
      return 0
    case 'one-year':
    case 'two-year':
    case 'bachelor':
      return canadianWorkYears === 0 ? 0 : canadianWorkYears === 1 ? 13 : 25
    case 'two-plus':
    case 'master':
    case 'doctorate':
      return canadianWorkYears === 0 ? 0 : canadianWorkYears === 1 ? 25 : 50
  }
}

/** Foreign work experience + official language proficiency (requires CLB 7+). */
export function foreignWorkLanguagePoints(
  foreignWorkYears: WorkYears,
  firstLanguageClb: readonly Clb[],
): number {
  if (foreignWorkYears === 0) return 0
  if (firstLanguageClb.some((c) => c < 7)) return 0
  const allNine = firstLanguageClb.every((c) => c >= 9)
  if (foreignWorkYears <= 2) return allNine ? 25 : 13
  return allNine ? 50 : 25
}

/** Foreign work experience + Canadian work experience. */
export function foreignWorkCanadianWorkPoints(
  foreignWorkYears: WorkYears,
  canadianWorkYears: WorkYears,
): number {
  if (foreignWorkYears === 0 || canadianWorkYears === 0) return 0
  const twoPlusCanadian = canadianWorkYears >= 2
  if (foreignWorkYears <= 2) return twoPlusCanadian ? 25 : 13
  return twoPlusCanadian ? 50 : 25
}

/** Certificate of qualification (trade occupations) + official language proficiency (requires CLB 5+). */
export function certificateQualificationPoints(
  hasCertificate: boolean,
  firstLanguageClb: readonly Clb[],
): number {
  if (!hasCertificate) return 0
  if (firstLanguageClb.some((c) => c < 5)) return 0
  const allSeven = firstLanguageClb.every((c) => c >= 7)
  return allSeven ? 50 : 25
}

// --- D. Additional points ---

export const ADDITIONAL_CANADIAN_EDUCATION_TABLE = {
  none: 0,
  'one-two-years': 15,
  'three-plus-years': 30,
} as const satisfies Record<string, number>

/** Additional points for French ability, based on English proficiency. */
export function frenchBonusPoints(
  frenchClb: readonly Clb[],
  englishClb: readonly Clb[],
): number {
  const frenchAtLeastSeven = frenchClb.every((c) => c >= 7)
  if (!frenchAtLeastSeven) return 0
  const englishAtLeastFive = englishClb.every((c) => c >= 5)
  return englishAtLeastFive ? 50 : 25
}

// --- Helpers ---

export function clbValues(proficiency: Record<LanguageAbility, Clb>): Clb[] {
  return ABILITIES.map((a) => proficiency[a])
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
