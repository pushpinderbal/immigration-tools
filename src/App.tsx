import { Link, NavLink, Outlet } from 'react-router-dom'
import { cn } from './components/ui'

const NAV = [
  { to: '/crs', label: 'CRS Calculator' },
  { to: '/oinp', label: 'OINP Points Calculator' },
]

export function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/crs" className="font-mono text-sm font-medium tracking-tight text-ink">
            s1ngh.ca<span className="text-muted">/tools</span>
          </Link>
          <nav aria-label="Tools" className="flex items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-2.5 py-1.5 text-sm transition-colors',
                    isActive ? 'bg-accent-soft font-medium text-ink' : 'text-muted hover:text-ink',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-panel">
        <div className="mx-auto flex h-11 w-full max-w-6xl items-center justify-center px-4 sm:px-6">
          <p className="font-mono text-xs text-muted">Estimates only — verify with official sources</p>
        </div>
      </footer>
    </div>
  )
}
