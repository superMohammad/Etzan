# SEO Audit — اتزان (Etzan)

**Scope:** technical + on-page SEO for the deployed web app (`etzan/web`, GitHub Pages).
**Method:** static review of `index.html`, `vite.config.ts`, `src/main.tsx`, and the
deploy workflow, plus a rendered-DOM check in Chrome for JS-injected tags. Schema and
meta detection was done in a rendered browser, not `curl`/fetch — those strip
`<script>` and cannot see client-injected JSON-LD.

**Status: all findings implemented.** This file is now a record of what was found
and what was done, not an open action list. Each finding below carries its
resolution. Re-audit after the first deploy to confirm indexing in the field.

**Not assessed:** Search Console data, backlinks, competitor positions, and live Core
Web Vitals field data — no access to the production property or analytics.

---

## Resolution summary

| # | Finding | Status |
|---|---------|--------|
| 1 | HashRouter blocks per-route indexing | Fixed — `BrowserRouter` + `404.html` fallback, base derived from the repo name in CI |
| 2 | No per-route title/description | Fixed — `lib/usePageMeta.ts`, per route and per language |
| 3 | No canonical | Fixed — self-referencing, set by `usePageMeta` |
| 4 | No Open Graph / Twitter | Fixed — `og:*` + `twitter:*`, `og:locale` follows the active language |
| 5 | No JSON-LD | Fixed — `WebApplication` block in `index.html` |
| 6 | No robots.txt / sitemap.xml | Fixed — `public/robots.txt`; both finalised in CI, which is the only place that knows the real origin |
| 7 | No favicon / theme-color | Fixed — `public/favicon.svg` + `theme-color` |
| 8 | Check pages had no `<h1>` | Fixed (earlier UI pass) |
| 9 | Heavy payload on first interaction | Partly fixed — routes are lazy and `recharts` is its own chunk (entry is ~77 kB); wasm prefetch **not** added (see note) |
| 10 | `lang`/`dir` correct, no hreflang needed | Still a pass — language is a client-side toggle over one URL set, so hreflang stays inapplicable |
| 11 | Numerals / bidi breakage | Fixed (earlier UI pass) |
| 12 | Thin indexable content | Fixed — new `/about` route plus real explanatory copy on every tool page |
| 13 | No E-E-A-T signals | Fixed — `/about` carries methodology, datasets, measured model accuracy, team, affiliation, not-medical-advice notice and privacy statement |

**Not done, deliberately:** the finding-9 wasm prefetch. Prefetching a 13.5 MB
binary from the landing page costs every visitor that download whether or not
they run a check. The chunk split was kept; the prefetch was not.

**Still unverifiable from here:** actual indexing, Core Web Vitals field data and
the live sitemap all need the deployed origin and Search Console access.

---

## Executive summary

The app is a single-page React build served statically from GitHub Pages. It is
technically sound (valid `lang`/`dir`, responsive, HTTPS by default on Pages) but is
**effectively a one-page site to a search engine**. Every route lives behind a `#`
fragment, so Google sees one URL with one title and one description, and the three
tools that are the actual product — the brain check, the sleep check, the tracker —
cannot rank for anything on their own.

**Top 3 priorities**

1. Routes are not indexable (`HashRouter`) — nothing else in this list matters as much.
2. No per-route `<title>`/`<meta description>` — even the one indexable URL is thin.
3. No canonical, Open Graph, or JSON-LD — no share previews, no entity understanding.

**Quick wins** (no routing change, under an hour each): favicon + `theme-color`,
`robots.txt` + `sitemap.xml`, Open Graph/Twitter tags, JSON-LD `WebApplication`.

---

## Technical SEO findings

### 1. Routes are not separately indexable — `HashRouter`

- **Impact:** Critical
- **Evidence:** `src/main.tsx:3,9` uses `HashRouter`; `vite.config.ts:10` sets
  `base: "./"`. URLs are `/#/brain`, `/#/sleep`, `/#/dashboard`.
- **Why it matters:** Google discards the fragment. All four routes collapse to one
  indexable URL, so the site can hold at most one position in the SERP, for one
  title/description pair, no matter how good the individual tools are.
- **Fix:** Switch to `BrowserRouter` and add the GitHub Pages SPA fallback — copy
  `dist/index.html` to `dist/404.html` in the build step so Pages serves the app for
  deep links. Note the tradeoff that motivated `HashRouter`: `base: "./"` makes the
  build work under any repo name. Moving to `BrowserRouter` means committing to a
  known base path (`base: "/<repo>/"`, or a custom domain at `/`).
- **Priority:** 1

### 2. No per-route title or meta description

- **Impact:** High
- **Evidence:** `index.html:6-7` — one static `<title>` and one `<meta name="description">`
  for the whole app. Rendered DOM confirms no runtime title updates.
- **Fix:** Set `document.title` and the description per route (a small `usePageMeta`
  hook, or `react-helmet-async`). Even while on `HashRouter` this improves the browser
  tab and shared-link text. Suggested targets:
  | Route | Title |
  |---|---|
  | `/` | اتزان — توازنك الرقمي |
  | `/brain` | فحص التعفن الدماغي — اتزان |
  | `/sleep` | فحص جودة النوم وموعد النوم المثالي — اتزان |
  | `/dashboard` | لوحة متابعة الاتزان الرقمي — اتزان |
- **Priority:** 2

### 3. No canonical tag

- **Impact:** High
- **Evidence:** Rendered DOM: `document.querySelector('link[rel="canonical"]')` → `null`.
- **Why it matters:** Pages is reachable at both `<user>.github.io/<repo>/` and any
  custom domain; without a canonical, those are duplicates competing with each other.
- **Fix:** Add a self-referencing `<link rel="canonical">` on the absolute production URL.
- **Priority:** 2

### 4. No Open Graph or Twitter Card tags

- **Impact:** Medium
- **Evidence:** Rendered DOM: zero `meta[property^="og:"]` / `meta[name^="twitter:"]`.
- **Why it matters:** Every share in WhatsApp, X, or LinkedIn renders as a bare URL
  with no title, description, or image — a direct loss of click-through for a project
  that will mostly be shared socially.
- **Fix:** Add `og:title`, `og:description`, `og:type=website`, `og:url`, `og:locale=ar_SA`,
  `og:image` (1200×630), and `twitter:card=summary_large_image`.
- **Priority:** 3

### 5. No structured data (JSON-LD)

- **Impact:** Medium
- **Evidence:** Rendered in Chrome — `document.querySelectorAll('script[type="application/ld+json"]').length` → `0`.
  Confirmed in a live DOM, so this is not the usual false negative from a fetch-based check.
- **Fix:** Add a `WebApplication` block (`applicationCategory: HealthApplication`,
  `inLanguage: ar`, `offers: price 0`) and, if an FAQ section is ever added, `FAQPage`.
  Validate with the Rich Results Test, which renders JavaScript.
- **Priority:** 3

### 6. No `robots.txt` and no `sitemap.xml`

- **Impact:** Medium
- **Evidence:** `etzan/web/public/` contains only `models/`.
- **Fix:** Add both to `public/` (Vite copies it verbatim). The sitemap is only worth
  more than one entry after finding 1 is fixed — sequence it after the routing change.
- **Priority:** 3

### 7. No favicon and no `theme-color`

- **Impact:** Low
- **Evidence:** Rendered DOM: zero `link[rel*="icon"]`, no `meta[name="theme-color"]`.
  The browser requests `/favicon.ico` and gets the SPA fallback.
- **Fix:** Add an SVG favicon plus `<meta name="theme-color" content="#faf3e7">` to match
  the cream canvas. Reuse the brain mark already used in the nav.
- **Priority:** 4

### 8. ~~Check pages had no `<h1>`~~ — resolved

- **Status:** Fixed during the accompanying UI work.
- **Evidence:** `BrainCheck.tsx`, `SleepCheck.tsx` and `Dashboard.tsx` previously opened
  at `<h2>` with no `<h1>` anywhere on the route. Each page now renders exactly one
  `<h1>` and the `h1 → h2 → h3` order is unbroken (verified in the rendered DOM).

### 9. Large blocking payload on first interaction

- **Impact:** Medium (Core Web Vitals — INP/LCP)
- **Evidence:** Build output: `ort-wasm-simd-threaded.wasm` is **13.5 MB** and the JS
  bundle is **692 KB** (207 KB gzipped). `lib/onnx.ts:41-56` lazily loads models per
  check, so the wasm runtime downloads on the user's first check, not on page load.
- **Why it matters:** The landing page is fine, but the first check on a mobile
  connection has a long, unindicated wait. This is a UX and engagement signal more than
  a crawl issue — Googlebot will not run the check.
- **Fix:** Keep the lazy load, but (a) add `<link rel="prefetch">` for the wasm on the
  landing page so it warms while the user reads, and (b) show real progress during the
  first model load instead of only "جارٍ التحليل…". Optionally split `recharts` into its
  own chunk via `manualChunks` to cut the main bundle.
- **Priority:** 4

### 10. Correct internationalisation setup — pass

- **Evidence:** `index.html:2` — `<html lang="ar" dir="rtl">`.
- **Assessment:** Correct and sufficient. The app is single-locale, so `hreflang`,
  `x-default`, and locale-prefixed URLs are **not** applicable; adding them would create
  the reciprocal-link and canonical conflicts described in the international-SEO
  reference for no benefit. Revisit only if an English version ships.

### 11. ~~Numerals and bidi breakage in rendered text~~ — resolved

- **Status:** Fixed during the accompanying UI work.
- **Why it was an SEO finding:** reversed and mixed-numeral strings (`٪40`, `١٠ / ٥٫٥٦`)
  are what a crawler extracts as page text, and they read as low-quality content to both
  users and content-quality systems. All numbers now go through `lib/format.ts`.

---

## Content findings

### 12. Thin indexable content

- **Impact:** High (compounds finding 1)
- **Evidence:** The landing page (`pages/Landing.tsx`) is the only indexable URL; its
  body text is roughly 120 words — a hero, four one-line facts, and three cards.
- **Why it matters:** Even after routing is fixed, the check pages are forms. A form
  with no surrounding explanation has little to rank with.
- **Fix:** Add genuine explanatory content to each tool page — what "التعفن الدماغي"
  means, how the model was built, what the dataset was, how to read the five levels.
  This material already exists in the research notebooks and would double as the E-E-A-T
  signal the site currently lacks (no author, no methodology, no credentials on-page).
- **Priority:** 2

### 13. No E-E-A-T signals on-page

- **Impact:** Medium
- **Evidence:** The footer lists four team names with no roles, affiliation, or links.
  There is no methodology page, no data-source statement, and no privacy page — despite
  the app processing health-adjacent self-reported data.
- **Why it matters:** This is health-adjacent content, where Google weighs
  trustworthiness heavily.
- **Fix:** Add an "عن اتزان" page: the team and their affiliation (Tuwaiq Academy), the
  datasets used, model accuracy, and an explicit statement that this is not medical
  advice. Add a short privacy statement — the "data stays in your browser" claim is a
  genuine trust asset and is currently buried in one line on the dashboard.
- **Priority:** 3

---

## Prioritised action plan

**Blocking indexation**
1. Migrate `HashRouter` → `BrowserRouter` + `404.html` fallback, and pin `base` (finding 1)

**High impact**
2. Per-route `<title>` + `<meta description>` (finding 2)
3. Self-referencing canonical (finding 3)
4. Real content on each tool page + an "عن اتزان" methodology page (findings 12, 13)

**Quick wins** (independent of routing; each under an hour)
5. Favicon + `theme-color` (finding 7)
6. `robots.txt` (finding 6)
7. Open Graph + Twitter Card (finding 4)
8. JSON-LD `WebApplication` (finding 5)

**After routing is fixed**
9. `sitemap.xml` with all four routes (finding 6)
10. Wasm prefetch + first-load progress + `manualChunks` (finding 9)

---

## Verification once implemented

- Rich Results Test (renders JS) for the JSON-LD — not `curl`.
- PageSpeed Insights on the landing route for field and lab Core Web Vitals.
- `site:` query and the Search Console coverage report to confirm all four routes index.
- Any social-share debugger for the Open Graph preview.
