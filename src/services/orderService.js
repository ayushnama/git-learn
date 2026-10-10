// Replace this adapter with the backend integration when order placement is available.
// The server must validate stock, delivery eligibility, prices and payment method.
export async function placeOrder() {
  return { available: false, message: 'Order placement is not available yet. No order has been placed. Your cart has been kept unchanged.' }
}
