# Marbello (frontend)

React/Vite client-side store. Backend, checkout, catalog and reviews remain development/demo work.

## Marbello catalog and branding

The default mock catalog has 34 products across Kitchen, Home decor, Bathroom, Pooja, Tableware and Furniture. Prices are INR demo prices; stock, discounts and ratings are examples. Product images are generated SVG illustrations, not product photographs. Original product IDs/slugs and `veina-cart`/`veina-wishlist` storage keys are retained to preserve existing saved items. Previous category URLs resolve through legacy category metadata.

The homepage, category navigation, product cards and detail pages use Marbello branding. `BrandMark` displays the supplied original `public/brand/marbello-logo.png` in the header, mobile menu and footer, preserving its aspect ratio. `VITE_BRAND_LOGO_URL` optionally overrides that path; an unavailable logo falls back to the wordmark.

Customer frontend routes include Login/Signup, My Profile, My Addresses and My Orders with order details/tracking. The default customer service intentionally remains unavailable; account pages require a server-authenticated session, and COD checkout requires login. Customer/password data is never persisted to browser storage. See `CUSTOMER_FEATURES_REPORT.md` for adapter contracts and behavior. Run `npm run test:customer` and `npm run test:customer:browser` for the complete regression suites.

Compact UI/UX refinements are documented in `UI_UX_REPORT.md`. The before/after gallery is `artifacts/ui-comparison.html`. Run `npm run test:ui` for the full regression and responsive screenshot suite, and `npm run test:ui:motion` for motion accessibility checks.

Buy now on a product card adds one unit; on the detail page it uses the selected quantity. Both open `/cart`, respecting stock and the existing ten-unit cap. At the cap, an item already in the cart opens the cart with limit feedback. Existing Add to Cart does not navigate. No checkout/payment behavior was added.

## Future catalog API

All consuming pages/components now read `CatalogContext`. `catalogService` is the single data adapter. The default `VITE_CATALOG_SOURCE=mock` does not make catalog network requests. When the future API exists, set `VITE_CATALOG_SOURCE=api` and `VITE_API_BASE_URL` to its HTTP(S) base URL. The adapter performs `GET <base>/catalog`, passes an AbortSignal, rejects HTTP errors and validates catalog data. The loading/error/retry UI appears before StoreProvider mounts, so failed/unfinished requests do not normalize saved items against an empty catalog.

Response contract:

```json
{
  "categories": [{ "slug": "kitchen", "name": "Kitchen", "description": "Collection description", "image": "/images/kitchen.jpg" }],
  "products": [{ "id": 1, "slug": "carrara-espresso-cup", "category": "kitchen", "name": "Example product", "description": "Product description", "price": 1450, "compareAt": 1710, "stock": 12, "images": ["/images/product.jpg"], "details": ["Product dimensions"], "rating": 4.8, "bestSeller": true, "isNew": false }]
}
```

IDs must be stable positive integers or nonempty strings; slugs/IDs must be unique; each product must reference a returned category. Keep existing ID types unchanged when moving saved carts to a backend. Price/compareAt are numeric INR amounts, stock is a nonnegative integer, and at least one image is required. Discounts are derived from price/compareAt. HTTP(S), root-relative image paths and the current generated SVG illustration format are accepted. Root-relative image paths resolve on the frontend origin; return absolute URLs for a separate image host. Category descriptions/images and product details/rating/bestSeller/isNew are optional. The adapter supports single-image products.

The future Node API and Admin Panel can manage this contract without page-level imports of mock product arrays. They are not implemented here. Server pricing, inventory reservation and cart validation must be authoritative when commerce is connected; current stock enforcement is a frontend demo. API authentication, pagination and Admin CRUD remain future scope. See `MARBELLO_IMPLEMENTATION_REPORT.md` for verification and pending assets.

## Local development

```
npm ci
npm run dev
```
Open http://localhost:5173. Mock data: src/data/products.js. Product art is generated SVG (src/utils/marble.js); replace `images` with real photos later.

## Metadata configuration

Copy `.env.example` to `.env.local` if needed. Set `VITE_SITE_URL` to your actual production HTTP(S) origin before building, for example the domain you own. Leave it blank locally to use the current browser origin. Subpath deployments are not configured. Values with credentials, paths, queries, hashes or unsupported protocols are rejected by Vite configuration. `VITE_` values are public; never store backend secrets in them.

Canonical and Open Graph URLs use the configured origin and current pathname, excluding tracking queries and fragments. Search, cart, wishlist and not-found routes use `noindex, follow`. No real share image is configured yet; generated data-URL SVG artwork is excluded from social image metadata.

## Verification and production output

The browser regression runner requires Node 22 (tested with 22.22.1), Google Chrome on Windows, and permission to start a local Vite server. Use `CHROME_PATH` to override its executable path.

```
npm run test:p1
npm run test:p2
npm run test:p3
npm run test:p3:browser
npm run test:catalog
npm run test:catalog:browser
npm run build
npm run preview
```

Build output is `dist/`. Preview serves the local build; it does not deploy the site. When deploying, configure the hosting provider to serve `index.html` for application routes such as `/product/...`. Missing assets should still return 404. The frontend itself cannot set server HTTP status codes or hosting rewrite rules.

Metadata updates run client-side. Social preview crawlers that do not execute JavaScript may only see the static HTML title/description; SSR or prerendering needs a separately authorized implementation. No sitemap or robots file with a guessed production domain is generated.

See `P2_REPORT.md`, `P3_REPORT.md` and `DEPENDENCY_SECURITY_REVIEW.md` for changes, verification and deferred work. Do not force major dependency upgrades to clear audit counts without reviewing compatibility.
