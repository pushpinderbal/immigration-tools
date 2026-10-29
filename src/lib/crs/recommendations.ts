/**
 * CRS score improvement recommendations.
 *
 * Pure function: never mutates the input, computes every point gain by running
 * `crsScore` on hypothetical copies of the input.
 */

import { overallClb } from './languages'
import { crsScore } from './score'
import type { CanadianEducation, Clb, CrsInput, LanguageProficiency, WorkYears } from './types'

export interface CrsRecommendation {
  id: string
  title: string
  detail: string
  potential: number
}

const EMPTY_PROFICIENCY: LanguageProficiency = { listening: 0, reading: 0, writing: 0, speaking: 0 }

interface Changes {
  age?: number
  canadianEducation?: CanadianEducation
  canadianWorkYears?: WorkYears
  foreignWorkYears?: WorkYears
  english?: LanguageProficiency
  french?: LanguageProficiency
  spouseLanguage?: LanguageProficiency
  spouseWorkYears?: WorkYears
  siblingInCanada?: boolean
  certificateOfQualification?: boolean
  provincialNomination?: boolean
}

/** Copy of the input with the given changes applied; the original is never touched. */
function withChanges(input: CrsInput, changes: Changes): CrsInput {
  const next: CrsInput = { ...input }
  if (changes.age !== undefined) next.age = changes.age
  if (changes.canadianEducation !== undefined) next.canadianEducation = changes.canadianEducation
  if (changes.canadianWorkYears !== undefined) next.canadianWorkYears = changes.canadianWorkYears
  if (changes.foreignWorkYears !== undefined) next.foreignWorkYears = changes.foreignWorkYears
  if (changes.english !== undefined) next.english = { ...changes.english }
  if (changes.french !== undefined) next.french = { ...changes.french }
  if (changes.siblingInCanada !== undefined) next.siblingInCanada = changes.siblingInCanada
  if (changes.certificateOfQualification !== undefined) next.certificateOfQualification = changes.certificateOfQualification
  if (changes.provincialNomination !== undefined) next.provincialNomination = changes.provincialNomination
  if (changes.spouseLanguage !== undefined || changes.spouseWorkYears !== undefined) {
    const baseSpouse =
      input.spouse ?? { education: 'secondary' as const, language: EMPTY_PROFICIENCY, canadianWorkYears: 0 as WorkYears }
    next.spouse = {
      ...baseSpouse,
      language: changes.spouseLanguage !== undefined ? { ...changes.spouseLanguage } : { ...baseSpouse.language },
      canadianWorkYears: changes.spouseWorkYears ?? baseSpouse.canadianWorkYears,
    }
  }
  return next
}

function raiseTo(proficiency: LanguageProficiency, target: Clb): LanguageProficiency {
  return {
    listening: Math.max(proficiency.listening, target) as Clb,
    reading: Math.max(proficiency.reading, target) as Clb,
    writing: Math.max(proficiency.writing, target) as Clb,
    speaking: Math.max(proficiency.speaking, target) as Clb,
  }
}

function pointGain(baseTotal: number, simulated: CrsInput): number {
  return crsScore(simulated).total - baseTotal
}

export function getCrsRecommendations(input: CrsInput): CrsRecommendation[] {
  const baseTotal = crsScore(input).total
  const recommendations: CrsRecommendation[] = []

  const push = (id: string, title: string, detail: string, potential: number) => {
    if (potential > 0) recommendations.push({ id, title, detail, potential })
  }

  const firstProficiency = input.firstOfficialLanguage === 'english' ? input.english : input.french
  const secondProficiency = input.firstOfficialLanguage === 'english' ? input.french : input.english
  const firstName = input.firstOfficialLanguage === 'english' ? 'English' : 'French'
  const secondName = input.firstOfficialLanguage === 'english' ? 'French' : 'English'
  const firstClb = overallClb(firstProficiency)

  if (firstClb < 9) {
    const next =
      input.firstOfficialLanguage === 'english'
        ? withChanges(input, { english: raiseTo(firstProficiency, 9) })
        : withChanges(input, { french: raiseTo(firstProficiency, 9) })
    const hint =
      input.firstOfficialLanguage === 'english'
        ? 'IELTS General: 8.0 in listening and 7.0 in reading, writing and speaking.'
        : 'Aim for NCLC 9 in listening, reading, writing, and speaking.'
    push(
      'first-language',
      `Reach CLB 9 in ${firstName}`,
      `This scenario sets all four ${firstName} abilities to at least CLB 9. ${hint}`,
      pointGain(baseTotal, next),
    )
  } else if (firstClb === 9) {
    const next =
      input.firstOfficialLanguage === 'english'
        ? withChanges(input, { english: raiseTo(firstProficiency, 10) })
        : withChanges(input, { french: raiseTo(firstProficiency, 10) })
    push(
      'first-language',
      `Reach CLB 10 in ${firstName}`,
      `This scenario sets all four ${firstName} abilities to CLB 10.`,
      pointGain(baseTotal, next),
    )
  }

  if (overallClb(secondProficiency) < 7) {
    const next =
      input.firstOfficialLanguage === 'english'
        ? withChanges(input, { french: raiseTo(secondProficiency, 7) })
        : withChanges(input, { english: raiseTo(secondProficiency, 7) })
    const bonus =
      secondName === 'French'
        ? ' French can also qualify for up to 50 additional points.'
        : ''
    push(
      'second-language',
      `Reach CLB 7 in ${secondName}`,
      `This scenario sets all four ${secondName} abilities to at least CLB 7.${bonus}`,
      pointGain(baseTotal, next),
    )
  }

  if (input.canadianEducation === 'none') {
    const gainShort = pointGain(baseTotal, withChanges(input, { canadianEducation: 'one-two-years' }))
    const gainLong = pointGain(baseTotal, withChanges(input, { canadianEducation: 'three-plus-years' }))
    push(
      'canadian-education',
      'Study in Canada for 3+ years',
      'Complete a post-secondary credential at a Canadian institution. Three or more years of study earns 30 points and even one to two years earns 15.',
      Math.max(gainShort, gainLong),
    )
  }

  if (input.canadianWorkYears < 5) {
    push(
      'canadian-work',
      'Add a year of Canadian work',
      'Gain one more year of qualifying skilled work in Canada. Its effect depends on your scoring rules, job offer and skill transferability.',
      pointGain(baseTotal, withChanges(input, { canadianWorkYears: (input.canadianWorkYears + 1) as WorkYears })),
    )
  }

  if (input.foreignWorkYears < 5) {
    push(
      'foreign-work',
      'Add a year of foreign work',
      'Add one more year of skilled foreign work experience to your profile. It strengthens the foreign work portion of your skill transferability points.',
      pointGain(baseTotal, withChanges(input, { foreignWorkYears: (input.foreignWorkYears + 1) as WorkYears })),
    )
  }

  if (!input.provincialNomination) {
    push(
      'provincial-nomination',
      'Get a provincial nomination',
      'A qualifying provincial nomination adds up to 600 points within the additional-points cap. Stream requirements apply.',
      pointGain(baseTotal, withChanges(input, { provincialNomination: true })),
    )
  }

  if (!input.siblingInCanada) {
    push(
      'sibling',
      'Add a sibling in Canada',
      'You earn 15 points when a sibling who is 18 or older is a Canadian citizen or permanent resident living in Canada. Update your profile if that applies to you.',
      pointGain(baseTotal, withChanges(input, { siblingInCanada: true })),
    )
  }

  if (!input.certificateOfQualification) {
    push(
      'certificate',
      'Get a certificate of qualification',
      'If you work in a skilled trade, a certificate of qualification issued by a province adds points when combined with your language scores.',
      pointGain(baseTotal, withChanges(input, { certificateOfQualification: true })),
    )
  }

  if (input.hasAccompanyingSpouse && input.spouse) {
    const spouse = input.spouse
    let spouseRec: CrsRecommendation | undefined

    if (overallClb(spouse.language) < 7) {
      const potential = pointGain(baseTotal, withChanges(input, { spouseLanguage: raiseTo(spouse.language, 7) }))
      if (potential > 0) {
        spouseRec = {
          id: 'spouse',
          title: 'Raise your spouse to CLB 7',
          detail: 'Help your spouse reach CLB 7 in all four abilities on their language test. Partner language scores add directly to your total.',
          potential,
        }
      }
    }

    if (spouse.canadianWorkYears < 5) {
      const potential = pointGain(
        baseTotal,
        withChanges(input, { spouseWorkYears: (spouse.canadianWorkYears + 1) as WorkYears }),
      )
      if (potential > 0 && (spouseRec === undefined || potential > spouseRec.potential)) {
        spouseRec = {
          id: 'spouse',
          title: 'Add a year of Canadian work for your spouse',
          detail: 'Your spouse earns more points with each additional year of skilled work in Canada.',
          potential,
        }
      }
    }

    if (spouseRec) recommendations.push(spouseRec)
  }

  const nextYearTotal = crsScore(withChanges(input, { age: input.age + 1 })).total
  if (nextYearTotal < baseTotal) {
    const lost = baseTotal - nextYearTotal
    push(
      'age-warning',
      'Age at your next birthday',
      `Your score drops by ${lost} point${lost === 1 ? '' : 's'} when you turn ${input.age + 1}. Creating a profile does not lock in your age points.`,
      lost,
    )
  }

  recommendations.sort((a, b) => b.potential - a.potential)
  return recommendations.slice(0, 6)
}
