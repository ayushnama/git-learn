export const MAX_QUANTITY = 10
export const quantityLimit = (product) => Math.min(MAX_QUANTITY, Number.isSafeInteger(product?.stock) ? Math.max(0, product.stock) : 0)

export function addCartItem(cart, product, qty = 1) {
  if (!product || !Number.isSafeInteger(qty) || qty < 1) return { cart, added: 0, message: 'Invalid quantity' }
  const current = cart.find((item) => item.id === product.id)?.qty || 0
  const limit = quantityLimit(product)
  const added = Math.max(0, Math.min(qty, limit - current))
  const message = !limit ? 'Out of stock' : !added ? 'Quantity limit reached' : added < qty ? `Added ${added} to cart (limit reached)` : 'Added to cart'
  if (!added) return { cart, added, message }
  return { cart: current ? cart.map((item) => item.id === product.id ? { ...item, qty: current + added } : item) : [...cart, { id: product.id, qty: added }], added, message }
}

export function updateCartQuantity(cart, product, qty) {
  if (!product || !Number.isSafeInteger(qty) || qty < 0) return cart
  const next = Math.min(qty, quantityLimit(product))
  return next === 0 ? cart.filter((item) => item.id !== product.id) : cart.map((item) => item.id === product.id ? { ...item, qty: next } : item)
}
