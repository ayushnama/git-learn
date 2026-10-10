import test from 'node:test'
import assert from 'node:assert/strict'
import { addCartItem, updateCartQuantity, quantityLimit } from '../src/utils/cart.js'
import { normalizeCart } from '../src/utils/storeStorage.js'
const product = { id: 1, stock: 12 }
test('new and existing items use the same limit and report partial additions', () => {
  assert.equal(addCartItem([], product, 25).added, 10)
  const result = addCartItem([{ id: 1, qty: 8 }], product, 5)
  assert.equal(result.added, 2)
  assert.equal(result.cart[0].qty, 10)
  assert.match(result.message, /limit reached/)
  assert.equal(addCartItem(result.cart, product).added, 0)
  assert.equal(addCartItem(result.cart, product).message, 'Quantity limit reached')
})
test('invalid quantities and unknown products never change the cart', () => {
  const cart = [{ id: 1, qty: 2 }]
  for (const qty of [-1, 0, 1.5, '2', NaN, Infinity]) assert.equal(addCartItem(cart, product, qty).cart, cart)
  assert.equal(addCartItem(cart, undefined).cart, cart)
  for (const qty of [-1, 1.5, '2', NaN]) assert.equal(updateCartQuantity(cart, product, qty), cart)
})
test('stock bounds apply to adding, quantity updates and saved cart recovery', () => {
  const low = { id: 1, stock: 2 }
  assert.equal(quantityLimit(low), 2)
  assert.equal(addCartItem([], low, 5).cart[0].qty, 2)
  assert.equal(updateCartQuantity([{ id: 1, qty: 1 }], low, 8)[0].qty, 2)
  assert.deepEqual(normalizeCart([{ id: 1, qty: 10 }], new Set([1]), new Map([[1, low]])), [{ id: 1, qty: 2 }])
  assert.deepEqual(addCartItem([], { id: 1, stock: 0 }).cart, [])
  assert.equal(addCartItem([], { id: 1, stock: 0 }).message, 'Out of stock')
  assert.deepEqual(updateCartQuantity([{ id: 1, qty: 1 }], product, 0), [])
})
