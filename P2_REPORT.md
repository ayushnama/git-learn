# P2 frontend fixes and verification

Reviewed and tested: 2026-10-10.

The functional P2 fixes were already implemented in the preceding authorized pass. This follow-up checked the implementation, expanded missing browser regression cases, reran P1/P2 regressions, ran the actual production build, and recorded the separate dependency security review. No further application UI changes or dependency upgrades were needed in this follow-up. Existing uncommitted P1/P2 work was preserved.

## Fix status

| P2 issue | Implemented behavior | Verification |
| --- | --- | --- |
| Invalid/oversized cart additions and quantity updates | Known products and safe integer quantities only; additions, updates and saved-data recovery respect the smaller of available stock and the existing 10-item limit. Zero removes an item; invalid updates do not corrupt the cart. | Unit tests for invalid IDs/quantities, new/existing carts, low/zero stock and normalization; browser rapid additions, capped button, persistence and normal increase/decrease/removal. |
| Misleading add-to-cart feedback | Full, partial, at-limit and out-of-stock results are distinguished. Rapid batched clicks keep consistent counts. Existing timers are cleared before replacement and on unmount. | Partial 5-item request with 8 already saved adds 2, reports the actual amount and survives reload. Repeated additions keep feedback for the latest timer and preserve both additions. |
| State carried between products | Product slug navigation resets quantity/feedback; gallery remounts per product ID and exposes the selected thumbnail semantically. | SPA navigation from a related-product link resets quantity to 1, image selection to 1 and feedback to the default button label. |
| Category display-name searches fail | Category name, slug, product name and description are searched with normalized punctuation/case and all query terms. | Unit tests plus browser searches for Cups & Mugs, Bowls & Trays and Clocks & Watches. |
| Unsupported claim of chronological newest sorting | The existing `isNew` sorting is accurately labeled `New arrivals first`. No invented dates were added. | Existing sort behavior retained; default Shop screenshots match. Actual chronological sorting requires real catalog dates. |
| Duplicate filter IDs and shared radio groups | React-generated unique price IDs and category radio group names distinguish sidebar and drawer. | Browser checks uniqueness, label-to-input associations, separate radio names and working category selection. |
| Drawer keyboard/focus/scroll behavior | Shared dialog hook provides initial focus, Tab wrapping, Escape close, background inert state, body/html scroll lock, restoration and desktop resize cleanup. Portals preserve overlay coverage. | Mobile menu tested at 320/375/768px; both menu and filter focus wrapping, Escape, restoration/cleanup and desktop resizing verified. |
| Invisible footer keyboard focus | Cream outline on the dark footer, only during keyboard focus. | Computed focus outline check; default appearance remains unchanged. |
| Contact/newsletter false success | Native email validation retained, contact whitespace rejected, entered message retained, truthful unavailable notices replace fake sent/subscribed responses. | Browser checks empty/invalid/whitespace cases, correction behavior, retained contact message and unavailable notices. No backend requests or personal-data storage added. |

## Final test results

| Check | Result |
| --- | --- |
| `npm run test:p2` (includes all P1 storage unit tests) | 14 tests passed, 0 failures |
| `node tests/p1-browser.mjs --p2` | 26 grouped checks passed; 0 uncaught browser errors |
| P1 regression coverage in that browser run | Menu geometry/navigation, quick-add keyboard activation, normal cart/wishlist operations, reload persistence and six malformed storage cases passed |
| Visual regression | 8 screenshots passed: Home, Shop, Contact and Product at 375px and 1366px |
| Actual `npm run build -- --outDir <fresh temporary directory>` | Passed; Vite 6.4.4 transformed 1,604 modules |

For deterministic screenshots, Chrome's intermittently different one-pixel backdrop-compositor edge is avoided by disabling header blur equally in both screenshot references. This is a test-only adjustment; application blur was not changed. Screenshot coverage verifies layout/colors/content for these routes, not every possible interactive state. The isolated browser profile and production build output were removed after testing; existing project build outputs were not removed.

## Items remaining under the requested constraints

- **Text contrast remains an open P2 item.** The taupe text against cream/bone has insufficient contrast for normal text. Fixing it requires changing color or typography, which conflicts with the explicit instruction to preserve the design. No global palette or typography changes were made. This item must not be represented as complete.
- **Backend-dependent functionality:** Contact sending and newsletter subscription remain unavailable. The misleading frontend responses are fixed; real submission requires the future backend or an approved service.
- **Business/demo content:** Catalog stock, review claims and legal/business copy remain demo content. Real stock, reviews and approved policies cannot be invented. No review, backend or legal-content implementation was added.
- **Dependency findings:** See [DEPENDENCY_SECURITY_REVIEW.md](./DEPENDENCY_SECURITY_REVIEW.md). Full audit: 5 high/4 moderate package entries; production-only audit: 2 moderate. Findings remain unresolved; no force update or major migration performed.

Backend and checkout were not created. P3 has not started and requires the user's permission.
