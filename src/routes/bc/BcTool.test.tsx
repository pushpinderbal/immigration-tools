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

const total = () => screen.getByRole('status').textContent

/** Fills the classic test profile: 2-3 yrs work, bachelor, $30/hr, Area 3, English IELTS 6/6/6/6 (CLB 7). */
function fillStandardProfile() {
  fireEvent.change(screen.getByLabelText('Directly related work experience'), { target: { value: '2-3' } })
  fireEvent.change(screen.getByLabelText('Highest level of education'), { target: { value: 'bachelor' } })
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '30' } })
  fireEvent.change(screen.getByLabelText('Area within BC'), { target: { value: 'area-3' } })
  fireEvent.change(screen.getByLabelText('English test'), { target: { value: 'ielts' } })
  for (const a of ['listening', 'reading', 'writing', 'speaking']) {
    fireEvent.change(screen.getByLabelText(`English ${a}`), { target: { value: '6.0' } })
  }
}

describe('BcTool', () => {
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
    fireEvent.change(screen.getByLabelText('Directly related work experience'), { target: { value: '5-plus' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /At least 1 year of directly related experience in Canada/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Currently working full-time in BC/ }))
    // experience 20 + 10 + 10 = 40 (was 8) → total 105
    expect(total()).toBe('105')
  })

  it('updates when the hourly wage changes', () => {
    renderBc()
    fillStandardProfile()
    const wage = screen.getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(wage, { target: { value: '40' } })
    // wage 25 (was 15) → total 83
    expect(total()).toBe('83')
  })

  it('hides the regional bonus checkbox in Area 1', () => {
    renderBc()
    fillStandardProfile()
    expect(screen.getByRole('checkbox', { name: /Regional experience or regional alumni/ })).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Area within BC'), { target: { value: 'area-1' } })
    expect(screen.queryByRole('checkbox', { name: /Regional experience or regional alumni/ })).toBeNull()
    // area 0 (was 15) → total 58
    expect(total()).toBe('58')
  })

  it('awards the regional bonus in Area 3', () => {
    renderBc()
    fillStandardProfile()
    fireEvent.click(screen.getByRole('checkbox', { name: /Regional experience or regional alumni/ }))
    // area 15 + 10 = 25 (was 15) → total 83
    expect(total()).toBe('83')
  })

  it('stacks the BC education bonus with the professional designation bonus', () => {
    renderBc()
    fillStandardProfile()
    fireEvent.change(screen.getByLabelText('Additional education'), { target: { value: 'bc' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /Eligible professional designation in B\.C\./ }))
    // education 15 + 8 (BC) + 5 (designation) = 28 (was 15) → total 86
    expect(total()).toBe('86')
  })

  it('awards both-languages points when French is added at CLB 4+', () => {
    renderBc()
    fillStandardProfile()
    fireEvent.click(screen.getByRole('button', { name: /Add French test/ }))
    const frenchScores: Record<string, string> = { reading: '393', writing: '379', listening: '393', speaking: '422' }
    for (const [ability, score] of Object.entries(frenchScores)) {
      fireEvent.change(screen.getByLabelText(`French ${ability}`), { target: { value: score } })
    }
    fireEvent.click(screen.getByRole('checkbox', { name: /both English and French/ }))
    // language 20 + 10 = 30 (was 20) → total 83
    expect(total()).toBe('83')
  })
})

describe('BcTool eligibility banner', () => {
  it('shows the eligible banner for the standard profile', () => {
    renderBc()
    fillStandardProfile()
    expect(screen.getByText('You appear eligible')).toBeTruthy()
  })

  it('shows the ineligible banner with reasons when requirements are not met', () => {
    renderBc()
    fillStandardProfile()
    fireEvent.change(screen.getByLabelText('Directly related work experience'), { target: { value: 'none' } })
    expect(screen.getByText('Not eligible yet')).toBeTruthy()
    expect(screen.getByText(/at least two years of full-time/)).toBeTruthy()
  })

  it('flags a wage below the minimum income floor', () => {
    renderBc()
    fillStandardProfile()
    const wage = screen.getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(wage, { target: { value: '10' } })
    expect(screen.getByText('Not eligible yet')).toBeTruthy()
    expect(screen.getByText(/minimum income floor/)).toBeTruthy()
  })
})
