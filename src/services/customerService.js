export class CustomerServiceUnavailable extends Error {
  constructor() { super('Customer services are not available yet. No account, address or order changes have been saved.'); this.name = 'CustomerServiceUnavailable' }
}
const unavailable = async () => { throw new CustomerServiceUnavailable() }

// Inject a real adapter into CustomerProvider when the backend is available.
// Session identity must come from the server, preferably via an HttpOnly cookie.
export const customerService = {
  getSession: async () => null,
  login: unavailable, signup: unavailable, logout: unavailable,
  updateProfile: unavailable,
  getAddresses: unavailable, saveAddress: unavailable, deleteAddress: unavailable, setDefaultAddress: unavailable,
  getOrders: unavailable, getOrder: unavailable,
}
