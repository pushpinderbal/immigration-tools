// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { OinpTool } from '../../routes/oinp/OinpTool'

afterEach(cleanup)

const total = () => screen.getByRole('status').textContent

describe('OinpTool', () => {
  it('renders the score for the default input', () => {
    render(<OinpTool />)
    // labour 46 (teer6 + noc4 + wage10 + tenure12 + earnings4 + permit10)
    // + education 11 (bachelor6 + one credential5)
    // + language 13 (CLB7 ability8 + 1 language5)
    // + region 10 (eastern) = 80
    expect(total()).toBe('80')
  })

  it('awards 2-language points when a French test at CLB 6 is added', () => {
    render(<OinpTool />)
    fireEvent.click(screen.getByRole('button', { name: /Add French test/ }))
    // English CLB 7 + French NCLC 6 → 2 official languages (CLB 6 threshold)
    const frenchScores: Record<string, string> = { reading: '393', writing: '379', listening: '393', speaking: '422' }
    for (const [ability, score] of Object.entries(frenchScores)) {
      fireEvent.change(screen.getByLabelText(`French ${ability}`), { target: { value: score } })
    }
    // language: ability 8 (CLB 7) + 2-language 10 = 18 (was 13) → total 85
    expect(total()).toBe('85')
  })

  it('updates when the hourly wage changes', () => {
    render(<OinpTool />)
    const wage = screen.getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(wage, { target: { value: '50' } })
    // labour +5 → 85
    expect(total()).toBe('85')
  })

  it('updates when the region changes to Toronto', () => {
    render(<OinpTool />)
    fireEvent.change(screen.getByLabelText('Location of work in job offer'), { target: { value: 'toronto' } })
    // region 0 (was 10) → 70
    expect(total()).toBe('70')
  })

  it('shows Ontario work select when tenure in position is under 6 months', () => {
    render(<OinpTool />)
    expect(screen.queryByLabelText('Time working in Ontario')).toBeNull()
    fireEvent.change(screen.getByLabelText('Time in job offer position'), { target: { value: 'less-6' } })
    expect(screen.getByLabelText('Time working in Ontario')).toBeTruthy()
  })
})
