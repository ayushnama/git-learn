import { marbleArt } from '../utils/marble'

export const categories = [
  { slug: 'cups-mugs', name: 'Cups & Mugs', type: 'cup', tone: 'white' },
  { slug: 'kitchenware', name: 'Kitchenware', type: 'bowl', tone: 'beige' },
  { slug: 'bowls-trays', name: 'Bowls & Trays', type: 'tray', tone: 'green' },
  { slug: 'decor', name: 'Decor', type: 'decor', tone: 'black' },
  { slug: 'clocks-watches', name: 'Clocks & Watches', type: 'clock', tone: 'white' },
]

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
]

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const products = raw.map(([name, category, price, tone, type, best, isNew, rating, description], i) => ({
  id: i + 1,
  slug: slugify(name),
  name, category, price, rating, description,
  compareAt: Math.round((price * 1.18) / 10) * 10,
  bestSeller: !!best, isNew: !!isNew, stock: 12,
  details: ['100% natural marble, hand-finished', 'Food-safe sealant on kitchen pieces', 'Each piece has unique veining', 'Wipe clean with a soft, damp cloth'],
  images: [0, 1, 2].map((k) => marbleArt(i * 3 + k, tone, k === 2 ? 'decor' : type)),
}))

export const getProduct = (slug) => products.find((p) => p.slug === slug)
export const getCategory = (slug) => categories.find((c) => c.slug === slug)
export const categoryImage = (c) => marbleArt(c.slug.length * 11, c.tone, c.type)
