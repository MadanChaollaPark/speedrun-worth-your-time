# PLAN — Iteration 1 (builder work package, ~40–70 min)

Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert

Read `GOAL.md` and `RESEARCH.md` first. Work only in `/workspace/speedrun-pe`. Do not commit, tag, or push (the driver does that after this round). Do not edit `speedrun_pe_loop.py`, `LOOP_LOG.md`, or write `STATE/ALL_DONE`. Never submit any form, contact anyone, or sign in to speedrun-talent-network.com. Never fake results: every claim in `STATE/BUILD_REPORT.md` must come from a command you ran.

Goal of this round: a working static Worth Your Time app in `docs/` with sample postings, the brief engine, the founder template, unit tests, a Playwright walkthrough with screenshots, `STATE/TEST_COMMANDS`, GitHub Pages enabled from `main:/docs`, and an updated README. `APPLICATION_DRAFT.md` is a stretch item (step 9).

## Locked decisions (do not re-open)

1. **Stack: zero-build static site.** Vanilla HTML + CSS + native ES modules, served as-is from `docs/`. No framework, no bundler, no CDN, no web fonts from third parties. Reason: GitHub Pages "deploy from branch" serves `docs/` directly, and the GitHub token on this box has scopes `repo, gist, read:org` but **not `workflow`**. **Do not create anything under `.github/workflows/`**: the driver's atomic push would be rejected and the whole round lost.
2. **All asset paths relative** (`./css/app.css`, `./js/app.js`) because the site lives under `/speedrun-worth-your-time/`. Add `docs/.nojekyll`.
3. **Brief engine is pure** (no DOM, no fetch) in `docs/js/brief.js` so Node can unit test it directly. DOM code lives in `docs/js/app.js` (and small view modules if you like).
4. **Tests:** Node built-in runner (`node --test`) for unit tests, `@playwright/test` (devDependency) for e2e. Root `package.json` with `"type": "module"` and `"private": true`. Commit `package-lock.json`. `node_modules/` is already gitignored.
5. **API path:** only for URLs whose host is exactly `speedrun-talent-network.com` (or `www.`) and path matches `/jobs/<slug>`. Fetch `https://speedrun-talent-network.com/api/v1/jobs/<slug>` (verified at iter 1: accepts the full slug, the 8-hex short id, or the UUID; CORS `*`; fields listed in RESEARCH.md "API re-check"). Timeout ~8 s via `AbortController`. Any failure (network, non-200, `status !== "open"`, bad JSON, missing `description_text`) → keep the URL, show a plain error, and move focus to the paste textarea. Any other URL → "We don't fetch other sites. Paste the posting text instead." No proxies, no scraping.
6. **Samples are fictional** and labeled "Sample — fictional company" in the UI. Never present invented company facts as real. Company names should be obviously made up.
7. **Design direction (original):** editorial "field notes" feel. Warm off-white paper background, near-black ink text, one strong accent (e.g. deep teal or brick), system serif for headings (`ui-serif, Georgia, …`), system sans for body, monospace for quoted evidence. Checklist statuses use icon + word + colour (never colour alone): **Signal** / **Risk** / **Unknown**. Visible focus rings. Light and dark (`prefers-color-scheme`). Print stylesheet that prints just the brief. Look at `research/screenshots/site_jobs.png` and `site_home.png` only to make sure you are **not** resembling them; copy nothing (no CSS, copy, assets, layout).
8. **localStorage keys** are our own: `wyt-founder-v1` (founder draft), `wyt-last-v1` (last pasted text). Never reuse `tsp-draft-v1`.

## Ordered work

### Step 1 — Scaffold (≈5 min)
Create:
```
package.json            scripts: "test": "npm run test:unit && npm run test:e2e", "test:unit": "node --test tests/unit/", "test:e2e": "playwright test", "serve": "node scripts/serve.mjs"
playwright.config.js    webServer: node scripts/serve.mjs on 127.0.0.1:4173 (reuseExistingServer: !process.env.CI), testDir tests/e2e, chromium only, retries 0
scripts/serve.mjs       tiny static server for docs/ (no deps). Reject path traversal (resolve + startsWith docs root), correct MIME types for .html .css .js .json .svg .png .ico .md, 404 otherwise. PORT env, default 4173.
docs/index.html
docs/.nojekyll
docs/css/app.css
docs/css/print.css      (or @media print inside app.css)
docs/js/brief.js        pure engine
docs/js/samples.js      sample postings + one API-shaped fixture
docs/js/founder.js      pure founder-template → markdown/posting text helpers
docs/js/app.js          DOM wiring, routing, rendering
docs/favicon.svg        original simple mark
tests/unit/*.test.js
tests/e2e/*.spec.js
tests/screenshots/      committed PNGs written by the e2e run
```
Append to `.gitignore`: `test-results/`, `playwright-report/`, `blob-report/`.

Install: `npm install --save-dev @playwright/test`. Then `npx playwright --version` and check whether its Chromium build is already in `~/.cache/ms-playwright` (currently `chromium-1255` and `chromium_headless_shell-1255` exist). If not, run `npx playwright install chromium` (public package download is allowed). Record which you did.

### Step 2 — Brief engine `docs/js/brief.js` (≈15 min)
Exports (names can vary slightly; document them):

- `normalizeFromText(text)` → `{ source: "paste", title, company, location, workplace, employment, comp, description }` with best-effort extraction of title/company/location from the first lines; unknowns are `null`, never guessed.
- `normalizeFromApi(job)` → same shape from the `/api/v1/jobs/{id}` object (`title, company, location, workplace_type, employment_type, comp_min/comp_max/comp_currency/comp_period/comp_summary, description_text, labels, url, apply.url, published_at, status`). Treat every field as untrusted and possibly missing/null.
- `parseSpeedrunJobUrl(input)` → `{ slug }` or `null`. Accept only `https:` (and `http:` upgraded), host `speedrun-talent-network.com` / `www.speedrun-talent-network.com`, path `/jobs/<[a-z0-9-]+>` with optional trailing slash, query/hash ignored. Reject `javascript:`, `data:`, look-alike hosts (`speedrun-talent-network.com.evil.io`, `evil.io/speedrun-talent-network.com/jobs/x`), userinfo tricks (`https://speedrun-talent-network.com@evil.io/jobs/x`).
- `analyze(posting)` → brief object:
  - `status`: `"ok" | "thin" | "empty"`. `empty` for blank/whitespace. `thin` when the description is under ~350 characters or fewer than 3 of the core facts (pay, location/workplace, responsibilities, team/stage, process) are present.
  - `reading`: `{ headline, summary[] }` — plain-language "what this job is": role, company (or "Company not named"), where/how (on-site / hybrid / remote + location), pay as posted (or "Pay not posted"), up to 5 concrete responsibilities pulled from bullet/sentence lines that start with action verbs or sit under "responsibilities/what you'll do" headings.
  - `isEarlyStage`: boolean + `earlyEvidence[]` (founding, first/first few engineers, seed, pre-seed, Series A, "employee #N", "<N person team", "0 to 1").
  - `checklist[]`: each `{ id, label, status: "signal"|"risk"|"unknown", evidence, why }`. `evidence` is a short **verbatim** snippet (≤160 chars) from the posting or the literal string "Not mentioned in the posting". Cover at least: posted salary range; equity stated (and whether it gives %/range, vesting, strike/409A); funding stage / runway / investors; team size and who you'd work with; reporting line; scope clarity (count of responsibilities, presence of "wear many hats" style language); success criteria (30/60/90, first-quarter goals); interview process and timeline; location / on-site expectation; hours / intensity language ("work hard", "hustle", "grind", "6 days", "nights and weekends"); visa sponsorship; customers / traction; tech stack named.
  - `unanswered[]`: `{ question, why }` generated from every `unknown` (and some `risk`) item, phrased as a question the seeker can send or ask in the first call (e.g. "What is the salary range for this role?", "What equity range, as a percentage, and what are the vesting and exercise terms?", "How many months of runway do you have at current burn?"). Early-stage roles get the extra founder questions (runway, who the first hires are, what happens if the next round slips).
  - `assessment`: `{ score (0–100), band, label, ledger[] , confidence }`. Start at 50; each checklist item adds or subtracts a fixed, documented weight; `ledger[]` lists `{ id, delta, reason }` so the UI can show exactly why. Bands (wording can be refined): ≥70 "Worth a conversation", 50–69 "Worth it if they answer the open questions", <50 "Proceed with caution". For `thin`, band is "Not enough to judge" and `confidence` is `"low"`; do not output a confident verdict on a thin post. `confidence` = low/medium/high from how many items are known.
  - Deterministic: same input → same output. No randomness, no network, no LLM.
- `briefToMarkdown(brief, posting)` → Markdown for copy/download. It must not emit raw HTML from the posting (escape `<`, `>` or put evidence in backticks/quotes safely).
- `encodeShare(text)` / `decodeShare(fragment)` → base64url of UTF-8 text for `#paste=` links (cap ~6000 chars; above that the UI says "Too long to share as a link, use Copy or Download"). Decoding must never throw to the UI; bad input → `null`.

### Step 3 — Samples `docs/js/samples.js` (≈5 min)
At least four fictional postings, realistic in length and tone:
1. **Founding Product Engineer**, seed-stage, 6-person team, on-site 4 days, posted salary band + equity range in %, vesting, clear first-90-days, interview steps. (Should land "Worth a conversation".)
2. **"First engineering hire / rockstar"**, pre-seed, no pay, "equity-heavy", "wear many hats", "fast-paced, work hard", no process, no team info. (Should land "Proceed with caution", with many unanswered questions.)
3. **Product Engineer at a Series B company** (not early-stage), decent detail, salary posted, hybrid. (Exercise the non-early path.)
4. **Thin post**: 2–3 lines only. (Must be `thin` / "Not enough to judge".)
Plus `apiFixture`: one object in the exact `/api/v1/jobs/{id}` shape (fictional company, `url` on `speedrun-talent-network.com/jobs/...`), used by unit tests and the mocked e2e route.

### Step 4 — UI `docs/index.html` + `docs/js/app.js` + CSS (≈15 min)
Views via hash routes: `#/` (Check a role, default), `#/founder` (Honest first-hire brief), `#/how` (how the assessment works, the weights, privacy: "everything runs in your browser; only speedrun board URLs call their public API"). Deep links: `#/?sample=<id>`, `#/?paste=<base64url>`, `#/?job=<slug>` (the last triggers the API path).

Check a role:
- One URL input + one large textarea ("Paste the job posting"), a **Get the brief** button, and a sample picker (buttons or a list) with "Sample — fictional company" labels.
- Errors inline next to the field with `aria-describedby` and `role="alert"`: empty ("Paste a posting or a speedrun job link first."), not a URL, unsupported site (see decision 5), API failure (fall back to paste and focus the textarea), very short text (still runs, shows the thin state).
- Loading state for the API call (button disabled, `aria-busy`).
- Result: heading with `tabindex="-1"` that receives focus after generation. Sections in this order: Verdict + score + confidence with the ledger ("Why this score") expandable; Plain-language reading; Questions the posting leaves unanswered (each with a per-question copy button and one "Copy all questions"); Signal/Risk/Unknown checklist with evidence quotes. Actions: **Copy as Markdown**, **Download .md**, **Print**, **Copy share link** (sample/job/paste link per decision above), **Check another**.
- For API jobs show "Source: speedrun talent network public API" and the role link (`https` only, `rel="noopener noreferrer"`, `target="_blank"`).

Founder template (`#/founder`):
- Fields: role title, company (or "stealth"), stage, team size today, funding raised / months of runway (ranges OK), salary range, equity range (%), vesting + cliff + exercise window, location and on-site days, who they report to, first 90 days, what's genuinely hard about this job, interview steps and total time, visa sponsorship (yes/no/case-by-case), contact or apply link.
- Live preview of the published brief, autosave to `wyt-founder-v1`, **Copy as Markdown**, **Download .md**, **Print**, **Clear** (with confirm), and **Check it with Worth Your Time**, which feeds the generated text into the analyzer and navigates to the result. A fully filled template should score in the top band; this is a nice consistency check to unit test.

Keyboard: skip link to main; logical tab order; `Ctrl+Enter` / `Cmd+Enter` in the textarea generates; `Enter` in the URL field generates; `?` (when not typing in a field) opens a shortcuts dialog (native `<dialog>`), `Esc` closes it and returns focus; `g` then `f` / `g` then `c` optional. Document shortcuts in the dialog, in `#/how`, and in README.

Security (must hold, reviewer will check):
- Never assign untrusted text through `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`document.write`. Build nodes with `createElement` + `textContent`. `grep -n "innerHTML" docs/js` should return nothing (or only static, literal templates with no interpolation).
- CSP `<meta http-equiv="Content-Security-Policy">`: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://speedrun-talent-network.com; base-uri 'none'; form-action 'none'; object-src 'none'`. No inline scripts or inline `style=""` attributes (use classes).
- `<meta name="referrer" content="no-referrer">`.
- Links built from API data: only if `new URL(x).protocol === "https:"`.

### Step 5 — Unit tests `tests/unit/` (≈7 min)
Import from `../../docs/js/brief.js` (and `founder.js`, `samples.js`). Minimum cases, each a separate `test()`:
1. Founding sample → `isEarlyStage === true`, band "Worth a conversation", salary/equity items `signal`, evidence strings are substrings of the input.
2. Rockstar sample → band "Proceed with caution", salary item `unknown` or `risk`, ≥6 `unanswered`, intensity language flagged `risk` with verbatim evidence.
3. Series B sample → `isEarlyStage === false`, founder-only questions absent.
4. Thin sample → `status === "thin"`, band "Not enough to judge", `confidence === "low"`.
5. Empty / whitespace input → `status === "empty"`, no throw.
6. Missing fields: posting with no pay, no location → those items `unknown`, matching questions present.
7. API-shaped input: `normalizeFromApi(apiFixture)` maps fields; comp built from `comp_min/max/currency/period`; nulls tolerated; object with `description_text: null` handled without throw.
8. `parseSpeedrunJobUrl` accept/reject table (include every reject case in Step 2).
9. Hostile input: posting containing `<script>alert(1)</script><img src=x onerror=alert(1)>` → engine returns it only as plain strings; `briefToMarkdown` output contains no raw `<script` or `<img`.
10. `encodeShare`/`decodeShare` round-trip with non-ASCII (Korean + emoji) text; garbage fragment → `null`.
11. Determinism: `analyze` twice on same input → deep-equal.
12. Founder template fully filled → analyzer band is the top band; empty template → not top band.

Run: `npm run test:unit` → all pass.

### Step 6 — Playwright walkthrough `tests/e2e/` (≈8 min)
Use the `webServer` from the config. Block real network to `speedrun-talent-network.com` in every test with `page.route` (fulfil from `apiFixture` or abort), so the suite is offline and deterministic. Save full-page screenshots to `tests/screenshots/`:
- `a-sample-brief.png`: open `/`, pick the founding sample **with the keyboard** (Tab/Enter), generate, assert focus is on the result heading, the verdict band text, ≥1 checklist item of each status shown; click Copy as Markdown (grant clipboard permissions in the context and assert clipboard text starts with `#`).
- `b-paste-brief.png`: type a pasted posting into the textarea, press `Control+Enter`, assert brief; also paste the hostile `<script>/<img onerror>` text and assert no dialog fired (`page.on("dialog")` fails the test) and the text appears literally.
- `c-founder-template.png`: open `#/founder`, fill every field, assert live preview, reload and assert autosave restored, click "Check it with Worth Your Time" and assert top band.
- `d-api-brief.png`: enter `https://speedrun-talent-network.com/jobs/<fixture-slug>`, route fulfils with fixture JSON, assert "Source: speedrun talent network public API".
- `e-api-fallback.png`: route aborts / returns 500, assert error message and that focus is in the paste textarea.
- `f-empty-error.png`: click generate with nothing → inline error with `role="alert"`.
- Plus: `?` opens the shortcuts dialog, `Escape` closes it.
- Optional: one `@axe-core/playwright` scan if quick; skip if it adds friction.

Run: `npx playwright test` → all pass, PNGs exist. Commit-worthy screenshots stay under `tests/screenshots/` (not gitignored).

### Step 7 — STATE/TEST_COMMANDS (≈1 min)
Exactly these lines (driver runs each from repo root with `CI=1`):
```
npm run test:unit
npx playwright test
```
Then run both lines yourself exactly as written, with `CI=1`, and paste the pass/fail counts into BUILD_REPORT.md.

### Step 8 — GitHub Pages (≈3 min)
Enable Pages from branch `main`, folder `/docs` (repo is public: `MadanChaollaPark/speedrun-worth-your-time`):
```
gh api -X POST repos/MadanChaollaPark/speedrun-worth-your-time/pages -f "source[branch]=main" -f "source[path]=/docs"
# if it returns 409 (already exists):
gh api -X PUT  repos/MadanChaollaPark/speedrun-worth-your-time/pages -f "source[branch]=main" -f "source[path]=/docs"
gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages --jq '.html_url,.source,.status'
```
Expected URL: `https://madanchaollapark.github.io/speedrun-worth-your-time/`. It will only serve the app after the driver pushes this round, so in BUILD_REPORT say "Pages enabled; live check pending driver push" (do not claim it is live). Do **not** push, do **not** create a `gh-pages` branch, do **not** add workflows. Local proof instead: start `node scripts/serve.mjs` in the background, `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4173/` and `/js/brief.js` → 200, then kill the server.

### Step 9 — Docs (≈5 min), then stretch
- `README.md`: what it is (2–3 sentences), live URL (marked "after first deploy"), how to run (`npm install`, `npm run serve` → http://127.0.0.1:4173), how to test (the two commands, plus `npx playwright install chromium` if browsers are missing), how to deploy (Pages from `main:/docs`, no build step), keyboard shortcuts table, privacy note (runs in browser; only speedrun board URLs call their public no-auth API), "not in v1" list. Keep the existing License section.
- `docs/PRODUCT.md` (or `PRODUCT.md` at root): the idea, who it's for, how the score is computed (weights table, matches the code), what is not in v1 (no accounts, no LLM, no scraping of other sites, no resume matching, no jobs board), why it fits the speedrun talent team's three goals.
- `CHANGELOG.md`: "Iteration 1" entry.
- **Stretch, only if all above pass:** `APPLICATION_DRAFT.md` per GOAL.md DoD 6: (a) step-2 `ideas` pitch ≤1500 characters (print `wc -m` / a node count in BUILD_REPORT) + `demo_url` = the Pages URL; (b) About You (email `EMAIL_PLACEHOLDER`, full name Madan Chaolla Park, LinkedIn `LINKEDIN_URL_PLACEHOLDER`, website `PERSONAL_WEBSITE_PLACEHOLDER`, shipped_url https://16ram.com and/or the Pages URL, GitHub https://github.com/MadanChaollaPark) and Last Few Questions (region, availability, sponsorship, usage, join_network as ALL-CAPS placeholders with the exact option lists from RESEARCH.md). Header line: "DRAFT — not submitted. Do not submit from this repo." Use only the known facts in GOAL.md; invent nothing.

## Acceptance criteria for this round (builder self-check before writing BUILD_REPORT)

| # | Check | Command / evidence |
|---|---|---|
| A1 | Unit tests pass, ≥12 tests | `CI=1 npm run test:unit` exit 0; paste summary line |
| A2 | E2E passes, screenshots a–f exist | `CI=1 npx playwright test` exit 0; `ls -la tests/screenshots` |
| A3 | `STATE/TEST_COMMANDS` has exactly the two lines | `cat STATE/TEST_COMMANDS` |
| A4 | No untrusted `innerHTML` | `grep -rn "innerHTML\|outerHTML\|insertAdjacentHTML\|document.write" docs/js` → none (or explain each literal-only use) |
| A5 | No workflows, no secrets | `ls .github 2>/dev/null`; `grep -rniE "gh[pousr]_[A-Za-z0-9]{20,}\|api[_-]?key\|secret" --exclude-dir=node_modules --exclude-dir=research .` → nothing real |
| A6 | Relative asset paths only | `grep -n 'src="/\|href="/' docs/index.html` → none |
| A7 | Pages enabled from main:/docs | `gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages --jq '.source'` |
| A8 | Local server serves the app | curl 200 for `/` and `/js/brief.js` |
| A9 | README + PRODUCT + CHANGELOG present and accurate | file list |
| A10 | Tree clean of temp files | `git status --short` shows only intended files; no `test-results/` or `playwright-report/` tracked; no stray servers (`pgrep -af serve.mjs` empty) |

## BUILD_REPORT.md must contain
What you built; files created/changed; each command above with its real exit code and pass/fail counts; Playwright/Chromium version used and whether you installed a browser; the Pages API response; anything not done, skipped, or uncertain (be explicit). Reply in 5 lines.

## Next iterations (for context, not this round)
- Iter 2: verify live Pages URL after driver push (+ Playwright smoke against the live URL), APPLICATION_DRAFT.md if not done, reviewer must-fixes.
- Iter 3+: polish (copywriting, design details, accessibility audit, more sample variety, print layout), live API smoke test kept optional (not in TEST_COMMANDS, so the driver suite stays offline).
- From 2026-11-23 17:47 KST: package mode only (docs, draft, deploy, tests; no new features).
