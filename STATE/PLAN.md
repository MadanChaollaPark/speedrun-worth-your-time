# PLAN — Iteration 2 (builder work package, ~40–70 min)

Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert

Read `GOAL.md`, `STATE/REVIEW.md` (iteration 1, verdict PARTIAL) and `STATE/CHECKLIST.md` first. Work only in `/workspace/speedrun-pe`. Do not commit, tag, or push (the driver does that). Do not edit `speedrun_pe_loop.py` (or its `.bak` copies), `LOOP_LOG.md`, or write `STATE/ALL_DONE`. Never submit any form, contact anyone, or sign in to speedrun-talent-network.com. Never fake results: every claim in `STATE/BUILD_REPORT.md` must come from a command you ran, with its real exit code and output.

## Where we are

- Iteration 1 built the full app in `docs/` and all DoD items were met locally. The only blocker was DoD 4 (live link), because nothing had been pushed.
- The driver pushed `6fff783` (tag `v01-iter01`). The orchestrator checked at 2026-11-22 23:35 KST: the Pages build for `6fff783` is `built`, `https://madanchaollapark.github.io/speedrun-worth-your-time/` returns **200** without a login, and every JS/CSS/SVG asset returns 200 and is byte-identical to `docs/`.
- Still missing: proof the app *works* in a browser on the live URL, the README and draft still say "pending", and three polish items from the review.

Goal of this round: prove the live app works with a scripted browser run, flip docs to live, fix the review's polish items, add an accessibility scan, and leave both driver suites green.

## Locked decisions (unchanged; do not re-open)

1. Zero-build static site in `docs/`, relative asset paths, `docs/.nojekyll`. Pages deploys from `main:/docs`. **Never create anything under `.github/workflows/`**: the token lacks `workflow` scope and the driver's push would be rejected.
2. The pure engine stays in `docs/js/brief.js` (no DOM, no fetch). DOM code stays in `docs/js/app.js`.
3. Driver suites stay exactly `npm run test:unit` and `npx playwright test` (the two lines in `STATE/TEST_COMMANDS`). They must stay offline and deterministic. **Do not add network-dependent tests to them.**
4. Do not add new product features this round. Polish and verification only.
5. Keep the original design (paper background, deep green accent, serif headings, monospace evidence). Copy nothing from the talent-network site.

## Ordered work

### Step 1 — Live smoke test, opt-in (≈15 min)

Create a separate Playwright config so the live check never runs inside `npx playwright test`:

- `playwright.live.config.js`: `testDir: 'tests/live'`, chromium only, `retries: 1`, **no `webServer`**, `use.baseURL = process.env.LIVE_URL || 'https://madanchaollapark.github.io/speedrun-worth-your-time/'`. Keep the trailing slash and use relative `page.goto('./')` so the `/speedrun-worth-your-time/` base path is kept.
- Confirm the default `playwright.config.js` has `testDir: 'tests/e2e'`, so `tests/live` is excluded from the driver suite.
- `package.json` script: `"test:live": "playwright test -c playwright.live.config.js"`.
- `tests/live/live.spec.js`. In each test, first block every request whose host is not `madanchaollapark.github.io` (`page.route('**/*', …)` → `route.abort()` for other hosts). The live smoke must not call the speedrun API or anything else. Tests:
  1. **Opens without a login:** response status 200, the final URL is still on `madanchaollapark.github.io`, the page title or h1 contains "Worth Your Time", and there are no console errors or page errors (collect `page.on('pageerror')` and `console` type `error`; CSP violations count as errors).
  2. **Sample → brief:** open the founding-role sample, generate, and assert the brief heading, the score, and at least one Signal/Risk/Unknown item are visible. Screenshot `tests/screenshots/live-a-sample-brief.png`.
  3. **Paste → brief:** paste a short realistic posting (reuse a fixture from `tests/fixtures.js`), generate with Ctrl+Enter, and assert the brief renders. Screenshot `tests/screenshots/live-b-paste-brief.png`.
  4. **Founder template:** open the founder view, fill two fields, and assert the preview updates. Screenshot `tests/screenshots/live-c-founder.png`.
- The live site serves the **iteration 1** code until the driver pushes this round. Use selectors that exist in both the current deployed code and your updated code (roles, labels and visible text that you are not changing). Do not change those labels this round.

Acceptance:
```sh
npm run test:live            # exit 0, 4 passed, 0 skipped (record real counts)
ls -la tests/screenshots/live-*.png
CI=1 npx playwright test --list | grep -c live   # expect 0: live specs are not in the driver suite
```
If the live run fails because of the deployed iteration 1 code (not your test), record the exact failure in BUILD_REPORT and fix the app. Do **not** weaken the assertion.

### Step 2 — Flip docs to live (≈5 min, only after Step 1 passes)

- `README.md:5`: drop "available after the first deploy…" and state the live URL plainly. Add a "Live check" line under the Test section: `npm run test:live` (optional, needs network; checks the deployed site, not part of the driver suite).
- `APPLICATION_DRAFT.md:5`: drop "(awaiting first app deployment)". Leave it marked DRAFT, not submitted.
- Update `PRODUCT.md` or `CHANGELOG.md` if they say "pending".
- `grep -n "pending\|awaiting\|after the first" README.md APPLICATION_DRAFT.md PRODUCT.md CHANGELOG.md` → no remaining matches about the deploy.

### Step 3 — Review polish (≈15 min)

a. **Skip link in screenshots.** `.skip` (`docs/css/app.css:62-71`) is `position: fixed` and shows in full-page screenshots a and c when it has focus. It covers the "Write your brief" heading, and there is a stray white bar top-left in screenshot a. Fix the root cause:
   - In the e2e spec, make sure focus is not left on the skip link before a screenshot. After generating, focus should already be on the result heading. Check why it isn't, and fix the app if focus handling is wrong.
   - Make sure the skip link is fully off-screen when it is not focused (for example `transform: translateY(-200%)` is not enough when `top: 1rem` and the element is tall; prefer `top:-100%` → `top:1rem` on `:focus`, or clip it). It must still appear and work when tabbed to (keep the existing keyboard test, or add an assertion that the first Tab focuses the skip link and Enter moves focus to `#main` or the equivalent).
   - Find the white bar's source in screenshot a and remove it.
b. **Evidence trimming.** `evidenceFor` (`docs/js/brief.js:134-138`) cuts mid-word ("Three payi", "Ask us abou"). Trim the window to word boundaries. Add a leading `…` when the start is cut and a trailing `…` when the end is cut. Keep the result ≤ ~170 chars and keep the anchor match inside the window.
   - Add unit tests: a long line whose snippet starts and ends at word boundaries with ellipses, the anchor match is contained, and short lines are returned unchanged.
c. Regenerate all screenshots (`CI=1 npx playwright test`). Then **open** `a-sample-brief.png`, `b-paste-brief.png` and `c-founder-template.png` and look at them: no skip link overlay, no white bar, no cut words in the evidence. Say in BUILD_REPORT what you saw.

### Step 4 — Accessibility scan (≈10 min)

- `npm install --save-dev @axe-core/playwright` (public package; commit the lockfile change).
- Add `tests/e2e/a11y.spec.js`, which runs axe on: the home/empty state, a generated brief (sample), the founder template, and the `?` shortcuts dialog open. Assert **zero `serious` or `critical` violations**. Print any `moderate`/`minor` ones to the test output.
- Fix any violations in the app (contrast in light **and** dark scheme: run one pass with `colorScheme: 'dark'`). Do not disable axe rules to make it pass. If a rule truly does not apply, explain it in BUILD_REPORT with the rule id and reason.

### Step 5 — Draft and docs touch-up (≈5 min)

- Recount `ideas` in `APPLICATION_DRAFT.md` with the counting command from the iteration 1 BUILD_REPORT. It must be ≤1500, and the draft must still contain the live demo link and ALL-CAPS placeholders for unknowns. Do not invent personal facts (GOAL.md lists the known ones).
- `CHANGELOG.md`: add "Iteration 2 · 2026-11-23": live verification, skip-link and evidence fixes, axe scan.
- README Test section: list unit, e2e (including a11y), and optional live. `STATE/TEST_COMMANDS` stays exactly two lines.

### Step 6 — Final verification and report (≈5 min)

Run, in order, and record the real exit codes and counts:
```sh
CI=1 npm run test:unit
CI=1 npx playwright test
npm run test:live
cat STATE/TEST_COMMANDS                     # exactly: npm run test:unit / npx playwright test
grep -rn "innerHTML\|outerHTML\|insertAdjacentHTML\|document.write\|eval(\|new Function" docs/js   # expect exit 1
ls .github 2>/dev/null                      # expect absent
curl -sS -o /dev/null -w '%{http_code}\n' https://madanchaollapark.github.io/speedrun-worth-your-time/   # expect 200
git status --short                          # only intended files; no test-results/ or playwright-report/ tracked
pgrep -af '[s]erve.mjs'                     # expect none left running
rg -n '^Orchestrator and reviewer are Kiro Claude Opus 5\.5; builder is Codex gpt-6\.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert$' GOAL.md STATE/PLAN.md
```
Write `STATE/BUILD_REPORT.md` (Iteration 2): files changed, a table of every command above with its real exit code and result, what you saw in the screenshots, and anything still open. Note that the live smoke ran against the iteration 1 deployment. The reviewer re-runs it after the driver pushes.

## Acceptance criteria for this round (the reviewer checks all of these)

1. `CI=1 npm run test:unit` exits 0, with ≥1 new evidence-trimming test, 0 failed, 0 skipped.
2. `CI=1 npx playwright test` exits 0, including the axe spec, 0 failed, 0 skipped, and no live specs listed.
3. `npm run test:live` exits 0 against the public Pages URL, and `tests/screenshots/live-{a,b,c}-*.png` exist.
4. README and APPLICATION_DRAFT.md give the live URL with no "pending" wording. The draft's `ideas` is ≤1500 chars and still unsubmitted.
5. Screenshots a/b/c show no skip-link overlay, no stray bar, and no mid-word evidence cuts.
6. Zero serious/critical axe violations in light and dark.
7. No workflow files, no secrets, no unsafe DOM sinks, worktree clean apart from intended changes, owner role line intact in GOAL.md and STATE/PLAN.md.
