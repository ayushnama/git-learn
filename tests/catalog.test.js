import test from 'node:test'
import assert from 'node:assert/strict'
import { categories, products, getCategory, belongsToCategory } from '../src/data/products.js'
import { createCatalogService, normalizeCatalog } from '../src/services/catalogService.js'

test('all six collections have complete products with stable legacy IDs and valid pricing/stock/images', () => {
  assert.deepEqual(categories.map((c) => c.slug), ['kitchen', 'home-decor', 'bathroom', 'pooja', 'tableware', 'furniture'])
  const normalized = normalizeCatalog({ categories, products })
  assert.equal(normalized.products.length, 34)
  for (const category of categories) assert.ok(products.filter((p) => p.category === category.slug).length >= 3)
  for (const product of normalized.products) {
    assert.equal(product.images.length, 3)
    assert.ok(product.compareAt >= product.price)
    assert.ok(product.description.length > 30)
    assert.ok(product.discount >= 0 && product.discount < 100)
  }
  assert.equal(products[0].id, 1)
  assert.equal(products[0].slug, 'carrara-espresso-cup')
  assert.equal(products[15].id, 16)
  assert.equal(products[15].slug, 'stone-wrist-watch')
  assert.equal(products.filter((p) => belongsToCategory(p, 'cups-mugs')).length, 3)
  assert.equal(getCategory('clocks-watches').name, 'Clocks & Watches')
})
test('invalid API payloads cannot enter cart/catalog state', () => {
  const payload = { categories, products: [products[0]] }
  for (const change of [{ price: -1 }, { stock: 1.5 }, { description: ' ' }, { images: ['javascript:alert(1)'] }, { images: ['https://user:pass@example.com/a.jpg'] }, { images: [] }, { category: 'missing' }, { id: null }]) assert.throws(() => normalizeCatalog({ ...payload, products: [{ ...products[0], ...change }] }))
  assert.throws(() => normalizeCatalog({ ...payload, products: [products[0], products[0]] }))
  assert.throws(() => normalizeCatalog({ products }))
  assert.deepEqual(normalizeCatalog({ categories, products: [] }).products, [])
})
test('mock repository returns a fresh normalized snapshot without network requests', async () => {
  const service = createCatalogService({ fetcher: () => { throw Error('Unexpected network') } })
  const first = await service.getCatalog(), second = await service.getCatalog()
  assert.notEqual(first.products, second.products)
  assert.notEqual(first.products[0].images, second.products[0].images)
  assert.equal(second.products.length, 34)
})
test('API adapter passes cancellation, validates responses and surfaces HTTP errors', async () => {
  const controller = new AbortController()
  let request
  const service = createCatalogService({ source: 'api', baseUrl: 'https://api.example/api', fetcher: async (url, options) => { request = { url, options }; return { ok: true, json: async () => ({ categories, products }) } } })
  assert.equal((await service.getCatalog({ signal: controller.signal })).products.length, 34)
  assert.equal(request.url, 'https://api.example/api/catalog')
  assert.equal(request.options.signal, controller.signal)
  await assert.rejects(createCatalogService({ source: 'api', baseUrl: 'https://api.example', fetcher: async () => ({ ok: false, status: 503 }) }).getCatalog(), /503/)
  await assert.rejects(createCatalogService({ source: 'api', baseUrl: 'javascript:bad' }).getCatalog(), /Invalid/)
  controller.abort()
  await assert.rejects(service.getCatalog({ signal: controller.signal }), { name: 'AbortError' })
})
