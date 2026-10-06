import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { categories } from '../data/products'
import { money } from '../utils/format'

export default function ProductFilter({ filters, setFilters, showCategories, desktopOnly }) {
  const [open, setOpen] = useState(false)
  const body = (
    <div className="space-y-8">
      {showCategories && (
        <fieldset>
          <legend className="mb-3 font-serif text-xl">Category</legend>
          {[{ slug: 'all', name: 'All' }, ...categories].map((c) => (
            <label key={c.slug} className="flex cursor-pointer items-center gap-2 py-1.5 text-sm">
              <input type="radio" name="cat" className="accent-ink" checked={filters.category === c.slug} onChange={() => setFilters({ ...filters, category: c.slug })} />{c.name}
            </label>
          ))}
        </fieldset>
      )}
      <div>
        <label htmlFor="price" className="mb-3 block font-serif text-xl">Max price: {money(filters.maxPrice)}</label>
        <input id="price" type="range" min="1000" max="8000" step="250" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: +e.target.value })} className="w-full accent-ink" />
      </div>
      <button className="text-sm underline" onClick={() => setFilters({ ...filters, category: 'all', maxPrice: 8000 })}>Reset filters</button>
    </div>
  )
  if (desktopOnly) return <aside className="w-56 shrink-0">{body}</aside>
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 border border-stone px-4 py-2.5 text-sm lg:hidden"><SlidersHorizontal size={16} /> Filters</button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-cream p-6">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl">Filters</h2><button onClick={() => setOpen(false)} aria-label="Close filters"><X /></button></div>
            {body}
            <button onClick={() => setOpen(false)} className="mt-8 w-full bg-ink py-3 text-sm text-cream">Show results</button>
          </div>
        </div>
      )}
    </>
  )
}
