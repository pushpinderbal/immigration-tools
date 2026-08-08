// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CrsTool } from '../../routes/crs/CrsTool'

afterEach(cleanup)

const total = () => screen.getByRole('status').textContent

describe('CrsTool', () => {
  it('renders the score for the default input', () => {
    render(<CrsTool />)
    // age 30 single (105) + bachelor (120) + English CLB 7 x4 (68) = 293 core
    // + transferability (bachelor + CLB 7 = 13) = 306
    expect(total()).toBe('306')
  })

  it('updates the score when age changes', () => {
    render(<CrsTool />)
    const age = screen.getByRole('slider')
    fireEvent.change(age, { target: { value: '26' } })
    // 110 + 120 + 68 = 298 core + 13 = 311
    expect(total()).toBe('311')
  })

  it('shows the spouse section and recalculates when an accompanying spouse is selected', () => {
    render(<CrsTool />)
    expect(screen.queryByText('Spouse or partner')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }))
    expect(screen.getByText('Spouse or partner')).toBeTruthy()
    // with-spouse core (95 + 112 + 64 = 271) + spouse (2) + transferability (13) = 286
    expect(total()).toBe('286')
  })

  it('awards the provincial nomination bonus', () => {
    render(<CrsTool />)
    fireEvent.click(screen.getByLabelText('Provincial nomination'))
    // 306 + 600 = 906
    expect(total()).toBe('906')
  })

  it('converts IELTS scores to CLB and scores accordingly', () => {
    render(<CrsTool />)
    // listening 8.0 → CLB 9 (was CLB 7); other abilities stay CLB 7
    const listening = screen.getByLabelText('English listening') as HTMLSelectElement
    fireEvent.change(listening, { target: { value: '8.0' } })
    // core: 105 + 120 + (17+17+31+17) = 307; transferability 13 → 320
    expect(total()).toBe('320')
  })

  it('switching the first official language resets the other to not taken', () => {
    render(<CrsTool />)
    fireEvent.click(screen.getByRole('button', { name: 'French' }))
    // French is now first: no English test → core language only from French (0) 
    // age 105 + edu 120 = 225
    expect(total()).toBe('225')
  })
})
