import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChromeSlot } from './CalculatorChrome'
import { CaretDownIcon, ArrowUpRightIcon } from './icons'
import { cn } from './ui'

const TOOLS = [
  { to: '/crs', id: 'crs', name: 'Express Entry / CRS' },
  { to: '/oinp', id: 'oinp', name: 'Ontario / OINP' },
  { to: '/bc', id: 'bc', name: 'British Columbia / BC PNP' },
  { to: '/saskatchewan', id: 'saskatchewan', name: 'Saskatchewan / SINP' },
  { to: '/alberta', id: 'alberta', name: 'Alberta / AAIP' },
  { to: '/manitoba', id: 'manitoba', name: 'Manitoba / MPNP' },
] as const

export function ToolTiles({ current }: { current?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const pointer = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false) }
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus() } }
    document.addEventListener('mousedown', pointer)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', pointer); document.removeEventListener('keydown', key) }
  }, [open])
  return <ChromeSlot name="program"><div className="tool-navigation" ref={ref}>
    <button type="button" className="tool-switcher" ref={trigger} aria-expanded={open} aria-label="Switch tool" onClick={() => setOpen(!open)}>
      <span>{TOOLS.find((tool) => tool.id === current)?.name ?? 'Select calculator'}</span><CaretDownIcon size={17} className={cn(open && 'is-open')} aria-hidden="true" />
    </button>
    {open && <nav aria-label="Tools" className="tool-menu">{TOOLS.map((tool) => <Link key={tool.id} to={tool.to}
      aria-current={tool.id === current ? 'page' : undefined} onClick={() => setOpen(false)}>{tool.name}<ArrowUpRightIcon size={16} /></Link>)}
      <Link to="/" onClick={() => setOpen(false)}>All calculators</Link><Link to="/programs" onClick={() => setOpen(false)}>Program guide</Link>
    </nav>}
  </div></ChromeSlot>
}
