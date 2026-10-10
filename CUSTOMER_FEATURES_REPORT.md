# Marbello customer frontend implementation

## Pages and navigation

| Route | Implemented behavior |
| --- | --- |
| `/login` | Premium two-column form, email/password validation, loading/error feedback, Signup link |
| `/signup` | Name, Indian mobile number, email, password and confirmation; minimum password length and matching checks |
| `/account/profile` | Server-session gate, editable name/email/phone, Save Profile and Sign Out with confirmation/error handling |
| `/account/addresses` | Server-session gate, address list, Add/Edit forms, Delete confirmation/cancel and Set as Default |
| `/account/orders` | Server-session gate, server-fed order list, empty/loading/error/retry states and detail links |
| `/account/orders/:id` | Order items, quantity, totals, COD method, shipping address, status, server-fed tracking events/carrier/number and missing-order errors |
| `/checkout` | Login required; complete address mandatory; signed-in users can choose a saved/default address or enter a different address |

Desktop navigation and the mobile menu now link to My Account. Account navigation links Profile, Addresses and Orders. Authentication return destinations are restricted to known internal routes. All customer routes use noindex metadata.

## Honest backend-unavailable behavior

The default customer adapter returns no authenticated session. Login/Signup return a clear unavailable error, stay on the form and never announce account creation, authentication or OTP verification. Protected account pages show a sign-in gate with Login/Signup options. No sample customer, saved address or order is shipped as real account data.

Address/profile mutation success notices require a resolved service operation. The default unavailable adapter rejects every mutation, so no production success notice can appear without a connected backend. The Add/Edit/Delete/Default interfaces are fully implemented behind the session gate and verified using a test-only adapter. Actual persistence, authentication and server orders remain dependent on the future backend.

Checkout now requires a verified server-authenticated user. Guest links and messages have been removed from Login, Signup, account gates and Checkout. Logged-out users cannot view or submit the shipping form, including after signing out. Cart-to-Checkout navigation retains a `/checkout` login return destination. With no authentication backend yet, the production checkout remains sign-in gated; no fabricated login bypass was added.

Place Order still uses the existing unavailable order adapter, explicitly states that no order was placed and retains the cart. COD is the only visible/default payment method. Buy Now continues to add products and open `/cart`; existing cart/wishlist storage keys and stock/quantity protections are unchanged.

## API-ready structure and data contracts

- `CustomerProvider` accepts an injected `service`, checks its server session, exposes authentication/profile session state and clears the session only after confirmed logout. A malformed session cannot become an authenticated user.
- `customerService.js` provides the default unavailable adapter. Replace it with a real adapter when the backend is ready; do not enable a fabricated local-login mode.
- `useCustomerResource` loads authenticated account data, supports Retry, resets data on user/route changes, passes AbortSignal and ignores responses after unmount. Missing resources and invalid list responses become errors.
- Shared field/layout/gate components and validation utilities keep account UI consistent with Marbello's existing typography, colors and rounded forms.

Service operations expected by the frontend:

| Operation | Input / resolved result |
| --- | --- |
| `getSession({signal})` | `null` or authenticated user `{id, name, email, phone}` |
| `login(details)` / `signup(details)` | Verified authenticated user; reject if unavailable, invalid or verification is incomplete |
| `logout()` | Resolve only after server logout |
| `updateProfile(details)` | Confirmed updated authenticated user |
| `getAddresses({signal})` | Array of `{id, name, phone, address, pincode, isDefault}` |
| `saveAddress(details)` | New details or existing `id`; resolve only after successful persistence |
| `deleteAddress({id})` / `setDefaultAddress({id})` | Resolve only after the server mutation; lists are reloaded afterward |
| `getOrders({signal})` | Array of `{id, status, total}`; may include detail fields |
| `getOrder({id, signal})` | Order with `items`, `paymentMethod`, `shippingAddress` and optional `tracking: {events, carrier, number}` |

Future backend responsibilities include real session authentication, account ownership checks for every address/order, password hashing, validation, single-default-address consistency, pincode serviceability, authoritative pricing/stock and order persistence. An HttpOnly server-session cookie is preferred; frontend gates do not replace server authorization. No backend endpoints or online payment provider were added.

## Privacy and validation

- Customer details, addresses, orders, passwords and tokens are not written to localStorage/sessionStorage. Existing cart and wishlist storage remains unchanged.
- Passwords live only in form memory and are cleared after submission attempts; confirmation is excluded from service payloads. Passwords are not logged or trimmed before transmission.
- Signup validates nonblank name, 10-digit Indian mobile format, email, a minimum password length of eight after ignoring outer whitespace, and matching confirmation. Checkout/address/profile share the existing mandatory-field checks, including a valid six-digit pincode.
- Invalid forms focus the first field error and associate errors with inputs. Buttons disable during mutations, errors remain visible, and failed address saves preserve input for retry.
- The default adapter makes no customer network requests. Test adapters and seeded orders exist only in the browser test fixture and are excluded from the production bundle.

## Verification

| Check | Final result |
| --- | --- |
| `npm run test:customer` | 29 tests passed; includes P1/P2/P3, catalog, checkout and customer validation/service checks |
| `npm run test:customer:browser` | 44 grouped checks passed; zero uncaught browser errors |
| Account/checkout browser coverage | Login/Signup validation and honest unavailable errors; password clearing/no sensitive storage; account gates/noindex; address read retry, failed-save retention, Add/Edit/Delete/cancel/Default; saved/default address selection and mandatory manual address; profile save; order list/detail/tracking; missing/empty orders; logout gate |
| Responsive coverage | Account forms/gates and signed-in order details at 320/375/768/1366px; checkout retains equivalent responsive checks; no horizontal overflow |
| UI artifacts | 12 mobile/desktop snapshots retained, including Login and Signup; existing Home/Shop/Contact/Product snapshots refreshed |
| Production build | Passed after removing guest access: Vite 6.4.4, 1,620 modules, 27.27 seconds; JS 256.40 kB (gzip 80.93 kB), CSS 20.39 kB (gzip 4.80 kB) |
| Whitespace check | `git diff --check` passed |

Tests cover both honest production-unavailable behavior and signed-in flows using an isolated test service, with no real authentication, address or order side effects. No dependency upgrades were made. Real authentication, OTP, address persistence, order creation and tracking integrations remain backend work; this implementation prepares and tests their frontend interfaces without reporting fake success.

After guest checkout removal, all 29 unit tests and 44 browser checks passed again. Updated checks confirm logged-out visitors cannot view/submit checkout, cart contents survive the login gate, the login link retains the checkout return path, authenticated manual/saved-address COD submission remains truthful, and checkout is blocked after logout. No guest checkout links or messages remain in application components.
