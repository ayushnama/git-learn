import { createContext, useContext, useEffect, useState } from 'react'
import { customerService } from '../services/customerService'
import { normalizeSession } from '../utils/customerResponses'

const CustomerContext = createContext(null)
export const useCustomer = () => useContext(CustomerContext)

export function CustomerProvider({ children, service = customerService }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    Promise.resolve().then(() => service.getSession({ signal: controller.signal })).then((session) => {
      const validated = normalizeSession(session, true)
      if (!controller.signal.aborted) setUser(validated)
    }).catch(() => { if (!controller.signal.aborted) { setUser(null); setError('Unable to check your account session. Please retry.') } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [service, attempt])
  async function authenticate(method, details) {
    if (!['login', 'signup'].includes(method)) throw new Error('Unsupported account action.')
    const session = normalizeSession(await service[method](details))
    setUser(session)
    return session
  }
  async function logout() { await service.logout(); setUser(null) }
  return <CustomerContext.Provider value={{ user, loading, error, service, authenticate, logout, setUser: (value) => setUser(normalizeSession(value)), retry: () => setAttempt((n) => n + 1) }}>{children}</CustomerContext.Provider>
}
