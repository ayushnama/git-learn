import { useEffect } from 'react'
const set = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', content)
}
export default function useSEO({ title, description, image, jsonLd }) {
  useEffect(() => {
    const t = title ? `${title} | Veina Marble` : 'Veina Marble | Handcrafted Marble Homeware'
    document.title = t
    if (description) { set('name', 'description', description); set('property', 'og:description', description) }
    set('property', 'og:title', t); set('property', 'og:type', 'website'); set('property', 'og:url', window.location.href)
    if (image && !image.startsWith('data:')) set('property', 'og:image', image)
    let ld = document.getElementById('ld-json')
    if (jsonLd) {
      if (!ld) { ld = document.createElement('script'); ld.id = 'ld-json'; ld.type = 'application/ld+json'; document.head.appendChild(ld) }
      ld.textContent = JSON.stringify(jsonLd)
    } else ld?.remove()
  }, [title, description, image, jsonLd])
}
