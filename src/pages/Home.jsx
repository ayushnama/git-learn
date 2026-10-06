import { Link } from 'react-router-dom'
import { Gem, Hammer, ShieldCheck, Truck, Star } from 'lucide-react'
import Button from '../components/Button'
import Section from '../components/Section'
import ProductGrid from '../components/ProductGrid'
import Newsletter from '../components/Newsletter'
import useSEO from '../hooks/useSEO'
import { products, categories, categoryImage } from '../data/products'
import { marbleArt } from '../utils/marble'

const why = [
  [Gem, 'Natural stone', 'Every piece is cut from real Makrana marble.'],
  [Hammer, 'Made by hand', 'Carved and polished by master artisans.'],
  [ShieldCheck, 'Food safe', 'Sealed and tested for daily kitchen use.'],
  [Truck, 'Careful delivery', 'Packed in protective foam, shipped insured.'],
]
const reviews = [
  ['Ananya R.', 'Mumbai', 'The Carrara cup feels like a small sculpture. Heavy, cool and beautiful.'],
  ['Karan M.', 'Delhi', 'Bought the wall clock for our living room. Guests ask about it every time.'],
  ['Meera S.', 'Bengaluru', 'The packaging was superb and the mortar and pestle is a joy to use.'],
]

export default function Home() {
  useSEO({ title: 'Handcrafted Marble Homeware', description: 'Shop handcrafted marble cups, bowls, trays, clocks and decor. Natural Makrana marble, finished by hand.' })
  return (
    <>
      <section className="relative overflow-hidden bg-bone">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 md:py-24 lg:grid-cols-2">
          <div className="animate-rise">
            <h1 className="text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">Stone, shaped slowly by hand.</h1>
            <p className="mt-6 max-w-md text-lg text-taupe">Cups, bowls, trays and clocks carved from natural marble. No two veins are alike.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Button to="/shop">Shop collection</Button><Button to="/about" variant="outline">Our story</Button></div>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-none">
            <img src={marbleArt(41, 'white', 'bowl')} alt="Hand-carved white marble bowl" className="absolute right-0 top-0 h-[88%] w-[78%] object-cover shadow-xl animate-rise" />
            <img src={marbleArt(52, 'black', 'cup')} alt="Black marble mug with gold veins" className="absolute bottom-0 left-0 h-[52%] w-[46%] border-4 border-bone object-cover shadow-xl" />
          </div>
        </div>
      </section>

      <Section title="Shop by category">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link key={c.slug} to={`/category/${c.slug}`} className="group">
              <div className="aspect-[3/4] overflow-hidden bg-bone"><img src={categoryImage(c)} alt={`${c.name} in marble`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /></div>
              <h3 className="mt-3 text-xl">{c.name}</h3>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Best sellers" subtitle="The pieces our customers return to." link="/shop" tone="bg-bone/50">
        <ProductGrid products={products.filter((p) => p.bestSeller).slice(0, 4)} />
      </Section>

      <Section title="New arrivals" link="/shop">
        <ProductGrid products={products.filter((p) => p.isNew).slice(0, 4)} />
      </Section>

      <section className="bg-ink text-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-2">
          <img src={marbleArt(77, 'black', 'decor')} alt="Artisan-carved black marble vase" loading="lazy" className="aspect-[4/5] w-full object-cover" />
          <div>
            <h2 className="text-4xl sm:text-5xl">Born in the quarries of Makrana</h2>
            <p className="mt-6 max-w-lg text-stone">The same stone that built the Taj Mahal, now shaped into things you use every day. Our artisans carve, grind and polish each piece over several days, so every cup and clock carries its own veining.</p>
            <Button to="/about" variant="light" className="mt-8">Read our story</Button>
          </div>
        </div>
      </section>

      <Section title="Why Veina">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {why.map(([Icon, t, d]) => (
            <div key={t}><Icon strokeWidth={1.2} size={32} /><h3 className="mt-4 text-2xl">{t}</h3><p className="mt-2 text-sm text-taupe">{d}</p></div>
          ))}
        </div>
      </Section>

      <section className="bg-bone/60 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 sm:px-8 md:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <img src={marbleArt(90, 'beige', 'tray')} alt="Beige marble tray styled on a table" loading="lazy" className="mt-8 aspect-[3/4] w-full object-cover" />
            <img src={marbleArt(91, 'green', 'cup')} alt="Green marble tumbler in a kitchen" loading="lazy" className="aspect-[3/4] w-full object-cover" />
          </div>
          <div>
            <h2 className="text-4xl sm:text-5xl">Made for the way you live</h2>
            <p className="mt-5 max-w-md text-taupe">Morning coffee, a cheese board on Friday, a clock that watches over the room. Marble belongs in daily rituals, not behind glass.</p>
            <Button to="/shop" variant="outline" className="mt-8">Shop the collection</Button>
          </div>
        </div>
      </section>

      <Section title="Kind words">
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map(([n, c, t]) => (
            <figure key={n} className="border border-stone p-7">
              <div className="flex gap-0.5" aria-label="5 out of 5 stars">{[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-ink" />)}</div>
              <blockquote className="mt-4 font-serif text-xl leading-snug">{t}</blockquote>
              <figcaption className="mt-5 text-sm text-taupe">{n}, {c}</figcaption>
            </figure>
          ))}
        </div>
      </Section>
      <Newsletter />
    </>
  )
}
