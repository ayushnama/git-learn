import ProductCard from './ProductCard'
export default function ProductGrid({ products, empty = 'No products found.' }) {
  if (!products.length) return <p className="py-20 text-center text-taupe">{empty}</p>
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
