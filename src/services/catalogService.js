import { categories, products } from '../data/products.js'

const validSlug = (value) => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
const validImage = (value) => {
  if (typeof value !== 'string') return false
  if (/^\/(?!\/)/.test(value) || value.startsWith('data:image/svg+xml;utf8,')) return true
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
  } catch { return false }
}

export function normalizeCatalog(data) {
  if (!data || !Array.isArray(data.categories) || !Array.isArray(data.products)) throw new Error('Invalid catalog response.')
  const slugs = new Set(), ids = new Set(), productSlugs = new Set()
  const normalizedCategories = data.categories.map((category) => {
    if (!category || !validSlug(category.slug) || typeof category.name !== 'string' || !category.name.trim() || slugs.has(category.slug)) throw new Error('Invalid or duplicate category.')
    slugs.add(category.slug)
    if (category.image && !validImage(category.image)) throw new Error('Invalid category image.')
    return { ...category, name: category.name.trim() }
  })
  const normalizedProducts = data.products.map((product) => {
    const idValid = Number.isSafeInteger(product?.id) && product.id > 0 || typeof product?.id === 'string' && product.id.trim().length > 0
    if (!idValid || ids.has(product.id) || !validSlug(product.slug) || productSlugs.has(product.slug) || !slugs.has(product.category) || typeof product.name !== 'string' || !product.name.trim() || typeof product.description !== 'string' || !product.description.trim() || !Number.isFinite(product.price) || product.price <= 0 || !Number.isSafeInteger(product.stock) || product.stock < 0 || !Array.isArray(product.images) || !product.images.length || !product.images.every(validImage)) throw new Error('Invalid or duplicate product.')
    ids.add(product.id); productSlugs.add(product.slug)
    const compareAt = Number.isFinite(product.compareAt) && product.compareAt > product.price ? product.compareAt : product.price
    return { ...product, name: product.name.trim(), compareAt, discount: Math.round((1 - product.price / compareAt) * 100), rating: Number.isFinite(product.rating) ? Math.max(0, Math.min(5, product.rating)) : 0, details: Array.isArray(product.details) ? product.details.filter((detail) => typeof detail === 'string') : [], images: [...product.images], bestSeller: !!product.bestSeller, isNew: !!product.isNew }
  })
  return { categories: normalizedCategories, products: normalizedProducts }
}

export function createCatalogService({ source = 'mock', baseUrl = '', fetcher = globalThis.fetch } = {}) {
  return {
    async getCatalog({ signal } = {}) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      if (source === 'mock') return normalizeCatalog({ categories, products })
      if (source !== 'api') throw new Error('Unsupported catalog source.')
      const url = new URL(baseUrl)
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Invalid catalog API base URL.')
      const response = await fetcher(`${url.href.replace(/\/$/, '')}/catalog`, { signal, headers: { Accept: 'application/json' } })
      if (!response.ok) throw new Error(`Catalog request failed (${response.status}).`)
      return normalizeCatalog(await response.json())
    },
  }
}

export const catalogService = createCatalogService({ source: import.meta.env?.VITE_CATALOG_SOURCE || 'mock', baseUrl: import.meta.env?.VITE_API_BASE_URL || '' })
