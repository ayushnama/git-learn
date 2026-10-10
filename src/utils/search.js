const words = (text) => String(text).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
export function matchesProduct(product, query, categoryName = '') {
  const terms = words(query).split(' ').filter(Boolean)
  const text = words(`${product.name} ${product.description} ${product.category} ${categoryName} ${product.searchTags || ''}`)
  return terms.every((term) => text.includes(term))
}
