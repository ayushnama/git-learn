import { marbleArt } from '../utils/marble.js'

export const legacyCategories = [
  { slug: 'cups-mugs', name: 'Cups & Mugs', type: 'cup', tone: 'white' },
  { slug: 'kitchenware', name: 'Kitchenware', type: 'bowl', tone: 'beige' },
  { slug: 'bowls-trays', name: 'Bowls & Trays', type: 'tray', tone: 'green' },
  { slug: 'decor', name: 'Decor', type: 'decor', tone: 'black' },
  { slug: 'clocks-watches', name: 'Clocks & Watches', type: 'clock', tone: 'white' },
]

export const categories = [
  { slug: 'kitchen', name: 'Kitchen', type: 'bowl', tone: 'white', description: 'Everyday tools, thoughtfully carved.' },
  { slug: 'home-decor', name: 'Home decor', type: 'decor', tone: 'green', description: 'Sculptural accents for quiet corners.' },
  { slug: 'bathroom', name: 'Bathroom', type: 'dispenser', tone: 'beige', description: 'A little ritual, a calmer space.' },
  { slug: 'pooja', name: 'Pooja', type: 'diya', tone: 'white', description: 'Natural stone for meaningful moments.' },
  { slug: 'tableware', name: 'Tableware', type: 'cup', tone: 'green', description: 'Made for gathering around the table.' },
  { slug: 'furniture', name: 'Furniture', type: 'table', tone: 'beige', description: 'Statement pieces with lasting character.' },
]
const categoryMap = { 'cups-mugs': 'tableware', kitchenware: 'kitchen', 'bowls-trays': 'tableware', decor: 'home-decor', 'clocks-watches': 'home-decor' }

// [name, category, price, tone, type, bestseller, new, rating, description]
const raw = [
  ['Carrara Espresso Cup', 'cups-mugs', 1450, 'white', 'cup', 1, 0, 4.8, 'Hand-turned from Makrana marble with a polished interior.'],
  ['Nero Marquina Mug', 'cups-mugs', 1890, 'black', 'cup', 1, 1, 4.9, 'A deep black mug with gold veining, finished by hand.'],
  ['Sage Tumbler', 'cups-mugs', 1650, 'green', 'cup', 0, 1, 4.6, 'A cool green tumbler that keeps drinks chilled longer.'],
  ['Mortar & Pestle Set', 'kitchenware', 2950, 'white', 'bowl', 1, 0, 4.9, 'Dense, heavy marble for grinding spices and pastes.'],
  ['Rolling Pin with Stand', 'kitchenware', 3400, 'beige', 'tray', 0, 0, 4.7, 'Naturally cool, so dough stays easy to work.'],
  ['Cheese Board Round', 'kitchenware', 2250, 'white', 'tray', 1, 0, 4.8, 'A food-safe board with a soft honed edge.'],
  ['Cream Serving Bowl', 'bowls-trays', 2100, 'beige', 'bowl', 0, 1, 4.7, 'A wide bowl for fruit, salads or keys by the door.'],
  ['Emerald Vanity Tray', 'bowls-trays', 2750, 'green', 'tray', 1, 0, 4.8, 'Rich green stone with slim, raised edges.'],
  ['Noir Trinket Dish', 'bowls-trays', 1250, 'black', 'bowl', 0, 1, 4.5, 'A small dish for rings, coins and keepsakes.'],
  ['Sculpted Orb Vase', 'decor', 3900, 'white', 'decor', 1, 0, 4.9, 'A smooth, weighty vase carved from a single block.'],
  ['Nero Bookends (Pair)', 'decor', 4200, 'black', 'decor', 0, 1, 4.8, 'Solid pair that holds a full shelf of books.'],
  ['Beige Incense Holder', 'decor', 990, 'beige', 'decor', 0, 0, 4.4, 'Minimal holder with a carved cradle.'],
  ['Carrara Wall Clock', 'clocks-watches', 5600, 'white', 'clock', 1, 0, 4.9, 'A silent-sweep wall clock with a brass hand set.'],
  ['Nero Desk Clock', 'clocks-watches', 3800, 'black', 'clock', 0, 1, 4.7, 'A compact desk clock with a matte black face.'],
  ['Sage Table Clock', 'clocks-watches', 4100, 'green', 'clock', 0, 1, 4.6, 'A calm green face for a bedside or study.'],
  ['Stone Wrist Watch', 'clocks-watches', 7900, 'beige', 'clock', 0, 0, 4.5, 'A marble-dial watch with a leather strap.'],
  ['White Marble Spice Cellar', 'kitchen', 1790, 'white', 'jar', 0, 1, 4.6, 'A lidded marble cellar for salt and dry spices. Smooth inner walls make it easy to refill.', 8, '10 × 10 × 9 cm'],
  ['Beige Marble Utensil Holder', 'kitchen', 2490, 'beige', 'holder', 1, 0, 4.7, 'A substantial honed cylinder that keeps wooden spoons and utensils within reach.', 6, '12 × 12 × 18 cm'],
  ['Green Marble Pastry Board', 'kitchen', 4490, 'green', 'tray', 0, 1, 4.8, 'A cool, flat work surface for rolling pastry or presenting cheeses. Hand wash and dry after use.', 4, '40 × 30 × 2 cm'],
  ['Travertine Arch Sculpture', 'home-decor', 3290, 'beige', 'arch', 1, 1, 4.7, 'A freestanding arch with a softly honed finish, sized for a console or bookshelf.', 7, '20 × 6 × 24 cm'],
  ['Nero Marble Candle Holder', 'home-decor', 1490, 'black', 'holder', 0, 0, 4.5, 'A sculpted holder for one taper candle. Natural gold-toned veins make each piece distinctive.', 9, '8 × 8 × 12 cm'],
  ['White Marble Catchall Bowl', 'home-decor', 2190, 'white', 'bowl', 0, 1, 4.6, 'A shallow accent bowl for keys, jewellery or a small arrangement on an entryway table.', 5, '22 × 22 × 5 cm'],
  ['Ivory Marble Soap Dispenser', 'bathroom', 2290, 'white', 'dispenser', 1, 1, 4.8, 'A refillable marble bottle with a brushed-metal pump for liquid hand soap. Rinse the pump regularly.', 8, '8 × 8 × 18 cm · 250 ml'],
  ['Beige Marble Soap Dish', 'bathroom', 990, 'beige', 'dish', 0, 0, 4.6, 'A gently curved soap dish with drainage grooves to keep a bar of soap lifted from standing water.', 3, '14 × 10 × 2 cm'],
  ['Sage Marble Vanity Set', 'bathroom', 3990, 'green', 'bath-set', 1, 1, 4.7, 'A coordinated tumbler and tray set for toothbrushes and small bathroom essentials.', 0, 'Tray 24 × 12 cm · tumbler 10 cm high'],
  ['Makrana Marble Diya Pair', 'pooja', 1290, 'white', 'diya', 1, 0, 4.8, 'Two carved diyas for your pooja space. Place on a heat-safe surface and never leave a lit wick unattended.', 10, '8 × 8 × 4 cm each · set of 2'],
  ['White Marble Pooja Thali', 'pooja', 2890, 'white', 'pooja-tray', 0, 1, 4.7, 'A round marble thali with three small bowls for organising flowers, kumkum and rice.', 5, '28 cm diameter · 3 bowls'],
  ['Carved Marble Incense Stand', 'pooja', 890, 'beige', 'incense', 0, 0, 4.5, 'A slim incense holder with a recessed ash channel. Designed for one incense stick at a time.', 6, '22 × 4 × 2 cm'],
  ['Carrara Dinner Plate Pair', 'tableware', 2690, 'white', 'plate', 1, 1, 4.7, 'Two honed marble presentation plates for dry snacks and desserts. Avoid acidic foods and hand wash only.', 6, '24 cm diameter · set of 2'],
  ['Sage Marble Coaster Set', 'tableware', 1190, 'green', 'coasters', 0, 1, 4.6, 'Four stone coasters with protective cork backing, cut from subtly veined green marble.', 12, '10 cm diameter · set of 4'],
  ['Beige Marble Cake Stand', 'tableware', 3490, 'beige', 'cake-stand', 1, 0, 4.8, 'A raised marble stand for cakes and bakes. A broad pedestal keeps presentation balanced.', 4, '28 cm diameter × 12 cm high'],
  ['Travertine Round Side Table', 'furniture', 18500, 'beige', 'table', 1, 1, 4.8, 'A round stone top on a sculptural pedestal base, sized to sit beside a sofa or reading chair.', 3, '40 cm diameter × 48 cm high'],
  ['Nero Marble Coffee Table', 'furniture', 42500, 'black', 'coffee-table', 0, 0, 4.9, 'A generous oval marble top with two solid pedestal supports. Professional handling is recommended.', 2, '100 × 55 × 38 cm'],
  ['Ivory Marble Accent Stool', 'furniture', 14900, 'white', 'stool', 0, 1, 4.7, 'A compact sculptural accent for a sheltered indoor space, suitable as an occasional seat or display plinth.', 4, '30 cm diameter × 43 cm high'],
]

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const products = raw.map(([name, oldCategory, price, tone, type, best, isNew, rating, description, stock = 12, dimensions], i) => ({
  id: i + 1,
  slug: slugify(name),
  name, category: categoryMap[oldCategory] || oldCategory, legacyCategory: categoryMap[oldCategory] ? oldCategory : undefined, price, rating, description,
  searchTags: legacyCategories.find((c) => c.slug === oldCategory)?.name || '',
  compareAt: Math.round((price * 1.18) / 10) * 10,
  discount: Math.round((1 - price / (Math.round((price * 1.18) / 10) * 10)) * 100),
  bestSeller: !!best, isNew: !!isNew, stock,
  details: ['Natural stone, hand-finished', dimensions ? `Dimensions: ${dimensions}` : 'Each piece has unique veining', 'Indoor use · wipe clean with a soft, damp cloth', 'Product imagery is illustrative; natural veining varies'],
  images: [0, 1, 2].map((k) => marbleArt(i * 3 + k, tone, type)),
}))

export const getProduct = (slug) => products.find((p) => p.slug === slug)
export const getCategory = (slug) => categories.find((c) => c.slug === slug) || legacyCategories.find((c) => c.slug === slug)
export const belongsToCategory = (p, slug) => p.category === slug || p.legacyCategory === slug
export const categoryImage = (c) => c.image || marbleArt(c.slug.length * 11, c.tone, c.type)
