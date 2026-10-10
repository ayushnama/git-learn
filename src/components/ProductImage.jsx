import { useState } from 'react'

const fallback = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#EDE7DD"/><path d="M140 235v-90h120v90zM145 225l35-40 30 25 20-20 25 35" fill="none" stroke="#8C857A" stroke-width="3"/><circle cx="230" cy="167" r="8" fill="#8C857A"/><text x="200" y="270" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#242424">Image unavailable</text></svg>')

export default function ProductImage({ src, alt = '', hideOnError = false, onError, ...props }) {
  const [failure, setFailure] = useState(null)
  const failed = !src || failure?.src === src
  if (failed && hideOnError) return null
  if (failed && failure?.fallbackFailed) return <span role={alt ? 'img' : undefined} aria-label={alt ? `${alt}: image unavailable` : undefined} aria-hidden={!alt || undefined} className={props.className}>Image unavailable</span>
  return <img {...props} src={failed ? fallback : src} alt={failed && alt ? `${alt}: image unavailable` : alt} onError={(event) => { setFailure({ src, fallbackFailed: failed }); onError?.(event) }} />
}
