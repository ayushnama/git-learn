export const paymentMethods = Object.freeze([{ id: 'cod', label: 'Cash on Delivery (COD)' }])

export function orderSummary(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const originalSubtotal = items.reduce((sum, item) => sum + Math.max(item.price, item.compareAt || item.price) * item.qty, 0)
  const shipping = subtotal && subtotal < 3000 ? 150 : 0
  return { originalSubtotal, discount: originalSubtotal - subtotal, subtotal, shipping, total: subtotal + shipping }
}

export function validateCustomer(customer) {
  const errors = {}
  if (!customer.name?.trim()) errors.name = 'Enter your name.'
  if (!/^[6-9]\d{9}$/.test(customer.phone?.trim() || '')) errors.phone = 'Enter a valid 10-digit Indian mobile number.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email?.trim() || '')) errors.email = 'Enter a valid email address.'
  if (!customer.address?.trim()) errors.address = 'Enter your complete delivery address.'
  if (!/^[1-9]\d{5}$/.test(customer.pincode?.trim() || '')) errors.pincode = 'Enter a valid 6-digit pincode.'
  return errors
}
