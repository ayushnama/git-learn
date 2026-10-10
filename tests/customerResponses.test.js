import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeSession, normalizeAddresses, normalizeOrder, normalizeCustomerResource, normalizeOrderResponse } from '../src/utils/customerResponses.js'

const address = { id: 'a1', name: 'Ayush', phone: '9876543210', address: '12 Marble Road', pincode: '110001', isDefault: true }
const order = { id: 'ORD1', total: 1950, status: 'Dispatched', paymentMethod: 'cod', items: [{ id: 1, name: 'Cup', price: 900, qty: 2 }], shippingAddress: { name: 'Ayush', address: '12 Marble Road', pincode: '110001' }, tracking: { events: [{ label: 'Confirmed', date: '2026-10-01' }] } }

test('session responses require server identity/email and discard sensitive extra fields', () => {
  assert.equal(normalizeSession(null, true), null)
  assert.deepEqual(normalizeSession({ id: 'u1', email: ' ayush@example.com ', password: 'secret', token: 'secret' }), { id: 'u1', email: 'ayush@example.com', name: '', phone: '' })
  for (const value of [null, undefined, [], {}, { id: 0, email: 'a@b.com' }, { id: {}, email: 'a@b.com' }, { id: 'u1', email: 'bad' }, { id: 'u1', email: 'a@b.com', name: {} }]) assert.throws(() => normalizeSession(value))
})
test('address responses reject missing fields, duplicate identity and conflicting defaults', () => {
  assert.deepEqual(normalizeAddresses([]), [])
  assert.deepEqual(normalizeAddresses([address]), [address])
  for (const values of [null, {}, [null], [{ ...address, pincode: 'x' }], [{ ...address, phone: 9876543210 }], [address, address], [address, { ...address, id: 'a2' }], [{ ...address, isDefault: 'false' }]]) assert.throws(() => normalizeAddresses(values))
})
test('orders reject missing/non-finite money, invalid line items and malformed tracking', () => {
  assert.equal(normalizeOrder(order, true).items[0].qty, 2)
  for (const value of [{ ...order, total: undefined }, { ...order, total: '1950' }, { ...order, total: NaN }, { ...order, total: Infinity }, { ...order, total: -1 }, { ...order, items: {} }, { ...order, items: [] }, { ...order, items: [{ name: 'Cup', price: 900, qty: -1 }] }, { ...order, items: [{ name: 'Cup', price: Number.MAX_VALUE, qty: 2 }] }, { ...order, tracking: { events: {} } }, { ...order, tracking: { events: [{ label: {} }] } }, { ...order, shippingAddress: { name: 'A', address: 'B', pincode: {} } }]) assert.throws(() => normalizeOrder(value, true))
})
test('resource routing validates IDs and permits valid empty lists and order summaries', () => {
  assert.deepEqual(normalizeCustomerResource('getOrders', []), [])
  assert.equal(normalizeCustomerResource('getOrders', [{ id: 'ORD1', total: 0 }])[0].total, 0)
  assert.equal(normalizeCustomerResource('getOrder', order, 'ORD1').id, 'ORD1')
  assert.throws(() => normalizeCustomerResource('getOrder', order, 'OTHER'))
  assert.throws(() => normalizeCustomerResource('getOrders', [order, order]))
  assert.throws(() => normalizeCustomerResource('getOrder', null, 'ORD1'), /not found/)
  assert.throws(() => normalizeCustomerResource('unknown', {}))
})
test('order placement responses require an explicit availability state and confirmed order data', () => {
  assert.deepEqual(normalizeOrderResponse({ available: false, message: 'Not connected' }), { available: false, message: 'Not connected' })
  assert.equal(normalizeOrderResponse({ available: true, message: 'Confirmed', order }).order.id, 'ORD1')
  for (const value of [null, {}, { available: 'false', message: 'x' }, { available: false, message: {} }, { available: true, message: 'Success' }]) assert.throws(() => normalizeOrderResponse(value))
})
