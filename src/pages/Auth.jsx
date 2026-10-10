import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import { CustomerField, focusCustomerError } from '../components/CustomerUI'
import { useCustomer } from '../context/CustomerContext'
import useSEO from '../hooks/useSEO'
import { safeAccountReturn, validateAccount } from '../utils/customer'

export default function Auth({ signup = false }) {
  useSEO({ title: signup ? 'Signup' : 'Login', noIndex: true })
  const { authenticate, user, logout } = useCustomer()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = safeAccountReturn(params.get('returnTo'))
  const [values, setValues] = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const change = (name, value) => { setValues((current) => ({ ...current, [name]: value })); setError('') }
  async function submit(event) {
    event.preventDefault()
    if (pending) return
    const invalid = validateAccount(values, signup)
    setErrors(invalid)
    if (Object.keys(invalid).length) { focusCustomerError(invalid); return }
    setPending(true); setError('')
    try {
      const { confirmPassword, ...payload } = values
      await authenticate(signup ? 'signup' : 'login', { ...payload, name: payload.name.trim(), email: payload.email.trim() })
      navigate(returnTo)
    } catch (failure) { setError(failure.message || 'Unable to connect to customer services. Please try again later.') }
    finally { setPending(false); setValues((current) => ({ ...current, password: '', confirmPassword: '' })) }
  }
  return <div className="mx-auto grid max-w-5xl gap-5 px-4 py-6 sm:px-6 md:grid-cols-2 md:py-9"><section className="order-2 rounded-xl bg-bone p-5 md:order-1 md:p-7"><p className="text-xs uppercase tracking-[0.2em]">Marbello · Crafting beauty</p><h1 className="mt-4 text-3xl md:text-4xl">{signup ? 'A home for your favourites.' : 'Welcome back.'}</h1><p className="mt-5 leading-relaxed">Thoughtfully crafted marble, personal details in one place, and a simpler shopping journey.</p><p className="mt-6 text-sm">Customer services are not connected yet. No account will be created or authenticated until the backend is available.</p></section><section className="order-1 min-w-0 rounded-xl border border-stone p-5 md:order-2 md:p-7"><h2 className="text-2xl">{signup ? 'Create your account' : 'Login'}</h2>{user ? <><p className="mt-4">Signed in as {user.email}</p><Button to={returnTo} className="mt-4">Continue</Button><Button disabled={pending} variant="outline" className="ml-2 mt-4" onClick={async () => { setPending(true); try { await logout() } catch (failure) { setError(failure.message) } finally { setPending(false) } }}>Sign out</Button></> : <form noValidate onSubmit={submit} className="mt-4 space-y-3">{signup && <><CustomerField name="name" label="Full name" value={values.name} onChange={change} error={errors.name} autoComplete="name" /><CustomerField name="phone" label="Mobile number" value={values.phone} onChange={change} error={errors.phone} type="tel" autoComplete="tel-national" maxLength={10} /></>}<CustomerField name="email" label="Email" value={values.email} onChange={change} error={errors.email} type="email" autoComplete="email" /><CustomerField name="password" label="Password" value={values.password} onChange={change} error={errors.password} type="password" autoComplete={signup ? 'new-password' : 'current-password'} />{signup && <CustomerField name="confirmPassword" label="Confirm password" value={values.confirmPassword} onChange={change} error={errors.confirmPassword} type="password" autoComplete="new-password" />}<Button type="submit" disabled={pending} className="w-full">{pending ? 'Connecting…' : signup ? 'Create account' : 'Login'}</Button><p className="text-sm">{signup ? 'Already have an account?' : 'New to Marbello?'} <Link className="underline" to={`${signup ? '/login' : '/signup'}?returnTo=${encodeURIComponent(returnTo)}`}>{signup ? 'Login' : 'Sign up'}</Link></p></form>}{error && <p role="alert" className="mt-4 text-sm">{error}</p>}</section></div>
}
