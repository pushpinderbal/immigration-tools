import { Link, Outlet } from 'react-router-dom'
import { MapleLeaf } from './components/MapleLeaf'
import { AiChat } from './components/AiChat'
import { aiChatEnabled } from './lib/features'

export function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
            <MapleLeaf className="h-4 w-4 text-accent" />
            ImmiCalc
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-panel">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-1 px-4 py-4 text-center sm:px-6">
          <p className="text-xs text-muted">
            Results are estimates. Confirm anything important against the official IRCC or provincial pages.
          </p>
          <p className="text-xs text-muted">
            Not affiliated with IRCC, Canada.ca, or any organization. Non-profit.
          </p>
        </div>
      </footer>

      {aiChatEnabled() && <AiChat />}
    </div>
  )
}
