import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Heart, ShoppingBag, Menu, X, UserRound } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useCatalog } from '../context/CatalogContext'
import BrandMark from './BrandMark'
import useDialog from '../hooks/useDialog'
import SearchDropdown from './SearchDropdown'

export default function Navbar() {
  const { categories } = useCatalog()
  const [open, setOpen] = useState(false)
  const { count, wishlist } = useStore()
  const { pathname, search } = useLocation()
  const dialog = useDialog(open, () => setOpen(false))
  useEffect(() => { setOpen(false) }, [pathname, search])

  const link = ({ isActive }) => `text-sm transition-colors hover:text-teal ${isActive ? 'border-b border-gold text-teal' : ''}`
  const badge = (n) => n > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-teal px-1 text-[10px] text-cream">{n}</span>
  const accountActions = () => <>
    <Link to="/account/profile" aria-label="My account" className="icon-button hidden lg:inline-flex"><UserRound size={19} /></Link>
    <Link to="/wishlist" aria-label="Wishlist" className="icon-button relative w-10 sm:w-11"><Heart size={19} />{badge(wishlist.length)}</Link>
    <Link to="/cart" aria-label={`Cart, ${count} items`} className="icon-button relative w-10 sm:w-11"><ShoppingBag size={19} />{badge(count)}</Link>
  </>

  return (
    <>
      <p data-announcement className="bg-teal px-2 py-1.5 text-center text-xs text-cream">Free shipping across India on orders over ₹3,000</p>
    <header className="sticky top-0 z-40 border-b border-stone/70 bg-cream/95 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-[1440px] items-center justify-between px-0.5 sm:h-[72px] sm:px-3 lg:h-20 lg:px-8">
        <button className="icon-button lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
        <Link to="/" aria-label="Marbello home" className="absolute left-1/2 top-0 flex h-16 -translate-x-1/2 items-center sm:h-[72px] lg:static lg:h-20 lg:translate-x-0"><BrandMark /></Link>
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:flex xl:gap-6" aria-label="Collections">
          <NavLink to="/shop" className={link}>Shop</NavLink>
          {categories.map((c) => <NavLink key={c.slug} to={`/category/${c.slug}`} className={link}>{c.slug === 'home-decor' ? 'Home Decor' : c.name}</NavLink>)}
        </nav>
        <div className="ml-auto flex items-center"><SearchDropdown key={pathname + search} /><div className="flex">{accountActions()}</div></div>
      </div>
      {open && createPortal(
        <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <nav aria-label="Mobile" className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col overflow-y-auto bg-cream p-4">
            <div className="mb-4 flex items-center justify-between"><BrandMark variant="menu" /><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button></div>
            {[['/shop', 'All products'], ...categories.map((c) => [`/category/${c.slug}`, c.name]), ['/account/profile', 'My account'], ['/wishlist', 'Wishlist'], ['/contact', 'Contact'], ['/faq', 'FAQ']].map(([to, label]) => (
              <Link key={to} to={to} className="border-b border-stone/60 py-3 font-serif text-xl">{label}</Link>
            ))}
          </nav>
        </div>, document.body
      )}
    </header>
    </>
  )
}
