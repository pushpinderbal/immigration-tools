import { useEffect, useState } from 'react'

interface Draw {
  drawNumber: string
  drawNumberHref?: string
  drawDate: string
  drawSize: string
  drawCRS: string
}

const ROUNDS_PAGE =
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html'
const KNOWN_FEED = 'https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json'
const FEED_URL_PATTERN = /\/content\/dam\/ircc\/documents\/json\/[a-z0-9_]+\.json/
const HREF_PATTERN = /href='([^']+)'/

/**
 * IRCC publishes the draw history as a JSON file on canada.ca with
 * permissive CORS, so we can read it straight from the browser. The file
 * name carries a version number, so when a fetch misses we re-read it from
 * the rounds page and try again.
 */
async function loadFeedUrl(): Promise<string> {
  const res = await fetch(ROUNDS_PAGE)
  if (!res.ok) throw new Error(`IRCC page responded ${res.status}`)
  const html = await res.text()
  const match = html.match(FEED_URL_PATTERN)
  if (!match) throw new Error('Could not find the draw data feed on the IRCC page')
  return `https://www.canada.ca${match[0]}`
}

async function fetchDraws(): Promise<Draw[]> {
  const feedUrl = KNOWN_FEED
  try {
    return parseDraws(await fetchFeed(feedUrl))
  } catch {
    return parseDraws(await fetchFeed(await loadFeedUrl()))
  }
}

async function fetchFeed(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Feed responded ${res.status}`)
  return res.json()
}

function parseDraws(data: unknown): Draw[] {
  const rounds = (data as { rounds?: Array<Record<string, unknown>> }).rounds ?? []
  return rounds.map((r) => {
    const href = String(r.drawNumberURL ?? '').match(HREF_PATTERN)?.[1]
    return {
      drawNumber: String(r.drawNumber ?? ''),
      drawNumberHref: href ? `https://www.canada.ca${href.replace('/content/canadasite', '')}` : undefined,
      drawDate: String(r.drawDateFull ?? r.drawDate ?? ''),
      drawSize: String(r.drawSize ?? ''),
      drawCRS: String(r.drawCRS ?? ''),
    }
  })
}

const SHOWN = 8

export function DrawFeed() {
  const [draws, setDraws] = useState<Draw[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = () => {
      fetchDraws()
        .then((d) => {
          if (!cancelled) {
            setDraws(d)
            setError(false)
          }
        })
        .catch(() => {
          if (!cancelled) setError(true)
        })
    }

    load()
    const onVisible = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return (
    <section
      aria-label="Recent Express Entry draws"
      className="overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_1px_3px_rgb(15_23_42/0.06)]"
    >
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          <span className="live-dot" aria-hidden="true" />
          Recent Express Entry draws
        </h2>
        <a
          href={ROUNDS_PAGE}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-xs font-medium text-accent hover:underline"
        >
          View all on IRCC
        </a>
      </div>

      {error ? (
        <p className="px-4 py-8 text-center text-sm text-muted">
          Couldn't load the latest draws. Check the{' '}
          <a href={ROUNDS_PAGE} target="_blank" rel="noreferrer" className="text-accent hover:underline">
            official IRCC page
          </a>
          .
        </p>
      ) : draws === null ? (
        <p className="px-4 py-8 text-center text-sm text-muted">Loading draws...</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                <th scope="col" className="px-4 py-2.5">
                  Draw
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Date
                </th>
                <th scope="col" className="px-4 py-2.5 text-right">
                  Cut-off
                </th>
                <th scope="col" className="px-4 py-2.5 text-right">
                  Invited
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {draws.slice(0, SHOWN).map((d) => (
                <tr key={d.drawNumber}>
                  <td className="px-4 py-3">
                    {d.drawNumberHref ? (
                      <a
                        href={d.drawNumberHref}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-accent hover:underline"
                      >
                        #{d.drawNumber}
                      </a>
                    ) : (
                      <span className="font-medium text-ink">#{d.drawNumber}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-muted">{d.drawDate}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-accent">
                    {d.drawCRS}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-ink">
                    {d.drawSize}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-line px-4 py-3">
            <p className="text-[11px] text-muted">
              Pulled straight from IRCC's published data. Each draw number links to its ministerial instruction.
            </p>
          </div>
        </>
      )}
    </section>
  )
}
