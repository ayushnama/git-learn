import { validateAddress } from './customer.js'

const record = (value) => !!value && typeof value === 'object' && !Array.isArray(value)
const identifier = (value) => Number.isSafeInteger(value) && value > 0 || typeof value === 'string' && !!value.trim()
const invalid = () => { throw new Error('The server returned invalid account information. Please retry.') }
function text(value, required = false) {
  if (value == null && !required) return ''
  if (typeof value !== 'string' || required && !value.trim()) return invalid()
  return value.trim()
}
function id(value) { if (!identifier(value)) return invalid(); return typeof value === 'string' ? value.trim() : value }
function amount(value) { if (!Number.isFinite(value) || value < 0) return invalid(); return value }
function unique(values, normalize) {
  if (!Array.isArray(values)) return invalid()
  const seen = new Set()
  return values.map((value) => {
    const item = normalize(value), key = String(item.id)
    if (seen.has(key)) return invalid()
    seen.add(key); return item
  })
}

export function normalizeSession(value, allowAnonymous = false) {
  if (value === null && allowAnonymous) return null
  if (!record(value)) return invalid()
  const email = text(value.email, true)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return invalid()
  return { id: id(value.id), email, name: text(value.name), phone: text(value.phone) }
}
export function normalizeAddresses(values) {
  const addresses = unique(values, (value) => {
    if (!record(value) || value.isDefault != null && typeof value.isDefault !== 'boolean') return invalid()
    const address = { id: id(value.id), name: text(value.name, true), phone: text(value.phone, true), address: text(value.address, true), pincode: text(value.pincode, true), isDefault: value.isDefault === true }
    if (Object.keys(validateAddress(address)).length) return invalid()
    return address
  })
  if (addresses.filter((address) => address.isDefault).length > 1) return invalid()
  return addresses
}
export function normalizeOrder(value, detail = false) {
  if (!record(value)) return invalid()
  const order = { id: id(value.id), total: amount(value.total), status: text(value.status), paymentMethod: text(value.paymentMethod) }
  if (detail || value.items != null) {
    if (!Array.isArray(value.items) || !value.items.length) return invalid()
    order.items = value.items.map((item) => {
      if (!record(item) || !Number.isSafeInteger(item.qty) || item.qty <= 0) return invalid()
      const price = amount(item.price)
      if (!Number.isFinite(price * item.qty)) return invalid()
      return { ...(item.id != null ? { id: id(item.id) } : {}), name: text(item.name, true), qty: item.qty, price }
    })
  }
  if (value.shippingAddress != null) {
    if (!record(value.shippingAddress)) return invalid()
    order.shippingAddress = { name: text(value.shippingAddress.name, true), address: text(value.shippingAddress.address, true), pincode: text(value.shippingAddress.pincode, true) }
    if (!/^[1-9]\d{5}$/.test(order.shippingAddress.pincode)) return invalid()
  }
  if (value.tracking != null) {
    if (!record(value.tracking) || value.tracking.events != null && !Array.isArray(value.tracking.events)) return invalid()
    order.tracking = { carrier: text(value.tracking.carrier), number: text(value.tracking.number), events: (value.tracking.events || []).map((event) => {
      if (!record(event)) return invalid()
      return { label: text(event.label, true), date: text(event.date) }
    }) }
  }
  return order
}
export function normalizeCustomerResource(method, result, requestedId) {
  if (result == null) throw new Error('The requested account information was not found.')
  if (method === 'getAddresses') return normalizeAddresses(result)
  if (method === 'getOrders') return unique(result, (order) => normalizeOrder(order))
  if (method === 'getOrder') {
    const order = normalizeOrder(result, true)
    if (String(order.id) !== String(requestedId)) return invalid()
    return order
  }
  return invalid()
}

export function normalizeOrderResponse(value) {
  if (!record(value) || typeof value.available !== 'boolean') return invalid()
  const message = text(value.message, true)
  return value.available ? { available: true, message, order: normalizeOrder(value.order, true) } : { available: false, message }
}
