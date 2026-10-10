import ProductImage from '../components/ProductImage'
import { normalizeOrderResponse } from '../utils/customerResponses'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import useSEO from '../hooks/useSEO'
import { useStore } from '../context/StoreContext'
import { money } from '../utils/format'
import { orderSummary, paymentMethods, validateCustomer } from '../utils/checkout'
import { placeOrder } from '../services/orderService'
import { useCustomer } from '../context/CustomerContext'
import useCustomerResource from '../hooks/useCustomerResource'
import { shippingCustomer } from '../utils/customer'
import { AccountGate } from '../components/CustomerUI'

const fields = [
  { name: 'name', label: 'Customer name', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel', inputMode: 'numeric', autoComplete: 'tel-national', maxLength: 10 },
  { name: 'pincode', label: 'Pincode', inputMode: 'numeric', autoComplete: 'postal-code', maxLength: 6 },
  { name: 'address', label: 'Complete address', autoComplete: 'street-address' },
]

export default function Checkout() {
  useSEO({ title: 'Checkout', description: 'Review your delivery details and Cash on Delivery order summary.', noIndex: true })
  const { user } = useCustomer()
  return <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8">{!user && <h1 className="mb-5 text-3xl sm:text-4xl">Checkout</h1>}<AccountGate><CheckoutForm /></AccountGate></div>
}

function CheckoutForm() {
  const { items } = useStore()
  const { user } = useCustomer()
  const addresses = useCustomerResource('getAddresses')
  const [addressMode, setAddressMode] = useState('saved')
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '', pincode: '' })
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [pending, setPending] = useState(false)
  const summary = orderSummary(items)
  const selectedAddress = addresses.data?.find((address) => String(address.id) === selectedAddressId)
  const usingSavedAddress = !!user && addressMode === 'saved'
  const deliveryCustomer = usingSavedAddress ? shippingCustomer(selectedAddress, user) : customer
  useEffect(() => {
    if (!user) { setSelectedAddressId(''); setAddressMode('saved'); return }
    if (addresses.data?.length && !addresses.data.some((address) => String(address.id) === selectedAddressId)) {
      const preferred = addresses.data.find((address) => address.isDefault) || addresses.data[0]
      setSelectedAddressId(String(preferred.id))
    }
    if (addresses.data?.length === 0) setAddressMode('manual')
  }, [user, addresses.data, selectedAddressId])
  async function submit(event) {
    event.preventDefault()
    if (pending || !items.length || !user) return
    const nextErrors = validateCustomer(deliveryCustomer)
    setErrors(nextErrors)
    setNotice('')
    if (Object.keys(nextErrors).length) {
      document.getElementById(`checkout-${Object.keys(nextErrors)[0]}`)?.focus()
      return
    }
    setPending(true)
    try {
      const result = await placeOrder({ customer: Object.fromEntries(Object.entries(deliveryCustomer).map(([key, value]) => [key, value.trim()])), ...(usingSavedAddress ? { shippingAddressId: selectedAddress.id } : {}), items: items.map(({ id, qty }) => ({ id, qty })), paymentMethod: 'cod' })
      setNotice(normalizeOrderResponse(result).message)
    } catch {
      setNotice('Unable to submit your order. Your cart has been kept unchanged. Please try again later.')
    } finally { setPending(false) }
  }
  if (!items.length) return <div className="px-5 py-28 text-center"><h1 className="text-4xl sm:text-5xl">Your cart is empty</h1><p className="mt-3 text-ink/75">Add products before continuing to checkout.</p><Button to="/shop" className="mt-8">Shop collection</Button></div>
  return (
    <div>
      <Link to="/cart" className="text-sm underline">Back to cart</Link>
      <h1 className="mt-2 text-3xl sm:text-4xl">Checkout</h1>
      <p className="mt-3 text-sm">Order placement is not available yet. You can review your details and totals; no order will be placed.</p>
      <form noValidate onSubmit={submit} className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <section>
          <h2 className="text-2xl">Delivery details</h2>
          <div className="mt-3 rounded-md border border-stone p-3">
            <p className="text-sm">Shipping address is required.</p>
            <fieldset className="mt-2 flex flex-wrap gap-4 text-sm"><legend className="sr-only">Address source</legend><label><input type="radio" name="addressSource" value="saved" checked={addressMode === 'saved'} onChange={() => { setAddressMode('saved'); setErrors({}); setNotice('') }} /> Saved address</label><label><input type="radio" name="addressSource" value="manual" checked={addressMode === 'manual'} onChange={() => { setAddressMode('manual'); setErrors({}); setNotice('') }} /> Enter another address</label></fieldset>
            {addresses.loading && <p role="status" className="mt-2 text-sm">Loading saved addresses…</p>}
            {addresses.error && <div className="mt-2 text-sm"><p role="alert">{addresses.error}</p><button type="button" className="mt-2 underline" onClick={addresses.reload}>Retry addresses</button></div>}
            {addressMode === 'saved' && !!addresses.data?.length && <><label htmlFor="saved-shipping-address" className="mt-3 block text-sm">Choose shipping address</label><select id="saved-shipping-address" value={selectedAddressId} onChange={(event) => { setSelectedAddressId(event.target.value); setErrors({}); setNotice('') }} className="mt-1 w-full min-w-0 rounded border border-stone bg-cream p-2 text-sm">{addresses.data.map((address) => <option key={address.id} value={String(address.id)}>{address.name} · {address.pincode}{address.isDefault ? ' · Default' : ''}</option>)}</select></>}
            {addresses.data?.length === 0 && <p className="mt-2 text-sm">No saved addresses. Enter your delivery details below.</p>}
            <Link to="/account/addresses" className="mt-2 inline-block text-sm underline">Manage addresses</Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
            {fields.map((field) => <div key={field.name} className={['name', 'email', 'address'].includes(field.name) ? 'col-span-2 sm:col-span-1' + (field.name === 'address' ? ' sm:col-span-2' : '') : ''}>
              <label htmlFor={`checkout-${field.name}`} className="mb-1 block text-sm">{field.label} <span aria-hidden="true">*</span></label>
              {field.name === 'address'
                ? <textarea id="checkout-address" name="address" autoComplete={field.autoComplete} required readOnly={usingSavedAddress} rows={2} value={deliveryCustomer.address} onChange={(e) => { setCustomer({ ...customer, address: e.target.value }); setNotice('') }} aria-invalid={!!errors.address} aria-describedby={errors.address ? 'checkout-address-error' : undefined} className="min-h-11 w-full rounded-md border border-stone bg-transparent px-3 py-2 text-base" />
                : <input name={field.name} type={field.type || 'text'} autoComplete={field.autoComplete} inputMode={field.inputMode} maxLength={field.maxLength} id={`checkout-${field.name}`} required readOnly={usingSavedAddress} value={deliveryCustomer[field.name]} onChange={(e) => { setCustomer({ ...customer, [field.name]: e.target.value }); setNotice('') }} aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `checkout-${field.name}-error` : undefined} className="min-h-11 w-full rounded-md border border-stone bg-transparent px-3 py-2 text-base" />}
              {errors[field.name] && <p id={`checkout-${field.name}-error`} className="mt-2 text-sm">{errors[field.name]}</p>}
            </div>)}
          </div>
          <fieldset className="mt-5 border-t border-stone pt-3">
            <legend className="text-2xl">Payment method</legend>
            {paymentMethods.map((method) => <label key={method.id} className="mt-2 flex min-h-11 items-center gap-3"><input type="radio" name="paymentMethod" value={method.id} checked={method.id === 'cod'} readOnly />{method.label}</label>)}
            <p className="mt-3 text-sm">Pay when your order is delivered. Delivery availability will be confirmed when order placement is enabled.</p>
          </fieldset>
        </section>
        <aside className="h-fit min-w-0 rounded-lg bg-bone p-4 sm:p-5">
          <h2 className="text-2xl">Order summary</h2>
          <ul className="mt-3 divide-y divide-stone">{items.map((item) => <li key={item.id} className="flex gap-3 py-2"><ProductImage src={item.images[0]} alt={item.name} className="h-12 w-12 shrink-0 rounded object-cover" /><div className="min-w-0 flex-1 break-words"><Link to={`/product/${item.slug}`} className="text-sm">{item.name}</Link><p className="mt-1 text-sm">Quantity: {item.qty}</p><p className="mt-1 text-sm">{money(item.price * item.qty)}</p></div></li>)}</ul>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Products subtotal</dt><dd>{money(summary.originalSubtotal)}</dd></div>
            <div className="flex justify-between"><dt>Discount</dt><dd>−{money(summary.discount)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{summary.shipping ? money(summary.shipping) : 'Free'}</dd></div>
            <div className="flex justify-between border-t border-stone pt-3 text-base"><dt>Total</dt><dd>{money(summary.total)}</dd></div>
          </dl>
          <Button type="submit" disabled={pending} className="mt-4 w-full">{pending ? 'Checking availability…' : 'Place Order'}</Button>
          {notice && <p role="status" className="mt-4 text-sm">{notice}</p>}
        </aside>
      </form>
    </div>
  )
}
