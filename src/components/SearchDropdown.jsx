import ProductImage from './ProductImage'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useCatalog } from '../context/CatalogContext'
import { matchesProduct } from '../utils/search'
import { money } from '../utils/format'

export default function SearchDropdown() {
  const { products, categories, getCategory } = useCatalog()
  const navigate = useNavigate()
  const panel = useRef(null)
  const input = useRef(null)
  const trigger = useRef(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(-1)
  const [open, setOpen] = useState(false)
  const [present, setPresent] = useState(false)
  useEffect(() => {
    if (open) { setPresent(true); return }
    const timer = setTimeout(() => setPresent(false), 150)
    return () => clearTimeout(timer)
  }, [open])
  useEffect(() => { if (open && present) input.current?.focus({ preventScroll: true }) }, [open, present])
  const onClose = (restore = false) => { setOpen(false); setActive(-1); if (restore === true) trigger.current?.focus() }
  const suggestions = useMemo(() => {
    const q = query.trim()
    if (!q) return categories.slice(0, 4).map((category) => ({ to: `/category/${category.slug}`, label: category.name, category: true }))
    return [
      ...products.filter((product) => matchesProduct(product, q, getCategory(product.category)?.name)).slice(0, 3).map((product) => ({ to: `/product/${product.slug}`, label: product.name, image: product.images[0], price: product.price })),
      ...categories.filter((category) => matchesProduct({ name: category.name, category: category.slug, description: '' }, q)).slice(0, 2).map((category) => ({ to: `/category/${category.slug}`, label: category.name, category: true })),
    ]
  }, [query, products, categories, getCategory])
  useEffect(() => {
    if (!open) return
    input.current?.focus({ preventScroll: true })
    const outside = (event) => { if (!panel.current?.contains(event.target)) onClose(false) }
    const escape = (event) => { if (event.key === 'Escape') { event.preventDefault(); onClose(true) } }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', outside); document.removeEventListener('keydown', escape) }
  }, [open])
  const visit = (to) => { onClose(false); navigate(to) }
  const submit = (event) => { event.preventDefault(); if (query.trim()) visit(`/search?q=${encodeURIComponent(query.trim())}`) }
  function keydown(event) {
    if (['ArrowDown', 'ArrowUp'].includes(event.key) && suggestions.length) {
      event.preventDefault()
      setOpen(true)
      setActive((index) => event.key === 'ArrowDown' ? (index + 1) % suggestions.length : (index <= 0 ? suggestions.length - 1 : index - 1))
    } else if (event.key === 'Enter' && active >= 0 && suggestions[active]) {
      event.preventDefault(); visit(suggestions[active].to)
    } else if (event.key === 'Enter' && query.trim()) {
      event.preventDefault(); visit(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }
  return <div ref={panel} aria-label="Product search">
    <button ref={trigger} type="button" aria-label="Search" aria-expanded={open} aria-controls="navbar-search" className="icon-button w-10 sm:w-11" onClick={() => open ? onClose(true) : setOpen(true)}><Search size={20} /></button>
    {present && <div id="navbar-search" inert={open ? undefined : ''} aria-hidden={!open} className={`navbar-search-panel absolute right-3 top-full z-50 mt-2 w-[calc(100%-24px)] max-w-[420px] rounded-lg border border-stone bg-cream p-3 shadow-lg transition-[opacity,transform] duration-150 lg:right-[164px] ${open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'}`}>
    <form role="search" onSubmit={submit} className="navbar-search-form flex items-center gap-2 rounded-md border border-stone px-2">
      <Search size={18} aria-hidden="true" className="shrink-0" />
      <input ref={input} role="combobox" aria-label="Search products" aria-autocomplete="list" aria-expanded={open} aria-controls="search-suggestions" aria-activedescendant={open && active >= 0 ? `search-suggestion-${active}` : undefined} value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setActive(-1); setOpen(true) }} onKeyDown={keydown} placeholder="Search marble products" className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none" />
      <button type="submit" aria-label="Submit search" className="icon-button"><Search size={18} /></button>
    </form>
    <div className="max-h-[min(280px,40dvh)] overflow-y-auto"><div className="flex items-center justify-between"><p className="px-1 text-xs uppercase tracking-wider">{query.trim() ? 'Suggestions' : 'Browse categories'}</p><button type="button" onClick={() => onClose(true)} aria-label="Close search" className="icon-button"><X size={16} /></button></div>
    <ul id="search-suggestions" role="listbox" aria-label="Search suggestions" className="space-y-1">
      {suggestions.map((suggestion, index) => <li key={suggestion.to} id={`search-suggestion-${index}`} role="option" aria-selected={active === index} className={`rounded-md ${active === index ? 'bg-bone' : ''}`}>
        <Link to={suggestion.to} tabIndex={-1} onMouseEnter={() => setActive(index)} onClick={() => onClose(false)} className="flex min-h-11 items-center gap-3 rounded-md px-2 py-2 hover:bg-bone">
          {suggestion.image && <ProductImage src={suggestion.image} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />}
          <span className="min-w-0 flex-1 text-sm">{suggestion.label}{suggestion.category && <span className="ml-2 text-xs">Collection</span>}</span>
          {suggestion.price != null && <span className="shrink-0 text-xs">{money(suggestion.price)}</span>}
        </Link>
      </li>)}
    </ul>
    {!suggestions.length && <p role="status" className="px-2 py-3 text-sm">No suggestions found. Search the full collection below.</p>}
    <p role="status" className="sr-only">{suggestions.length} suggestions. Use arrow keys to select, Enter to open, Escape to close.</p>
    {query.trim() && <button onClick={() => visit(`/search?q=${encodeURIComponent(query.trim())}`)} className="mt-3 min-h-11 w-full border-t border-stone pt-2 text-left text-sm underline">See all results for “{query.trim()}”</button>}
    </div></div>}
  </div>
}
