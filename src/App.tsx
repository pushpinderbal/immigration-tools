import { useLayoutEffect, useRef } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { CalculatorChrome } from './components/CalculatorChrome'
import { GithubLogoIcon } from './components/icons'

const CALCULATOR_PATHS = new Set(['/crs', '/oinp', '/bc', '/alberta', '/manitoba', '/saskatchewan'])

export function App() {
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)
  const mainRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (previousPath.current !== pathname) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      mainRef.current?.focus({ preventScroll: true })
      previousPath.current = pathname
    }
  }, [pathname])

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <CalculatorChrome active={CALCULATOR_PATHS.has(pathname)}
        brand={<Link to="/" className="brand-lockup" aria-label="ImmiCalc home">
          <span className="brand-wordmark">ImmiCalc</span>
          <span className="brand-caption">Canadian immigration calculators</span>
        </Link>}
        navigation={<nav className="site-nav" aria-label="Main navigation">
          <Link to="/">Calculators</Link>
          <Link to="/programs">Program guide</Link>
          <a href="https://github.com/pushpinderbal/immigration-tools" target="_blank" rel="noreferrer" aria-label="View the source on GitHub"><GithubLogoIcon size={21} /></a>
        </nav>}>
        <main ref={mainRef} id="main-content" tabIndex={-1}><Outlet /></main>
      </CalculatorChrome>
      <footer className="site-footer">
        <p>Calculated in your browser. No account required.</p>
        <Link to="/programs">Official sources and program coverage</Link>
        <p>Independent of IRCC.</p>
      </footer>
    </div>
  )
}
