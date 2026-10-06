import CartItem from '../components/CartItem'
import Button from '../components/Button'
import useSEO from '../hooks/useSEO'
import { useStore } from '../context/StoreContext'
import { money } from '../utils/format'

export default function Cart() {
  useSEO({ title: 'Your cart', description: 'Review the items in your Veina cart.' })
  const { items, subtotal } = useStore()
  const shipping = subtotal >= 3000 || !subtotal ? 0 : 150
  if (!items.length) return (
    <div className="px-5 py-28 text-center"><h1 className="text-4xl sm:text-5xl">Your cart is empty</h1><p className="mt-3 text-taupe">Find something made to last.</p><Button to="/shop" className="mt-8">Shop collection</Button></div>
  )
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 md:py-16">
      <h1 className="text-4xl sm:text-5xl">Your cart</h1>
      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_380px]">
        <ul className="border-t border-stone">{items.map((i) => <CartItem key={i.id} item={i} />)}</ul>
        <aside className="h-fit bg-bone p-7">
          <h2 className="text-2xl">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping ? money(shipping) : 'Free'}</dd></div>
            <div className="flex justify-between border-t border-stone pt-3 text-base"><dt>Total</dt><dd>{money(subtotal + shipping)}</dd></div>
          </dl>
          <Button className="mt-6 w-full" onClick={() => alert('Checkout will be added with the backend.')}>Checkout</Button>
        </aside>
      </div>
    </div>
  )
}
