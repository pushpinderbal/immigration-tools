// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AlbertaTool } from './AlbertaTool'

vi.mock('../../components/DrawFeed', () => ({ DrawFeed: () => null }))

afterEach(cleanup)

function renderAlberta() {
  return render(
    <MemoryRouter>
      <AlbertaTool />
    </MemoryRouter>,
  )
}

const total = () => screen.getByRole('status').textContent

/** Fills the classic test profile: bachelor, English IELTS 6 (CLB 6), 12+ months experience, age 30. */
function fillStandardProfile() {
  fireEvent.change(screen.getByLabelText('Highest level of education'), { target: { value: 'bachelor' } })
  fireEvent.change(screen.getByLabelText('Total work experience'), { target: { value: 'over-12' } })
  fireEvent.change(screen.getByRole('slider'), { target: { value: '30' } })
  fireEvent.change(screen.getByLabelText('English test'), { target: { value: 'ielts' } })
  for (const a of ['listening', 'reading', 'writing', 'speaking']) {
    fireEvent.change(screen.getByLabelText(`English ${a}`), { target: { value: '6.0' } })
  }
}

describe('AlbertaTool', () => {
  it('starts blank with a near-zero score', () => {
    renderAlberta()
    // experience 3 (less-6 fallback) + age 3 (18, slider minimum) = 6
    expect(total()).toBe('6')
  })

  it('renders the score for the standard profile', () => {
    renderAlberta()
    fillStandardProfile()
    // education 7 (bachelor) + language 10 (English CLB 6)
    // + experience 11 (12+ months) + age 5 = 33
    expect(total()).toBe('33')
  })

  it('updates when the education level changes to doctorate', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.change(screen.getByLabelText('Highest level of education'), { target: { value: 'doctorate' } })
    // education 7 → 12 → total 38
    expect(total()).toBe('38')
  })

  it('awards family connection points when the checkbox is checked', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.click(screen.getByRole('checkbox', { name: /Family connection/ }))
    // +8 → 41
    expect(total()).toBe('41')
  })

  it('awards regulated occupation points when the checkbox is checked', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.click(screen.getByRole('checkbox', { name: /Regulated occupation/ }))
    // +10 → 43
    expect(total()).toBe('43')
  })

  it('awards permanent full-time job offer points when the checkbox is checked', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.click(screen.getByRole('checkbox', { name: /Permanent full-time job offer/ }))
    // +10 → 43
    expect(total()).toBe('43')
  })

  it('awards rural or sector job offer points from the select', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.change(screen.getByLabelText('Job offer to work in select Alberta rural communities or sector'), {
      target: { value: 'rural-renewal' },
    })
    // +6 → 39
    expect(total()).toBe('39')
  })

  it('permanent offer and rural endorsement stack', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.click(screen.getByRole('checkbox', { name: /Permanent full-time job offer/ }))
    fireEvent.change(screen.getByLabelText('Job offer to work in select Alberta rural communities or sector'), {
      target: { value: 'rural-renewal' },
    })
    // +10 +6 = 16 job offer → total 49
    expect(total()).toBe('49')
  })

  it('awards bilingual bonus when a French test at CLB 4+ is added and bilingual is checked', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.click(screen.getByRole('button', { name: /Add French test/ }))
    // English CLB 6 + French NCLC 6 → bilingual (CLB 4 threshold)
    const frenchScores: Record<string, string> = { reading: '393', writing: '379', listening: '393', speaking: '422' }
    for (const [ability, score] of Object.entries(frenchScores)) {
      fireEvent.change(screen.getByLabelText(`French ${ability}`), { target: { value: score } })
    }
    fireEvent.click(screen.getByRole('checkbox', { name: /Bilingual/ }))
    // language: 10 (English) + 3 bilingual = 13 (was 10) → total 36
    expect(total()).toBe('36')
  })

  it('flags the standard profile as not eligible without a job offer', () => {
    renderAlberta()
    fillStandardProfile()
    expect(screen.getByText('Not eligible yet')).toBeTruthy()
    expect(screen.getByText(/full-time job offer or employment contract/)).toBeTruthy()
  })

  it('shows an eligible banner once a permanent full-time job offer is selected', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.click(screen.getByRole('checkbox', { name: /Permanent full-time job offer/ }))
    expect(screen.getByText('You appear eligible')).toBeTruthy()
  })

  it('shows an eligible banner with a select rural or sector job offer', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.change(screen.getByLabelText('Job offer to work in select Alberta rural communities or sector'), {
      target: { value: 'rural-renewal' },
    })
    expect(screen.getByText('You appear eligible')).toBeTruthy()
  })
})
