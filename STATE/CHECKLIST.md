# Checklist (orchestrator-owned)

Statuses: TODO / IN-PROGRESS / VERIFIED (with evidence). Only mark VERIFIED after a command or inspection actually confirmed it. Last updated: iteration 5 plan, 2026-11-23 09:15 KST. Iterations 2, 3 and 4 verdicts: PASS (every required item below VERIFIED as of the iteration 4 review, 09:12 KST). Items marked TODO under "Iteration 5 polish" are optional quality work, not Definition of Done gaps.

## DoD 1 — Research captured
- [VERIFIED] RESEARCH.md records live page, role/values, wizard map, existing products, inspiration board (#step-3), exact step-2 (`demo_url`, `ideas` ≤1500) and step-3 (About You, Last Few Questions) prompts and fields, with sources. Evidence: read in full at iter 1; screenshots and text dumps present under `research/`.
- [VERIFIED] Public API facts re-checked for the app's API path. Evidence: iter 1 orchestrator `curl` of `/api/v1/openapi.json` (200), `/api/v1/jobs?limit=1` (CORS `*`), `/api/v1/jobs/{uuid|short|slug}` (200, same job); note added to RESEARCH.md.

## DoD 2 — Working product
- [VERIFIED] Paste text → brief (plain-language reading, unanswered questions, risk/signal checklist, explained assessment). Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] Paste speedrun job URL → public `/api/v1/jobs/{slug}` → brief; failure falls back to paste with a clear message. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] Non-speedrun URL → explains it can't fetch, asks for pasted text (no scraping, no proxy). Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] Shipped sample postings (fictional, labeled), incl. ≥1 founding/first-hire role and ≥1 weak/thin posting; work with no network. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] View / print / copy (Markdown) / download / share-link for a brief. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] Founder "honest first-hire brief" template: fill, live preview, copy/download/print, autosave, "check it with Worth Your Time". Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] Keyboard flow: skip link, logical tab order, Ctrl/Cmd+Enter to generate, focus moves to result heading, `?` shortcuts dialog, Esc closes; shortcuts documented in-app and README. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] Empty and error states (empty input, too-short input, API failure, bad URL). Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.

## DoD 3 — Tests
- [VERIFIED] Unit tests (`node --test`) for brief logic: full posting, founding role, missing fields, thin/weak posting, empty input, API-shaped input normalization, HTML/script in input treated as text. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] Playwright walkthrough with saved screenshots: (a) sample → brief, (b) pasted text → brief, (c) founder template; plus API path (mocked route) and API failure fallback. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] `STATE/TEST_COMMANDS` (one command per line) and README test section; driver run green. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.

## DoD 4 — Live public link
- [VERIFIED] GitHub Pages enabled from `main` `/docs` (no Actions workflow: token lacks `workflow` scope). Evidence: iter 1 `gh api .../pages` source main:/docs, status building; repo public.
- [VERIFIED] https://madanchaollapark.github.io/speedrun-worth-your-time/ opens without login. Evidence: iter 2 orchestrator, 2026-11-22 23:35 KST: driver pushed 6fff783 (v01-iter01); `gh api .../pages/builds/latest` status `built`, commit 6fff783, no error; unauthenticated `curl` of `/` → 200; `js/{app,brief,samples,founder}.js`, `css/{app,print}.css`, `favicon.svg` → 200 with correct content types and byte-identical to `docs/` (`cmp`).
- [VERIFIED] Iteration 2 build is what Pages serves. Evidence: iter 3 orchestrator, 2026-11-23 07:26 KST: `gh api .../pages/builds/latest` → `built`, commit `abecb7164e…` (v02-iter02), no error; unauthenticated `curl` of the live URL → 200.
- [VERIFIED] Iteration 3 build is what Pages serves. Evidence: iter 4 orchestrator, 2026-11-23 07:36 KST: `gh api .../pages/builds/latest` → `built`, commit `8c64674…` (v03-iter03); unauthenticated `curl` → 200.
- [VERIFIED] Iteration 4 build is what Pages serves. Evidence: iter 5 orchestrator, 2026-11-23 09:14 KST: `gh api .../pages/builds/latest` → `built`, commit `90a9a4b721b9…` (v04-iter04), updated 00:13:25Z; unauthenticated `curl` of the live URL → 200.
- [VERIFIED] Live browser smoke re-run against the iteration 4 deploy (`90a9a4b`). Evidence: iter 5 reviewer `npm run test:live -- --retries=0` exit 0 (4 passed); Pages `built` at `90a9a4b`; `curl` → 200.
- [TODO] Live browser smoke re-run against the iteration 5 deploy (after driver push).
- [VERIFIED] Live browser smoke re-run against the iteration 3 deploy (`8c64674`). Evidence: iter 4 reviewer 2026-11-23 09:12 KST `npm run test:live -- --retries=0` exit 0 (4 passed); Pages `built` at `8c64674`; `curl` → 200.
- [VERIFIED] Live browser smoke re-run against the iteration 2 deploy (`abecb71`), with the founder test stabilized. Evidence: iter 3 reviewer `npm run test:live -- --retries=0` exit 0 (4 passed); `tests/live/live.spec.js:60` waits for `#founder-company`; Pages `built` at `abecb71`.
- [VERIFIED] App works end-to-end on the live URL (sample → brief, paste → brief, founder template) in a real browser. Evidence: iter 2 reviewer `npm run test:live` exit 0 (4 passed with --retries=0; an earlier run had 1 flaky founder test that passed on retry), screenshots `tests/screenshots/live-*.png`; deployed commit 6fff783.
- [VERIFIED] URL recorded in README and APPLICATION_DRAFT.md. Evidence: iter 2 reviewer read README.md:5 and APPLICATION_DRAFT.md:5; no pending wording.

## DoD 5 — Quality and original design
- [VERIFIED] Polish from iter 1 review: skip link clipped when unfocused (docs/css/app.css:62-71), evidence trimmed at word boundaries with ellipses (docs/js/brief.js:133-155). Evidence: iter 2 reviewer viewed regenerated a/c screenshots; `CI=1 npm run test:unit` exit 0 (18 pass).
- [VERIFIED] Automated accessibility scan (axe via `@axe-core/playwright`) on home, brief, founder and shortcuts dialog, light and dark: zero serious/critical violations. Evidence: iter 2 reviewer `CI=1 npx playwright test` exit 0 (19 passed incl. 8 axe).
- [VERIFIED] "Brief actions ↓" link no longer overlaps the focused result-heading outline. Evidence: iter 3 reviewer opened regenerated `tests/screenshots/a-sample-brief.png`; `CI=1 npx playwright test` exit 0 (19 passed incl. axe and mobile overflow).
- [VERIFIED] Calibration fixes (reporting line, hybrid cloud, org-count traction) and contractor/hourly and non-USD pay cases, each with fictional regression tests. Evidence: iter 3 reviewer `CI=1 npm run test:unit` exit 0 (25 pass); calibration run itself reported by builder, not re-run by reviewer.
- [VERIFIED] Distinct evidence excerpts per checklist row. Evidence: iter 4 reviewer opened `tests/screenshots/a-sample-brief.png` (three distinct excerpts); `CI=1 npm run test:unit` exit 0 (36 pass).
- [VERIFIED] Equity evidence only from compensation lines, not duty bullets. Evidence: iter 4 reviewer unit run (36 pass) plus ad hoc node check: duty-only bullet → `unknown`.
- [VERIFIED] Conflicting API vs description employment type shown and asked about. Evidence: iter 4 reviewer `CI=1 npm run test:unit` exit 0 (conflict and agreement tests pass).
- [VERIFIED] Explicit pay non-disclosure ("no range", "salary TBD") counts as pay risk; bare "competitive salary" stays unknown. Evidence: iter 4 reviewer `CI=1 npm run test:unit` exit 0 (36 pass).
- [VERIFIED] Original visual design (not default theme, not talent-network look), print stylesheet, responsive. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] No invented company data presented as fact; samples labeled fictional. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] Security pass: no `innerHTML` with untrusted text, CSP meta, http(s)-only links with `rel="noopener noreferrer"`, host allow-list for API fetch, safe share-link decoding, no secrets in repo. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.

## DoD 6 — Application draft (never submit)
- [VERIFIED] `APPLICATION_DRAFT.md` step-2 `ideas` pitch ≤1500 chars (counted) + demo link. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] About You / Last Few Questions answers with known facts; ALL-CAPS placeholders for unknowns. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.

## DoD 7 — Docs
- [VERIFIED] README: what it is, run, test, deploy, live URL, keyboard shortcuts. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] Product write-up (idea, how the assessment works, not in v1). Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] README shows one product screenshot; CHANGELOG has an iteration 3 entry. Evidence: iter 3 reviewer read README.md:7 and CHANGELOG.md:3-8.
- [VERIFIED] CHANGELOG iteration 4 entry matching verified changes. Evidence: iter 4 reviewer read CHANGELOG.md:3-9.
- [VERIFIED] Changelog / round notes. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.

## Iteration 5 polish (optional quality; see STATE/PLAN.md)
- [VERIFIED] Clause-aware excerpts on shared lines: Reporting row ends at its clause, Team row starts at its own clause, First-quarter row in the paste sample keeps "30 existing customers". (Review iter 4 issue 1; screenshot a and b.) Evidence: iter 5 reviewer `CI=1 npm run test:unit` exit 0 (44 pass), `CI=1 npx playwright test` exit 0 (19 passed); screenshots a/b inspected; see STATE/REVIEW.md.
- [VERIFIED] Checklist evidence drops leading list markers (`- `, `* `, `• `, `1. `) while staying verbatim otherwise. Evidence: iter 5 reviewer `CI=1 npm run test:unit` exit 0 (44 pass), `CI=1 npx playwright test` exit 0 (19 passed); screenshots a/b inspected; see STATE/REVIEW.md.
- [VERIFIED] Score no longer saturates: baseline derived so full disclosure is exactly 100; paste sample with equity and hours unknown no longer scores 99. Ledger stays additive; app, Markdown and PRODUCT.md wording match. Evidence: iter 5 reviewer `CI=1 npm run test:unit` exit 0 (44 pass), `CI=1 npx playwright test` exit 0 (19 passed); screenshots a/b inspected; see STATE/REVIEW.md.
- [VERIFIED] API postings: bare one-word employment line in the description does not create a false listing/description conflict. (Review iter 4 issue 2.) Evidence: iter 5 reviewer `CI=1 npm run test:unit` exit 0 (44 pass), `CI=1 npx playwright test` exit 0 (19 passed); screenshots a/b inspected; see STATE/REVIEW.md.
- [VERIFIED] Direct unit assertion for the funding reason "The posting gives a funding detail and also states a runway figure." (Review iter 4 issue 3.) Evidence: iter 5 reviewer `CI=1 npm run test:unit` exit 0 (44 pass), `CI=1 npx playwright test` exit 0 (19 passed); screenshots a/b inspected; see STATE/REVIEW.md.
