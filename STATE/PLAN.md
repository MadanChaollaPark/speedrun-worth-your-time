# PLAN — Iteration 3 (builder work package, ~40–70 min)

Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert

Read `GOAL.md`, `STATE/REVIEW.md` (iteration 2, verdict PASS) and `STATE/CHECKLIST.md` first. Work only in `/workspace/speedrun-pe`. Do not touch `/workspace/garamjigi` or `/workspace/kumgang`. Do not commit, tag, or push (the driver does that). Do not edit `speedrun_pe_loop.py` (or its `.bak` copies), `LOOP_LOG.md`, or `STATE/ALL_DONE`. Never submit any form, contact anyone, or sign in to speedrun-talent-network.com. Never fake results: every claim in `STATE/BUILD_REPORT.md` must come from a command you ran, with its real exit code and output.

## Timebox

Iteration 2's build ran 27,218 s against a 4,500 s timeout. Keep this round to **about 60 minutes of work**. Do the steps in order. If a step runs past its budget, stop it, record what is left in `BUILD_REPORT.md`, and move on. Steps 1, 2, 5 and 6 are required. Steps 3 and 4 are best-effort.

## Where we are

- Iteration 2 got a PASS. Pages now serves iteration 2: orchestrator check at 2026-11-23 07:26 KST, `gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest` → `built`, commit `abecb7164e…`, live URL → HTTP 200.
- Open review items: re-run the live smoke on the new deploy, stabilize the flaky live founder test, and fix the "Brief actions ↓" link that overlaps the focused heading outline.
- This round is polish and calibration. Package mode starts 2026-11-23 17:47 KST.

## Locked decisions (unchanged; do not re-open)

1. Zero-build static site in `docs/`, relative asset paths, `docs/.nojekyll`, Pages from `main:/docs`. **Never create anything under `.github/workflows/`** (the token lacks `workflow` scope).
2. Pure engine in `docs/js/brief.js` (no DOM, no fetch). DOM code in `docs/js/app.js`.
3. Driver suites stay exactly `npm run test:unit` and `npx playwright test` (the two lines in `STATE/TEST_COMMANDS`). They stay offline and deterministic. Live checks stay in `npm run test:live`.
4. No new product features. Do not change the CSP `connect-src`, the API host allow-list, or the scoring weights beyond what a step requires.
5. Do not commit any text fetched from the speedrun API. Fixtures stay fictional or paraphrased.

## Steps

### 1. Live smoke on the iteration 2 deploy, and stabilize the founder test (≈10 min, required)

- In `tests/live/live.spec.js`, make the founder test wait for the founder section to be visible (for example `await expect(page.locator('#founder-company')).toBeVisible()` after clicking the link) before filling fields. Give live tests an explicit timeout in `playwright.live.config.js` (`timeout: 60_000`, `expect: { timeout: 15_000 }`) and `trace: 'retain-on-failure'`. Keep `retries: 1`.
- Run `gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest --jq '{status,commit}'` and record the commit.
- Run `npm run test:live -- --retries=0` **twice**. Record both exit codes and pass counts. If a test fails, save the error text and trace path in the report. Do not hide a failure with retries.
- Acceptance: both runs exit 0 with 4 passed. `tests/screenshots/live-*.png` are regenerated. `CI=1 npx playwright test --list | grep -c live` still prints 0.

### 2. "Brief actions ↓" spacing (≈10 min, required)

- The link is built in `docs/js/app.js` around line 355 (class `result-jump`). Adjust `docs/css/app.css` so the link no longer touches the focus outline of the result heading at desktop (1280 px) and mobile (390 px) widths. For example, put it on its own row, or add a margin larger than the outline width plus offset. Keep the link keyboard-reachable and in the same tab order.
- Regenerate screenshots with `CI=1 npx playwright test`. Open `tests/screenshots/a-sample-brief.png` and check it. Describe what you saw in the report.
- Acceptance: no overlap is visible in `a-sample-brief.png`. Axe tests still report zero serious or critical violations. The mobile overflow test still passes.

### 3. Calibration against real public postings (≈20 min, best-effort)

- Write a throwaway script **outside the repo** (for example `/tmp/wyt-calibrate.mjs`). It imports `docs/js/brief.js` by absolute path. It fetches `https://speedrun-talent-network.com/api/v1/jobs?limit=20` with plain GET, no auth, no keys. Check `/api/v1/openapi.json` for a filter that returns founding or early roles and include up to 5 of those if one exists. For each job, call `GET /api/v1/jobs/{id}`, then `normalizeFromApi` and `analyze`. Make at most 30 requests in total, sequentially.
- Print one line per job: short id, title, verdict band, score, the counts of signals, risks and unknowns, and whether pay, location and employment type were detected. Read 5 of the briefs alongside their `description_text` and find clear misreads. Examples: a risk on negated language, pay missed when `comp_*` fields exist, a "thin" verdict for a long posting, or a wrong stage.
- Fix **at most 3** clear misreads in `docs/js/brief.js`. Add a regression unit test for each, using **paraphrased, fictional** text, not API text.
- Paste the summary table (ids, titles, bands, scores only, no description text) and the list of fixes into `BUILD_REPORT.md`. Delete `/tmp/wyt-calibrate.mjs` when done.
- Acceptance: the script ran against the live API and the table is real output. Every fix has a passing unit test. No API text is in the repo (`git diff` shows only paraphrased fixtures).

### 4. Contractor and non-USD pay cases (≈10 min, best-effort)

This role is a contractor role, so hourly pay matters. Add unit tests in `tests/unit/brief.test.js` for pasted text with:
- `$80–$120/hr, 6-month contract` → pay detected and the range kept intact; employment type `contract`.
- `£70,000 – £90,000` and `€65k–€80k` → pay detected without guessing USD.
- `₩60,000,000–₩80,000,000` or `KRW 60M–80M` → either detected verbatim or left unknown. Never mis-parsed into a different number.
- `Competitive salary` with no numbers → pay stays unknown and the salary-range question is asked.

Fix `docs/js/brief.js` only where a test exposes a real bug. Acceptance: all new tests pass under `npm run test:unit`.

### 5. Docs (≈5 min, required)

- `README.md`: add one screenshot under the live demo link, `![Brief for the fictional founding-role sample](tests/screenshots/a-sample-brief.png)`, and keep the rest unchanged.
- `CHANGELOG.md`: add an `## Iteration 3 · 2026-11-23` entry. It lists only changes you verified (live re-check, spacing fix, calibration fixes, pay tests).
- If calibration changed scoring behavior, update the matching sentence in `PRODUCT.md`.
- Do not change `APPLICATION_DRAFT.md` unless a fact in it is now wrong. Its `ideas` must stay ≤1500 characters.

### 6. Final verification and report (≈5 min, required)

Run and record exit code and pass/fail/skip counts for:

```sh
CI=1 npm run test:unit
CI=1 npx playwright test
npm run test:live -- --retries=0
cmp -s STATE/TEST_COMMANDS <(printf '%s\n' 'npm run test:unit' 'npx playwright test'); echo $?
grep -rnE 'innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(' docs/js || echo "no unsafe sinks"
ls .github 2>&1
grep -c 'Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert' GOAL.md STATE/PLAN.md
git status --short
```

Write `STATE/BUILD_REPORT.md` with: the changes per step, the full command table (command, exit code, result), the calibration table from step 3 (or why it was skipped), the screenshots you opened and what you saw, and anything left undone. Leave no temporary files in the repo (`test-results/` must stay untracked).

## Acceptance for the round

- Both driver suites exit 0 with 0 failed and 0 skipped.
- The live smoke ran twice on the current deploy and passed, or the report records the exact failure.
- The "Brief actions" overlap is gone in the regenerated screenshot.
- README has the screenshot, and CHANGELOG has an iteration 3 entry.
- The role line is intact in `GOAL.md` and `STATE/PLAN.md`. No `.github/`, no secrets, no API text committed, and no form submitted.
