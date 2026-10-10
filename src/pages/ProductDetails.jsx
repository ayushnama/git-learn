import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, Minus, Plus, Star, Truck, ShieldCheck } from 'lucide-react'
import ProductGallery from '../components/ProductGallery'
import ProductGrid from '../components/ProductGrid'
import Button from '../components/Button'
import useSEO from '../hooks/useSEO'
import { useStore } from '../context/StoreContext'
import { useCatalog } from '../context/CatalogContext'
import useBuyNow from '../hooks/useBuyNow'
import { money } from '../utils/format'
import { quantityLimit } from '../utils/cart'

export default function ProductDetails() {
  const { getProduct, getCategory, products } = useCatalog()
  const { slug } = useParams()
  const p = getProduct(slug)
  const { addToCart, isWished, toggleWish } = useStore()
  const [qty, setQty] = useState(1)
  const buyNow = useBuyNow(p, qty)
  const [feedback, setFeedback] = useState('')
  const timer = useRef(null)
  const limit = quantityLimit(p)
  useEffect(() => {
    setQty(1); setFeedback('')
    return () => clearTimeout(timer.current)
  }, [slug])
  useSEO(p ? {
    title: p.name, description: p.description, type: 'product',
    jsonLd: { '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description, category: getCategory(p.category)?.name, sku: 'VM-' + p.id,
      brand: { '@type': 'Brand', name: 'Marbello' },
      offers: { '@type': 'Offer', priceCurrency: 'INR', price: p.price, availability: limit ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: window.location.href } },
  } : { title: 'Product not found', description: 'This product could not be found. Browse the Marbello collection.', noIndex: true })

  if (!p) return <div className="py-16 text-center"><h1 className="text-3xl">Product not found</h1><Link to="/shop" className="mt-4 inline-block underline">Back to shop</Link></div>
  const cat = getCategory(p.category)
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4)
  const add = () => {
    clearTimeout(timer.current)
    setFeedback(addToCart(p.id, qty).message)
    timer.current = setTimeout(() => setFeedback(''), 1800)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs leading-relaxed text-ink/75"><Link to="/shop">Shop</Link> / <Link to={'/category/' + cat.slug}>{cat.name}</Link> / <span className="text-ink">{p.name}</span></nav>
      <div className="grid items-start gap-5 md:grid-cols-2 lg:gap-8">
        <ProductGallery key={p.id} images={p.images} name={p.name} />
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl">{p.name}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm"><Star size={14} className="fill-gold text-gold" />{p.rating} <span className="text-ink/75">(Sample rating)</span></p>
          <p className="mt-3 flex flex-wrap items-baseline gap-2 text-2xl">{money(p.price)}{p.compareAt > p.price && <span className="text-sm text-ink/75 line-through">{money(p.compareAt)}</span>}{p.discount > 0 && <span className="rounded-full bg-bone px-2 py-1 text-xs">Save {p.discount}%</span>}</p>
          <p className="mt-2 text-sm">{p.stock ? p.stock + ' available' : 'Currently out of stock'}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="flex items-center border border-stone">
              <button className="grid h-11 w-11 place-items-center" aria-label="Decrease quantity" disabled={qty <= 1 || !limit} onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={14} /></button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button className="grid h-11 w-11 place-items-center" aria-label="Increase quantity" disabled={qty >= limit} onClick={() => setQty(Math.min(limit, qty + 1))}><Plus size={14} /></button>
            </div>
            <Button onClick={add} disabled={!limit} aria-live="polite" className="min-w-0 flex-1 px-3">{feedback || (limit ? 'Add to cart' : 'Out of stock')}</Button>
            <button onClick={() => toggleWish(p.id)} aria-pressed={isWished(p.id)} aria-label="Toggle wishlist" className="grid h-11 w-11 place-items-center rounded border border-stone bg-cream text-teal hover:bg-bone"><Heart size={18} className={isWished(p.id) ? 'fill-teal' : ''} /></button>
          </div>
          <Button onClick={buyNow} disabled={!limit} variant="outline" className="mt-2 w-full">Buy now</Button>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink/75">{p.description}</p>
          <ul className="mt-4 space-y-1.5 border-t border-stone pt-4 text-sm">{p.details.map((d) => <li key={d}>{d}</li>)}</ul>
          <div className="mt-4 grid gap-2 text-sm text-ink/75 sm:grid-cols-2">
            <p className="flex items-center gap-2"><Truck size={16} /> Ships in 3 to 5 days</p>
            <p className="flex items-center gap-2"><ShieldCheck size={16} /> 7-day easy returns</p>
          </div>
        </div>
      </div>
      {related.length > 0 && <section className="mt-10 md:mt-12"><h2 className="mb-5 text-2xl sm:text-3xl">You may also like</h2><ProductGrid products={related} /></section>}
    </div>
  )
}
