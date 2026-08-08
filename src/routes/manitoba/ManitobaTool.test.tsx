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

const total = () => screen.getByRole('status').textContent

/** Fills the classic test profile: English IELTS 6 (CLB 7), age 30, 3 yrs work, 2-year program, close friend or distant relative. */
function fillStandardProfile() {
  fireEvent.change(screen.getByLabelText('English (first official language) test'), { target: { value: 'ielts' } })
  for (const a of ['listening', 'reading', 'writing', 'speaking']) {
    fireEvent.change(screen.getByLabelText(`English (first official language) ${a}`), { target: { value: '6.0' } })
  }
  fireEvent.change(screen.getByRole('slider'), { target: { value: '30' } })
  fireEvent.change(screen.getByLabelText('Work experience in the last 5 years'), { target: { value: '3' } })
  fireEvent.change(screen.getByLabelText('Highest level of education'), { target: { value: 'two-year' } })
  fireEvent.click(screen.getByRole('checkbox', { name: /Close friend or distant relative/ }))
}

describe('ManitobaTool', () => {
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
    fireEvent.change(screen.getByRole('slider'), { target: { value: '50' } })
    // age 0 (was 75) → 298
    expect(total()).toBe('298')
  })

  it('applies a risk deduction for work experience in another province', () => {
    renderManitoba()
    fillStandardProfile()
    fireEvent.click(screen.getByRole('checkbox', { name: /Work experience in another province/ }))
    // risk -100 → 273
    expect(total()).toBe('273')
  })

  it('awards second official language points at CLB 5+', () => {
    renderManitoba()
    fillStandardProfile()
    fireEvent.click(screen.getByRole('button', { name: /Add second language test/ }))
    // TEF scores that map to NCLC 5 on all four abilities
    const frenchScores: Record<string, string> = { reading: '352', writing: '330', listening: '352', speaking: '387' }
    for (const [ability, score] of Object.entries(frenchScores)) {
      fireEvent.change(screen.getByLabelText(`Second official language ${ability}`), { target: { value: score } })
    }
    fireEvent.click(screen.getByRole('checkbox', { name: /Second official language/ }))
    // language 88 + 25 = 113 → 398
    expect(total()).toBe('398')
  })

  it('shows the eligibility banner and flags a missing connection', () => {
    renderManitoba()
    fillStandardProfile()
    expect(screen.getByText('You appear eligible')).toBeTruthy()
    fireEvent.click(screen.getByRole('checkbox', { name: /Close friend or distant relative/ }))
    expect(screen.getByText('Not eligible yet')).toBeTruthy()
    expect(screen.getByText(/connection to Manitoba/)).toBeTruthy()
  })
})
