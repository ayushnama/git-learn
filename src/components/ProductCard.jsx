import ProductImage from './ProductImage'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Plus } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { money } from '../utils/format'
import { useCatalog } from '../context/CatalogContext'
import useBuyNow from '../hooks/useBuyNow'
import { quantityLimit } from '../utils/cart'

export default function ProductCard({ product: p }) {
  const { getCategory } = useCatalog()
  const buyNow = useBuyNow(p)
  const { isWished, toggleWish, addToCart } = useStore()
  const wished = isWished(p.id)
  const [feedback, setFeedback] = useState('')
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const add = () => {
    clearTimeout(timer.current)
    setFeedback(addToCart(p.id).message)
    timer.current = setTimeout(() => setFeedback(''), 1800)
  }
  return (
    <article className="group flex h-full min-w-0 flex-col">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-stone/70 bg-bone">
        <Link to={`/product/${p.slug}`} aria-label={p.name}>
          <ProductImage src={p.images[0]} alt={`${p.name} handcrafted marble`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105" />
          {p.images[1] && <ProductImage hideOnError src={p.images[1]} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />}
        </Link>
        {(p.isNew || p.bestSeller) && <span className="absolute left-2 top-2 max-w-[calc(100%-56px)] rounded bg-cream px-2 py-1 text-[10px] sm:text-xs">{p.isNew ? 'New' : 'Best seller'}</span>}
        <button onClick={() => toggleWish(p.id)} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={wished}
          className="absolute right-1.5 top-1.5 grid h-11 w-11 place-items-center rounded-full bg-cream text-teal transition hover:bg-bone">
          <Heart size={16} className={wished ? 'fill-teal' : ''} />
        </button>
        <span className="sr-only" role="status">{feedback}</span>
        <button onClick={add} disabled={!quantityLimit(p)} title={feedback || (!quantityLimit(p) ? 'Out of stock' : undefined)} aria-label={`Add ${p.name} to cart`}
          className="absolute bottom-2 right-2 grid h-11 w-11 place-items-center bg-teal text-cream transition md:translate-y-14 md:group-hover:translate-y-0 md:focus-visible:translate-y-0 enabled:hover:bg-teal-dark">
          <Plus size={18} />
        </button>
      </div>
      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-xs text-ink/75">{getCategory(p.category)?.name}</p>
        <h3 className="mt-1 min-h-[2.5em] text-base leading-tight sm:text-lg"><Link to={`/product/${p.slug}`} className="hover:text-ink/75">{p.name}</Link></h3>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-2 text-sm"><span className="font-medium">{money(p.price)}</span>{p.compareAt > p.price && <span className="text-ink/75 line-through">{money(p.compareAt)}</span>}{p.discount > 0 && <span className="text-xs text-ink">{p.discount}% off</span>}</p>
        <p className="mb-3 mt-2 text-xs text-ink/75">{!p.stock ? 'Out of stock' : p.stock <= 3 ? `Only ${p.stock} left` : 'In stock'}</p>
        <button onClick={buyNow} disabled={!quantityLimit(p)} aria-label={`Buy ${p.name} now`} className="mt-auto min-h-11 w-full rounded-md border border-teal text-teal px-3 py-2.5 text-sm transition-colors enabled:hover:bg-bone disabled:cursor-not-allowed disabled:opacity-50">{p.stock ? 'Buy now' : 'Out of stock'}</button>
      </div>
    </article>
  )
}
