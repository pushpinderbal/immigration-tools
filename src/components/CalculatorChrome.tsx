import { createContext, useContext, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ChromeSlots {
  program: HTMLElement | null
  score: HTMLElement | null
  rules: HTMLElement | null
}

const ChromeContext = createContext<ChromeSlots>({ program: null, score: null, rules: null })

export function CalculatorChrome({ brand, navigation, children, active }: {
  brand: ReactNode
  navigation: ReactNode
  children: ReactNode
  active: boolean
}) {
  const [program, setProgram] = useState<HTMLDivElement | null>(null)
  const [score, setScore] = useState<HTMLDivElement | null>(null)
  const [rules, setRules] = useState<HTMLDivElement | null>(null)
  return (
    <ChromeContext.Provider value={{ program, score, rules }}>
      <header className={`site-header${active ? ' has-calculator' : ''}`}>
        <div className="site-header-inner">
          {brand}
          {active ? <>
            <div className="header-program" ref={setProgram} />
            <div className="header-rules" ref={setRules} />
            <div className="header-score" ref={setScore} />
          </> : navigation}
        </div>
      </header>
      {children}
    </ChromeContext.Provider>
  )
}

export function ChromeSlot({ name, children }: { name: keyof ChromeSlots; children: ReactNode }) {
  const slots = useContext(ChromeContext)
  return slots[name] ? createPortal(children, slots[name]) : <div className={`chrome-fallback chrome-${name}`}>{children}</div>
}

interface WorkspaceSlots {
  actions: HTMLDivElement | null
  setActions: (element: HTMLDivElement | null) => void
}
const WorkspaceContext = createContext<WorkspaceSlots>({ actions: null, setActions: () => {} })

export function ToolWorkspace({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<HTMLDivElement | null>(null)
  return <WorkspaceContext.Provider value={{ actions, setActions }}>
    <div className="tool-workspace">{children}</div>
  </WorkspaceContext.Provider>
}

export function ScoreActionsSlot() {
  const { setActions } = useContext(WorkspaceContext)
  return <div className="receipt-actions" ref={setActions} />
}

export function ScoreActions({ children }: { children: ReactNode }) {
  const { actions } = useContext(WorkspaceContext)
  return actions ? createPortal(children, actions) : <div className="score-actions-fallback">{children}</div>
}
