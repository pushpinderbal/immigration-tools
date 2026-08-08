import { useState } from 'react'

const COMING_SOON =
  "A personalized analysis of your score is coming soon. When it's here, you can ask questions about your situation and get plain-language answers."

export function AiChat() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && (
        <section
          aria-label="AI analysis"
          className="fixed right-4 bottom-24 z-50 flex max-h-[min(28rem,calc(100vh-9rem))] w-80 flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_1px_3px_rgb(15_23_42/0.06)] sm:w-96"
        >
          <header className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="live-dot shrink-0" aria-hidden="true" />
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">AI analysis</h2>
              <span className="shrink-0 rounded-full border border-line px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">
                Coming soon
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close AI analysis"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-accent-soft hover:text-accent"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div className="flex flex-col gap-3 overflow-y-auto p-4">
            <div className="flex items-start gap-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 h-6 w-6 shrink-0 text-accent"
                aria-hidden="true"
              >
                <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
                <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
              </svg>
              <p className="text-sm leading-relaxed text-ink">{COMING_SOON}</p>
            </div>
            <input
              type="text"
              disabled
              aria-label="Ask about your score"
              placeholder="Ask about your score..."
              className="h-10 w-full rounded-lg border border-line bg-panel px-3 text-sm text-ink outline-none transition-shadow placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI analysis"
        aria-expanded={open}
        className="fixed right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-[0_4px_12px_rgb(0_52_120/0.35)] transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
          <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
        </svg>
      </button>
    </>
  )
}
