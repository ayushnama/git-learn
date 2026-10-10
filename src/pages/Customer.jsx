import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/Button'
import { AccountGate, CustomerField, CustomerLayout, ResourceState, focusCustomerError } from '../components/CustomerUI'
import { useCustomer } from '../context/CustomerContext'
import useCustomerResource from '../hooks/useCustomerResource'
import useSEO from '../hooks/useSEO'
import { validateAddress, validateProfile } from '../utils/customer'
import { money } from '../utils/format'

export function Profile() {
  useSEO({ title: 'My Profile', noIndex: true })
  return <CustomerLayout title="My Profile"><AccountGate><ProfileForm /></AccountGate></CustomerLayout>
}
function ProfileForm() {
  const { user, service, setUser, logout } = useCustomer()
  const [values, setValues] = useState({ name: user.name || '', email: user.email || '', phone: user.phone || '' })
  const [errors, setErrors] = useState({})
  const [pending, setPending] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    if (pending) return
    const invalid = validateProfile(values); setErrors(invalid); setNotice(''); setError('')
    if (Object.keys(invalid).length) { focusCustomerError(invalid); return }
    setPending(true)
    try {
      const updated = await service.updateProfile(Object.fromEntries(Object.entries(values).map(([key,value]) => [key,value.trim()])))
      if (!updated?.id || !updated?.email) throw new Error('The server did not confirm your profile changes.')
      setUser(updated); setNotice('Your profile was updated.')
    } catch (failure) { setError(failure.message || 'Unable to save your profile.') } finally { setPending(false) }
  }
  return <form noValidate onSubmit={submit} className="max-w-xl rounded-lg border border-stone p-5 sm:p-6"><div className="grid gap-4">{[['name','Full name','text','name'],['email','Email','email','email'],['phone','Mobile number','tel','tel-national']].map(([name,label,type,autoComplete]) => <CustomerField key={name} name={name} label={label} type={type} autoComplete={autoComplete} value={values[name]} error={errors[name]} onChange={(key,value) => { setValues({...values,[key]:value}); setNotice('') }} />)}</div><div className="mt-5 flex flex-wrap gap-3"><Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save profile'}</Button><Button type="button" disabled={pending} variant="outline" onClick={async () => { setPending(true); try { await logout() } catch (failure) { setError(failure.message) } finally { setPending(false) } }}>Sign out</Button></div>{error && <p role="alert" className="mt-3 text-sm">{error}</p>}{notice && <p role="status" className="mt-3 text-sm">{notice}</p>}</form>
}

export function Addresses() {
  useSEO({ title: 'My Addresses', noIndex: true })
  return <CustomerLayout title="My Addresses"><AccountGate><AddressBook /></AccountGate></CustomerLayout>
}
const emptyAddress = { name: '', phone: '', address: '', pincode: '' }
function AddressBook() {
  const { service } = useCustomer()
  const resource = useCustomerResource('getAddresses')
  const [editing, setEditing] = useState(null)
  const [values, setValues] = useState(emptyAddress)
  const [errors, setErrors] = useState({})
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [deleting, setDeleting] = useState(null)
  async function mutate(operation, message) {
    if (pending) return
    setPending(true); setError(''); setNotice('')
    try { await operation(); setEditing(null); setDeleting(null); resource.reload(); setNotice(message) }
    catch (failure) { setError(failure.message || 'Unable to update addresses. Please retry.') }
    finally { setPending(false) }
  }
  function start(address) { setEditing(address?.id || 'new'); setValues(address ? { ...address } : { ...emptyAddress }); setErrors({}); setError(''); setNotice(''); setDeleting(null) }
  function submit(event) {
    event.preventDefault()
    const invalid = validateAddress(values); setErrors(invalid)
    if (Object.keys(invalid).length) { focusCustomerError(invalid); return }
    mutate(() => service.saveAddress({ ...(editing !== 'new' ? { id: editing } : {}), ...Object.fromEntries(Object.entries(emptyAddress).map(([key]) => [key, values[key].trim()])) }), 'Your address was saved.')
  }
  return <><ResourceState resource={resource}><div className="mb-5 flex items-center justify-between gap-4"><p className="text-sm">Manage your delivery addresses.</p><Button disabled={pending} onClick={() => start(null)}>Add address</Button></div>{!resource.data?.length && <p className="rounded-lg bg-bone p-5">No saved addresses yet.</p>}<div className="grid gap-4 sm:grid-cols-2">{resource.data?.map((address) => <article key={address.id} className="min-w-0 rounded-lg border border-stone p-5"><h2 className="text-xl">{address.name}</h2>{address.isDefault && <p className="mt-1 text-xs uppercase tracking-wider">Default address</p>}<p className="mt-3 whitespace-pre-line break-words text-sm">{address.address}</p><p className="mt-1 text-sm">{address.pincode} · {address.phone}</p><div className="mt-4 flex flex-wrap gap-4 text-sm"><button disabled={pending} className="underline" onClick={() => start(address)} aria-label={`Edit address for ${address.name}`}>Edit</button><button disabled={pending} className="underline" onClick={() => setDeleting(address.id)} aria-label={`Delete address for ${address.name}`}>Delete</button>{!address.isDefault && <button disabled={pending} className="underline" onClick={() => mutate(() => service.setDefaultAddress({id:address.id}), 'Default address updated.')}>Set as default</button>}</div>{deleting === address.id && <div className="mt-4 border-t border-stone pt-3"><p className="text-sm">Delete this address?</p><div className="mt-3 flex gap-3"><Button disabled={pending} onClick={() => mutate(() => service.deleteAddress({id:address.id}), 'Address deleted.')}>Confirm delete</Button><button disabled={pending} className="text-sm underline" onClick={() => setDeleting(null)}>Cancel</button></div></div>}</article>)}</div></ResourceState>{editing && <form noValidate onSubmit={submit} className="mt-6 max-w-xl rounded-lg bg-bone p-5"><h2 className="text-2xl">{editing === 'new' ? 'Add address' : 'Edit address'}</h2><div className="mt-4 grid gap-4">{[['name','Recipient name','text','name'],['phone','Mobile number','tel','tel-national'],['address','Complete shipping address','text','street-address'],['pincode','Pincode','text','postal-code']].map(([name,label,type,autoComplete]) => <CustomerField key={name} name={name} label={label} type={type} autoComplete={autoComplete} multiline={name === 'address'} value={values[name]} error={errors[name]} maxLength={name === 'pincode' ? 6 : name === 'phone' ? 10 : undefined} onChange={(key,value) => setValues({...values,[key]:value})} />)}</div><div className="mt-5 flex gap-3"><Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save address'}</Button><Button type="button" variant="outline" disabled={pending} onClick={() => setEditing(null)}>Cancel</Button></div></form>}{pending && <p role="status" className="mt-3">Updating addresses…</p>}{error && <p role="alert" className="mt-3 text-sm">{error}</p>}{notice && <p role="status" className="mt-3 text-sm">{notice}</p>}</>
}

export function Orders() {
  useSEO({ title: 'My Orders', noIndex: true })
  return <CustomerLayout title="My Orders"><AccountGate><OrderList /></AccountGate></CustomerLayout>
}
function OrderList() {
  const resource = useCustomerResource('getOrders')
  return <ResourceState resource={resource}>{!resource.data?.length ? <div className="rounded-lg bg-bone p-6"><h2 className="text-2xl">No orders yet</h2><p className="mt-3 text-sm">Only orders confirmed by the server will appear here.</p><Button to="/shop" className="mt-5">Shop collection</Button></div> : <ul className="grid gap-4">{resource.data.map((order) => <li key={order.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-stone p-5"><div><h2 className="text-xl">Order {order.id}</h2><p className="mt-2 text-sm">{order.status || 'Status unavailable'} · {money(order.total)}</p></div><Button to={`/account/orders/${encodeURIComponent(order.id)}`} variant="outline">View order</Button></li>)}</ul>}</ResourceState>
}
export function OrderDetails() {
  useSEO({ title: 'Order details and tracking', noIndex: true })
  return <CustomerLayout title="Order details & tracking"><AccountGate><OrderDetailContent /></AccountGate></CustomerLayout>
}
function OrderDetailContent() {
  const { id } = useParams()
  const resource = useCustomerResource('getOrder', id)
  const order = resource.data
  return <><Link to="/account/orders" className="text-sm underline">Back to orders</Link><div className="mt-5"><ResourceState resource={resource}>{order && <div className="grid gap-6 md:grid-cols-2"><section className="min-w-0 rounded-lg border border-stone p-5"><h2 className="break-words text-2xl">Order {order.id}</h2><p className="mt-3 text-sm">Status: {order.status || 'Not available'}</p><p className="mt-2 text-sm">Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Not available'}</p><ul className="mt-4 divide-y divide-stone">{order.items?.map((item, index) => <li key={item.id || index} className="py-3 text-sm">{item.name} · Qty {item.qty} · {money(item.price * item.qty)}</li>)}</ul><p className="mt-3">Total: {money(order.total)}</p>{order.shippingAddress && <><h3 className="mt-5 text-xl">Shipping address</h3><p className="mt-2 whitespace-pre-line break-words text-sm">{order.shippingAddress.name}<br />{order.shippingAddress.address}<br />{order.shippingAddress.pincode}</p></>}</section><section className="rounded-lg bg-bone p-5"><h2 className="text-2xl">Tracking</h2>{order.tracking?.events?.length ? <ol className="mt-4 space-y-4 border-l border-stone pl-4">{order.tracking.events.map((event,index) => <li key={index}><p>{event.label}</p>{event.date && <p className="mt-1 text-sm">{event.date}</p>}</li>)}</ol> : <p className="mt-4 text-sm">Tracking updates are not available for this order yet.</p>}{order.tracking?.carrier && <p className="mt-4 text-sm">Carrier: {order.tracking.carrier}</p>}{order.tracking?.number && <p className="mt-2 break-words text-sm">Tracking number: {order.tracking.number}</p>}</section></div>}</ResourceState></div></>
}
