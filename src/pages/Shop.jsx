import { useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import ProductGrid from '../components/ProductGrid'
import ProductFilter from '../components/ProductFilter'
import useSEO from '../hooks/useSEO'
import { products, getCategory } from '../data/products'

const sorts = { featured: 'Featured', low: 'Price: low to high', high: 'Price: high to low', rating: 'Top rated', new: 'Newest' }

export default function Shop({ mode }) {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim().toLowerCase()
  const cat = mode === 'category' ? getCategory(slug) : null
  const [filters, setFilters] = useState({ category: 'all', maxPrice: 8000 })
  const [sort, setSort] = useState('featured')

  const title = mode === 'search' ? `Search: ${params.get('q') || ''}` : cat ? cat.name : 'All products'
  useSEO({ title, description: cat ? `Shop handcrafted marble ${cat.name.toLowerCase()} from Veina.` : 'Browse the full Veina collection of handcrafted marble homeware.' })

  const list = useMemo(() => {
    let l = products.filter((p) => p.price <= filters.maxPrice)
    if (cat) l = l.filter((p) => p.category === cat.slug)
    else if (filters.category !== 'all') l = l.filter((p) => p.category === filters.category)
    if (mode === 'search' && q) l = l.filter((p) => `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(q))
    const s = { low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating, new: (a, b) => b.isNew - a.isNew }[sort]
    return s ? [...l].sort(s) : l
  }, [filters, sort, cat, q, mode])

  if (mode === 'category' && !cat) return <div className="py-32 text-center"><h1 className="text-4xl">Category not found</h1><Link to="/shop" className="mt-4 inline-block underline">Browse all products</Link></div>

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 md:py-16">
      <h1 className="text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-2 text-taupe">{list.length} {list.length === 1 ? 'piece' : 'pieces'}</p>
      <div className="mt-8 flex items-center justify-between gap-3 border-y border-stone py-3">
        <ProductFilter filters={filters} setFilters={setFilters} showCategories={mode !== 'category'} />
        <label className="ml-auto flex items-center gap-2 text-sm">Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-stone bg-cream px-3 py-2.5">
            {Object.entries(sorts).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-10 flex gap-12">
        <div className="hidden lg:block"><ProductFilterSide filters={filters} setFilters={setFilters} show={mode !== 'category'} /></div>
        <div className="min-w-0 flex-1"><ProductGrid products={list} empty="Nothing matched. Try a different search or reset the filters." /></div>
      </div>
    </div>
  )
}
// Desktop sidebar reuses the same filter markup.
function ProductFilterSide(props) {
  return <ProductFilter filters={props.filters} setFilters={props.setFilters} showCategories={props.show} desktopOnly />
}
