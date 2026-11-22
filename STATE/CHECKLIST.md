# Checklist (orchestrator-owned)

Statuses: TODO / IN-PROGRESS / VERIFIED (with evidence). Only mark VERIFIED after a command or inspection actually confirmed it. Last updated: iteration 1 review, 2026-11-23 KST.

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
- [TODO] https://madanchaollapark.github.io/speedrun-worth-your-time/ opens without login and app works there (verify after driver push). Iter 1 review: HTTP 404, origin/main still 9ebd021 (not pushed).
- [IN-PROGRESS] URL recorded in README and APPLICATION_DRAFT.md. Recorded in README:5 and APPLICATION_DRAFT.md:5 but marked pending; flip to live after deploy is verified.

## DoD 5 — Quality and original design
- [VERIFIED] Original visual design (not default theme, not talent-network look), print stylesheet, responsive. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] No invented company data presented as fact; samples labeled fictional. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] Security pass: no `innerHTML` with untrusted text, CSP meta, http(s)-only links with `rel="noopener noreferrer"`, host allow-list for API fetch, safe share-link decoding, no secrets in repo. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.

## DoD 6 — Application draft (never submit)
- [VERIFIED] `APPLICATION_DRAFT.md` step-2 `ideas` pitch ≤1500 chars (counted) + demo link. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] About You / Last Few Questions answers with known facts; ALL-CAPS placeholders for unknowns. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.

## DoD 7 — Docs
- [VERIFIED] README: what it is, run, test, deploy, live URL, keyboard shortcuts. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] Product write-up (idea, how the assessment works, not in v1). Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
- [VERIFIED] Changelog / round notes. Evidence: iter 1 review — `CI=1 npm run test:unit` exit 0 (15 pass), `CI=1 npx playwright test` exit 0 (11 passed), code inspection; see STATE/REVIEW.md.
