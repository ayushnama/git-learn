import { NavLink, useLocation } from 'react-router-dom'
import { useCustomer } from '../context/CustomerContext'
import Button from './Button'

export function CustomerField({ name, label, value, onChange, error, type = 'text', autoComplete, multiline, ...rest }) {
  const id = `customer-${name}`
  const props = { id, name, value, onChange: (event) => onChange(name, event.target.value), required: true, autoComplete, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : undefined, className: 'min-h-11 w-full rounded-md border border-stone bg-transparent px-3 py-2 text-base', ...rest }
  return <div><label htmlFor={id} className="mb-1 block text-sm">{label}</label>{multiline ? <textarea {...props} rows={2} /> : <input {...props} type={type} />}{error && <p id={`${id}-error`} className="mt-1 text-sm">{error}</p>}</div>
}

export function CustomerLayout({ title, children }) {
  return <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6"><p className="text-xs uppercase tracking-[0.2em]">Your Marbello</p><h1 className="mt-2 text-3xl sm:text-4xl">{title}</h1><nav aria-label="Customer account" className="mt-4 flex flex-wrap gap-x-6 gap-y-3 border-b border-stone pb-4">{[['profile','My Profile'],['addresses','My Addresses'],['orders','My Orders']].map(([path,label]) => <NavLink key={path} to={`/account/${path}`} className={({isActive}) => `text-sm ${isActive ? 'underline underline-offset-8' : ''}`}>{label}</NavLink>)}</nav><div className="mt-5">{children}</div></div>
}

export function AccountGate({ children }) {
  const { user, loading, error, retry } = useCustomer()
  const { pathname } = useLocation()
  if (loading) return <p role="status">Checking your account…</p>
  if (error) return <div><p role="alert">{error}</p><Button onClick={retry} className="mt-4">Retry</Button></div>
  if (!user) return <div className="rounded-lg bg-bone p-6"><h2 className="text-2xl">Sign in to your account</h2><p className="mt-3 text-sm">Your profile, saved addresses and orders will be available when customer services are connected. Sign in is required to continue to checkout.</p><div className="mt-4 flex flex-wrap gap-3"><Button to={`/login?returnTo=${encodeURIComponent(pathname)}`}>Login</Button><Button to={`/signup?returnTo=${encodeURIComponent(pathname)}`} variant="outline">Create account</Button></div></div>
  return children
}

export function ResourceState({ resource, children }) {
  if (resource.loading || (!resource.data && !resource.error)) return <p role="status">Loading your details…</p>
  if (resource.error) return <div><p role="alert">{resource.error}</p><Button onClick={resource.reload} className="mt-4">Retry</Button></div>
  return children
}

export function focusCustomerError(errors) {
  document.getElementById(`customer-${Object.keys(errors)[0]}`)?.focus()
}
