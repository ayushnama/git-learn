import ProductImage from '../components/ProductImage'
import { Link } from 'react-router-dom'
import { Gem, Hammer, ShieldCheck, Truck, Star } from 'lucide-react'
import Button from '../components/Button'
import Section from '../components/Section'
import ProductGrid from '../components/ProductGrid'
import Newsletter from '../components/Newsletter'
import useSEO from '../hooks/useSEO'
import { categoryImage } from '../data/products'
import { useCatalog } from '../context/CatalogContext'
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
  const { products, categories } = useCatalog()
  useSEO({ title: 'Handcrafted Marble Homeware', description: 'Shop handcrafted marble cups, bowls, trays, clocks and decor. Natural Makrana marble, finished by hand.' })
  return (
    <>
      <section className="relative overflow-hidden bg-bone">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:py-10">
          <div className="animate-rise">
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-ink">The Marbello collection</p>
            <h1 className="text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">Natural stone.<br />Everyday elegance.</h1>
            <p className="mt-4 max-w-md text-base text-ink/75">Thoughtfully shaped marble for your kitchen, your rituals and the spaces you call home.</p>
            <div className="mt-5 flex flex-wrap gap-3"><Button to="/shop">Shop collection</Button></div>
          </div>
          <div className="relative mx-auto aspect-[16/9] w-full max-w-sm sm:max-w-md lg:h-[340px] lg:max-w-lg lg:aspect-auto">
            <ProductImage src={marbleArt(41, 'white', 'bowl')} alt="Hand-carved white marble bowl" className="absolute right-0 top-0 h-[88%] w-[78%] object-cover shadow-xl animate-rise" />
            <ProductImage src={marbleArt(52, 'black', 'cup')} alt="Black marble mug with gold veins" className="absolute bottom-0 left-0 h-[52%] w-[46%] border-4 border-bone object-cover shadow-xl" />
          </div>
        </div>
      </section>

      <Section title="Shop by category">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {categories.map((c) => (
            <Link key={c.slug} to={`/category/${c.slug}`} className="group">
              <div className="aspect-[4/3] overflow-hidden rounded-lg bg-bone"><ProductImage src={categoryImage(c)} alt={`${c.name} in marble`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105" /></div>
              <h3 className="mt-2 text-lg">{c.name}</h3>
              <p className="mt-1 text-xs text-ink/70">{products.filter((p) => p.category === c.slug).length} pieces</p>
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

      <Section title="The Marbello approach">
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {why.map(([Icon, t, d]) => (
            <div key={t}><Icon strokeWidth={1.2} size={32} /><h3 className="mt-3 text-xl">{t}</h3><p className="mt-2 text-sm text-ink/75">{d}</p></div>
          ))}
        </div>
      </Section>

      <section className="bg-bone/60 py-9 md:py-12">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 sm:px-6 md:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <ProductImage src={marbleArt(90, 'beige', 'tray')} alt="Beige marble tray styled on a table" loading="lazy" className="mt-4 aspect-square w-full object-cover" />
            <ProductImage src={marbleArt(91, 'green', 'cup')} alt="Green marble tumbler in a kitchen" loading="lazy" className="aspect-square w-full object-cover" />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl">Made for the way you live</h2>
            <p className="mt-5 max-w-md text-ink/75">Morning coffee, a cheese board on Friday, a clock that watches over the room. Marble belongs in daily rituals, not behind glass.</p>
            <Button to="/shop" variant="outline" className="mt-5">Shop the collection</Button>
          </div>
        </div>
      </section>

      <Section title="Kind words">
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map(([n, c, t]) => (
            <figure key={n} className="rounded-lg border border-stone p-5">
              <div className="flex gap-0.5" aria-label="5 out of 5 stars">{[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-gold text-gold" />)}</div>
              <blockquote className="mt-4 font-serif text-xl leading-snug">{t}</blockquote>
              <figcaption className="mt-5 text-sm text-ink/75">{n}, {c}</figcaption>
            </figure>
          ))}
        </div>
      </Section>
      <Newsletter />
    </>
  )
}
