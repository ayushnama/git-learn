import { Link } from 'react-router-dom'
export default function Section({ title, subtitle, link, linkLabel = 'View all', tone = '', children }) {
  return (
    <section className={`py-16 md:py-24 ${tone}`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl">{title}</h2>
            {subtitle && <p className="mt-3 max-w-md text-taupe">{subtitle}</p>}
          </div>
          {link && <Link to={link} className="border-b border-ink pb-0.5 text-sm hover:text-taupe">{linkLabel}</Link>}
        </div>
        {children}
      </div>
    </section>
  )
}
