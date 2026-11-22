# Review · Iteration 1

Reviewer: Kiro Claude Opus 5.5 · 2026-11-23 KST

## Verdict: PARTIAL

Both required suites pass (driver run and my own rerun). The product, tests, docs and application draft meet the Definition of Done locally. DoD 4 is unmet: the public Pages URL returns HTTP 404 because the app has not been pushed yet (`origin/main` is still `9ebd021`, the initial commit). PASS needs the live link to open without a login.

## Commands I ran (cwd `/workspace/speedrun-pe`)

| Command | Exit | Result |
| --- | --- | --- |
| `CI=1 npm run test:unit` | 0 | 15 pass, 0 fail, 0 skipped |
| `CI=1 npx playwright test` | 0 | 11 passed (4.8 s), 0 skipped; screenshots a–f regenerated |
| `curl -sS -o /dev/null -w '%{http_code}' https://madanchaollapark.github.io/speedrun-worth-your-time/` | 0 | **404** |
| `git ls-remote origin` | 0 | `refs/heads/main` = `9ebd021` (no app pushed) |
| `gh api repos/MadanChaollaPark/speedrun-worth-your-time --jq '{private,visibility}'` | 0 | `{"private":false,"visibility":"public"}` |
| `gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages --jq .status` | 0 | `building` (source `main:/docs` per builder) |
| `grep -rn "innerHTML\|outerHTML\|insertAdjacentHTML\|document.write\|eval(\|new Function" docs/js` | 1 | zero matches |

Driver logs agree: `STATE/logs/iter01_tests_1.txt` (unit, EXIT=0, 15 pass) and `STATE/logs/iter01_tests_2.txt` (Playwright, EXIT=0, 11 passed), run by the driver.

## Grades per Definition of Done item

1. **Research captured: MET.** RESEARCH.md keeps the live page, products, inspiration board and step-2/step-3 fields. The new API notes (wrapper `{job}`, CORS `*`, slug/uuid/short-id lookup) match how `docs/js/app.js:156-163` consumes the API.
2. **Working product: MET (locally).** Sample, paste, speedrun URL (API) and non-speedrun URL paths are all present (`docs/js/app.js` `checkInput`, `checkJob`). The brief includes a plain-language reading, unanswered questions, a Signal/Risk/Unknown checklist with verbatim evidence, and a score with a "Why this score" ledger. Copy Markdown, download, print, share link and the founder template with autosave, preview and handoff all work. Keyboard support: skip link, Ctrl/Cmd+Enter, focus moves to the result heading, a `?` dialog, and Esc restores focus. Shortcuts are documented in README §Keyboard shortcuts. Samples include a founding role ("Founding Product Engineer", screenshot a).
3. **Tests: MET.** Unit tests cover missing fields, a weak posting, API-shaped normalization, hostile markup, share round-trip, the URL allow-list and determinism. The Playwright walkthrough saved screenshots for (a) a sample, (b) a paste, (c) the founder template, plus the API, fallback and empty states. README and `STATE/TEST_COMMANDS` both document the two commands.
4. **Live public link: NOT MET.** Pages is enabled and the repo is public, but the URL returns 404 because nothing has been pushed. README:5 and APPLICATION_DRAFT.md:5 record the URL but mark it pending.
5. **Quality and original design: MET.** The design is original: warm paper background, deep green accent, serif display headings, monospace evidence quotes. It looks nothing like the talent-network site and is not a default framework theme. I found no copied assets or JS. Samples are labelled "Sample — fictional company". Security: no HTML sinks, and a strict CSP meta (`script-src 'self'`, `connect-src` limited to self and the API host, `form-action 'none'`, `base-uri 'none'`). API fetches use `credentials:'omit'` and `redirect:'error'`. The job host has an exact allow-list with no port or userinfo, and slugs must match `[a-z0-9-]+`. API `url` values must pass `safeHttpsUrl`, and the original-posting link uses `rel="noopener noreferrer"`. Share links are decoded with a size limit. I found no secrets.
6. **Application draft: MET.** `ideas` has 926 characters (≤1500, builder count; I did not recount it). The demo link is present, and unknowns use ALL-CAPS placeholders (REGION, VISA_SPONSORSHIP, AVAILABILITY, LINKEDIN, website, network usage/join, resume, email). Nothing was submitted.
7. **Docs: MET.** README covers what the app is, run, test, deploy and shortcuts. PRODUCT.md and CHANGELOG.md are present.

## Claims in BUILD_REPORT.md

Every claim I checked holds: test counts, no sinks, two-line TEST_COMMANDS, the Pages source/status, and the public 404 before the push. The report labels the live link as pending and does not claim it works.

## Issues

- **Blocking:** DoD 4. The Pages URL returns 404 until the driver pushes `docs/` to `main` and the build finishes.
- `docs/css/app.css:62-71` and `tests/screenshots/c-founder-template.png`: the focused "Skip to content" link overlays the "Write your brief" heading. A white bar also shows at the top left of screenshot a. The screenshots capture a focused skip link. Either blur before the screenshot or check that the link sits at the viewport top when it has focus. Cosmetic.
- `docs/js/brief.js` evidence snippets are cut mid-word ("Three payi", "Ask us abou" in screenshot a). Trim at a word boundary and add an ellipsis.
- `speedrun_pe_loop.py` has an uncommitted one-line change (`ansi.sub("", …)`). It is owner/driver territory. I left it alone and am noting it only.
- The optional axe accessibility scan was skipped. It is not a DoD requirement.

## Must-fix list (priority order)

1. Driver pushes. Then verify the live URL returns HTTP 200 without a login, and that a sample → brief works there (Playwright against the live URL or a curl of `index.html` plus `js/app.js`). After that, change README and APPLICATION_DRAFT.md from "pending" to live.
2. Fix the skip-link overlay and the stray white bar in screenshots, then regenerate them.
3. Trim evidence quotes at word boundaries.
