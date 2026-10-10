import CartItem from '../components/CartItem'
import Button from '../components/Button'
import useSEO from '../hooks/useSEO'
import { useStore } from '../context/StoreContext'
import { money } from '../utils/format'
import { orderSummary } from '../utils/checkout'
import { useLocation } from 'react-router-dom'

export default function Cart() {
  const { state } = useLocation()
  useSEO({ title: 'Your cart', description: 'Review the items in your Marbello cart.' })
  const { items, subtotal } = useStore()
  const { shipping } = orderSummary(items)
  if (!items.length) return (
    <div className="px-5 py-14 text-center"><h1 className="text-3xl sm:text-4xl">Your cart is empty</h1><p className="mt-3 text-ink/75">Find something made to last.</p><Button to="/shop" className="mt-8">Shop collection</Button></div>
  )
  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 md:py-9">
      <h1 className="text-3xl sm:text-4xl">Your cart</h1>
      {state?.purchaseNotice && <p role="status" className="mt-3 text-sm">{state.purchaseNotice}</p>}
      <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
        <ul className="border-t border-stone">{items.map((i) => <CartItem key={i.id} item={i} />)}</ul>
        <aside className="h-fit rounded-lg bg-bone p-5">
          <h2 className="text-2xl">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping ? money(shipping) : 'Free'}</dd></div>
            <div className="flex justify-between border-t border-stone pt-3 text-base"><dt>Total</dt><dd>{money(subtotal + shipping)}</dd></div>
          </dl>
          <Button to="/checkout" className="mt-6 w-full">Checkout</Button>
        </aside>
      </div>
    </div>
  )
}
