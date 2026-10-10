# Compact Marbello UI/UX refinement plan

Inspection found a sticky header already present, but wishlist is hidden on small screens and account access is limited to menus. The expandable search currently occupies a separate full-width header row, without suggestions or keyboard selection. The homepage hero has desktop padding of 192px plus a portrait image; other promotional images also use tall portrait ratios. Product cards use 4:5 images and large text spacing; detail galleries have no height cap. Shared sections use generous 64–96px vertical padding. Customer forms and checkout already contain the required functionality and will retain it.

1. Capture the existing website at desktop and mobile widths as a reviewable baseline.
2. Header/search: preserve the original logo asset, improve wordmark alignment, retain sticky positioning, expose account/wishlist/cart/search on mobile without increasing header height. Replace the search row with a bounded dropdown, suggestions using existing search matching, arrow/Enter/Escape handling, focus restoration and outside dismissal. Test this stage in a real browser.
3. Homepage/shared browsing: shorten hero, categories and promotional images; standardize section spacing, heading sizes, buttons and product cards. Keep all existing content and product data. Verify mobile/desktop geometry and browsing controls.
4. Product details: constrain gallery height and thumbnails, use two columns from tablet width, tighten purchasing information and related-product spacing. Preserve quantity limits, stock handling, Add to Cart, wishlist and Buy Now. Test purchasing regressions.
5. Customer/checkout/information pages: refine spacing consistently, put login/signup forms first on mobile, retain mandatory authenticated checkout and saved/manual address behavior. Use existing ink for readable body text on light backgrounds; preserve palette values and logo contents.
6. Motion: use lightweight CSS hover and intersection-observer reveal effects; preserve visibility without JavaScript and honor reduced motion. No animation dependencies.
7. Capture matching after screenshots at 320/375/390/768/1366px, compare representative desktop/mobile views and geometry, run all unit/browser regressions and production build, then report results and limits.

Business rules, catalog prices, service adapters, authentication behavior and localStorage protections stay unchanged. No backend, admin or payment implementation is included.
