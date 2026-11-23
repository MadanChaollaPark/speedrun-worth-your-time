# Plan · Iteration 4 · 2026-11-23 07:36 KST

Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert

Only the owner may change role assignments or loop configuration.

## Context

- Iterations 2 and 3 were PASS. All Definition of Done items are VERIFIED (see `STATE/CHECKLIST.md`).
- Orchestrator check at 07:36 KST: `gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest` → `built`, commit `8c64674` (v03-iter03). Unauthenticated `curl` of the live URL → 200. The live browser smoke has not yet been run against `8c64674`.
- Package mode starts 17:47 KST. This round is well before it, so small logic fixes are allowed. No new features, pages or dependencies.
- This round is polish of the brief logic: the three non-blocking issues from `STATE/REVIEW.md` (iteration 3) plus a live re-check. Budget roughly 40–70 minutes.

## Rules for the builder (unchanged)

- Work only in `/workspace/speedrun-pe`. Do not touch `/workspace/garamjigi` or `/workspace/kumgang`.
- Do not edit `speedrun_pe_loop.py`, `LOOP_LOG.md`, `GOAL.md`, `STATE/ALL_DONE`, `STATE/CHECKLIST.md` or this file.
- No git commit, tag or push. The driver owns those.
- Never submit any form, never sign in to speedrun-talent-network.com, never contact anyone.
- Every regression fixture must be fictional. Do not commit text copied from real API postings.
- Claim a result only after running the command and reading its output.
- Leave no temp files (`/tmp/wyt*`, scratch scripts, stray `test-results/` artifacts beyond what `.gitignore` covers). `git status --untracked-files=all` must show only intended files.

## Ordered work package

### Step 1 — Re-check the live iteration 3 deploy (≈5 min)

Run:
```sh
gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest --jq '{status,commit}'
curl -sS -o /dev/null -w '%{http_code}\n' https://madanchaollapark.github.io/speedrun-worth-your-time/
npm run test:live -- --retries=0
```
Acceptance: status `built` at commit `8c64674…`, HTTP 200, live suite 4 passed with retries off. Record all three outputs in BUILD_REPORT. If the live suite fails, diagnose and fix the test or app before Step 2, and report the cause.

### Step 2 — Distinct evidence excerpts per checklist row (≈15 min)

Problem: in the founding sample brief, "Funding and runway", "Team" and "Customers and traction" quote overlapping windows of the same sentence (`docs/js/brief.js`, `evidenceFor` and `inspect`).

Fix: when several rows draw from the same source line, each row's excerpt must be centered on that row's own anchor match, and if a different line also matches a row's pattern, prefer the line not already used by an earlier row. Keep the existing word-boundary trimming and ellipses.

Acceptance:
- New unit test with a fictional posting where one sentence mentions funding, team size and customers. The three rows' `evidence` strings are not identical, and each contains its own anchor term (for example "seed"/"raised", "engineers"/"team", "customers").
- New unit test: when funding appears in a separate line too, the Funding row quotes that separate line.
- Regenerated `tests/screenshots/a-sample-brief.png` shows the change. Open the screenshot and describe the three excerpts in BUILD_REPORT.

### Step 3 — Equity evidence must be about compensation (≈10 min)

Problem: an equity excerpt can quote a duty line (for example a bullet about building an "equity" feature or managing "stock options" for customers).

Fix: when picking `equityName` / `equityPercent`, skip lines that are in the extracted responsibilities list, and prefer lines with compensation context (salary, compensation, offer, vesting, ownership, %, "we offer", benefits). If the only equity mentions are duty lines, treat equity as not mentioned (existing unknown path with its question).

Acceptance:
- New fictional unit test: a responsibilities bullet "Build the equity cap table view for our customers" and no compensation equity → equity row is `unknown`, not `risk` or `signal`, and its evidence does not quote the bullet.
- New fictional unit test: the same bullet plus "Compensation: $150k–$180k + 0.5%–1.0% equity, 4-year vesting, 1-year cliff" → equity evidence quotes the compensation line.
- All existing equity tests still pass unchanged.

### Step 4 — Conflicting employment metadata (≈10 min)

Problem: API `employment_type` can say one thing (for example full time) while the description says another (for example "6-month contract").

Fix: in `analyze`/`normalizeFromApi`, when the API label and an employment term found in the text disagree, show both in the "Where and how" line (for example "Full time (listing) · contract (description)") and add an unanswered question: "The listing says X but the description says Y. Which is it, and does it convert?" Do not change the score for this.

Acceptance:
- New unit test using an API-shaped fictional fixture (same shape as existing API tests in `tests/unit/brief.test.js`) with `employment_type` full time and description text "This is a 6-month contract". Assert both labels appear and the question is present.
- New unit test: when they agree, no extra question appears.

### Step 5 — Pay wording edge cases (≈5 min)

Problem from review issue 1: "competitive pay, no range" never counts as a pay risk.

Fix: keep bare "competitive salary/pay/compensation" as `unknown` with the existing question. Add explicit non-disclosure phrases to `weakPay`: "no range", "range not shared", "salary TBD", "to be discussed". Do not re-add bare `competitive`.

Acceptance: unit tests for "Competitive pay, no range" → pay `risk`; "Competitive salary" → still `unknown` with question; "Salary TBD" → `risk`. Existing 25 tests still pass.

### Step 6 — Full test run, docs, report (≈10 min)

Run exactly the driver commands plus the checks below, from `/workspace/speedrun-pe`:
```sh
CI=1 npm run test:unit
CI=1 npx playwright test
grep -rnE 'innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function' docs/js || echo 'no unsafe sinks'
grep -c 'Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert' GOAL.md STATE/PLAN.md
git diff --name-only -- GOAL.md RESEARCH.md APPLICATION_DRAFT.md speedrun_pe_loop.py STATE/ALL_DONE
git status --short --untracked-files=all
```
Acceptance:
- Unit: 0 fail, 0 skipped, count ≥ 25 + new tests (expect ≥ 33).
- Playwright: 19 passed (or more), 0 failed, 0 skipped. Screenshots in `tests/screenshots/` regenerated.
- `no unsafe sinks`; role line count 1 in GOAL.md and ≥1 in STATE/PLAN.md; the `git diff --name-only` line prints nothing.
- `STATE/TEST_COMMANDS` unchanged (still exactly `npm run test:unit` and `npx playwright test`).
- CHANGELOG.md gets an "Iteration 4 · 2026-11-23" entry listing only verified changes. Update the scoring/evidence paragraph in PRODUCT.md if behavior changed. README only if a command or behavior it documents changed.
- Write `STATE/BUILD_REPORT.md`: steps done, each command with exit code and the key output line, files changed, anything deferred and why.

## Out of scope this round

New UI features, new pages, new dependencies, changes to APPLICATION_DRAFT.md, CI workflows (`.github/` stays absent: token lacks `workflow` scope), re-running the 25-posting live API calibration.
