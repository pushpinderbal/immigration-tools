import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ChromeSlot, ScoreActions } from './CalculatorChrome'
import { ChartBarIcon, ClockCounterClockwiseIcon, XIcon } from './icons'

function useAnimatedScore(value: number) {
  const [display, setDisplay] = useState(value)
  const current = useRef(value)
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced || !window.requestAnimationFrame) {
      current.current = value
      setDisplay(value)
      return
    }
    const from = current.current
    const start = performance.now()
    let frame = 0
    const update = (now: number) => {
      const progress = Math.max(0, Math.min(1, (now - start) / 240))
      const eased = 1 - (1 - progress) ** 3
      current.current = Math.round(from + (value - from) * eased)
      setDisplay(current.current)
      if (progress < 1) frame = window.requestAnimationFrame(update)
    }
    frame = window.requestAnimationFrame(update)
    return () => window.cancelAnimationFrame(frame)
  }, [value])
  return display
}

export function ToolSidebar({ label, total, max, breakdown, draws }: {
  label: string; total: number; max: number; breakdown: ReactNode; draws?: ReactNode
}) {
  const [active, setActive] = useState<'breakdown' | 'draws' | null>(null)
  const display = useAnimatedScore(total)
  return <aside className="tool-sidebar" aria-label="Score">
    <ChromeSlot name="score">
      <div className="live-score" aria-label={`${label}: ${total} of ${max}`}>
        <span className="live-score-label">Estimated score</span>
        <span className="live-score-number" aria-hidden="true">{display}</span>
        <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">{total}</span>
        <span className="live-score-max" aria-hidden="true">/ {max}</span>
      </div>
    </ChromeSlot>
    <ScoreActions>
      <div className="score-actions" role="group" aria-label="Score details">
        <button type="button" className="score-action" aria-label="Breakdown" aria-haspopup="dialog" onClick={() => setActive('breakdown')}>
          <ChartBarIcon size={21} aria-hidden="true" /><span>Score breakdown</span>
        </button>
        {draws !== undefined && <button type="button" className="score-action" aria-label="Historical draws" aria-haspopup="dialog" onClick={() => setActive('draws')}>
          <ClockCounterClockwiseIcon size={20} aria-hidden="true" /><span>Draw history</span>
        </button>}
      </div>
    </ScoreActions>
    <ScoreDetailsDialog open={active === 'breakdown'} onClose={() => setActive(null)} title="Score breakdown" label={label}>
      <p className="dialog-score"><strong>{total}</strong> / {max} points</p>
      {breakdown}
    </ScoreDetailsDialog>
    {draws !== undefined && <ScoreDetailsDialog open={active === 'draws'} onClose={() => setActive(null)} title="Draw history" label="Express Entry">{draws}</ScoreDetailsDialog>}
  </aside>
}

function ScoreDetailsDialog({ open, onClose, title, label, children }: {
  open: boolean; onClose: () => void; title: string; label: string; children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])
  return <dialog ref={ref} className="score-dialog" aria-labelledby={titleId}
    onCancel={(event) => { event.preventDefault(); onClose() }} onClose={onClose}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return
      const bounds = event.currentTarget.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
    }}>
    {open && <><header className="score-dialog-header"><div><p className="section-kicker">{label}</p><h2 id={titleId}>{title}</h2></div>
      <button type="button" className="dialog-close" aria-label={`Close ${title.toLowerCase()}`} autoFocus onClick={onClose}><XIcon size={22} /></button></header>
      <div className="score-dialog-body">{children}</div></>}
  </dialog>
}
