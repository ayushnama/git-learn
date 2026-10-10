import { useEffect, useRef } from 'react'

export default function Reveal({ children, className = '' }) {
  const element = useRef(null)
  useEffect(() => {
    const node = element.current
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!node || motion.matches || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { node.classList.add('animate-rise'); observer.disconnect() }
    }, { threshold: 0.08 })
    observer.observe(node)
    const stop = () => { if (motion.matches) { observer.disconnect(); node.classList.remove('animate-rise') } }
    motion.addEventListener('change', stop)
    return () => { observer.disconnect(); motion.removeEventListener('change', stop) }
  }, [])
  return <div ref={element} className={className}>{children}</div>
}
