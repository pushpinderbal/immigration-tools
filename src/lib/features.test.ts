// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { aiChatEnabled } from './features'

afterEach(() => {
  localStorage.clear()
  vi.unstubAllEnvs()
})

describe('aiChatEnabled', () => {
  it('is enabled by default', () => {
    expect(aiChatEnabled()).toBe(true)
  })

  it('is disabled when the localStorage flag is off', () => {
    localStorage.setItem('ff:ai-chat', 'off')
    expect(aiChatEnabled()).toBe(false)
  })

  it('is enabled when the localStorage flag is set to anything else', () => {
    localStorage.setItem('ff:ai-chat', 'on')
    expect(aiChatEnabled()).toBe(true)
  })

  it('is disabled when VITE_FF_AI_CHAT is off', () => {
    vi.stubEnv('VITE_FF_AI_CHAT', 'off')
    expect(aiChatEnabled()).toBe(false)
  })

  it('is disabled when VITE_FF_AI_CHAT is 0', () => {
    vi.stubEnv('VITE_FF_AI_CHAT', '0')
    expect(aiChatEnabled()).toBe(false)
  })

  it('is disabled when VITE_FF_AI_CHAT is false', () => {
    vi.stubEnv('VITE_FF_AI_CHAT', 'false')
    expect(aiChatEnabled()).toBe(false)
  })
})
