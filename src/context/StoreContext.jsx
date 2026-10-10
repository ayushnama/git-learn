import { createContext, useContext, useMemo, useEffect } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { useCatalog } from './CatalogContext'
import { normalizeCart, normalizeWishlist } from '../utils/storeStorage'
import { addCartItem, updateCartQuantity } from '../utils/cart'


const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const { products } = useCatalog()
  const catalog = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const productIds = useMemo(() => new Set(catalog.keys()), [catalog])
  const normalizeStoredCart = useMemo(() => (value) => normalizeCart(value, productIds, catalog), [productIds, catalog])
  const normalizeStoredWishlist = useMemo(() => (value) => normalizeWishlist(value, productIds), [productIds])
  const [cart, setCart] = useLocalStorage('veina-cart', [], normalizeStoredCart)
  const [wishlist, setWishlist] = useLocalStorage('veina-wishlist', [], normalizeStoredWishlist)
  useEffect(() => { setCart((current) => current); setWishlist((current) => current) }, [setCart, setWishlist])

  const value = useMemo(() => {
    const items = cart.map((c) => ({ ...catalog.get(c.id), qty: c.qty })).filter((i) => i.id)
    return {
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.price, 0),
      addToCart: (id, qty = 1) => {
        let result
        setCart((c) => { result = addCartItem(c, catalog.get(id), qty); return result.cart })
        return result
      },
      setQty: (id, qty) => setCart((c) => updateCartQuantity(c, catalog.get(id), qty)),
      removeFromCart: (id) => setCart((c) => c.filter((x) => x.id !== id)),
      wishlist,
      isWished: (id) => wishlist.includes(id),
      toggleWish: (id) => setWishlist((w) => w.includes(id) ? w.filter((x) => x !== id) : [...w, id]),
    }
  }, [cart, wishlist, setCart, setWishlist, catalog])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
