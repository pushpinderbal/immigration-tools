import { answer, control } from '../../test/calculator'
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

const total = () => control('status').textContent

/** Fills the classic test profile: bachelor, English IELTS 6 (CLB 6), 12+ months experience, age 30. */
function fillStandardProfile() {
  fireEvent.change(answer('Highest level of education'), { target: { value: 'bachelor' } })
  fireEvent.change(answer('Total work experience'), { target: { value: 'over-12' } })
  fireEvent.change(control('slider', { name: 'Age' }), { target: { value: '30' } })
  fireEvent.change(answer('English test'), { target: { value: 'ielts' } })
  for (const a of ['listening', 'reading', 'writing', 'speaking']) {
    fireEvent.change(answer(`English ${a}`), { target: { value: '6.0' } })
  }
}

describe('AlbertaTool', () => {
  it('waits for an answer before showing eligibility', () => {
    renderAlberta()
    expect(screen.queryByText('Requirements to review')).toBeNull()
    expect(screen.queryByText('Initial checks passed')).toBeNull()
    const education = answer('Highest level of education')
    fireEvent.focus(education)
    expect(screen.queryByText('Requirements to review')).toBeNull()
    fireEvent.change(education, { target: { value: 'bachelor' } })
    expect(screen.getByText('Requirements to review')).toBeTruthy()
  })

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
    fireEvent.change(answer('Highest level of education'), { target: { value: 'doctorate' } })
    // education 7 → 12 → total 38
    expect(total()).toBe('38')
  })

  it('awards family connection points when the checkbox is checked', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.click(control('switch', { name: /Family connection/ }))
    // +8 → 41
    expect(total()).toBe('41')
  })

  it('awards regulated occupation points when the checkbox is checked', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.click(control('switch', { name: /Regulated occupation/ }))
    expect(total()).toBe('33')
    fireEvent.click(control('switch', { name: /Permanent full-time job offer/ }))
    expect(total()).toBe('53')
  })

  it('awards permanent full-time job offer points when the checkbox is checked', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.click(control('switch', { name: /Permanent full-time job offer/ }))
    // +10 → 43
    expect(total()).toBe('43')
  })

  it('awards rural or sector job offer points from the select', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.change(answer('Job offer to work in select Alberta rural communities or sector'), {
      target: { value: 'rural-renewal' },
    })
    // +6 → 39
    expect(total()).toBe('39')
  })

  it('permanent offer and rural endorsement stack', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.click(control('switch', { name: /Permanent full-time job offer/ }))
    fireEvent.change(answer('Job offer to work in select Alberta rural communities or sector'), {
      target: { value: 'rural-renewal' },
    })
    // +10 +6 = 16 job offer → total 49
    expect(total()).toBe('49')
  })

  it('awards bilingual bonus when a French test at CLB 4+ is added and bilingual is checked', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.click(control('button', { name: /Add French test/ }))
    // English CLB 6 + French NCLC 6 → bilingual (CLB 4 threshold)
    const frenchScores: Record<string, string> = { reading: '393', writing: '379', listening: '393', speaking: '422' }
    for (const [ability, score] of Object.entries(frenchScores)) {
      fireEvent.change(answer(`French ${ability}`), { target: { value: score } })
    }
    // language: 10 (English) + 3 bilingual = 13 (was 10) → total 36
    expect(total()).toBe('36')
  })

  it('checks the WEOI language floor without inventing a universal job-offer requirement', () => {
    renderAlberta()
    fillStandardProfile()
    expect(screen.getByText('Initial checks passed')).toBeTruthy()
  })

  it('shows an eligible banner once a permanent full-time job offer is selected', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.click(control('switch', { name: /Permanent full-time job offer/ }))
    expect(screen.getByText('Initial checks passed')).toBeTruthy()
  })

  it('shows an eligible banner with a select rural or sector job offer', () => {
    renderAlberta()
    fillStandardProfile()
    fireEvent.change(answer('Job offer to work in select Alberta rural communities or sector'), {
      target: { value: 'rural-renewal' },
    })
    expect(screen.getByText('Initial checks passed')).toBeTruthy()
  })
})
