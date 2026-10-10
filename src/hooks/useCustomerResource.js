import { useEffect, useState } from 'react'
import { useCustomer } from '../context/CustomerContext'
import { normalizeCustomerResource } from '../utils/customerResponses'

export default function useCustomerResource(method, id) {
  const { service, user } = useCustomer()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setData(null)
    setError('')
    setLoading(!!user)
    if (user) {
      Promise.resolve().then(() => service[method]({ id, signal: controller.signal })).then((result) => {
        const validated = normalizeCustomerResource(method, result, id)
        if (!controller.signal.aborted) setData(validated)
      }).catch((failure) => { if (!controller.signal.aborted) setError(failure.message || 'Unable to load your account data.') })
        .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    }
    return () => controller.abort()
  }, [service, user, method, id, attempt])
  return { data, loading, error, reload: () => setAttempt((n) => n + 1) }
}
