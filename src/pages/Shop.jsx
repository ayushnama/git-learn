import { useMemo, useState } from 'react'
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom'
import ProductGrid from '../components/ProductGrid'
import ProductFilter from '../components/ProductFilter'
import useSEO from '../hooks/useSEO'
import { belongsToCategory } from '../data/products'
import { useCatalog } from '../context/CatalogContext'
import { matchesProduct } from '../utils/search'

const sorts = { featured: 'Featured', low: 'Price: low to high', high: 'Price: high to low', rating: 'Top rated', new: 'New arrivals first' }

export default function Shop({ mode }) {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  return <ShopContent key={`${mode}:${pathname}:${params.get('q') || ''}`} mode={mode} />
}

function ShopContent({ mode }) {
  const { products, getCategory, priceCeiling } = useCatalog()
  const { slug } = useParams()
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim().toLowerCase()
  const cat = mode === 'category' ? getCategory(slug) : null
  const [selectedFilters, setFilters] = useState({ category: 'all', maxPrice: null })
  const filters = useMemo(() => ({ ...selectedFilters, maxPrice: Math.min(selectedFilters.maxPrice ?? priceCeiling, priceCeiling) }), [selectedFilters, priceCeiling])
  const [sort, setSort] = useState('featured')
  const reset = () => { setFilters({ category: 'all', maxPrice: null }); setSort('featured') }

  const title = mode === 'search' ? `Search: ${params.get('q') || ''}` : cat ? cat.name : 'All products'
  useSEO({ title: mode === 'category' && !cat ? 'Category not found' : title, description: cat ? `Shop handcrafted marble ${cat.name.toLowerCase()} from Marbello.` : 'Browse the full Marbello collection of handcrafted marble homeware.', noIndex: mode === 'category' && !cat })

  const list = useMemo(() => {
    let l = products.filter((p) => p.price <= filters.maxPrice)
    if (cat) l = l.filter((p) => belongsToCategory(p, cat.slug))
    else if (filters.category !== 'all') l = l.filter((p) => p.category === filters.category)
    if (mode === 'search' && q) l = l.filter((p) => matchesProduct(p, q, getCategory(p.category)?.name))
    const s = { low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating, new: (a, b) => b.isNew - a.isNew }[sort]
    return s ? [...l].sort(s) : l
  }, [filters, sort, cat, q, mode, products, getCategory])

  if (mode === 'category' && !cat) return <div className="py-32 text-center"><h1 className="text-4xl">Category not found</h1><Link to="/shop" className="mt-4 inline-block underline">Browse all products</Link></div>

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 md:py-9">
      <h1 className="text-3xl sm:text-4xl">{title}</h1>
      {cat?.description && <p className="mt-3 max-w-xl text-ink/75">{cat.description}</p>}
      <p className="mt-2 text-ink/75">{list.length} {list.length === 1 ? 'piece' : 'pieces'}</p>
      <div className="mt-5 flex items-center justify-between gap-3 border-y border-stone py-3">
        <ProductFilter filters={filters} setFilters={setFilters} onReset={reset} showCategories={mode !== 'category'} />
        <label className="ml-auto flex min-w-0 items-center gap-2 text-sm">Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="min-h-11 min-w-0 max-w-[180px] rounded border border-stone bg-cream px-2 py-2 sm:max-w-none">
            {Object.entries(sorts).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-6 flex gap-7">
        <div className="hidden lg:block"><ProductFilter filters={filters} setFilters={setFilters} onReset={reset} showCategories={mode !== 'category'} desktopOnly /></div>
        <div className="min-w-0 flex-1"><ProductGrid products={list} empty="Nothing matched. Try a different search or reset the filters." /></div>
      </div>
    </div>
  )
}
