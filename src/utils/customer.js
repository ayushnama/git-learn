import { validateCustomer } from './checkout.js'

export function validateAccount(values, signup = false) {
  const errors = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email?.trim() || '')) errors.email = 'Enter a valid email address.'
  if (!values.password?.trim()) errors.password = 'Enter your password.'
  if (signup) {
    if (!values.name?.trim()) errors.name = 'Enter your name.'
    if (!/^[6-9]\d{9}$/.test(values.phone || '')) errors.phone = 'Enter a valid 10-digit Indian mobile number.'
    if ((values.password || '').trim().length < 8) errors.password = 'Use at least 8 characters.'
    if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords must match.'
  }
  return errors
}

export function validateProfile(values) {
  const { name, email, phone } = validateCustomer(values)
  return Object.fromEntries(Object.entries({ name, email, phone }).filter(([, error]) => error))
}

export function shippingCustomer(address, user) {
  return { name: address?.name || '', phone: address?.phone || '', email: user?.email || '', address: address?.address || '', pincode: address?.pincode || '' }
}

export function validateAddress(values) {
  const { email, ...errors } = validateCustomer({ ...values, email: 'address@example.com' })
  return errors
}

export function safeAccountReturn(value) {
  return ['/checkout', '/account/profile', '/account/addresses', '/account/orders'].includes(value) ? value : '/account/profile'
}
