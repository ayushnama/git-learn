# Marbello navbar redesign

## Latest follow-up: compact mobile row

The mobile two-row layout described below has been superseded. Below 640px the sticky main navbar is now 73px including its border: hamburger left, original proportional 52px logo centered independently, Search/Wishlist/Cart on the right. Account is available in the hamburger menu. Mobile action targets are 40px wide and 44px high to fit 320px screens without overlap; tablet/desktop targets remain 44px square. Desktop layout is unchanged. Search opens below the single row.

Latest verification: 12 grouped navbar/browser checks passed at 320, 375, 390, 430, 768, 1024 and 1440px, including centering, one-row alignment, logo overlap, search keyboard behavior and menu navigation; zero uncaught browser errors. All 29 unit tests and the production build passed (15.74s). Final 320px screenshot visually reviewed; updated screenshots are in `artifacts/navbar-final/`. The earlier full regression and motion results below belong to the previous revision.

## Scope and implementation

Only navbar-related components (`Navbar`, `SearchDropdown`, header presentation in `BrandMark`) and browser verification were updated. Product pages, checkout, backend services, product prices and business logic were untouched.

### Desktop

- Slim 28px announcement outside the sticky header: Free shipping across India on orders over ₹3,000.
- First row: original 64px logo on the left; Search, My Account, Wishlist and Cart on the right.
- Second row: centered Shop, Kitchen, Home Decor, Bathroom, Pooja, Tableware and Furniture links with consistent spacing and subtle color transitions.
- Sticky main header is 116px tall. Announcement scrolls away naturally; the header remains in document flow so page content has its own space.
- The original PNG already contains the MARBELLO wordmark and tagline. Its embedded typography is preserved; an additional text wordmark was removed to avoid duplication. No asset cropping or alteration.

### Mobile and tablet

- Below 1024px, the logo uses absolute 50% positioning and translation, independent of the menu/action widths.
- Below 640px: a 64px first row contains menu, centered logo and Search. Account/Wishlist/Cart occupy a compact 44px lower row on the right to prevent logo overlap.
- From 640px through 1023px: a single 72px row accommodates the centered logo and all four right-hand icons.
- Categories remain in the hamburger menu. Existing focus trap, Escape, background inertness, scroll lock, navigation close and desktop-resize cleanup are preserved.
- Icon controls retain 44×44px touch targets, labels, focus outlines and live cart/wishlist badges.

### Search and accessibility

- Search input is collapsed initially and opens from the Search icon into a bounded dropdown below the navbar.
- Opening focuses the input. Arrow keys select product/category suggestions; Enter navigates to the selected suggestion or full search results.
- Escape and the Close search button restore trigger focus. Outside pointer/focus interaction closes the dropdown without stealing focus.
- Search state resets on route changes. Empty-result messaging and category-name matching remain intact.
- Existing reduced-motion CSS disables transitions. No animation library or dependency was introduced.

## Screenshots

- Before: `artifacts/navbar-before/` (captured immediately before this implementation).
- After: `artifacts/navbar-final/` (all seven requested widths).
- Side-by-side desktop/mobile comparison: `artifacts/navbar-comparison.html`, using identical 1024px desktop and 375px mobile viewport sizes.
- Screenshots at 320px, 768px and 1440px were visually reviewed in addition to automated geometry checks.

## Validation

- Customer/P1/P2/P3 unit suite: **29 tests passed**.
- Full frontend regression: **65 grouped browser checks passed**, zero uncaught browser errors. Includes storage recovery, cart/wishlist persistence, stock limits, Buy Now to `/cart`, dialog accessibility, SEO, catalog retry, authentication gates, profile/address/order test-adapter flows and COD checkout.
- Targeted navbar suite: **12 grouped checks passed**, including 320, 375, 390, 430, 768, 1024 and 1440px; zero uncaught browser errors. Assertions cover exact centering within the usable viewport (less than 1px error), no logo/icon overlap, touch target sizes, two desktop rows, overflow, sticky header, announcement scrolling and search keyboard behavior.
- Reduced-motion/menu suite: **6 grouped checks passed**, zero uncaught browser errors.
- Production build: **passed**, Vite 6.4.4, 1,622 modules, 15.44s. JS 260.39 kB (gzip 82.01 kB), CSS 22.57 kB (gzip 5.19 kB).

Testing uses Chrome at the specified viewport widths. Real authentication/orders remain backend-dependent. No fake authentication, order success or payment behavior was introduced. This report supersedes the previous single-row/persistent-search navbar layout.
