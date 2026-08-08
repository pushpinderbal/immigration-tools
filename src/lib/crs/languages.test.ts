import { describe, expect, it } from 'vitest'
import { convertTestToClb, emptyScores, overallClb } from './languages'
import type { LanguageScores } from './languages'

const s = (reading: number, writing: number, listening: number, speaking: number): LanguageScores => ({
  reading,
  writing,
  listening,
  speaking,
})

const toClb = (r: number, w: number, l: number, sp: number) =>
  convertTestToClb('ielts', s(r, w, l, sp))

describe('IELTS General → CLB (official table)', () => {
  it('CLB 10 (L8.5 R8.0 W7.5 S7.5)', () => {
    expect(toClb(8, 7.5, 8.5, 7.5)).toEqual({ reading: 10, writing: 10, listening: 10, speaking: 10 })
  })
  it('CLB 9 (L8.0 R7.0 W7.0 S7.0)', () => {
    expect(toClb(7, 7, 8, 7)).toEqual({ reading: 9, writing: 9, listening: 9, speaking: 9 })
  })
  it('CLB 8 (L7.5 R6.5 W6.5 S6.5)', () => {
    expect(toClb(6.5, 6.5, 7.5, 6.5)).toEqual({ reading: 8, writing: 8, listening: 8, speaking: 8 })
  })
  it('CLB 7 (L6.0 R6.0 W6.0 S6.0)', () => {
    expect(toClb(6, 6, 6, 6)).toEqual({ reading: 7, writing: 7, listening: 7, speaking: 7 })
  })
  it('CLB 6 (L5.5 R5.0 W5.5 S5.5)', () => {
    expect(toClb(5, 5.5, 5.5, 5.5)).toEqual({ reading: 6, writing: 6, listening: 6, speaking: 6 })
  })
  it('CLB 5 (L5.0 R4.0 W5.0 S5.0)', () => {
    expect(toClb(4, 5, 5, 5)).toEqual({ reading: 5, writing: 5, listening: 5, speaking: 5 })
  })
  it('CLB 4 (L4.5 R3.5 W4.0 S4.0)', () => {
    expect(toClb(3.5, 4, 4.5, 4)).toEqual({ reading: 4, writing: 4, listening: 4, speaking: 4 })
  })
  it('below CLB 4 maps to 0', () => {
    expect(toClb(3, 3.5, 4, 3.5)).toEqual({ reading: 0, writing: 0, listening: 0, speaking: 0 })
  })
  it('handles mixed bands per ability', () => {
    // reading 6.0→7, writing 6.5→8, listening 7.5→8, speaking 6.5→8
    expect(toClb(6, 6.5, 7.5, 6.5)).toEqual({ reading: 7, writing: 8, listening: 8, speaking: 8 })
  })
})

describe('CELPIP General → CLB (1:1)', () => {
  const c = (r: number, w: number, l: number, sp: number) =>
    convertTestToClb('celpip', s(r, w, l, sp))
  it('level n maps to CLB n', () => {
    expect(c(7, 7, 7, 7)).toEqual({ reading: 7, writing: 7, listening: 7, speaking: 7 })
    expect(c(9, 9, 9, 9)).toEqual({ reading: 9, writing: 9, listening: 9, speaking: 9 })
  })
  it('levels 11-12 cap at CLB 10', () => {
    expect(c(12, 11, 12, 11)).toEqual({ reading: 10, writing: 10, listening: 10, speaking: 10 })
  })
  it('level 3 is below CLB 4 → 0', () => {
    expect(c(3, 3, 3, 3)).toEqual({ reading: 0, writing: 0, listening: 0, speaking: 0 })
  })
})

describe('PTE Core → CLB (official table)', () => {
  const p = (r: number, w: number, l: number, sp: number) =>
    convertTestToClb('pte', s(r, w, l, sp))
  it('top bands', () => {
    expect(p(90, 90, 90, 90)).toEqual({ reading: 10, writing: 10, listening: 10, speaking: 10 })
    expect(p(88, 89, 89, 89)).toEqual({ reading: 10, writing: 9, listening: 10, speaking: 10 })
  })
  it('CLB 9', () => {
    expect(p(78, 88, 82, 84)).toEqual({ reading: 9, writing: 9, listening: 9, speaking: 9 })
  })
  it('CLB 7', () => {
    expect(p(60, 69, 60, 68)).toEqual({ reading: 7, writing: 7, listening: 7, speaking: 7 })
  })
  it('below CLB 4 → 0', () => {
    expect(p(32, 31, 17, 33)).toEqual({ reading: 0, writing: 0, listening: 0, speaking: 0 })
  })
})

describe('TEF Canada (post Dec 2023) → NCLC (official table)', () => {
  const t = (r: number, w: number, l: number, sp: number) =>
    convertTestToClb('tef', s(r, w, l, sp))
  it('CLB 7 bands', () => {
    expect(t(434, 428, 434, 456)).toEqual({ reading: 7, writing: 7, listening: 7, speaking: 7 })
  })
  it('CLB 9 bands', () => {
    expect(t(503, 512, 503, 518)).toEqual({ reading: 9, writing: 9, listening: 9, speaking: 9 })
  })
  it('below CLB 4 → 0', () => {
    expect(t(305, 267, 305, 327)).toEqual({ reading: 0, writing: 0, listening: 0, speaking: 0 })
  })
})

describe('TCF Canada → NCLC (official table)', () => {
  const t = (r: number, w: number, l: number, sp: number) =>
    convertTestToClb('tcf', s(r, w, l, sp))
  it('CLB 6 (writing/speaking are 4-20 scale)', () => {
    expect(t(406, 7, 398, 7)).toEqual({ reading: 6, writing: 6, listening: 6, speaking: 6 })
  })
  it('CLB 10', () => {
    expect(t(549, 16, 549, 16)).toEqual({ reading: 10, writing: 10, listening: 10, speaking: 10 })
  })
  it('below CLB 4 → 0', () => {
    expect(t(341, 3, 330, 3)).toEqual({ reading: 0, writing: 0, listening: 0, speaking: 0 })
  })
})

describe('no test', () => {
  it('maps to all zeros', () => {
    expect(convertTestToClb('none', emptyScores())).toEqual({ listening: 0, reading: 0, writing: 0, speaking: 0 })
  })
})

describe('overallClb', () => {
  it('is the lowest band across abilities', () => {
    expect(overallClb({ listening: 9, reading: 7, writing: 8, speaking: 8 })).toBe(7)
    expect(overallClb({ listening: 10, reading: 10, writing: 10, speaking: 10 })).toBe(10)
    expect(overallClb({ listening: 0, reading: 7, writing: 7, speaking: 7 })).toBe(0)
  })
})
