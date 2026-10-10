import test from 'node:test'
import assert from 'node:assert/strict'
import { matchesProduct } from '../src/utils/search.js'
test('display category names, punctuation, spaces and case all match', () => {
  for (const [category, label] of [['cups-mugs', 'Cups & Mugs'], ['bowls-trays', 'Bowls & Trays'], ['clocks-watches', 'Clocks & Watches']]) {
    const p = { name: 'Marble piece', description: 'Hand carved', category }
    for (const q of [label, label.toUpperCase(), label.replace('&', ' '), category]) assert.equal(matchesProduct(p, q, label), true)
    assert.equal(matchesProduct(p, 'unrelated', label), false)
  }
})
test('product names and descriptions work and every query term must match', () => {
  const p = { name: 'Carrara Cup', description: 'Hand-turned marble', category: 'cups-mugs' }
  assert.equal(matchesProduct(p, 'cup marble'), true)
  assert.equal(matchesProduct(p, 'cup unknown'), false)
  assert.equal(matchesProduct(p, ''), true)
})
