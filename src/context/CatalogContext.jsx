import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { catalogService } from '../services/catalogService'
import { legacyCategories } from '../data/products'

const CatalogContext = createContext(null)
export const useCatalog = () => useContext(CatalogContext)

export function CatalogProvider({ children, service = catalogService }) {
  const [catalog, setCatalog] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setError('')
    service.getCatalog({ signal: controller.signal }).then((data) => { if (!controller.signal.aborted) setCatalog(data) }).catch((failure) => { if (!controller.signal.aborted) setError(failure.message) })
    return () => controller.abort()
  }, [service, attempt])
  const value = useMemo(() => {
    if (!catalog) return null
    const bySlug = new Map(catalog.products.map((p) => [p.slug, p]))
    const byCategory = new Map([...legacyCategories, ...catalog.categories].map((c) => [c.slug, c]))
    return { ...catalog, getProduct: (slug) => bySlug.get(slug), getCategory: (slug) => byCategory.get(slug), priceCeiling: catalog.products.reduce((ceiling, p) => Math.max(ceiling, Math.ceil(p.price / 1000) * 1000), 1000) }
  }, [catalog])
  if (!catalog) return <main className="grid min-h-screen place-items-center bg-cream px-6 text-center"><div><h1 className="font-serif text-4xl">Marbello</h1>{error ? <><p role="alert" className="mt-4">We couldn’t load the collection. Please try again.</p><button className="mt-6 border border-teal text-teal hover:bg-bone px-6 py-3" onClick={() => setAttempt((n) => n + 1)}>Retry</button></> : <p role="status" className="mt-4">Preparing the collection…</p>}</div></main>
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}
