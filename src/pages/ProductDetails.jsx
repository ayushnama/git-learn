import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, Minus, Plus, Star, Truck, ShieldCheck } from 'lucide-react'
import ProductGallery from '../components/ProductGallery'
import ProductGrid from '../components/ProductGrid'
import Button from '../components/Button'
import useSEO from '../hooks/useSEO'
import { useStore } from '../context/StoreContext'
import { getProduct, getCategory, products } from '../data/products'
import { money } from '../utils/format'

export default function ProductDetails() {
  const { slug } = useParams()
  const p = getProduct(slug)
  const { addToCart, isWished, toggleWish } = useStore()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  useSEO(p ? {
    title: p.name, description: p.description,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description, category: getCategory(p.category)?.name, sku: `VM-${p.id}`,
      brand: { '@type': 'Brand', name: 'Veina Marble' },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: 24 },
      offers: { '@type': 'Offer', priceCurrency: 'INR', price: p.price, availability: 'https://schema.org/InStock', url: window.location.href } },
  } : { title: 'Product not found' })

  if (!p) return <div className="py-32 text-center"><h1 className="text-4xl">Product not found</h1><Link to="/shop" className="mt-4 inline-block underline">Back to shop</Link></div>
  const cat = getCategory(p.category)
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4)
  const add = () => { addToCart(p.id, qty); setAdded(true); setTimeout(() => setAdded(false), 1800) }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 md:py-16">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-taupe"><Link to="/shop">Shop</Link> / <Link to={`/category/${cat.slug}`}>{cat.name}</Link> / <span className="text-ink">{p.name}</span></nav>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={p.images} name={p.name} />
        <div>
          <h1 className="text-4xl sm:text-5xl">{p.name}</h1>
          <p className="mt-3 flex items-center gap-2 text-sm"><Star size={14} className="fill-ink" />{p.rating} <span className="text-taupe">(24 reviews)</span></p>
          <p className="mt-5 text-2xl">{money(p.price)} <span className="ml-2 text-base text-taupe line-through">{money(p.compareAt)}</span></p>
          <p className="mt-5 max-w-lg text-taupe">{p.description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-stone">
              <button className="p-3.5" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={14} /></button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button className="p-3.5" aria-label="Increase quantity" onClick={() => setQty(Math.min(10, qty + 1))}><Plus size={14} /></button>
            </div>
            <Button onClick={add} className="flex-1 sm:flex-none sm:min-w-52">{added ? 'Added to cart' : 'Add to cart'}</Button>
            <button onClick={() => toggleWish(p.id)} aria-pressed={isWished(p.id)} aria-label="Toggle wishlist" className="grid h-12 w-12 place-items-center border border-stone"><Heart size={18} className={isWished(p.id) ? 'fill-ink' : ''} /></button>
          </div>
          <ul className="mt-8 space-y-2 border-t border-stone pt-6 text-sm">{p.details.map((d) => <li key={d}>{d}</li>)}</ul>
          <div className="mt-6 grid gap-3 text-sm text-taupe sm:grid-cols-2">
            <p className="flex items-center gap-2"><Truck size={16} /> Ships in 3 to 5 days</p>
            <p className="flex items-center gap-2"><ShieldCheck size={16} /> 7-day easy returns</p>
          </div>
        </div>
      </div>
      {related.length > 0 && <section className="mt-24"><h2 className="mb-8 text-3xl sm:text-4xl">You may also like</h2><ProductGrid products={related} /></section>}
    </div>
  )
}
