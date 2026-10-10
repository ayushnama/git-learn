import { MAX_QUANTITY, quantityLimit } from './cart.js'

export function normalizeCart(value, productIds, catalog) {
  if (!Array.isArray(value)) return []

  const quantities = new Map()
  for (const item of value) {
    if (!item || !productIds.has(item.id)) continue
    const qty = typeof item.qty === 'string' && /^\d+$/.test(item.qty.trim())
      ? Number(item.qty)
      : item.qty
    if (!Number.isSafeInteger(qty) || qty < 1) continue
    const limit = catalog ? quantityLimit(catalog.get(item.id)) : MAX_QUANTITY
    if (limit) quantities.set(item.id, Math.min(limit, (quantities.get(item.id) || 0) + qty))
  }

  return Array.from(quantities, ([id, qty]) => ({ id, qty }))
}

export function normalizeWishlist(value, productIds) {
  return Array.isArray(value) ? [...new Set(value.filter((id) => productIds.has(id)))] : []
}
