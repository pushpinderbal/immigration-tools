// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AiChat } from './AiChat'

afterEach(() => {
  cleanup()
})

describe('AiChat', () => {
  it('renders the launcher button by default', () => {
    render(<AiChat />)
    expect(screen.getByRole('button', { name: 'Open AI analysis' })).toBeTruthy()
    expect(screen.queryByText(/coming soon/i)).toBeNull()
  })

  it('opens the panel with the coming-soon message when clicked', () => {
    render(<AiChat />)
    fireEvent.click(screen.getByRole('button', { name: 'Open AI analysis' }))
    expect(screen.getByText(/^Coming soon$/)).toBeTruthy()
    expect(
      screen.getByText(/a personalized analysis of your score is coming soon/i),
    ).toBeTruthy()
  })

  it('closes the panel when the close button is clicked', () => {
    render(<AiChat />)
    fireEvent.click(screen.getByRole('button', { name: 'Open AI analysis' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close AI analysis' }))
    expect(screen.queryByText(/a personalized analysis of your score is coming soon/i)).toBeNull()
  })
})
