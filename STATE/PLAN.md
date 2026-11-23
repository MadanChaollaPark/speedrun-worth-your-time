# Plan · Iteration 5 · 2026-11-23 09:15 KST

Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert

Only the owner may change role assignments or loop configuration.

## Context

- Iterations 2, 3 and 4 were PASS. Every Definition of Done item is VERIFIED in `STATE/CHECKLIST.md`.
- Orchestrator check at 09:14 KST: `gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest` returned `built` at commit `90a9a4b721b9…` (v04-iter04). An unauthenticated `curl` of the live URL returned 200. The live browser suite has not yet run against `90a9a4b`.
- Package mode starts at 17:47 KST. This round falls well before that, so small logic and display fixes are allowed. Do not add features, pages, routes or dependencies.
- This round polishes the brief so its output reads well and its score stays honest. It covers the three non-blocking issues in `STATE/REVIEW.md` (iteration 4) plus two problems the orchestrator found in the screenshots. Budget roughly 50–70 minutes.

What the screenshots show today:
- `tests/screenshots/a-sample-brief.png`, founding sample: Reporting reads "You report directly to the CTO and …". Team reads "… the CTO and work with our product designer…", so the Team excerpt starts inside the reporting clause.
- `tests/screenshots/b-paste-brief.png`, paste sample: First-quarter outcomes reads "First 90 days: Launch the guided importer to …". The excerpt stops before the object of the sentence because the traction anchor ("30 existing customers") sits on the same line.
- Scope and Technical stack excerpts begin with a raw list marker ("- Build…", "- Integrate…").
- The paste sample scores **99/100** although equity and hours are both unknown and both appear as open questions. The engine starts at 50 and the rewards sum to 58, so the result hits the 100 cap and missing details stop counting. That undercuts the "explained, not magical" promise.

## Rules for the builder (unchanged)

- Work only in `/workspace/speedrun-pe`. Do not touch `/workspace/garamjigi` or `/workspace/kumgang`.
- Do not edit `speedrun_pe_loop.py`, `LOOP_LOG.md`, `GOAL.md`, `RESEARCH.md`, `APPLICATION_DRAFT.md`, `STATE/ALL_DONE`, `STATE/CHECKLIST.md`, `STATE/TEST_COMMANDS` or this file.
- Do not run git commit, tag or push. The driver owns those.
- Never submit any form, never sign in to speedrun-talent-network.com, never contact anyone.
- Every regression fixture must be fictional. Do not commit text copied from real API postings.
- Claim a result only after you run the command and read its output.
- Leave no temp files (`/tmp/wyt*`, scratch scripts, stray `test-results/` artifacts beyond what `.gitignore` covers). `git status --short --untracked-files=all` must show only intended files.

## Ordered work package

### Step 1 — Re-check the live iteration 4 deploy (≈5 min)

```sh
gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest --jq '{status,commit}'
curl -sS -o /dev/null -w '%{http_code}\n' https://madanchaollapark.github.io/speedrun-worth-your-time/
npm run test:live -- --retries=0
```

Acceptance: status is `built` at commit `90a9a4b…`, HTTP is 200, and the live suite passes 4 of 4 with retries off. Record all three outputs in BUILD_REPORT. If the live suite fails, diagnose it and fix the test or app before Step 2, then report the cause.

### Step 2 — Clause-aware excerpts on shared lines (≈20 min)

File: `docs/js/brief.js`, `evidenceFor`. When the function trims a shared line to keep clear of another row's anchor, it currently cuts at that anchor's index. Change the cut so it snaps to a clause boundary:

- Clause boundaries: sentence end (`. ! ?` followed by a space), `;`, `, ` and the connector words ` and `, ` but `, ` while `, ` then `, ` so `.
- **After** the row's own anchor, the excerpt must continue at least to the first clause boundary after `matchEnd`. Cut there, not mid-clause, even if another anchor starts earlier inside that clause.
- **Before** the row's own anchor, start at the last clause boundary before `matchStart`. Never start inside a clause that belongs to an earlier anchor.
- Drop a dangling connector or comma at the cut so excerpts never end in "and …" or start with "and …". Keep the existing `… ` and ` …` markers wherever text is omitted.
- Keep the 160-character limit and the word-boundary trimming for long single clauses. Each excerpt must remain a verbatim substring of the posting once the ellipses are removed. The existing test at `tests/unit/brief.test.js:13-26` checks this.

Acceptance (use the shipped samples in `docs/js/samples.js`; add unit tests that assert these exact strings):
- Founding sample, Reporting row: `You report directly to the CTO …` (no trailing "and").
- Founding sample, Team row: starts with `… work with our product designer` and contains `dispatch team at a pilot operator`.
- Paste sample (the Pencil Cloud Studio posting), First-quarter outcomes row: contains `Launch the guided importer to 30 existing customers`.
- Paste sample, Customers and traction row still contains `30 existing customers`.
- The iteration 4 distinct-excerpt tests still pass. If one asserted a mid-clause cut that the new rule replaces, update the expected string. Say which test changed, and why, in BUILD_REPORT.
- Open the regenerated `a-sample-brief.png` and `b-paste-brief.png` and quote the four rows above in BUILD_REPORT.

### Step 3 — Drop list markers from evidence (≈5 min)

In `evidenceFor` (or right before it is called), strip one leading list marker matching `stripBullet` (`- `, `* `, `• `, `1. `, `1) `) from the displayed excerpt. Analysis must still use the original line.

Acceptance:
- New unit test: a posting with the bullet `- Build the import tool in TypeScript` yields a Technical stack evidence of `Build the import tool in TypeScript` (no leading `- `).
- The founding sample's Scope and Technical stack excerpts no longer start with `- ` in `a-sample-brief.png`.
- The verbatim-substring test still passes.

### Step 4 — Score that does not saturate (≈15 min)

File: `docs/js/brief.js`, around line 437. Today `score = clamp(50 + Σdelta)`, and the rewards sum to 58, so a posting can miss two criteria and still reach 99–100.

Change: derive the baseline from the weights so that a posting with every criterion a signal scores exactly 100. The baseline is `100 − (the maximum total positive delta the ledger can produce)`. Compute it from `criteria` (and any other positive ledger rows, if they exist) rather than hard-coding it. Today that is 42. Keep the clamp to 0–100 and keep the ledger additive: the score must equal baseline + Σdelta, clamped. Leave the band thresholds (70 / 50) and the confidence rules unchanged.

Update every place that says "starts at 50" so it shows the actual baseline: `docs/js/app.js:242`, the Markdown export at `docs/js/brief.js:473`, and `PRODUCT.md:12`. Also update the unit test at `tests/unit/brief.test.js:191-196` so it uses the exported baseline, not 50. Export the baseline from `brief.js` (for example `export const BASELINE`).

Acceptance:
- New unit test: a fictional posting where every criterion is a signal scores exactly 100, with no clamping needed (baseline + Σdelta === 100).
- New unit test: the paste sample scores below 95, and its ledger plus baseline equals its score.
- In BUILD_REPORT, add a table of before and after score and band for each shipped sample in `docs/js/samples.js`. The founding sample must stay "Worth a conversation". If any other sample changes band, say so and explain whether the new band is more accurate. Do not retune thresholds to hide a change.
- "Why this score" in the app and the Markdown export state the new baseline in plain words, for example "Starts at 42, so a posting that answers every question scores 100."

### Step 5 — Close the two remaining review gaps (≈10 min)

a) Review issue 2, in `employmentInDescription`: for `source === 'api'` postings, ignore the final bare-line fallback (a line that is only an employment word, such as "Contract"). The API's `employment_type` stays authoritative unless the description states a type explicitly: a labeled field, a fixed-term contract, or a "this is a … role" statement. Paste-only postings keep the current behavior.

Acceptance: a new fictional API-shaped fixture (same shape as the existing API tests) with `employment_type: 'full_time'` and a description containing the heading line `Contract` followed by `We sign a standard offer letter and IP agreement.` produces no conflict question, and "Where and how" shows only the listing type. The existing 6-month-contract conflict test still passes unchanged.

b) Review issue 3: add a unit test where funding ("We raised a $4M seed round.") and runway ("We have 22 months of runway.") sit on separate lines. Assert that the Funding row has status `signal`, quotes the seed line, and has the reason `The posting gives a funding detail and also states a runway figure.`

### Step 6 — Full test run, docs, report (≈10 min)

Run these from `/workspace/speedrun-pe`:

```sh
CI=1 npm run test:unit
CI=1 npx playwright test
grep -rnE 'innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function' docs/js || echo 'no unsafe sinks'
grep -rn 'starts at 50\|Starts at 50' docs PRODUCT.md README.md || echo 'no stale baseline'
grep -c 'Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert' GOAL.md STATE/PLAN.md
git diff --name-only -- GOAL.md RESEARCH.md APPLICATION_DRAFT.md speedrun_pe_loop.py STATE/ALL_DONE STATE/TEST_COMMANDS
git diff --check -- docs tests PRODUCT.md CHANGELOG.md README.md
git status --short --untracked-files=all
```

Acceptance:
- Unit tests: 0 fail and 0 skipped, with at least 36 plus the new tests (expect ≥ 43).
- Playwright: at least 19 passed, 0 failed, 0 skipped, including the axe scans. The screenshots in `tests/screenshots/` are regenerated. If an e2e test asserted the old score, update it to the new value and list it in BUILD_REPORT.
- The checks print `no unsafe sinks` and `no stale baseline`. The role line count is 1 in GOAL.md and at least 1 in STATE/PLAN.md. The `git diff --name-only` and `git diff --check` commands print nothing.
- CHANGELOG.md gets an "Iteration 5 · 2026-11-23" entry that lists only verified changes. Update PRODUCT.md's scoring paragraph to match Step 4. Update the README only if a behavior or command it documents changed. The README screenshot path stays the same.
- Write `STATE/BUILD_REPORT.md` covering: the steps done; each command with its exit code and key output line; the sample before/after score table; the quoted excerpts from the screenshots; the files changed; and anything deferred, with the reason.

## Out of scope this round

- New UI features, pages or dependencies.
- Changes to APPLICATION_DRAFT.md.
- CI workflows. `.github/` stays absent because the token lacks `workflow` scope.
- Band threshold retuning.
- Re-running the 25-posting live API calibration.
