# Dependency security review

Reviewed: 2026-10-10. Read-only review; no dependency or lockfile changes in this review, and no `npm audit fix --force` or overrides applied.

Frontend stabilization recheck: `npm audit --json` still reports 5 high and 4 moderate affected package entries; runtime-only `npm audit --omit=dev --json` reports 2 moderate entries and no high/critical entries. Audit exit code 1 indicates advisories were found. No install, update, force fix or override was performed. Input/response validation and the React error boundary do not remove dependency advisories. The build-tool applicability and Router migration review below remain applicable; this is not a claim that all findings are resolved.

P3 recheck on the same date: both audit commands were rerun successfully and returned the same counts below. No package dependency versions or lockfile were changed during P3. `package.json` changes only add P3 test scripts. Vite remains 6.4.4; Tailwind and React Router major migrations are still deferred. P3 metadata/configuration changes do not remove these package findings.

## Audit results

| Command | High | Moderate | Critical | Result |
| --- | ---: | ---: | ---: | --- |
| `npm audit --json` | 5 | 4 | 0 | 9 affected package entries |
| `npm audit --omit=dev --json` | 0 | 2 | 0 | 2 affected package entries |

These are package counts, including dependent packages affected by an upstream advisory, not nine independent vulnerabilities. The underlying advisories are braces stack exhaustion, selector-parser CPU exhaustion, Router open redirect, and Router SSR hydration constructor injection. Audit exit code 1 means findings were returned; it does not mean the build failed. The production-only query initially hit a registry/network error; the read-only retry succeeded.

## Installed packages and exposure

| Dependency chain | Installed versions | Assessment for this project | Disposition |
| --- | --- | --- | --- |
| Tailwind -> chokidar/micromatch -> braces; fast-glob -> micromatch | Tailwind 3.4.19, chokidar 3.6.0, micromatch 4.0.8, fast-glob 3.3.3, braces 3.0.3 | Development/build tooling. Deeply nested untrusted brace patterns can exhaust the Node call stack. The current app does not pass browser search input to these tools. This does not make the installed package patched. | No patched braces version is listed in the [advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). npm proposes a Tailwind 4 major migration for the chain. Defer migration for compatibility and design review. |
| Tailwind -> postcss-nested -> postcss-selector-parser; Tailwind -> postcss-selector-parser | postcss-nested 6.2.0, selector-parser 6.1.4 | Trusted build sources only. The [advisory](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) identifies exposure when untrusted selectors are synchronously parsed in a request path; ordinary trusted builds are not affected by that scenario. | Patched selector-parser is 7.1.6. Existing dependencies request version 6; do not force a major transitive override. Review with the future Tailwind migration. |
| react-router-dom -> react-router | Both 6.30.6 | Production dependency. [Open redirect](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) requires attacker-supplied paths reaching navigation. Current links use fixed internal routes or catalog slugs; search text is encoded into a fixed `/search?q=` path. No raw user-supplied redirect target was found. | Fixed in Router 7.18.0. npm proposes react-router-dom 7.18.4, a major migration. Defer until migration is authorized and route behavior is tested. |
| react-router-dom -> react-router | Both 6.30.6 | The [SSR hydration advisory](https://github.com/advisories/GHSA-337j-9hxr-rhxg) explicitly excludes Declarative Mode. This app uses client-side BrowserRouter/createRoot, with no SSR hydration. | Same Router major migration decision. Installed package finding remains visible even though this application's current mode does not meet the exploit conditions. |

## P1 security fix retained

Vite remains 6.4.4 with esbuild 0.25.12. Neither appears in the current audit findings. No downgrades or major Tailwind/Router updates were performed.

## Follow-up requiring a separate change

Prepare isolated Router 7 and Tailwind 4 migration proposals, including compatibility work and browser/layout regression coverage, before making package changes. Re-audit if the project starts processing untrusted CSS/globs, accepts redirect destinations, or introduces SSR. This review does not claim a clean security audit or proven absence of exploitation.
