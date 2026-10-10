import ProductImage from './ProductImage'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { money } from '../utils/format'
import { quantityLimit } from '../utils/cart'
export default function CartItem({ item }) {
  const { setQty, removeFromCart } = useStore()
  return (
    <li className="flex gap-3 border-b border-stone py-4">
      <Link to={`/product/${item.slug}`} className="h-20 w-20 shrink-0 overflow-hidden bg-bone sm:h-24 sm:w-24"><ProductImage src={item.images[0]} alt={item.name} className="h-full w-full object-cover" /></Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex justify-between gap-3">
          <div className="min-w-0"><h3 className="text-lg leading-tight"><Link to={`/product/${item.slug}`}>{item.name}</Link></h3><p className="text-sm text-ink/75">{money(item.price)}</p></div>
          <p className="text-sm">{money(item.price * item.qty)}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-stone">
            <button className="grid h-11 w-11 place-items-center" aria-label="Decrease quantity" onClick={() => setQty(item.id, item.qty - 1)}><Minus size={14} /></button>
            <span className="w-6 text-center text-sm" aria-live="polite">{item.qty}</span>
            <button className="grid h-11 w-11 place-items-center" aria-label="Increase quantity" disabled={item.qty >= quantityLimit(item)} onClick={() => setQty(item.id, item.qty + 1)}><Plus size={14} /></button>
          </div>
          <button onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`} className="icon-button text-ink/75 hover:text-ink"><Trash2 size={17} /></button>
        </div>
      </div>
    </li>
  )
}
