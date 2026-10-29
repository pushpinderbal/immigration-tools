import { answer, control } from '../../test/calculator'
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ManitobaTool } from './ManitobaTool'

vi.mock('../../components/DrawFeed', () => ({ DrawFeed: () => null }))

afterEach(cleanup)

function renderManitoba() {
  return render(
    <MemoryRouter>
      <ManitobaTool />
    </MemoryRouter>,
  )
}

const total = () => control('status').textContent

/** Fills the classic test profile: English IELTS 6 (CLB 7), age 30, 3 yrs work, 2-year program, close friend or distant relative. */
function fillStandardProfile() {
  fireEvent.change(answer('English (first official language) test'), { target: { value: 'ielts' } })
  for (const a of ['listening', 'reading', 'writing', 'speaking']) {
    fireEvent.change(answer(`English (first official language) ${a}`), { target: { value: '6.0' } })
  }
  fireEvent.change(control('slider', { name: 'Age' }), { target: { value: '30' } })
  fireEvent.change(answer('Work experience in the last 5 years'), { target: { value: '3' } })
  fireEvent.change(answer('Highest level of education'), { target: { value: 'two-year' } })
  fireEvent.change(answer('Highest-scoring connection to Manitoba'), { target: { value: 'friend' } })
}

describe('ManitobaTool', () => {
  it('supports French first and restricts second-language tests to the other official language', () => {
    renderManitoba()
    fillStandardProfile()
    fireEvent.change(answer('First official language'), { target: { value: 'french' } })
    fireEvent.change(answer('French (first official language) test'), { target: { value: 'tef' } })
    const scores: Record<string, string> = { listening: '434', reading: '434', writing: '428', speaking: '456' }
    for (const [ability, score] of Object.entries(scores)) {
      fireEvent.change(answer(`French (first official language) ${ability}`), { target: { value: score } })
    }
    expect(total()).toBe('373')
    fireEvent.click(control('button', { name: /Add second language test/ }))
    const tests = answer('Second official language test') as HTMLSelectElement
    expect(Array.from(tests.options).map((option) => option.value)).toEqual(['none', 'ielts', 'celpip', 'pte'])
  })
  it('waits for an answer before showing eligibility', () => {
    renderManitoba()
    expect(screen.queryByText('Requirements to review')).toBeNull()
    expect(screen.queryByText('Initial checks passed')).toBeNull()
    const education = answer('Highest level of education')
    fireEvent.focus(education)
    expect(screen.queryByText('Requirements to review')).toBeNull()
    fireEvent.change(education, { target: { value: 'two-year' } })
    expect(screen.getByText('Requirements to review')).toBeTruthy()
  })

  it('starts blank with a near-zero score', () => {
    renderManitoba()
    // age 20 (18, slider minimum) is the only points-bearing fallback
    expect(total()).toBe('20')
  })

  it('renders the score for the standard profile', () => {
    renderManitoba()
    fillStandardProfile()
    // language 88 (English CLB 7 per band) + age 75 + experience 60 + education 100 + adaptability 50 = 373
    expect(total()).toBe('373')
  })

  it('updates the score when the age changes', () => {
    renderManitoba()
    fillStandardProfile()
    fireEvent.change(control('slider', { name: 'Age' }), { target: { value: '50' } })
    // age 0 (was 75) → 298
    expect(total()).toBe('298')
  })

  it('applies a risk deduction for work experience in another province', () => {
    renderManitoba()
    fillStandardProfile()
    fireEvent.click(control('switch', { name: /Work experience in another province/ }))
    // risk -100 → 273
    expect(total()).toBe('273')
  })

  it('awards second official language points at CLB 5+', () => {
    renderManitoba()
    fillStandardProfile()
    fireEvent.click(control('button', { name: /Add second language test/ }))
    // TEF scores that map to NCLC 5 on all four abilities
    const frenchScores: Record<string, string> = { reading: '352', writing: '330', listening: '352', speaking: '387' }
    for (const [ability, score] of Object.entries(frenchScores)) {
      fireEvent.change(answer(`Second official language ${ability}`), { target: { value: score } })
    }
    // language 88 + 25 = 113 → 398
    expect(total()).toBe('398')
  })

  it('shows the eligibility banner and flags a missing connection', () => {
    renderManitoba()
    fillStandardProfile()
    expect(screen.getByText('Initial checks passed')).toBeTruthy()
    fireEvent.change(answer('Highest-scoring connection to Manitoba'), { target: { value: 'none' } })
    expect(screen.getByText('Requirements to review')).toBeTruthy()
    expect(screen.getByText(/Skilled Worker streams require an established connection to Manitoba/)).toBeTruthy()
  })
})
