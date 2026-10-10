import test from 'node:test'
import assert from 'node:assert/strict'
import { orderSummary, validateCustomer, paymentMethods } from '../src/utils/checkout.js'
import { placeOrder } from '../src/services/orderService.js'

test('discounts are deducted once and shipping matches cart thresholds', () => {
  assert.deepEqual(orderSummary([{ price: 1200, compareAt: 1500, qty: 2 }]), { originalSubtotal: 3000, discount: 600, subtotal: 2400, shipping: 150, total: 2550 })
  assert.equal(orderSummary([{ price: 1500, qty: 2 }]).shipping, 0)
  assert.equal(orderSummary([{ price: 1000, compareAt: 900, qty: 1 }]).discount, 0)
  assert.equal(orderSummary([]).total, 0)
})
test('customer validation rejects malformed fields and accepts valid details', () => {
  assert.equal(Object.keys(validateCustomer({ name: ' ', phone: '1234567890', email: 'bad', address: '\n', pincode: '000000' })).length, 5)
  assert.deepEqual(validateCustomer({ name: ' Ayush ', phone: '9876543210', email: 'ayush@example.com', address: '12 Marble Road, Delhi', pincode: '110001' }), {})
})
test('COD only and unavailable order adapter never reports success', async () => {
  assert.deepEqual(paymentMethods.map(({ id }) => id), ['cod'])
  const result = await placeOrder()
  assert.equal(result.available, false)
  assert.match(result.message, /No order has been placed/)
  assert.equal(result.orderId, undefined)
})
