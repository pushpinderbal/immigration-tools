// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from './App'
import { HomePage } from './routes/home/HomePage'

afterEach(cleanup)

function renderApp(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="crs" element={<div>crs page</div>} />
          <Route path="oinp" element={<div>oinp page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('shows the brand, the landing heading and the federal calculator link', () => {
    renderApp('/')
    expect(screen.getByRole('link', { name: /ImmiCalc/ })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Immigration Tools' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Express Entry \(CRS\)/ })).toBeTruthy()
  })

  it('navigates to a tool from the landing page', () => {
    renderApp('/')
    fireEvent.click(screen.getByRole('link', { name: /Express Entry \(CRS\)/ }))
    expect(screen.getByText('crs page')).toBeTruthy()
  })

  it('returns to the landing page from a tool via the brand', () => {
    renderApp('/crs')
    expect(screen.getByText('crs page')).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: /ImmiCalc/ }))
    expect(screen.getByRole('heading', { name: 'Immigration Tools' })).toBeTruthy()
  })
})
