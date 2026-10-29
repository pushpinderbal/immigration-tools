import { useCallback, useState } from 'react'

export function useCalculatorForm<T extends object>(initialValues: T) {
  const [values, setValues] = useState(initialValues)
  const [hasStarted, setHasStarted] = useState(false)

  const patch = useCallback((changes: Partial<T>) => {
    setHasStarted(true)
    setValues((previous) => ({ ...previous, ...changes }))
  }, [])

  return { values, patch, hasStarted }
}
