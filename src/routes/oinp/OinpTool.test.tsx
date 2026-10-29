import { answer, control } from '../../test/calculator'
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OinpTool } from '../../routes/oinp/OinpTool'

vi.mock('../../components/DrawFeed', () => ({ DrawFeed: () => null }))

afterEach(cleanup)

function renderOinp() {
  return render(
    <MemoryRouter>
      <OinpTool />
    </MemoryRouter>,
  )
}

const total = () => control('status').textContent

/** Fills the classic test profile: TEER 2, NOC 0, $30/hr, 6-12 months, $30k-50k, work permit, bachelor, one credential, English CLB 7, Eastern Ontario. */
function fillStandardProfile() {
  fireEvent.change(answer('NOC TEER category'), { target: { value: '2' } })
  fireEvent.change(answer('NOC broad occupational category'), { target: { value: '0' } })
  fireEvent.change(control('spinbutton', { name: /^Hourly wage/ }), { target: { value: '30' } })
  fireEvent.change(answer('Time in job offer position'), { target: { value: '6-12' } })
  fireEvent.change(answer('Highest yearly earnings'), { target: { value: '30k-50k' } })
  fireEvent.change(answer('Legal status in Canada'), { target: { value: 'work-permit' } })
  fireEvent.change(answer('Highest level of education'), { target: { value: 'bachelor' } })
  fireEvent.change(answer('Canadian education credentials'), { target: { value: 'one' } })
  fireEvent.change(answer('Location of work in job offer'), { target: { value: 'eastern' } })
  fireEvent.change(answer('English test'), { target: { value: 'ielts' } })
  for (const a of ['listening', 'reading', 'writing', 'speaking']) {
    fireEvent.change(answer(`English ${a}`), { target: { value: '6.0' } })
  }
}

describe('OinpTool', () => {
  it('adds the October 5 earnings tier and supports self-employed physicians', () => {
    renderOinp()
    fillStandardProfile()
    fireEvent.change(answer('Highest yearly earnings'), { target: { value: '80k-plus' } })
    expect(total()).toBe('86')
    fireEvent.change(answer('Application pathway'), { target: { value: 'physician' } })
    fireEvent.change(answer('Time working in Ontario'), { target: { value: '6-12' } })
    expect(total()).toBe('85')
    expect(screen.queryByRole('spinbutton', { name: /^Hourly wage/ })).toBeNull()
    fireEvent.click(control('switch', { name: /OHIP billing number/ }))
    expect(screen.getByText('Initial checks passed')).toBeTruthy()
  })
  it('waits for an answer before showing eligibility', () => {
    renderOinp()
    expect(screen.queryByText('Requirements to review')).toBeNull()
    expect(screen.queryByText('Initial checks passed')).toBeNull()
    const education = answer('Highest level of education')
    fireEvent.focus(education)
    expect(screen.queryByText('Requirements to review')).toBeNull()
    fireEvent.change(education, { target: { value: 'bachelor' } })
    expect(screen.getByText('Requirements to review')).toBeTruthy()
  })

  it('starts blank with a near-zero score', () => {
    renderOinp()
    expect(total()).toBe('0')
  })

  it('renders the score for the standard profile', () => {
    renderOinp()
    fillStandardProfile()
    // labour 46 (teer6 + noc4 + wage10 + tenure12 + earnings4 + permit10)
    // + education 11 (bachelor6 + one credential5)
    // + language 13 (CLB7 ability8 + 1 language5)
    // + region 10 (eastern) = 80
    expect(total()).toBe('80')
  })

  it('awards 2-language points when a French test at CLB 6 is added', () => {
    renderOinp()
    fillStandardProfile()
    fireEvent.click(control('button', { name: /Add French test/ }))
    // English CLB 7 + French NCLC 6 → 2 official languages (CLB 6 threshold)
    const frenchScores: Record<string, string> = { reading: '393', writing: '379', listening: '393', speaking: '422' }
    for (const [ability, score] of Object.entries(frenchScores)) {
      fireEvent.change(answer(`French ${ability}`), { target: { value: score } })
    }
    // language: ability 8 (CLB 7) + 2-language 10 = 18 (was 13) → total 85
    expect(total()).toBe('85')
  })

  it('updates when the hourly wage changes', () => {
    renderOinp()
    fillStandardProfile()
    const wage = control('spinbutton', { name: /^Hourly wage/ }) as HTMLInputElement
    fireEvent.change(wage, { target: { value: '50' } })
    // labour +5 → 85
    expect(total()).toBe('85')
  })

  it('updates when the region changes to Toronto', () => {
    renderOinp()
    fillStandardProfile()
    fireEvent.change(answer('Location of work in job offer'), { target: { value: 'toronto' } })
    // region 0 (was 10) → 70
    expect(total()).toBe('70')
  })

  it('shows Ontario work select when tenure in position is under 6 months', () => {
    renderOinp()
    expect(screen.queryByLabelText('Time working in Ontario')).toBeNull()
    fireEvent.change(answer('Time in job offer position'), { target: { value: 'less-6' } })
    expect(answer('Time working in Ontario')).toBeTruthy()
  })

  it('recent Ontario graduate determination does not change the score', () => {
    renderOinp()
    fillStandardProfile()
    expect(total()).toBe('80')
    fireEvent.click(control('switch', { name: /Recent Ontario graduate/ }))
    // eligibility-only determination, no points → total unchanged
    expect(total()).toBe('80')
  })

  it('shows the eligible banner for the standard profile', () => {
    renderOinp()
    fillStandardProfile()
    expect(screen.getByText('Initial checks passed')).toBeTruthy()
  })

  it('shows a not eligible banner with reasons when legal status is missing', () => {
    renderOinp()
    fillStandardProfile()
    fireEvent.change(answer('Legal status in Canada'), { target: { value: 'none' } })
    expect(screen.getByText('Requirements to review')).toBeTruthy()
    expect(screen.getByText(/must have valid legal status in Canada/)).toBeTruthy()
  })

  it('shows a not eligible banner with reasons for under 6 months in the position', () => {
    renderOinp()
    fillStandardProfile()
    fireEvent.change(answer('Time in job offer position'), { target: { value: 'less-6' } })
    expect(screen.getByText('Requirements to review')).toBeTruthy()
    expect(screen.getByText(/require at least 6 months of consecutive full-time work experience/)).toBeTruthy()
  })

  it('shows eligible again for a recent Ontario graduate with under 6 months in the position', () => {
    renderOinp()
    fillStandardProfile()
    fireEvent.change(answer('Time in job offer position'), { target: { value: 'less-6' } })
    expect(screen.getByText('Requirements to review')).toBeTruthy()
    fireEvent.click(control('switch', { name: /Recent Ontario graduate/ }))
    fireEvent.change(control('spinbutton', { name: /^Qualifying months/ }), { target: { value: '3' } })
    expect(screen.getByText('Initial checks passed')).toBeTruthy()
  })
})
