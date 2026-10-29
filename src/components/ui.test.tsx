// @vitest-environment jsdom
import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { FormSections, Section, Slider } from './ui'

afterEach(cleanup)

function AnswerFixture() {
  const [age, setAge] = useState(30)
  return <FormSections>
    <Section title="Profile" summary={`${age} years`}><Slider label="Age" min={17} max={60} value={age} onChange={setAge} /></Section>
    <Section title="Language"><p>Language controls</p></Section>
    <Section title="Experience"><p>Experience controls</p></Section>
  </FormSections>
}

describe('answer workspace', () => {
  it('uses arrow keys, Home and End for direct tab navigation', () => {
    render(<AnswerFixture />)
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Profile' }), { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: 'Language' }).getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Language' }))
    fireEvent.keyDown(document.activeElement!, { key: 'End' })
    expect(screen.getByRole('tab', { name: 'Experience' }).getAttribute('aria-selected')).toBe('true')
    fireEvent.keyDown(document.activeElement!, { key: 'Home' })
    expect(screen.getByRole('slider', { name: 'Age' })).toBeTruthy()
  })

  it('keeps answers when changing sections and allows summary-based editing', () => {
    render(<AnswerFixture />)
    fireEvent.change(screen.getByRole('slider', { name: 'Age' }), { target: { value: '35' } })
    fireEvent.click(screen.getByRole('tab', { name: 'Experience' }))
    expect(screen.queryByRole('slider', { name: 'Age' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Edit Profile' }))
    expect((screen.getByRole('spinbutton', { name: 'Age value' }) as HTMLInputElement).value).toBe('35')
  })

  it('permits clearing and retyping a numeric value without clamping partial input', () => {
    render(<AnswerFixture />)
    const number = screen.getByRole('spinbutton', { name: 'Age value' }) as HTMLInputElement
    fireEvent.change(number, { target: { value: '' } })
    fireEvent.change(number, { target: { value: '3' } })
    expect(number.value).toBe('3')
    expect((screen.getByRole('slider', { name: 'Age' }) as HTMLInputElement).value).toBe('30')
    fireEvent.change(number, { target: { value: '34' } })
    expect((screen.getByRole('slider', { name: 'Age' }) as HTMLInputElement).value).toBe('34')
    fireEvent.blur(number)
    expect(number.value).toBe('34')
  })
})
