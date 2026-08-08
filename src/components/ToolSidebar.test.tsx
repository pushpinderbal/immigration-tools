// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ToolSidebar } from './ToolSidebar'

afterEach(cleanup)

function renderSidebar(total = 1200, withDraws = false) {
  return render(
    <ToolSidebar
      label="Estimated score"
      total={total}
      max={1200}
      breakdown={<div>breakdown rows</div>}
      draws={withDraws ? <div>draw feed</div> : undefined}
    />,
  )
}

describe('ToolSidebar', () => {
  it('shows the total with a static Points breakdown tab', () => {
    renderSidebar()
    expect(screen.getByRole('status').textContent).toBe('1200')
    expect(screen.getByRole('button', { name: 'Points breakdown' })).toBeTruthy()
    expect(screen.getByText('breakdown rows')).toBeTruthy()
    expect(screen.queryByText('Historical draws')).toBeNull()
  })

  it('shows Breakdown and Historical draws tabs when draws are provided', () => {
    renderSidebar(1200, true)
    expect(screen.getByRole('button', { name: 'Breakdown' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Historical draws' })).toBeTruthy()
    expect(screen.getByText('breakdown rows')).toBeTruthy()
  })

  it('switches to the draws tab when selected', () => {
    renderSidebar(1200, true)
    fireEvent.click(screen.getByRole('button', { name: 'Historical draws' }))
    expect(screen.getByText('draw feed')).toBeTruthy()
    expect(screen.queryByText('breakdown rows')).toBeNull()
  })

  it("fills the pot's water proportionally to the total", () => {
    const { container } = renderSidebar(600)
    const water = container.querySelector('rect')
    expect(water).toBeTruthy()
    expect(water?.getAttribute('height')).toBe('16')
  })

  it('drips water in when the score rises and leaks it out when it falls', () => {
    const { container, rerender } = renderSidebar(600)
    rerender(
      <ToolSidebar label="Estimated score" total={900} max={1200} breakdown={<div>breakdown rows</div>} />,
    )
    expect(container.querySelector('.drip-in')).toBeTruthy()
    expect(container.querySelector('.drip-out')).toBeNull()
    rerender(
      <ToolSidebar label="Estimated score" total={300} max={1200} breakdown={<div>breakdown rows</div>} />,
    )
    expect(container.querySelector('.drip-out')).toBeTruthy()
    expect(container.querySelector('.drip-in')).toBeNull()
  })
})
