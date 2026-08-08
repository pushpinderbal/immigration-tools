// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from './App'

afterEach(cleanup)

function renderApp(initialEntry = '/crs') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="crs" element={<div>crs page</div>} />
          <Route path="oinp" element={<div>oinp page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('App header', () => {
  it('shows the wordmark and crawlable tool links', () => {
    renderApp('/crs')
    expect(screen.getByRole('link', { name: /s1ngh/ })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'CRS Calculator' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'OINP Points Calculator' })).toBeTruthy()
  })

  it('navigates via the header links', () => {
    renderApp('/crs')
    expect(screen.getByText('crs page')).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'OINP Points Calculator' }))
    expect(screen.getByText('oinp page')).toBeTruthy()
  })
})
