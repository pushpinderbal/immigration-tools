// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterAll, beforeAll, afterEach, describe, expect, it } from 'vitest'
import { ToolSidebar } from './ToolSidebar'

afterEach(cleanup)

// JSDOM does not implement the native dialog methods.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
  }
})
afterAll(() => {
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
})

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
  it('shows the total with a Breakdown tab that is collapsed by default', () => {
    renderSidebar()
    expect(screen.getByRole('status').textContent).toBe('1200')
    expect(screen.getByRole('button', { name: 'Breakdown' })).toBeTruthy()
    expect(screen.queryByText('breakdown rows')).toBeNull()
    expect(screen.queryByText('Historical draws')).toBeNull()
  })

  it('opens the breakdown in a dialog and closes it without changing the score', () => {
    renderSidebar()
    fireEvent.click(screen.getByRole('button', { name: 'Breakdown' }))
    expect(screen.getByText('breakdown rows')).toBeTruthy()
    expect(screen.getByRole('dialog', { name: 'Score breakdown' })).toBeTruthy()
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.click(screen.getByRole('button', { name: 'Close score breakdown' }))
    expect(screen.queryByText('breakdown rows')).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    expect(screen.getByRole('status').textContent).toBe('1200')
  })

  it('shows Breakdown and Historical draws tabs when draws are provided', () => {
    renderSidebar(1200, true)
    expect(screen.getByRole('button', { name: 'Breakdown' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Historical draws' })).toBeTruthy()
    expect(screen.queryByText('breakdown rows')).toBeNull()
  })

  it('opens independent detail panels without a tab switcher', () => {
    renderSidebar(600, true)
    fireEvent.click(screen.getByRole('button', { name: 'Historical draws' }))
    expect(screen.getByRole('dialog', { name: 'Draw history' })).toBeTruthy()
    expect(screen.queryByRole('group', { name: 'Detail view' })).toBeNull()
    expect(screen.queryByText('breakdown rows')).toBeNull()
    expect(screen.getByText('draw feed')).toBeTruthy()
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    fireEvent.click(screen.getByRole('button', { name: 'Breakdown' }))
    expect(screen.getByRole('dialog', { name: 'Score breakdown' })).toBeTruthy()
    expect(screen.queryByText('draw feed')).toBeNull()
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
    rerender(<ToolSidebar label="Estimated score" total={900} max={1200} breakdown={<div>breakdown rows</div>} />)
    expect(container.querySelector('.drip-in')).toBeTruthy()
    expect(container.querySelector('.drip-out')).toBeNull()
    rerender(<ToolSidebar label="Estimated score" total={300} max={1200} breakdown={<div>breakdown rows</div>} />)
    expect(container.querySelector('.drip-out')).toBeTruthy()
    expect(container.querySelector('.drip-in')).toBeNull()
  })
})
