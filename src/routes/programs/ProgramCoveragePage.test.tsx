// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, it } from 'vitest'
import { ProgramCoveragePage } from './ProgramCoveragePage'

afterEach(cleanup)

it('shows all jurisdictions and distinguishes calculators from official guidance', () => {
  render(<MemoryRouter><ProgramCoveragePage /></MemoryRouter>)
  expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(13)
  expect(screen.getAllByRole('link', { name: 'Open calculator' })).toHaveLength(5)
  expect(screen.getAllByRole('link', { name: 'Official guide' })).toHaveLength(13)
  expect(screen.getByRole('heading', { name: 'Quebec' })).toBeTruthy()
  expect(screen.getByText(/Nunavut does not have a Provincial Nominee Program/)).toBeTruthy()
})
