import { Link } from 'react-router-dom'
import { Heart, Plus } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { money } from '../utils/format'
import { getCategory } from '../data/products'

export default function ProductCard({ product: p }) {
  const { isWished, toggleWish, addToCart } = useStore()
  const wished = isWished(p.id)
  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-bone">
        <Link to={`/product/${p.slug}`} aria-label={p.name}>
          <img src={p.images[0]} alt={`${p.name} handcrafted marble`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <img src={p.images[1]} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </Link>
        {(p.isNew || p.bestSeller) && <span className="absolute left-3 top-3 bg-cream px-2.5 py-1 text-xs">{p.isNew ? 'New' : 'Best seller'}</span>}
        <button onClick={() => toggleWish(p.id)} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={wished}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-cream/90 transition hover:bg-cream">
          <Heart size={16} className={wished ? 'fill-ink' : ''} />
        </button>
        <button onClick={() => addToCart(p.id)} aria-label={`Add ${p.name} to cart`}
          className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center bg-ink text-cream transition md:translate-y-14 md:group-hover:translate-y-0 hover:bg-taupe">
          <Plus size={18} />
        </button>
      </div>
      <div className="mt-4">
        <p className="text-xs text-taupe">{getCategory(p.category)?.name}</p>
        <h3 className="mt-1 text-xl leading-snug"><Link to={`/product/${p.slug}`} className="hover:text-taupe">{p.name}</Link></h3>
        <p className="mt-1 text-sm"><span>{money(p.price)}</span> <span className="ml-2 text-taupe line-through">{money(p.compareAt)}</span></p>
      </div>
    </article>
  )
}
