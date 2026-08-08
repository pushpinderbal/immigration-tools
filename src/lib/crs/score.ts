/**
 * CRS scoring engine — pure functions, zero framework dependencies.
 *
 * Verified against IRCC "Comprehensive Ranking System (CRS) criteria"
 * (canada.ca, updated 2026-06-22) and the official CRS tool's worked examples.
 */

import {
  ABILITIES,
  CANADIAN_WORK_TABLE,
  MAX_ADDITIONAL,
  MAX_CORE_WITH_SPOUSE,
  MAX_CORE_WITHOUT_SPOUSE,
  MAX_SPOUSE,
  MAX_TRANSFERABILITY,
  MAX_TOTAL,
  SPOUSE_CANADIAN_WORK_TABLE,
  SPOUSE_EDUCATION_TABLE,
  agePoints,
  certificateQualificationPoints,
  clbValues,
  clamp,
  educationCanadianWorkPoints,
  educationLanguagePoints,
  firstLanguagePointsPerAbility,
  foreignWorkCanadianWorkPoints,
  foreignWorkLanguagePoints,
  frenchBonusPoints,
  secondLanguagePointsPerAbility,
  spouseLanguagePointsPerAbility,
} from './tables'
import { ADDITIONAL_CANADIAN_EDUCATION_TABLE, EDUCATION_TABLE } from './tables'
import type { CrsBreakdown, CrsInput, LanguageProficiency } from './types'

/** A. Core / human capital factors. Capped at 460 (with spouse) or 500 (without). */
export function coreHumanCapitalPoints(input: CrsInput): number {
  const withSpouse = input.hasAccompanyingSpouse

  const age = agePoints(input.age, withSpouse)
  const education = EDUCATION_TABLE[input.education][withSpouse ? 0 : 1]
  const languages = languageProficiencyPoints(input, withSpouse)
  const canadianWork = CANADIAN_WORK_TABLE[input.canadianWorkYears][withSpouse ? 0 : 1]

  const cap = withSpouse ? MAX_CORE_WITH_SPOUSE : MAX_CORE_WITHOUT_SPOUSE
  return clamp(age + education + languages + canadianWork, 0, cap)
}

/** First official language (max 128 with spouse / 136 without) + second official language bonus (max 22 / 24). */
function languageProficiencyPoints(input: CrsInput, withSpouse: boolean): number {
  const first = input.firstOfficialLanguage === 'english' ? input.english : input.french
  const second = input.firstOfficialLanguage === 'english' ? input.french : input.english

  const firstPoints = ABILITIES.reduce(
    (sum, a) => sum + firstLanguagePointsPerAbility(first[a], withSpouse),
    0,
  )

  const secondPoints = ABILITIES.reduce(
    (sum, a) => sum + secondLanguagePointsPerAbility(second[a]),
    0,
  )
  const secondCap = withSpouse ? 22 : 24

  return clamp(firstPoints, 0, withSpouse ? 128 : 136) + clamp(secondPoints, 0, secondCap)
}

/** B. Spouse or common-law partner factors. Capped at 40. */
export function spousePoints(input: CrsInput): number {
  const spouse = input.spouse
  if (!input.hasAccompanyingSpouse || !spouse) return 0

  const education = SPOUSE_EDUCATION_TABLE[spouse.education]

  const language = ABILITIES.reduce(
    (sum, a) => sum + spouseLanguagePointsPerAbility(spouse.language[a]),
    0,
  )

  const canadianWork = SPOUSE_CANADIAN_WORK_TABLE[spouse.canadianWorkYears]

  return clamp(education + language + canadianWork, 0, MAX_SPOUSE)
}

/** C. Skill transferability factors. Capped at 100. */
export function transferabilityPoints(input: CrsInput): number {
  const firstLanguageClb = clbValues(input.firstOfficialLanguage === 'english' ? input.english : input.french)
  const canadianWork = input.canadianWorkYears
  const foreignWork = input.foreignWorkYears

  const education = clamp(
    educationLanguagePoints(input.education, firstLanguageClb) +
      educationCanadianWorkPoints(input.education, canadianWork),
    0,
    50,
  )

  const foreign = clamp(
    foreignWorkLanguagePoints(foreignWork, firstLanguageClb) +
      foreignWorkCanadianWorkPoints(foreignWork, canadianWork),
    0,
    50,
  )

  const certificate = certificateQualificationPoints(input.certificateOfQualification, firstLanguageClb)

  return clamp(education + foreign + certificate, 0, MAX_TRANSFERABILITY)
}

/** D. Additional points. Capped at 600. */
export function additionalPoints(input: CrsInput): number {
  let points = 0
  if (input.provincialNomination) points += 600
  points += ADDITIONAL_CANADIAN_EDUCATION_TABLE[input.canadianEducation]
  if (input.siblingInCanada) points += 15
  points += frenchBonusPoints(clbValues(input.french), clbValues(input.english))
  return clamp(points, 0, MAX_ADDITIONAL)
}

/** Full CRS score. */
export function crsScore(input: CrsInput): CrsBreakdown {
  const core = coreHumanCapitalPoints(input)
  const spouse = spousePoints(input)
  const transferability = transferabilityPoints(input)
  const additional = additionalPoints(input)
  const total = clamp(core + spouse + transferability + additional, 0, MAX_TOTAL)
  return { core, spouse, transferability, additional, total }
}

export const LANGUAGE_PROFICIENCY_EMPTY: LanguageProficiency = {
  listening: 0,
  reading: 0,
  writing: 0,
  speaking: 0,
}
