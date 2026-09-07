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
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="tool-navigation">
      <Link to="/" className="back-link">
        ← All calculators
      </Link>
      <div ref={ref} className="relative inline-block">
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-label="Switch tool"
          onClick={() => setOpen((o) => !o)}
          className="tool-switcher"
        >
          <span>{TOOLS.find((tool) => tool.id === current)?.name ?? 'Switch tool'}</span>
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
            className="tool-menu absolute right-0 top-full z-20 mt-2 w-72 max-w-[calc(100vw-2rem)]"
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
                  className={cn('tool-menu-link', active && 'is-active')}
                >
                  <span className={cn('h-4 w-4 shrink-0', active ? 'text-accent' : 'text-muted')}>{tool.icon}</span>
                  <span className="tool-menu-label">{tool.name}</span>
                </Link>
              )
            })}
          </nav>
        )}
      </div>
    </div>
  )
}
