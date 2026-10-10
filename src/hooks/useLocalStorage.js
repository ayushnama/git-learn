import { useState, useEffect, useCallback, useRef } from 'react'
const identity = (value) => value
export default function useLocalStorage(key, initial, normalize = identity) {
  const [v, setV] = useState(() => {
    try { return normalize(JSON.parse(localStorage.getItem(key)) ?? initial) } catch { return normalize(initial) }
  })
  const current = useRef(v)
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }, [key, v])
  const setValue = useCallback((update) => {
    const next = normalize(typeof update === 'function' ? update(current.current) : update)
    current.current = next
    setV(next)
    return next
  }, [normalize])
  return [v, setValue]
}
