import { fireEvent, screen } from '@testing-library/react'

/** Navigate to an answer's tab before interacting, as a user would. */
export function answer(label: string | RegExp): HTMLElement {
  const element = screen.getByLabelText(label)
  const panel = element.closest<HTMLElement>('[role="tabpanel"]')
  if (panel?.hidden) {
    const tab = document.getElementById(panel.getAttribute('aria-labelledby') ?? '')
    if (tab) fireEvent.click(tab)
  }
  return element
}

export function control(...args: Parameters<typeof screen.getByRole>): HTMLElement {
  const visible = screen.queryByRole(...args)
  if (visible) return visible
  for (const tab of screen.queryAllByRole('tab')) {
    fireEvent.click(tab)
    const element = screen.queryByRole(...args)
    if (element) return element
  }
  return screen.getByRole(...args)
}
