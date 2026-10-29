// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useCalculatorForm } from './useCalculatorForm'

afterEach(cleanup)

describe('useCalculatorForm', () => {
  it('retains both answers when updates are batched and tracks the first change', () => {
    const initial = { age: 30, education: '' }
    const { result } = renderHook(() => useCalculatorForm(initial))
    expect(result.current.hasStarted).toBe(false)

    act(() => {
      result.current.patch({ age: 31 })
      result.current.patch({ education: 'bachelor' })
    })

    expect(result.current.values).toEqual({ age: 31, education: 'bachelor' })
    expect(result.current.hasStarted).toBe(true)
    expect(initial).toEqual({ age: 30, education: '' })
  })
})
