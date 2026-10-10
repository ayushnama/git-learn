import { Link } from 'react-router-dom'
import Reveal from './Reveal'
export default function Section({ title, subtitle, link, linkLabel = 'View all', tone = '', children }) {
  return (
    <section className={`py-9 md:py-12 ${tone}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl">{title}</h2>
            {subtitle && <p className="mt-2 max-w-md text-ink/75">{subtitle}</p>}
          </div>
          {link && <Link to={link} className="border-b border-gold pb-0.5 text-sm text-teal hover:text-teal-dark">{linkLabel}</Link>}
        </div>
        <Reveal>{children}</Reveal>
      </div>
    </section>
  )
}
