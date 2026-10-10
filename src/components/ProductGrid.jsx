import ProductCard from './ProductCard'
export default function ProductGrid({ products, empty = 'No products found.' }) {
  if (!products.length) return <p className="py-10 text-center text-ink/75">{empty}</p>
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
