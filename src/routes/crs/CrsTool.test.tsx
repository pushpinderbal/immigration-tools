// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CrsTool } from '../../routes/crs/CrsTool'

vi.mock('../../components/DrawFeed', () => ({ DrawFeed: () => null }))

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-28T12:00:00-04:00'))
})
afterEach(() => { cleanup(); vi.useRealTimers() })

function renderCrs() {
  return render(
    <MemoryRouter>
      <CrsTool />
    </MemoryRouter>,
  )
}

const total = () => screen.getByRole('status').textContent

/** Fills the classic test profile: age 30, bachelor, English IELTS 6/6/6/6 (CLB 7). */
function fillStandardProfile() {
  fireEvent.change(screen.getByRole('slider'), { target: { value: '30' } })
  fireEvent.change(screen.getByLabelText('Highest level of education'), { target: { value: 'bachelor' } })
  fireEvent.change(screen.getByLabelText('English test'), { target: { value: 'ielts' } })
  for (const a of ['listening', 'reading', 'writing', 'speaking']) {
    fireEvent.change(screen.getByLabelText(`English ${a}`), { target: { value: '6.0' } })
  }
}

describe('CrsTool', () => {
  it('previews a qualifying high-wage offer without adding it to Canadian work points', () => {
    renderCrs()
    fillStandardProfile()
    fireEvent.change(screen.getByLabelText('Canadian work experience'), { target: { value: '1' } })
    expect(total()).toBe('359')
    fireEvent.change(screen.getByLabelText('Scoring rules'), { target: { value: 'from-2026-11-03' } })
    fireEvent.change(screen.getByLabelText('Job offer occupation (NOC)'), { target: { value: '10010' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /My offer meets IRCC/ }))
    expect(total()).toBe('419')
    fireEvent.change(screen.getByLabelText('Scoring rules'), { target: { value: 'before-2026-11-03' } })
    expect(total()).toBe('359')
  })

  it('supports mixed NOC experience and recalculates after removing a period', () => {
    renderCrs()
    fillStandardProfile()
    fireEvent.change(screen.getByLabelText('Canadian work experience'), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText('Scoring rules'), { target: { value: 'from-2026-11-03' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Canadian work period/ }))
    fireEvent.change(screen.getByLabelText('Work occupation 1 (NOC)'), { target: { value: '10010' } })
    fireEvent.change(screen.getByRole('spinbutton', { name: /^Qualifying months 1/ }), { target: { value: '6' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Canadian work period/ }))
    fireEvent.change(screen.getByLabelText('Work occupation 2 (NOC)'), { target: { value: '21232' } })
    fireEvent.change(screen.getByRole('spinbutton', { name: /^Qualifying months 2/ }), { target: { value: '6' } })
    expect(total()).toBe('399')
    fireEvent.click(screen.getByRole('button', { name: 'Remove work period 1' }))
    expect(total()).toBe('359')
  })

  it('defaults to the November rules once they take effect', () => {
    vi.setSystemTime(new Date('2026-11-03T12:00:00-05:00'))
    renderCrs()
    expect((screen.getByLabelText('Scoring rules') as HTMLSelectElement).value).toBe('from-2026-11-03')
    expect(screen.getByRole('heading', { name: /Labour market integration/ })).toBeTruthy()
  })
  it('starts blank with a zero score', () => {
    renderCrs()
    expect(total()).toBe('0')
  })

  it('renders the score for the standard profile', () => {
    renderCrs()
    fillStandardProfile()
    // age 30 single (105) + bachelor (120) + English CLB 7 x4 (68) = 293 core
    // + transferability (bachelor + CLB 7 = 13) = 306
    expect(total()).toBe('306')
  })

  it('updates the score when age changes', () => {
    renderCrs()
    fillStandardProfile()
    fireEvent.change(screen.getByRole('slider'), { target: { value: '26' } })
    // 110 + 120 + 68 = 298 core + 13 = 311
    expect(total()).toBe('311')
  })

  it('shows the spouse section and recalculates when an accompanying spouse is selected', () => {
    renderCrs()
    fillStandardProfile()
    expect(screen.queryByRole('heading', { name: 'Spouse or partner' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Spouse or partner' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }))
    expect(screen.getByRole('heading', { name: /Spouse or partner/ })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Spouse or partner' }).getAttribute('href')).toBe('#section-spouse-or-partner')
    // with-spouse core (95 + 112 + 64 = 271) + spouse (2) + transferability (13) = 286
    expect(total()).toBe('286')
  })

  it('awards the provincial nomination bonus', () => {
    renderCrs()
    fillStandardProfile()
    fireEvent.click(screen.getByRole('checkbox', { name: /Provincial nomination/ }))
    // 306 + 600 = 906
    expect(total()).toBe('906')
  })

  it('converts IELTS scores to CLB and scores accordingly', () => {
    renderCrs()
    fillStandardProfile()
    // listening 8.0 → CLB 9 (was CLB 7); other abilities stay CLB 7
    fireEvent.change(screen.getByLabelText('English listening'), { target: { value: '8.0' } })
    // core: 105 + 120 + (17+17+31+17) = 307; transferability 13 → 320
    expect(total()).toBe('320')
  })

  it('switching the first official language resets the other to not taken', () => {
    renderCrs()
    fillStandardProfile()
    fireEvent.click(screen.getByRole('button', { name: 'French' }))
    // French is now first: no English test → core language only from French (0)
    // age 105 + edu 120 = 225
    expect(total()).toBe('225')
  })
})
