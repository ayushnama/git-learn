import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import BrandMark from './BrandMark'
export default function Footer() {
  const { categories } = useCatalog()
  const col = 'space-y-2.5 text-sm text-stone'
  return (
    <footer className="bg-teal text-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-x-3 gap-y-6 px-4 py-8 sm:grid-cols-2 sm:gap-6 sm:px-6 sm:py-10 lg:grid-cols-4">
        <div className="col-span-3 flex items-center gap-4 sm:col-span-1 sm:block">
          <Link to="/" aria-label="Marbello home" className="shrink-0"><BrandMark variant="footer" /></Link>
          <p className="min-w-0 max-w-xs text-sm text-stone sm:mt-4">Marble homeware carved and finished by hand in Makrana, Rajasthan.</p>
        </div>
        <nav aria-label="Shop"><h2 className="mb-4 text-xl">Shop</h2><ul className={col}>{categories.map((c) => <li key={c.slug}><Link className="hover:text-cream" to={`/category/${c.slug}`}>{c.name}</Link></li>)}</ul></nav>
        <nav aria-label="Help"><h2 className="mb-4 text-xl">Help</h2><ul className={col}>
          {[['/faq', 'FAQ'], ['/shipping-returns', 'Shipping & returns'], ['/contact', 'Contact']].map(([to, l]) => <li key={to}><Link className="hover:text-cream" to={to}>{l}</Link></li>)}
        </ul></nav>
        <nav aria-label="Legal"><h2 className="mb-4 text-xl">Legal</h2><ul className={col}>
          <li><Link className="hover:text-cream" to="/privacy-policy">Privacy policy</Link></li>
          <li><Link className="hover:text-cream" to="/terms-and-conditions">Terms & conditions</Link></li>
        </ul></nav>
      </div>
      <p className="border-t border-gold/40 py-4 text-center text-xs text-stone">© {new Date().getFullYear()} Marbello. All rights reserved.</p>
    </footer>
  )
}
