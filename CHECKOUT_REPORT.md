# Marbello COD checkout frontend

## Implemented

Checkout now requires a verified customer session. Guest access and related links/messages have been removed. Logged-out users see Login/Signup options instead of shipping or payment forms, and are blocked again after logout. Since the authentication backend is not connected, checkout remains unavailable to real signed-out customers until it is connected; no fake login bypass was added.

Checkout spacing was compacted for mobile and desktop: reduced page/form/summary gaps, a two-row address field, phone and pincode sharing a row on mobile, smaller product thumbnails, and side-by-side delivery/summary sections from the tablet breakpoint. Existing colors, typography, validation and COD behavior remain unchanged. The 36-check browser regression suite passed after this adjustment, including checkout overflow checks at 320/375/768/1366px.

- Added `/checkout` and connected the existing Cart Checkout button. Buy Now continues to add products and navigate to `/cart`.
- Preserved existing fonts, colors, shared buttons, navigation and footer. Checkout follows the existing responsive cart layout.
- Added required customer name, Indian mobile number, email, complete address and pincode fields, autocomplete, accessible field errors and focus on the first invalid field.
- Cash on Delivery is the sole displayed and default payment method. No online payment, UPI or card controls are displayed.
- Summary includes product images, names, quantities, selling amounts, original products subtotal, discount, shipping and total. Discounts are deducted once; shipping remains ₹150 below ₹3,000 selling subtotal and free at/above ₹3,000. Empty carts have no shipping charge.
- Place Order validates details, then explicitly states that order placement is unavailable and no order has been placed. It does not clear the cart, create an order ID, make a network request or save customer details to local storage.
- Empty checkout directs customers to Shop. Checkout metadata is noindex.

## Future integration

`src/services/orderService.js` isolates order submission. The current adapter intentionally returns unavailable. A future backend adapter must validate prices, discounts, stock, payment method and delivery eligibility on the server before confirming an order. The payload contains trimmed customer fields, product IDs/quantities and `paymentMethod: 'cod'`; it does not treat browser totals as authoritative.

`paymentMethods` in `src/utils/checkout.js` is a separate configuration point for a future payment implementation. Enabling online payments will also require selection state and provider/backend handling; adding an entry alone is not sufficient.

## Verification

- `npm run test:checkout`: 25 tests passed, covering existing storage/cart/search/SEO/catalog regressions plus checkout totals, customer validation and unavailable order submission.
- `npm run test:checkout:browser`: 36 grouped checks passed, zero uncaught browser errors. Checkout checks include COD-only/default selection, five invalid-field errors, valid form submission with truthful notice, cart preservation, noindex, empty-cart protection and Cart-to-Checkout navigation.
- Checkout has no horizontal overflow at 320, 375, 768 and 1366px. Existing P1/P2/P3 and catalog browser checks passed.
- Production build passed: Vite 6.4.4, 1,613 modules; JS 236.01 kB (gzip 75.77 kB), CSS 19.44 kB (gzip 4.61 kB).
- `git diff --check` passed. No dependency changes, backend, payment gateway or admin panel were added.

Customer field checks validate format only. Pincode serviceability, real phone/email verification and actual order persistence require the future backend. Current customer inputs stay in component memory and reset when leaving checkout.
