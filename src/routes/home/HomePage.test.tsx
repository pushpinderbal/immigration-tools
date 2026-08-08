// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
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
    expect(screen.getByRole('heading', { name: 'Immigration tools' })).toBeTruthy()
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
})
