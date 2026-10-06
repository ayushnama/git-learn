import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Search, Heart, ShoppingBag, Menu, X } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { categories } from '../data/products'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [q, setQ] = useState('')
  const { count, wishlist } = useStore()
  const nav = useNavigate()
  const { pathname } = useLocation()
  useEffect(() => { setOpen(false); setSearching(false) }, [pathname])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' }, [open])

  const submit = (e) => { e.preventDefault(); if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`) }
  const link = ({ isActive }) => `text-sm transition-colors hover:text-taupe ${isActive ? 'border-b border-ink' : ''}`
  const badge = (n) => n > 0 && <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] text-cream">{n}</span>

  return (
    <header className="sticky top-0 z-40 border-b border-stone/70 bg-cream/90 backdrop-blur">
      <p className="bg-ink py-2 text-center text-xs text-cream">Free shipping across India on orders over ₹3,000</p>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></button>
        <Link to="/" className="font-serif text-2xl tracking-[0.2em] lg:text-3xl">VEINA</Link>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          <NavLink to="/shop" className={link}>Shop</NavLink>
          {categories.slice(0, 4).map((c) => <NavLink key={c.slug} to={`/category/${c.slug}`} className={link}>{c.name}</NavLink>)}
          <NavLink to="/about" className={link}>Our story</NavLink>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={() => setSearching((s) => !s)} aria-label="Search"><Search size={20} /></button>
          <Link to="/wishlist" aria-label="Wishlist" className="relative hidden sm:block"><Heart size={20} />{badge(wishlist.length)}</Link>
          <Link to="/cart" aria-label={`Cart, ${count} items`} className="relative"><ShoppingBag size={20} />{badge(count)}</Link>
        </div>
      </div>
      {searching && (
        <form onSubmit={submit} role="search" className="border-t border-stone/70 bg-cream px-5 py-3 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cups, bowls, clocks…" aria-label="Search products" className="w-full bg-transparent py-2 text-base outline-none" />
            <button className="text-sm underline">Search</button>
          </div>
        </form>
      )}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <nav aria-label="Mobile" className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col overflow-y-auto bg-cream p-6">
            <div className="mb-8 flex items-center justify-between"><span className="font-serif text-2xl tracking-[0.2em]">VEINA</span><button onClick={() => setOpen(false)} aria-label="Close menu"><X /></button></div>
            {[['/shop', 'All products'], ...categories.map((c) => [`/category/${c.slug}`, c.name]), ['/wishlist', 'Wishlist'], ['/about', 'Our story'], ['/contact', 'Contact'], ['/faq', 'FAQ']].map(([to, label]) => (
              <Link key={to} to={to} className="border-b border-stone/60 py-3.5 font-serif text-2xl">{label}</Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
