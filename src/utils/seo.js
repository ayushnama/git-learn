export const DEFAULT_DESCRIPTION = 'Explore Marbello marble kitchenware, home decor, bathroom accessories, pooja essentials, tableware and furniture.'

export function siteOrigin(configured, fallback) {
  if (!configured?.trim()) return new URL(fallback).origin
  const url = new URL(configured.trim())
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('VITE_SITE_URL must be an HTTP(S) origin without credentials, a path, query or hash.')
  }
  return url.origin
}

export function pageMetadata({ title, description, image, type = 'website', noIndex = false }, pathname, origin) {
  const canonicalURL = new URL(origin)
  canonicalURL.pathname = pathname
  const canonical = canonicalURL.href
  let socialImage
  if (image) {
    try {
      const url = new URL(image, origin)
      if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) socialImage = url.href
    } catch { /* Unsupported image URLs are omitted from social metadata. */ }
  }
  return {
    title: title ? `${title} | Marbello` : 'Marbello | Handcrafted Marble Homeware',
    description: description || DEFAULT_DESCRIPTION,
    canonical, image: socialImage, type,
    robots: noIndex || ['/cart', '/wishlist', '/search'].includes(pathname.replace(/\/+$/, '')) ? 'noindex, follow' : 'index, follow',
  }
}

export function applyMetadata(document, metadata, jsonLd) {
  const meta = (attr, key, content) => {
    let element = document.head.querySelector(`meta[${attr}="${key}"]`)
    if (!content) { element?.remove(); return }
    if (!element) { element = document.createElement('meta'); element.setAttribute(attr, key); document.head.appendChild(element) }
    element.setAttribute('content', content)
  }
  document.title = metadata.title
  for (const [key, value] of Object.entries({ description: metadata.description, robots: metadata.robots, 'twitter:card': metadata.image ? 'summary_large_image' : 'summary', 'twitter:title': metadata.title, 'twitter:description': metadata.description, 'twitter:image': metadata.image })) meta('name', key, value)
  for (const [key, value] of Object.entries({ title: metadata.title, description: metadata.description, type: metadata.type, url: metadata.canonical, image: metadata.image, site_name: 'Marbello' })) meta('property', `og:${key}`, value)
  let canonical = document.head.querySelector('link[rel="canonical"]')
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
  canonical.href = metadata.canonical
  let ld = document.getElementById('ld-json')
  if (jsonLd) {
    if (!ld) { ld = document.createElement('script'); ld.id = 'ld-json'; ld.type = 'application/ld+json'; document.head.appendChild(ld) }
    ld.textContent = jsonLd
  } else ld?.remove()
}
