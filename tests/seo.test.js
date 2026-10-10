import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_DESCRIPTION, pageMetadata, siteOrigin } from '../src/utils/seo.js'

test('canonical origin accepts HTTP(S), falls back locally, and rejects invalid deployment values', () => {
  assert.equal(siteOrigin('', 'http://localhost:5173/shop'), 'http://localhost:5173')
  assert.equal(siteOrigin(' https://store.example/ ', 'http://localhost'), 'https://store.example')
  for (const value of ['invalid', 'ftp://store.example', 'https://user:pass@store.example', 'https://store.example/shop', 'https://store.example/?q=1', 'https://store.example/#a']) {
    assert.throws(() => siteOrigin(value, 'http://localhost'))
  }
})
test('missing descriptions reset to a default and canonical paths cannot replace the configured host', () => {
  const metadata = pageMetadata({ title: 'Product not found', noIndex: true }, '//other.example/path', 'https://store.example')
  assert.equal(metadata.description, DEFAULT_DESCRIPTION)
  assert.equal(new URL(metadata.canonical).origin, 'https://store.example')
  assert.equal(metadata.robots, 'noindex, follow')
  assert.equal(metadata.title, 'Product not found | Marbello')
})
test('cart, wishlist, search and error pages are noindex while catalog pages remain indexable', () => {
  for (const pathname of ['/cart', '/cart/', '/wishlist', '/search']) assert.equal(pageMetadata({}, pathname, 'https://store.example').robots, 'noindex, follow')
  for (const pathname of ['/', '/shop', '/product/cup', '/category/cups-mugs']) assert.equal(pageMetadata({}, pathname, 'https://store.example').robots, 'index, follow')
})
test('social metadata accepts real HTTP(S) images and omits unsupported or embedded artwork', () => {
  assert.equal(pageMetadata({ image: '/images/cup.jpg', type: 'product' }, '/shop', 'https://store.example').image, 'https://store.example/images/cup.jpg')
  assert.equal(pageMetadata({ image: 'https://cdn.example/cup.jpg' }, '/', 'https://store.example').image, 'https://cdn.example/cup.jpg')
  for (const image of ['data:image/svg+xml,a', 'javascript:alert(1)', 'ftp://store.example/a', 'https://user:pass@store.example/a']) assert.equal(pageMetadata({ image }, '/', 'https://store.example').image, undefined)
})
