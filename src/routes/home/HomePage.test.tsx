// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { HomePage } from './HomePage'

afterEach(cleanup)

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  it('shows the heading and a link to the federal CRS calculator', () => {
    renderHome()
    expect(screen.getByRole('heading', { name: /Your PR Journey/ })).toBeTruthy()
    const crs = screen.getByRole('link', { name: /Express Entry \(CRS\)/ })
    expect(crs.getAttribute('href')).toBe('/crs')
  })

  it('renders the interactive map with clickable provinces', async () => {
    renderHome()
    const map = await screen.findByRole('img', { name: 'Map of Canada' })
    const paths = map.querySelectorAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(10)
  })

  it('highlights only the provinces with calculators as clickable links', async () => {
    renderHome()
    const map = await screen.findByRole('img', { name: 'Map of Canada' })
    const clickable = Array.from(map.querySelectorAll<SVGPathElement>('path[role="link"]'))
    const ariaLabels = clickable.map((p) => p.getAttribute('aria-label'))
    expect(ariaLabels).toContain('British Columbia: open calculator')
    expect(ariaLabels).toContain('Ontario: open calculator')
    expect(ariaLabels).not.toContain('Quebec: open calculator')
  })

  it('shows accurate availability on hover and keyboard focus', async () => {
    renderHome()
    const map = await screen.findByRole('img', { name: 'Map of Canada' })
    fireEvent.mouseEnter(map.querySelector('[aria-label="Quebec: no calculator yet"]')!)
    expect(screen.getByText('Quebec · No calculator available yet')).toBeTruthy()
    fireEvent.focus(screen.getByRole('link', { name: 'Ontario: open calculator' }))
    expect(screen.getByText('Ontario · Open calculator ↗')).toBeTruthy()
  })

  it('connects province list focus with the map highlight', async () => {
    renderHome()
    await screen.findByRole('img', { name: 'Map of Canada' })
    const ontario = screen.getByRole('link', { name: 'Ontario OINP' })
    fireEvent.focus(ontario)
    const mapProvince = screen.getByRole('link', { name: 'Ontario: open calculator' })
    expect(mapProvince.classList.contains('is-highlighted')).toBe(true)
    fireEvent.blur(ontario)
    expect(mapProvince.classList.contains('is-highlighted')).toBe(false)
    fireEvent.mouseEnter(mapProvince)
    expect(ontario.classList.contains('is-highlighted')).toBe(true)
  })
})
