import { answer, control } from '../../test/calculator'
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BcTool } from './BcTool'

vi.mock('../../components/DrawFeed', () => ({ DrawFeed: () => null }))

afterEach(cleanup)

function renderBc() {
  return render(
    <MemoryRouter>
      <BcTool />
    </MemoryRouter>,
  )
}

const total = () => control('status').textContent

/** Fills the classic test profile: 2-3 yrs work, bachelor, $30/hr, Area 3, English IELTS 6/6/6/6 (CLB 7). */
function fillStandardProfile() {
  fireEvent.change(answer('Directly related work experience'), { target: { value: '2-3' } })
  fireEvent.change(answer('Highest level of education'), { target: { value: 'bachelor' } })
  fireEvent.change(control('spinbutton', { name: /^Hourly wage/ }), { target: { value: '30' } })
  fireEvent.change(answer('Area within BC'), { target: { value: 'area-3' } })
  fireEvent.change(answer('English test'), { target: { value: 'ielts' } })
  for (const a of ['listening', 'reading', 'writing', 'speaking']) {
    fireEvent.change(answer(`English ${a}`), { target: { value: '6.0' } })
  }
}

describe('BcTool', () => {
  it('waits for an answer before showing eligibility', () => {
    renderBc()
    expect(screen.queryByText('Requirements to review')).toBeNull()
    expect(screen.queryByText('Initial checks passed')).toBeNull()
    const education = answer('Highest level of education')
    fireEvent.focus(education)
    expect(screen.queryByText('Requirements to review')).toBeNull()
    fireEvent.change(education, { target: { value: 'bachelor' } })
    expect(screen.getByText('Requirements to review')).toBeTruthy()
  })

  it('starts blank with a zero score', () => {
    renderBc()
    expect(total()).toBe('0')
  })

  it('renders the score for the standard profile', () => {
    renderBc()
    fillStandardProfile()
    // experience 8 (2-3 yrs) + education 15 (bachelor) + language 20 (CLB 7)
    // + wage 15 ($30/hr) + area 15 (Area 3) = 73
    expect(total()).toBe('73')
  })

  it('awards Canadian and BC work experience bonuses', () => {
    renderBc()
    fillStandardProfile()
    fireEvent.change(answer('Directly related work experience'), { target: { value: '5-plus' } })
    fireEvent.click(control('switch', { name: /At least 1 year of directly related experience in Canada/ }))
    fireEvent.click(control('switch', { name: /Currently working full-time in BC/ }))
    // experience 20 + 10 + 10 = 40 (was 8) → total 105
    expect(total()).toBe('105')
  })

  it('updates when the hourly wage changes', () => {
    renderBc()
    fillStandardProfile()
    const wage = control('spinbutton', { name: /^Hourly wage/ }) as HTMLInputElement
    fireEvent.change(wage, { target: { value: '40' } })
    // wage 25 (was 15) → total 83
    expect(total()).toBe('83')
  })

  it('hides the regional bonus checkbox in Area 1', () => {
    renderBc()
    fillStandardProfile()
    expect(control('switch', { name: /Regional experience or regional alumni/ })).toBeTruthy()
    fireEvent.change(answer('Area within BC'), { target: { value: 'area-1' } })
    expect(screen.queryByRole('checkbox', { name: /Regional experience or regional alumni/ })).toBeNull()
    // area 0 (was 15) → total 58
    expect(total()).toBe('58')
  })

  it('awards the regional bonus in Area 3', () => {
    renderBc()
    fillStandardProfile()
    fireEvent.click(control('switch', { name: /Regional experience or regional alumni/ }))
    // area 15 + 10 = 25 (was 15) → total 83
    expect(total()).toBe('83')
  })

  it('stacks the BC education bonus with the professional designation bonus', () => {
    renderBc()
    fillStandardProfile()
    fireEvent.change(answer('Additional education'), { target: { value: 'bc' } })
    fireEvent.click(control('switch', { name: /Eligible professional designation in B\.C\./ }))
    // education 15 + 8 (BC) + 5 (designation) = 28 (was 15) → total 86
    expect(total()).toBe('86')
  })

  it('awards both-languages points when French is added at CLB 4+', () => {
    renderBc()
    fillStandardProfile()
    fireEvent.click(control('button', { name: /Add French test/ }))
    const frenchScores: Record<string, string> = { reading: '393', writing: '379', listening: '393', speaking: '422' }
    for (const [ability, score] of Object.entries(frenchScores)) {
      fireEvent.change(answer(`French ${ability}`), { target: { value: score } })
    }
    // language 20 + 10 = 30 (was 20) → total 83
    expect(total()).toBe('83')
  })
})

describe('BcTool eligibility banner', () => {
  it('shows the eligible banner for the standard profile', () => {
    renderBc()
    fillStandardProfile()
    expect(screen.getByText('Initial checks passed')).toBeTruthy()
  })

  it('shows the ineligible banner with reasons when requirements are not met', () => {
    renderBc()
    fillStandardProfile()
    fireEvent.change(answer('Directly related work experience'), { target: { value: 'none' } })
    expect(screen.getByText('Requirements to review')).toBeTruthy()
    expect(screen.getByText(/at least two years of full-time/)).toBeTruthy()
  })

  it('flags a wage below the minimum income floor', () => {
    renderBc()
    fillStandardProfile()
    const wage = control('spinbutton', { name: /^Hourly wage/ }) as HTMLInputElement
    fireEvent.change(wage, { target: { value: '10' } })
    expect(screen.getByText('Requirements to review')).toBeTruthy()
    expect(screen.getByText(/minimum income floor/)).toBeTruthy()
  })
})
