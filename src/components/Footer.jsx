import { Link } from 'react-router-dom'
import { categories } from '../data/products'
export default function Footer() {
  const col = 'space-y-2.5 text-sm text-stone'
  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <div>
          <p className="font-serif text-3xl tracking-[0.2em]">VEINA</p>
          <p className="mt-4 max-w-xs text-sm text-stone">Marble homeware carved and finished by hand in Makrana, Rajasthan.</p>
        </div>
        <nav aria-label="Shop"><h2 className="mb-4 text-xl">Shop</h2><ul className={col}>{categories.map((c) => <li key={c.slug}><Link className="hover:text-cream" to={`/category/${c.slug}`}>{c.name}</Link></li>)}</ul></nav>
        <nav aria-label="Help"><h2 className="mb-4 text-xl">Help</h2><ul className={col}>
          {[['/faq', 'FAQ'], ['/shipping-returns', 'Shipping & returns'], ['/contact', 'Contact'], ['/about', 'About us']].map(([to, l]) => <li key={to}><Link className="hover:text-cream" to={to}>{l}</Link></li>)}
        </ul></nav>
        <nav aria-label="Legal"><h2 className="mb-4 text-xl">Legal</h2><ul className={col}>
          <li><Link className="hover:text-cream" to="/privacy-policy">Privacy policy</Link></li>
          <li><Link className="hover:text-cream" to="/terms-and-conditions">Terms & conditions</Link></li>
        </ul></nav>
      </div>
      <p className="border-t border-taupe/40 py-6 text-center text-xs text-stone">© {new Date().getFullYear()} Veina Marble. All rights reserved.</p>
    </footer>
  )
}
