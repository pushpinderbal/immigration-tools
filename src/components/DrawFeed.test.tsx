// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DrawFeed } from './DrawFeed'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const ROUNDS_JSON = (rounds: Array<Record<string, unknown>>) => JSON.stringify({ rounds })

const INSTRUCTION_HREF =
  '/content/canadasite/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds/invitations.html?q=434'

const SAMPLE_ROUNDS: Array<Record<string, unknown>> = [
  {
    drawNumber: '434',
    drawNumberURL: `<a href='${INSTRUCTION_HREF}'>434</a>`,
    drawDateFull: 'August 7, 2026',
    drawName: 'Transport Occupations',
    drawSize: '300',
    drawCRS: '470',
    drawText2: 'Federal Skilled Worker Program, Canadian Experience Class and Federal Skilled Trades Program',
  },
  {
    drawNumber: '433',
    drawDateFull: 'July 24, 2026',
    drawName: 'Canadian Experience Class',
    drawSize: '1500',
    drawCRS: '510',
    drawText2: 'Canadian Experience Class',
  },
]

describe('DrawFeed', () => {
  it('renders the latest draws from the IRCC feed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(ROUNDS_JSON(SAMPLE_ROUNDS), { status: 200 })),
    )
    render(<DrawFeed />)
    expect(await screen.findByText('August 7, 2026')).toBeTruthy()
    expect(screen.getByText('#434')).toBeTruthy()
    expect(screen.getByText('470')).toBeTruthy()
    expect(screen.getByText('July 24, 2026')).toBeTruthy()
  })

  it('links each draw number to its ministerial instruction', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(ROUNDS_JSON(SAMPLE_ROUNDS), { status: 200 })),
    )
    render(<DrawFeed />)
    await screen.findByText('#434')
    const link = screen.getByRole('link', { name: /#434/ })
    expect(link.getAttribute('href')).toBe(
      'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds/invitations.html?q=434',
    )
  })

  it('reads a versioned feed URL from the IRCC page when the known feed misses', async () => {
    const versionedFeed = 'https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_456_en.json'
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === versionedFeed) {
        return Promise.resolve(new Response(ROUNDS_JSON(SAMPLE_ROUNDS), { status: 200 }))
      }
      if (url.includes('rounds-invitations.html')) {
        return Promise.resolve(
          new Response(
            `<div data-wb-jsonmanager="{ &quot;url&quot;: &quot;/content/dam/ircc/documents/json/ee_rounds_456_en.json&quot; }"></div>`,
            { status: 200 },
          ),
        )
      }
      return Promise.reject(new Error('not found'))
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<DrawFeed />)
    expect(await screen.findByText('August 7, 2026')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledWith(versionedFeed, expect.anything())
  })

  it('shows a fallback message when the feed cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
    render(<DrawFeed />)
    expect(await screen.findByText(/Couldn't load the latest draws/)).toBeTruthy()
  })

  it('links to the official IRCC rounds page', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(ROUNDS_JSON(SAMPLE_ROUNDS), { status: 200 })))
    render(<DrawFeed />)
    const link = screen.getByRole('link', { name: /View all on IRCC/ })
    expect(link.getAttribute('href')).toBe(
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html',
    )
  })
})
