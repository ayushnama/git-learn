import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'

export default function useBuyNow(product, qty = 1) {
  const navigate = useNavigate()
  const { addToCart, items } = useStore()
  return () => {
    const result = addToCart(product.id, qty)
    if (result.added > 0 || items.some((item) => item.id === product.id && item.qty > 0)) {
      navigate('/cart', { state: { purchaseNotice: result.message } })
    }
    return result
  }
}
