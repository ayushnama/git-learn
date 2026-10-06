import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { money } from '../utils/format'
export default function CartItem({ item }) {
  const { setQty, removeFromCart } = useStore()
  return (
    <li className="flex gap-4 border-b border-stone py-6">
      <Link to={`/product/${item.slug}`} className="h-28 w-24 shrink-0 overflow-hidden bg-bone sm:h-32 sm:w-28"><img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" /></Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex justify-between gap-3">
          <div className="min-w-0"><h3 className="text-xl leading-tight"><Link to={`/product/${item.slug}`}>{item.name}</Link></h3><p className="text-sm text-taupe">{money(item.price)}</p></div>
          <p className="text-sm">{money(item.price * item.qty)}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-stone">
            <button className="p-2" aria-label="Decrease quantity" onClick={() => setQty(item.id, item.qty - 1)}><Minus size={14} /></button>
            <span className="w-8 text-center text-sm" aria-live="polite">{item.qty}</span>
            <button className="p-2" aria-label="Increase quantity" onClick={() => setQty(item.id, item.qty + 1)}><Plus size={14} /></button>
          </div>
          <button onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`} className="p-2 text-taupe hover:text-ink"><Trash2 size={17} /></button>
        </div>
      </div>
    </li>
  )
}
