import ProductGrid from '../components/ProductGrid'
import Button from '../components/Button'
import useSEO from '../hooks/useSEO'
import { useStore } from '../context/StoreContext'
import { useCatalog } from '../context/CatalogContext'

export default function Wishlist() {
  const { products } = useCatalog()
  useSEO({ title: 'Wishlist', description: 'Your saved Marbello marble pieces.' })
  const { wishlist } = useStore()
  const list = products.filter((p) => wishlist.includes(p.id))
  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 md:py-9">
      <h1 className="text-3xl sm:text-4xl">Wishlist</h1>
      <div className="mt-6">
        {list.length ? <ProductGrid products={list} /> : <div className="py-9 text-center"><p className="text-ink/75">Tap the heart on any piece to save it here.</p><Button to="/shop" className="mt-6">Shop collection</Button></div>}
      </div>
    </div>
  )
}
