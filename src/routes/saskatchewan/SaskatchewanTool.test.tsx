// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SaskatchewanTool } from './SaskatchewanTool'

vi.mock('../../components/DrawFeed', () => ({ DrawFeed: () => null }))

afterEach(cleanup)

function renderSask() {
  return render(
    <MemoryRouter>
      <SaskatchewanTool />
    </MemoryRouter>,
  )
}

const total = () => {
  // ToolSidebar shows the live total; ScoreCard breakdown also emits an empty status span.
  const statuses = screen.getAllByRole('status')
  const live = statuses.find((el) => el.textContent && el.textContent.trim() !== '')
  return live?.textContent ?? null
}

/** Fills the classic test profile: bachelor, 3 yrs work, 2 yrs prior, age 30, English IELTS 6 (CLB 7), family relative. */
function fillStandardProfile() {
  fireEvent.change(screen.getByLabelText('Highest level of education or training'), { target: { value: 'bachelor' } })
  fireEvent.change(screen.getByLabelText('Skilled work experience (last 5 years)'), { target: { value: '3' } })
  fireEvent.change(screen.getByLabelText('Skilled work experience (6-10 years prior)'), { target: { value: '2' } })
  fireEvent.change(screen.getByLabelText('Age'), { target: { value: '30' } })
  fireEvent.change(screen.getByLabelText('English (first official language) test'), { target: { value: 'ielts' } })
  for (const a of ['listening', 'reading', 'writing', 'speaking']) {
    fireEvent.change(screen.getByLabelText(`English (first official language) ${a}`), { target: { value: '6.0' } })
  }
  fireEvent.click(screen.getByRole('checkbox', { name: /Close family relative in Saskatchewan/ }))
}

describe('SaskatchewanTool', () => {
  it('starts blank with a near-zero score', () => {
    renderSask()
    // education 12 (certificate, lowest band) is the only points-bearing fallback
    expect(total()).toBe('12')
  })

  it('renders the score for the standard profile', () => {
    renderSask()
    fillStandardProfile()
    // education 20 (bachelor) + work 6 (3 yrs) + prior work 2 (2 yrs 6-10 ago)
    // + language 18 (IELTS 6 → CLB 7) + age 12 (30) + connection 20 (family) = 78
    expect(total()).toBe('78')
  })

  it('updates when the age changes', () => {
    renderSask()
    fillStandardProfile()
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '40' } })
    // age 10 (was 12) → 76
    expect(total()).toBe('76')
  })

  it('updates when the work experience changes', () => {
    renderSask()
    fillStandardProfile()
    fireEvent.change(screen.getByLabelText('Skilled work experience (last 5 years)'), { target: { value: '5' } })
    // work 10 (was 6) → 82
    expect(total()).toBe('82')
  })

  it('updates when the prior work experience changes', () => {
    renderSask()
    fillStandardProfile()
    fireEvent.change(screen.getByLabelText('Skilled work experience (6-10 years prior)'), { target: { value: '5' } })
    // prior work 5 (was 2) → 81
    expect(total()).toBe('81')
  })

  it('removes family points when the relative box is unchecked', () => {
    renderSask()
    fillStandardProfile()
    fireEvent.click(screen.getByRole('checkbox', { name: /Close family relative in Saskatchewan/ }))
    // connection 0 (was 20) → 58
    expect(total()).toBe('58')
  })

  it('awards the full 30 points for an Employment Offer', () => {
    renderSask()
    fillStandardProfile()
    fireEvent.click(screen.getByRole('button', { name: 'Employment Offer' }))
    // connection 0 (no job offer yet) → 58
    expect(total()).toBe('58')
    fireEvent.click(screen.getByRole('checkbox', { name: /High-skilled job offer/ }))
    // connection 30 → 88
    expect(total()).toBe('88')
  })

  it('adds second-language points when a French test at CLB 6 is added', () => {
    renderSask()
    fillStandardProfile()
    fireEvent.click(screen.getByRole('button', { name: /Add second language test/ }))
    const frenchScores: Record<string, string> = { reading: '393', writing: '379', listening: '393', speaking: '422' }
    for (const [ability, score] of Object.entries(frenchScores)) {
      fireEvent.change(screen.getByLabelText(`French (second official language) ${ability}`), { target: { value: score } })
    }
    // language 24 (18 first + 6 second) → 84
    expect(total()).toBe('84')
  })

  it('shows the eligible banner for the standard profile', () => {
    renderSask()
    fillStandardProfile()
    expect(screen.getByText('You appear eligible')).toBeTruthy()
    expect(screen.queryByText('Not eligible yet')).toBeNull()
  })

  it('shows the not eligible banner with reasons when criteria are not met', () => {
    renderSask()
    fillStandardProfile()
    fireEvent.change(screen.getByLabelText('Skilled work experience (last 5 years)'), { target: { value: '0' } })
    fireEvent.change(screen.getByLabelText('Skilled work experience (6-10 years prior)'), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /Close family relative in Saskatchewan/ }))
    // points 50 (below 60) and no work experience both fail; language stays at CLB 7
    expect(screen.getByText('Not eligible yet')).toBeTruthy()
    expect(screen.getByText(/You must score at least 60 points/)).toBeTruthy()
    expect(screen.getByText(/one year of full-time paid work experience/)).toBeTruthy()
  })

  it('keeps the eligible banner for an Employment Offer with a job offer', () => {
    renderSask()
    fillStandardProfile()
    fireEvent.click(screen.getByRole('button', { name: 'Employment Offer' }))
    fireEvent.click(screen.getByRole('checkbox', { name: /High-skilled job offer/ }))
    expect(screen.getByText('You appear eligible')).toBeTruthy()
  })
})
