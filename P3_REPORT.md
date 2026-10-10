# P3 frontend changes and verification

Date: 2026-10-10. Scope: SEO, metadata, configuration and small code cleanup. Existing P1/P2 changes were retained. Page layout, colors, typography and visible business/demo copy were not changed. Backend-dependent form logic, newsletter logic, product data/reviews, checkout and backend were not changed during P3.

## Changes

| Area | Previous issue | P3 change |
| --- | --- | --- |
| Route metadata | Missing descriptions could retain the previous page's text; same-path navigation was not an explicit effect dependency. | Shared metadata utility applies a fallback description and updates metadata on pathname/search changes. Invalid products/categories get accurate metadata titles; unknown routes are marked noindex. |
| Canonical URLs | No canonical link; OG URLs contained tracking/search query strings. | One canonical link and matching OG URL use the current pathname and configured site origin, excluding query strings/fragments. A path starting with `//` cannot replace the configured canonical host. |
| Indexing hints | Personal cart/wishlist, internal search and invalid routes had no indexing policy. | `noindex, follow` on cart, wishlist, search and not-found routes; normal catalog pages restore `index, follow`. These are client-side metadata hints, not server HTTP status changes. |
| Social metadata | No Twitter metadata; old OG images could persist after navigation. | OG site name/type and Twitter title/description/card added. Valid products use OG type `product`. Both OG/Twitter images are removed when absent or unsupported. Only HTTP(S) image URLs are accepted; generated SVG data URLs are excluded. |
| Structured data | Object identity caused metadata effects to rerun on unrelated product state changes. | Effect depends on serialized structured data. Product schema is still removed on navigation to ordinary pages. Demo schema claims and catalog values were not rewritten. |
| Static HTML | Only title/description existed before React ran. | Default OG/Twitter metadata added for the static HTML shell. Page-specific metadata still requires JavaScript execution. Existing title and description copy preserved. |
| Font configuration | Missing preconnect to the font asset host. | Added the gstatic preconnect; font family/weights and stylesheet URL preserved. |
| Public environment configuration | No explicit production canonical-origin configuration or validation. | `.env.example` documents optional `VITE_SITE_URL`. Vite validates HTTP(S) origin format and rejects credentials, subpaths, query strings and fragments. Blank values fall back to the browser origin. No production domain was invented. |
| Repository hygiene | Build outputs and local env variants could appear as untracked changes. | `.gitignore` now covers `dist/`, `.vite/`, `coverage/` and `.env.*`, while keeping `.env.example` trackable. Existing output files were not deleted. |
| Code cleanup | Unused React import, a redundant filter wrapper, repeated product lookup and incomplete memo dependency list. | Removed the unused import/wrapper, reused the existing catalog Map for cart items, and included stable setters in StoreContext memo dependencies. Filter markup and cart behavior preserved. |
| Project instructions | README lacked build, testing, metadata and hosting details. | Added reproducible `npm ci`, regression scripts, production build/preview instructions, public env guidance, BrowserRouter hosting fallback and client-side metadata limitations. User scratch notes were left untouched. |

P3 adds `test:p3` and `test:p3:browser`. No dependency version or lockfile change was made during P3.

## Verification

| Check | Result |
| --- | --- |
| `npm run test:p3` | 18 tests passed, 0 failures; includes all 14 P1/P2 unit tests and 4 new SEO/configuration tests |
| `node tests/p1-browser.mjs --p2 --p3` | 29 grouped checks passed; 0 uncaught browser errors |
| P1/P2 browser regressions | Menu geometry/navigation, keyboard quick-add, malformed storage, normal/rapid/partial cart operations, wishlist, reload persistence, product state resets, drawer focus/scroll cleanup, search, existing form validation and footer focus passed |
| New SEO browser regressions | Product metadata/canonical URL, same-path search updates, noindex/index restoration, fallback description, unique tags, stale social image removal and JSON-LD cleanup passed |
| UI regression | 8 mobile/desktop comparisons passed: Home, Shop, Contact and Product at 375px and 1366px |
| Production build | Passed after final static metadata changes; actual `npm run build -- --outDir <fresh temporary directory>`, Vite 6.4.4, 1,605 modules, 19.95 seconds |
| Whitespace/config hygiene | `git diff --check` passed; `dist/test.js` and `.env.local` ignored, `.env.example` not ignored |

The screenshot runner disables header backdrop blur equally in both references to avoid Chrome's nondeterministic compositor-edge pixels. This is test-only; the app's blur is unchanged. External web fonts are blocked equally, so screenshots use the existing fallback fonts. Tests cover the stated routes/states; they do not prove all browser/device combinations or crawler behavior. A test-harness async import error was corrected before the successful browser run.

Final output: HTML 1.49 kB (gzip 0.54 kB), CSS 18.25 kB (gzip 4.34 kB), JS 216.91 kB (gzip 69.83 kB). The CSS content hash remains `DoCVtVf2`, matching the P2 build. Temporary browser/build directories were cleaned after verification; existing project outputs and source files were preserved.

## Contrast proposal — awaiting permission

No color or typography change was applied. The proposal is to add a **text-only** taupe token `#70695F` for normal body text on light backgrounds, keeping `#8C857A` for existing decorative/background uses and preserving the cream/bone/ink palette. This avoids a global taupe replacement that could also affect button hover backgrounds.

| Text shade | On cream `#FAF7F2` | On bone `#F1ECE3` |
| --- | ---: | ---: |
| Existing `#8C857A` | 3.42:1 | 3.10:1 |
| Proposed text-only `#70695F` | 5.07:1 | 4.61:1 |

Ratios were calculated using sRGB relative luminance. [WCAG 2.2 minimum contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) requires at least 4.5:1 for normal text, with exceptions such as large text. These candidate ratios apply to the two solid backgrounds above; they are not a full-site accessibility certification. Mixed backgrounds, placeholders and hover/focus states would need verification during an approved contrast change. Increasing every text size to avoid color changes would alter layout and is not proposed.

## Separate security review

The read-only audits were refreshed during P3:

- Full audit: **9 affected package entries — 5 high, 4 moderate, 0 critical**.
- Production-only audit: **2 moderate entries — react-router and react-router-dom; 0 high/critical**.
- The package counts include dependency-chain propagation and are not independent advisory counts.
- Tailwind build-tool findings and Router advisories remain unresolved; no force updates, overrides or major migrations were performed. P1 Vite 6.4.4 remains installed.

Installed-package exposure, patched versions and deferred migration decisions are documented in [DEPENDENCY_SECURITY_REVIEW.md](./DEPENDENCY_SECURITY_REVIEW.md). This work does not claim a clean dependency audit.

## Limits and next steps requiring authorization

- Contrast token/application is pending permission; current colors are preserved.
- Set the real `VITE_SITE_URL` before a production build. No actual domain or hosting account was configured or published.
- CSR metadata cannot guarantee page-specific social previews for crawlers that do not run JavaScript. SSR/prerendering, real share assets and a domain-specific sitemap need separate scope; no backend was added.
- Missing routes still use the SPA's hosting response. Real HTTP 404 status and route fallback need hosting configuration.
- Dependency migrations require a separate compatibility review/change. Backend forms, business/demo content and checkout remain outside this pass.

P3 implementation is complete within these constraints. Further changes wait for the user's permission.
