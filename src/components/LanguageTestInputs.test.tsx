// @vitest-environment jsdom
import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ENGLISH_TESTS, FRENCH_TESTS, emptyScores } from '../lib/crs/languages'
import type { LanguageTestState } from '../lib/crs/languages'
import { OptionalLanguageTestInputs } from './LanguageTestInputs'

afterEach(cleanup)

function OptionalTest({ language }: { language: 'English' | 'French' }) {
  const [value, setValue] = useState<LanguageTestState>({ test: 'none', scores: emptyScores() })
  return <OptionalLanguageTestInputs
    title={language}
    addLabel={`Add ${language} test`}
    allowedTests={language === 'English' ? ENGLISH_TESTS : FRENCH_TESTS}
    value={value}
    onChange={setValue}
    help="https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-test.html"
  />
}

describe('OptionalLanguageTestInputs', () => {
  it.each(['English', 'French'] as const)('opens the %s test with the existing default, options and help', (language) => {
    render(<OptionalTest language={language} />)
    expect(screen.queryByLabelText(`${language} test`)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: `Add ${language} test` }))

    const test = screen.getByLabelText(`${language} test`) as HTMLSelectElement
    const allowed = language === 'English' ? ENGLISH_TESTS : FRENCH_TESTS
    expect(test.value).toBe(allowed[0])
    expect(Array.from(test.options, (option) => option.value)).toEqual(['none', ...allowed])
    expect(screen.getByRole('link', { name: `${language}: official documentation` }).getAttribute('href')).toContain('canada.ca')
  })

  it('clears scores when changing tests and starts fresh after removing and re-adding a test', () => {
    render(<OptionalTest language="French" />)
    fireEvent.click(screen.getByRole('button', { name: 'Add French test' }))
    fireEvent.change(screen.getByLabelText('French listening'), { target: { value: '434' } })
    fireEvent.change(screen.getByLabelText('French test'), { target: { value: 'tcf' } })
    expect((screen.getByLabelText('French listening') as HTMLInputElement).value).toBe('')
    fireEvent.change(screen.getByLabelText('French speaking'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('French test'), { target: { value: 'none' } })
    expect(screen.queryByLabelText('French speaking')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Add French test' }))
    expect((screen.getByLabelText('French test') as HTMLSelectElement).value).toBe('tef')
    for (const ability of ['listening', 'reading', 'writing', 'speaking']) {
      expect((screen.getByLabelText(`French ${ability}`) as HTMLInputElement).value).toBe('')
    }
  })
})
