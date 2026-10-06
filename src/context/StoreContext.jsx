import { createContext, useContext, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { products } from '../data/products'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [cart, setCart] = useLocalStorage('veina-cart', [])
  const [wishlist, setWishlist] = useLocalStorage('veina-wishlist', [])

  const value = useMemo(() => {
    const items = cart.map((c) => ({ ...products.find((p) => p.id === c.id), qty: c.qty })).filter((i) => i.id)
    return {
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.price, 0),
      addToCart: (id, qty = 1) => setCart((c) => c.some((x) => x.id === id) ? c.map((x) => x.id === id ? { ...x, qty: Math.min(10, x.qty + qty) } : x) : [...c, { id, qty }]),
      setQty: (id, qty) => setCart((c) => qty < 1 ? c.filter((x) => x.id !== id) : c.map((x) => x.id === id ? { ...x, qty: Math.min(10, qty) } : x)),
      removeFromCart: (id) => setCart((c) => c.filter((x) => x.id !== id)),
      wishlist,
      isWished: (id) => wishlist.includes(id),
      toggleWish: (id) => setWishlist((w) => w.includes(id) ? w.filter((x) => x !== id) : [...w, id]),
    }
  }, [cart, wishlist])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
