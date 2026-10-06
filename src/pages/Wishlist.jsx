import ProductGrid from '../components/ProductGrid'
import Button from '../components/Button'
import useSEO from '../hooks/useSEO'
import { useStore } from '../context/StoreContext'
import { products } from '../data/products'

export default function Wishlist() {
  useSEO({ title: 'Wishlist', description: 'Your saved Veina marble pieces.' })
  const { wishlist } = useStore()
  const list = products.filter((p) => wishlist.includes(p.id))
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 md:py-16">
      <h1 className="text-4xl sm:text-5xl">Wishlist</h1>
      <div className="mt-10">
        {list.length ? <ProductGrid products={list} /> : <div className="py-16 text-center"><p className="text-taupe">Tap the heart on any piece to save it here.</p><Button to="/shop" className="mt-6">Shop collection</Button></div>}
      </div>
    </div>
  )
}
