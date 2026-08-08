/**
 * Language test score → CLB/NCLC conversion.
 *
 * Source: IRCC "Language results" equivalence tables (canada.ca, updated 2026-05-27):
 * https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/eligibility/language-results.html
 *
 * - IELTS General Training → CLB (per ability thresholds)
 * - CELPIP General → CLB is 1:1 with the reported level
 * - PTE Core → CLB (per ability ranges)
 * - TEF Canada (post Dec 10, 2023 scoring) → NCLC
 * - TCF Canada → NCLC
 *
 * Pure functions, no framework dependencies.
 */

import { ABILITIES } from './tables'
import type { Clb, LanguageAbility, LanguageProficiency } from './types'

export type LanguageTestId = 'none' | 'ielts' | 'celpip' | 'pte' | 'tef' | 'tcf'

export type LanguageScores = Record<LanguageAbility, number>

export interface LanguageTestState {
  test: LanguageTestId
  scores: LanguageScores
}

type Thresholds = readonly (readonly [Clb, number])[]

const IELTS: Record<LanguageAbility, Thresholds> = {
  reading: [[10, 8], [9, 7], [8, 6.5], [7, 6], [6, 5], [5, 4], [4, 3.5]],
  writing: [[10, 7.5], [9, 7], [8, 6.5], [7, 6], [6, 5.5], [5, 5], [4, 4]],
  listening: [[10, 8.5], [9, 8], [8, 7.5], [7, 6], [6, 5.5], [5, 5], [4, 4.5]],
  speaking: [[10, 7.5], [9, 7], [8, 6.5], [7, 6], [6, 5.5], [5, 5], [4, 4]],
}

const PTE: Record<LanguageAbility, Thresholds> = {
  reading: [[10, 88], [9, 78], [8, 69], [7, 60], [6, 51], [5, 42], [4, 33]],
  writing: [[10, 90], [9, 88], [8, 79], [7, 69], [6, 60], [5, 51], [4, 41]],
  listening: [[10, 89], [9, 82], [8, 71], [7, 60], [6, 50], [5, 39], [4, 28]],
  speaking: [[10, 89], [9, 84], [8, 76], [7, 68], [6, 59], [5, 51], [4, 42]],
}

const TEF: Record<LanguageAbility, Thresholds> = {
  reading: [[10, 546], [9, 503], [8, 462], [7, 434], [6, 393], [5, 352], [4, 306]],
  writing: [[10, 558], [9, 512], [8, 472], [7, 428], [6, 379], [5, 330], [4, 268]],
  listening: [[10, 546], [9, 503], [8, 462], [7, 434], [6, 393], [5, 352], [4, 306]],
  speaking: [[10, 556], [9, 518], [8, 494], [7, 456], [6, 422], [5, 387], [4, 328]],
}

const TCF: Record<LanguageAbility, Thresholds> = {
  reading: [[10, 549], [9, 524], [8, 499], [7, 453], [6, 406], [5, 375], [4, 342]],
  writing: [[10, 16], [9, 14], [8, 12], [7, 10], [6, 7], [5, 6], [4, 4]],
  listening: [[10, 549], [9, 523], [8, 503], [7, 458], [6, 398], [5, 369], [4, 331]],
  speaking: [[10, 16], [9, 14], [8, 12], [7, 10], [6, 7], [5, 6], [4, 4]],
}

type ThresholdTest = Exclude<LanguageTestId, 'none' | 'celpip'>

const TABLES: Record<ThresholdTest, Record<LanguageAbility, Thresholds>> = {
  ielts: IELTS,
  pte: PTE,
  tef: TEF,
  tcf: TCF,
}

function thresholdClb(table: Thresholds, score: number): Clb {
  for (const [clb, threshold] of table) {
    if (score >= threshold) return clb
  }
  return 0
}

/** Convert raw test scores to a CLB/NCLC proficiency (0 = below CLB 4 / no result). */
export function convertTestToClb(test: LanguageTestId, scores: LanguageScores): LanguageProficiency {
  const result = { listening: 0, reading: 0, writing: 0, speaking: 0 } as LanguageProficiency
  if (test === 'none') return result

  if (test === 'celpip') {
    for (const a of ABILITIES) {
      const level = scores[a]
      result[a] = level >= 11 ? 10 : level >= 4 ? (Math.round(level) as Clb) : 0
    }
    return result
  }

  const table = TABLES[test]
  for (const a of ABILITIES) {
    result[a] = thresholdClb(table[a], scores[a])
  }
  return result
}

/** Overall CLB for a language = lowest band across the four abilities. */
export function overallClb(proficiency: LanguageProficiency): Clb {
  let min = 10
  for (const a of ABILITIES) {
    if (proficiency[a] < min) min = proficiency[a]
  }
  return min as Clb
}

export function emptyScores(): LanguageScores {
  return { listening: 0, reading: 0, writing: 0, speaking: 0 }
}
