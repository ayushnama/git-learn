import { useEffect, useRef } from 'react'

export default function useDialog(open, onClose) {
  const dialog = useRef(null)
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    if (!open || !dialog.current) return
    const element = dialog.current
    const previous = document.activeElement
    const bodyOverflow = document.body.style.overflow
    const htmlOverflow = document.documentElement.style.overflow
    const background = [...document.body.children].filter((child) => child !== element).map((child) => [child, child.inert])
    background.forEach(([child]) => { child.inert = true })
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    const focusable = () => [...element.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter((node) => node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden')
    const keydown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); return }
      if (event.key !== 'Tab') return
      const nodes = focusable(), first = nodes[0], last = nodes.at(-1)
      if (!first) { event.preventDefault(); element.focus(); return }
      if (!element.contains(document.activeElement) || (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
        event.preventDefault(); (event.shiftKey ? last : first).focus()
      }
    }
    const desktop = window.matchMedia('(min-width: 1024px)')
    const resize = () => { if (desktop.matches) close.current() }
    document.addEventListener('keydown', keydown, true)
    desktop.addEventListener('change', resize)
    if (desktop.matches) close.current()
    else (focusable()[0] || element).focus({ preventScroll: true })
    return () => {
      document.removeEventListener('keydown', keydown, true)
      desktop.removeEventListener('change', resize)
      background.forEach(([child, inert]) => { child.inert = inert })
      document.body.style.overflow = bodyOverflow
      document.documentElement.style.overflow = htmlOverflow
      if (previous?.isConnected && previous.getClientRects().length) previous.focus({ preventScroll: true })
    }
  }, [open])
  return dialog
}
