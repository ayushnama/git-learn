import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeCart, normalizeWishlist } from '../src/utils/storeStorage.js'

const productIds = new Set([1, 2, 3])

test('valid saved cart and wishlist are preserved without mutating the inputs', () => {
  const cart = Object.freeze([Object.freeze({ id: 1, qty: 2 }), Object.freeze({ id: 2, qty: 1 })])
  const wishlist = Object.freeze([2, 1])
  assert.deepEqual(normalizeCart(cart, productIds), cart)
  assert.deepEqual(normalizeWishlist(wishlist, productIds), wishlist)
})

test('non-array saved data recovers to an empty collection', () => {
  for (const value of [null, undefined, {}, 'invalid', 42, true]) {
    assert.deepEqual(normalizeCart(value, productIds), [])
    assert.deepEqual(normalizeWishlist(value, productIds), [])
  }
})

test('bad cart entries are discarded while valid entries survive', () => {
  const cart = [null, undefined, {}, false, 'bad', { id: 99, qty: 1 }, { id: '1', qty: 1 }, { id: 2, qty: 3 }]
  assert.deepEqual(normalizeCart(cart, productIds), [{ id: 2, qty: 3 }])
})

test('negative, zero, fractional, missing and nonnumeric quantities are discarded', () => {
  for (const qty of [-3, 0, 1.5, null, undefined, true, {}, [], NaN, Infinity, 'bad', '', ' ', '-2', '1.5']) {
    assert.deepEqual(normalizeCart([{ id: 1, qty }], productIds), [])
  }
})

test('numeric string quantities become numbers so counts cannot concatenate', () => {
  assert.deepEqual(normalizeCart([{ id: 1, qty: '2' }, { id: 2, qty: ' 3 ' }], productIds), [
    { id: 1, qty: 2 }, { id: 2, qty: 3 },
  ])
})

test('oversized saved quantities respect the existing ten-unit limit', () => {
  assert.deepEqual(normalizeCart([{ id: 1, qty: 1000 }], productIds), [{ id: 1, qty: 10 }])
})

test('duplicate cart entries merge once and cannot bypass the quantity limit', () => {
  assert.deepEqual(normalizeCart([{ id: 1, qty: 7 }, { id: 2, qty: 1 }, { id: 1, qty: 8 }], productIds), [
    { id: 1, qty: 10 }, { id: 2, qty: 1 },
  ])
})

test('wishlist drops unknown IDs and duplicates but preserves valid order', () => {
  assert.deepEqual(normalizeWishlist([null, {}, 99, '1', 2, 1, 2], productIds), [2, 1])
})

test('normalization is stable across persistence and reload', () => {
  const cart = normalizeCart([{ id: 1, qty: '2' }, null, { id: 2, qty: 500 }], productIds)
  const wishlist = normalizeWishlist([1, 2, 1, null], productIds)
  assert.deepEqual(normalizeCart(JSON.parse(JSON.stringify(cart)), productIds), cart)
  assert.deepEqual(normalizeWishlist(JSON.parse(JSON.stringify(wishlist)), productIds), wishlist)
})
