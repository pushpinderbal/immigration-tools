import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MapleLeaf } from './MapleLeaf'
import { cn } from './ui'

interface Tool {
  to: string
  id: string
  name: string
  icon: ReactNode
}

const TOOLS: readonly Tool[] = [
  {
    to: '/crs',
    id: 'crs',
    name: 'CRS Calculator',
    icon: <MapleLeaf className="h-full w-full" />,
  },
  {
    to: '/oinp',
    id: 'oinp',
    name: 'OINP Points Calculator',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="6.5" r="3.2" />
        <circle cx="8.6" cy="12" r="3.2" />
        <circle cx="15.4" cy="12" r="3.2" />
        <path d="M12 14.6v4.4" />
      </svg>
    ),
  },
  {
    to: '/bc',
    id: 'bc',
    name: 'BC PNP Calculator',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 18 5-8 3.5 5 2.5-3.5L21 18H3Z" />
        <path d="M3 21h18" />
      </svg>
    ),
  },
  {
    to: '/saskatchewan',
    id: 'saskatchewan',
    name: 'SINP Calculator',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21V4" />
        <path d="M12 6c-3.2 0-3.2 3 0 3s3.2-3 0-3Z" />
        <path d="M12 11c-3.2 0-3.2 3 0 3s3.2-3 0-3Z" />
        <path d="M12 16c-3.2 0-3.2 3 0 3s3.2-3 0-3Z" />
      </svg>
    ),
  },
  {
    to: '/alberta',
    id: 'alberta',
    name: 'AAIP Calculator',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="9" r="2.6" />
        <circle cx="8.1" cy="11.9" r="2.6" />
        <circle cx="15.9" cy="11.9" r="2.6" />
        <circle cx="6.9" cy="6.6" r="2.6" />
        <circle cx="17.1" cy="6.6" r="2.6" />
      </svg>
    ),
  },
  {
    to: '/manitoba',
    id: 'manitoba',
    name: 'MPNP Calculator',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11Z" />
      </svg>
    ),
  },
]

/**
 * Compact tool switcher: a button that opens the full tool list on click.
 * Closes on outside click, Escape, or picking a tool.
 */
export function ToolTiles({ current }: { current?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2 text-sm font-medium text-ink shadow-[0_1px_3px_rgb(15_23_42/0.06)] transition-colors hover:border-accent/40"
      >
        <span className="text-muted">Switch tool</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn('h-3.5 w-3.5 text-muted transition-transform', open && 'rotate-180')}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <nav
          aria-label="Tools"
          className="absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl border border-line bg-panel p-1.5 shadow-[0_8px_24px_rgb(15_23_42/0.12)]"
        >
          {TOOLS.map((tool) => {
            const active = tool.id === current
            return (
              <Link
                key={tool.id}
                to={tool.to}
                viewTransition
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors',
                  active ? 'bg-accent-soft font-medium text-ink' : 'text-muted hover:bg-accent-soft/60 hover:text-ink',
                )}
              >
                <span className={cn('h-4 w-4 shrink-0', active ? 'text-accent' : 'text-muted')}>{tool.icon}</span>
                {tool.name}
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}
