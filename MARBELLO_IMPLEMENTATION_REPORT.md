# Marbello UI and catalog implementation

Date: 2026-10-10.

## Status

UI, catalog, Buy Now and the API-ready frontend layer are implemented and tested. The supplied original logo is now integrated in the header, mobile menu and footer from `public/brand/marbello-logo.png`. Its duplicate `.png.png` filename was corrected; the original image contents are unchanged.

No backend, Admin Panel, checkout page or payment integration was created. No dependency updates were performed during this pass.

## Phase 1 — catalog and compatibility

Added six primary collections with 34 total demo products:

| Collection | Products | Example new products |
| --- | ---: | --- |
| Kitchen | 6 | Spice cellar, utensil holder, pastry board |
| Home decor | 10 | Arch sculpture, candle holder, catchall bowl |
| Bathroom | 3 | Soap dispenser, soap dish, vanity set |
| Pooja | 3 | Diya pair, pooja thali, incense stand |
| Tableware | 9 | Dinner plates, coaster set, cake stand |
| Furniture | 3 | Side table, coffee table, accent stool |

Each product has a stable ID/slug, category, numeric INR price, comparison price, computed discount, nonnegative integer stock, description, details and three generated SVG illustrations. New products include dimensions and category-appropriate descriptions. Stock includes low-stock and out-of-stock examples. Furniture prices up to ₹42,500 are included by the catalog-derived price filter ceiling; the old ₹8,000 ceiling no longer hides them.

The original 16 product IDs/slugs remain intact. Their display categories now belong to the six primary collections, while legacy category metadata preserves `/category/cups-mugs`, `/category/kitchenware`, `/category/bowls-trays`, `/category/decor` and `/category/clocks-watches`. Legacy category-name searches are retained through search tags.

Existing `veina-cart` and `veina-wishlist` storage keys are deliberately retained so saved items do not disappear after rebranding. P1 normalization and P2 integer/stock/ten-unit limits remain in place.

Testing: catalog schema/completeness, compatibility, pricing, stock, images, invalid payload rejection, repository behavior and API cancellation/error handling are covered by unit tests. Final combined unit suite: 22 passing tests.

## Phase 2 — branding and premium UI

- Marbello naming in header, mobile menu, footer, page descriptions and metadata.
- Shared BrandMark displays the supplied original logo by default, supports an override via `VITE_BRAND_LOGO_URL`, and retains a wordmark fallback if unavailable. The supplied logo was not recreated or guessed.
- Calm homepage headline, collection intro, category product counts and a six-collection grid.
- Desktop category navigation on a separate row, keeping the main header clear; six collections in the mobile drawer.
- Rounded product image surfaces and buttons, clearer price/discount hierarchy, stock labels and visible Buy Now actions.
- Product detail pages show available stock, discounts and a Buy Now button. Demo ratings are labeled as sample ratings; unverified aggregate review count was removed from product schema.
- Existing illustration generation extended with shapes for bathroom, pooja, tableware and furniture products.

Images are illustrative SVG artwork, **not product photography**. Prices, stock, ratings and product details are dummy catalog data. The previous cream/bone/ink palette is retained; the pending global taupe text contrast change was not applied.

The old pixel-identical UI comparison is no longer the criterion for this explicitly authorized redesign. The regression runner now captures redesigned UI snapshots and checks responsive widths. Screenshots were visually inspected for the homepage, mobile shop and desktop product detail. Snapshot artifacts are in `artifacts/catalog/` and ignored by Git.

## Phase 3 — purchasing behavior

`useBuyNow` shares the existing StoreContext cart operation:

1. Product card Buy Now requests one unit; detail Buy Now uses the selected quantity.
2. Existing cart normalization, stock bounds and ten-unit cap determine the amount added.
3. The frontend navigates to `/cart`, with accurate purchase/limit feedback.
4. Out-of-stock Buy Now is disabled. If the product is already at the cart limit, Buy Now opens the existing cart without increasing quantity.

Add to Cart still adds in place and does not navigate. Wishlist behavior, cart totals, quantity controls, persistence and removal remain intact. The existing checkout placeholder is untouched; Buy Now does not invoke it or navigate to checkout.

Testing: selected quantities, card/detail actions, duplicate-item merging, reload persistence, existing-limit behavior, disabled out-of-stock controls and two-unit furniture stock passed in Chrome.

## Phase 4 — API-ready frontend

- `catalogService` is the single adapter for mock and future API catalog data.
- `CatalogContext` supplies products/categories/lookups to the navbar, footer, homepage, Shop, product detail, filters, product cards, wishlist and StoreContext.
- `VITE_CATALOG_SOURCE=mock` is the default; no catalog network requests occur in mock mode.
- Future API mode performs `GET <VITE_API_BASE_URL>/catalog`, sends an AbortSignal, handles HTTP errors and validates the response before rendering products.
- The initial catalog loading/error/retry UI precedes StoreProvider mounting. Saved cart data is not normalized against an empty/incomplete catalog during loading/failure.
- Store normalization uses current catalog IDs/stock. Single-image API products are supported; price filter bounds come from the current catalog.
- API shape, configuration, stable ID requirements and public env guidance are documented in README and `.env.example`.

Testing: an isolated browser fixture verified failure/retry/loading, preservation of a saved ten-unit cart until data arrived, reconciliation to a two-unit stock limit, dynamic product rendering, single-image rendering and cancellation on unmount. This is test scaffolding, not a backend endpoint or Admin Panel implementation.

Future backend work still needs authoritative pricing/inventory validation, authentication, pagination and Admin CRUD. No such server functionality was added.

## Final verification

| Check | Result |
| --- | --- |
| `npm run test:catalog` | 22 tests passed, 0 failures; includes all P1/P2/P3 unit tests |
| `node tests/p1-browser.mjs --p2 --p3 --catalog` | 34 grouped checks passed; 0 uncaught browser errors |
| P1/P2/P3 regressions | Menu geometry/focus/scroll cleanup, keyboard quick-add, malformed storage, cart/wishlist, search, product state reset, form validation and SEO transitions passed |
| Responsive layouts | Shop and furniture detail checked at 320, 375, 768, 1024 and 1366px; no horizontal overflow detected |
| Saved UI snapshots | 8 mobile/desktop snapshots: Home, Shop, Contact and Product at 375px/1366px |
| Final actual production build | Passed: Vite 6.4.4, 1,610 modules, 23.49 seconds |
| Build output | HTML 1.52 kB; CSS 18.87 kB; JS 229.54 kB (gzip 74.17 kB) |
| `git diff --check` | Passed |

The browser runner blocks external fonts equally and disables header blur only during screenshot capture to avoid compositor artifacts. Application blur/fonts remain configured. Tests cover the stated routes/states, not every device. Temporary browser profiles/build outputs were cleaned; requested screenshot artifacts were kept in the workspace. Existing unrelated files and previous uncommitted fixes were preserved.

## Pending assets and scope

### Supplied logo verification (10 October 2026)

- Header and mobile menu show a 48px square original logo alongside a readable wordmark; the footer shows a 144px square logo on a cream background. Aspect ratio is preserved and image contents are unchanged.
- `npm run test:catalog`: all 22 tests passed.
- Browser P1/P2/P3 and catalog regression suite: 35 grouped checks passed, including header/footer image loading and mobile-menu image loading at 320/375/768px; zero uncaught browser errors.
- Production build passed (1,610 modules); verified `brand/marbello-logo.png` exists in production output. `git diff --check` passed.

- Supplied-logo integration is complete. `VITE_BRAND_LOGO_URL` remains available for an optional replacement path; image failures retain the text fallback.
- Product photography can replace `images` through the catalog without changing page components. Current images are explicitly illustrative.
- Real support contact details and approved business/legal/review content remain future business inputs; no new contact address was invented.
- Text contrast remains pending its separate color-change permission. No global palette update or dependency migration was performed.
- P3 client-side SEO limitations and existing dependency security findings remain as documented in their reports.
- Backend, Admin Panel and checkout remain outside this implementation.
