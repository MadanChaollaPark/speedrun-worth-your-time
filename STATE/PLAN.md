# Plan · Iteration 6 · 2026-11-23 09:58 KST

Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert

Only the owner may change role assignments or loop configuration.

## Context

- Iterations 2 through 5 were PASS. Every Definition of Done item is VERIFIED in `STATE/CHECKLIST.md`.
- Orchestrator check at 09:57 KST: `gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest` returned `built` at commit `9b46781cf3f5…` (v05-iter05). An unauthenticated `curl` of the live URL returned 200. The live browser suite has not yet run against `9b46781`.
- Package mode starts at 17:47 KST. This round is well before that, so small logic and display fixes are allowed. Do not add features, pages, routes or dependencies.
- Budget: roughly 50–70 minutes. This round fixes the three non-blocking excerpt issues from `STATE/REVIEW.md` (iteration 5) and runs a bounded calibration against real public postings, which earlier rounds deferred.

What the engine shows today for the Moonbutton sample (`docs/js/samples.js:27-44`), from an orchestrator `node` dump of `analyze(normalizeFromText(text))`:

| Row | Status | Evidence today |
| --- | --- | --- |
| Equity and terms | risk | `… This is an equity-heavy opportunity for a rockstar who wants to get in on the ground floor.` |
| Hours and intensity | risk | `… This is an equity-heavy opportunity for a rockstar who wants to get in on the ground floor.` (same as Equity) |
| Scope clarity | risk | `You'll wear many hats. This is a fast-paced environment where we work hard and expect nights and weekends when it takes them to make a launch happen. We are …` |

Causes, in `docs/js/brief.js`:
- `timePressure` treats `rockstar` and `fast-paced` the same as `nights and weekends`. `pressure` keeps document order, so the rockstar line comes first. Both pressure lines are already in `shown` (Equity took the rockstar line and Scope took the paragraph), so `preferUnused` falls back to `candidates[0]`.
- `evidenceFor`'s long-clause path trims at a word boundary near 160 characters, which leaves the fragment `We are …`.
- Other samples show `… pilot operator. …` and `Series B vendor portal company. …`, a period followed by an ellipsis.

## Rules for the builder (unchanged)

- Work only in `/workspace/speedrun-pe`. Do not touch `/workspace/garamjigi` or `/workspace/kumgang`.
- Do not edit `speedrun_pe_loop.py`, `LOOP_LOG.md`, `GOAL.md`, `RESEARCH.md`, `APPLICATION_DRAFT.md`, `STATE/ALL_DONE`, `STATE/CHECKLIST.md`, `STATE/TEST_COMMANDS` or this file.
- Do not run git commit, tag or push. The driver owns those.
- Never submit any form, never sign in to speedrun-talent-network.com, never contact anyone.
- Every regression fixture must be fictional. Do not commit text copied from real API postings.
- Claim a result only after you run the command and read its output.
- Leave no temp files (`/tmp/wyt*`, scratch scripts, calibration dumps, stray `test-results/` artifacts beyond what `.gitignore` covers). `git status --short --untracked-files=all` must show only intended files.

## Ordered work package

### Step 1 — Re-check the live iteration 5 deploy (≈5 min)

```sh
gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest --jq '{status,commit}'
curl -sS -o /dev/null -w '%{http_code}\n' https://madanchaollapark.github.io/speedrun-worth-your-time/
npm run test:live -- --retries=0
```

Acceptance: status is `built` at commit `9b46781…`, HTTP is 200, and the live suite passes 4 of 4 with retries off. Record all three outputs in BUILD_REPORT. If the live suite fails, diagnose it and fix the test or app before Step 2, then report the cause.

### Step 2 — Hours row uses the strongest schedule phrase (≈15 min)

File: `docs/js/brief.js`, `inspect`.

- Split the hours wording into two tiers. Strong: `nights and weekends`, `weekends expected/required`, `long hours`, `50+ … 80+ hours`, `six days` / `6-day`, `crunch`, `always on`. Soft: `rockstar`, `fast-paced`, `hustle`, `grind`, `work hard`, `breakneck speed`. Keep the same negation guard (`negated` within 28 characters before the match) for both tiers.
- The Hours row stays `risk` when either tier matches, as today. Choose the line and anchor from the strong tier first. Use the soft tier only when no line has a strong match. The anchor passed to `item` must be the pattern of the tier that chose the line, so the excerpt centers on that phrase.
- Keep the reason text, status logic and score unchanged. The point is better evidence, not a new rule.

Acceptance (add unit tests that assert these on the shipped Moonbutton sample):
- Hours evidence contains `nights and weekends`.
- Hours evidence differs from Equity evidence, and Equity evidence still contains `equity-heavy`.
- Scope evidence starts with `You'll wear many hats.` and does not contain `nights and weekends`. If the Step 3 sentence rule alone does not get there, the shared-line clause logic must cut the Scope row before the Hours anchor.
- Moonbutton score and band stay `26 · Proceed with caution`. No other sample's score or band changes. Show a before/after table in BUILD_REPORT for all four samples.
- New fictional unit test: a posting that has only `We move fast and want a rockstar.` still yields Hours `risk` with an excerpt containing `rockstar`.

### Step 3 — Long excerpts end at a sentence (≈15 min)

File: `docs/js/brief.js`, `evidenceFor`, the long-clause path (the code after `if (excerpt.length <= limit) return excerpt;`).

- When the excerpt must be trimmed to 160 characters, first look for the last sentence end (`.`, `!` or `?` followed by whitespace or the end of the line) that falls after `matchEnd` and keeps the excerpt within the limit. If one exists, end the excerpt there. Otherwise keep today's word-boundary trim with ` …`.
- Apply the same preference to the start: if a sentence start lies between `minStart` and the anchor, begin there, so the excerpt does not open mid-sentence when a clean start fits.
- Keep the rule that each excerpt, with the `… ` and ` …` markers removed, is a verbatim substring of the posting line. The existing verbatim-substring test must still pass.

Acceptance:
- Moonbutton Scope evidence does not end with `We are …` and does not end with any word fragment followed by ` …` when a sentence end was available within the limit.
- New fictional unit test: a single 220-character line made of three sentences, with the anchor in the first sentence, yields evidence that ends with that line's first or second sentence's final period, and has no trailing ` …`.
- New fictional unit test: a single 200-character sentence with no internal period still trims at a word boundary and ends with ` …`.

### Step 4 — No period followed by an ellipsis (≈5 min)

In `evidenceFor`'s `formatExcerpt` and in the Step 3 path: when the excerpt ends with `.`, `!` or `?`, do not append ` …`. Keep the leading `… ` whenever text before the excerpt is omitted.

Acceptance:
- No shipped sample has evidence matching `/[.!?] …$/`. Add one unit test that loops over every sample in `docs/js/samples.js` and every checklist row and asserts this.
- Founding Team evidence reads `… work with our product designer and the dispatch team at a pilot operator.` Paste Funding evidence reads `We are a Series B vendor portal company.` Update any existing unit test that asserted the old trailing ` …`, and name it in BUILD_REPORT.

### Step 5 — Bounded live calibration on public postings (≈15 min, report-first)

Use only the public no-auth API. The orchestrator confirmed at 09:58 KST that `GET https://speedrun-talent-network.com/api/v1/jobs?limit=3` returns 50 jobs (the `limit` parameter is ignored) and that list items have no `description_text`. Fetch the list once, take the first 20 ids, and fetch each detail with `GET /api/v1/jobs/{id}`. Wait at least 0.5 s between requests. Do not use any other endpoint and do not open the site in a browser for this step.

Run a scratch script from outside the repo (for example `/tmp/wyt-calibrate.mjs`, importing `docs/js/brief.js` by absolute path) that calls `normalizeFromApi(detail.job)` and `analyze(...)` for each job. Delete the script and any dump when done.

Report in BUILD_REPORT, without quoting any posting text longer than 12 words:
- The band count (how many of the 20 are Worth a conversation, Proceed with caution, Not enough to judge) and the min, median and max score.
- For each of the 13 checklist rows, the count of signal, risk and unknown.
- A spot-check of 5 jobs (identify each by its 8-hex short id and title only). For each, read the description and list any row whose status is clearly wrong (a false signal, a false risk, or a missed explicit statement).

Fixes: fix at most two clear misfires, and only if each fix is small (roughly 10 lines or fewer in `brief.js`). Each fix needs a fictional unit regression that fails before the fix and passes after it. List every other finding under "Deferred" with the reason. If a fix changes a shipped sample's score or band, show it in the Step 2 table and explain it.

### Step 6 — Full test run, docs, report (≈10 min)

Run these from `/workspace/speedrun-pe`:

```sh
CI=1 npm run test:unit
CI=1 npx playwright test
grep -rnE 'innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function' docs/js || echo 'no unsafe sinks'
grep -c 'Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert' GOAL.md STATE/PLAN.md
git diff --name-only -- GOAL.md RESEARCH.md APPLICATION_DRAFT.md speedrun_pe_loop.py STATE/ALL_DONE STATE/TEST_COMMANDS
git diff --check -- docs tests PRODUCT.md CHANGELOG.md README.md
ls /tmp/wyt* 2>/dev/null || echo 'no temp files'
git status --short --untracked-files=all
```

Acceptance:
- Unit tests: 0 fail and 0 skipped, with at least 44 plus the new tests (expect ≥ 50).
- Playwright: at least 19 passed, 0 failed, 0 skipped, including the axe scans. The screenshots in `tests/screenshots/` are regenerated. Open `a-sample-brief.png` and `b-paste-brief.png` and quote the Team row (screenshot a) and the Funding row (screenshot b) in BUILD_REPORT. There is no Moonbutton screenshot, so quote its Equity, Hours and Scope rows from a `node` dump.
- The checks print `no unsafe sinks` and `no temp files`. The role line count is 1 in GOAL.md and at least 1 in STATE/PLAN.md. The `git diff --name-only` and `git diff --check` commands print nothing.
- CHANGELOG.md gets an "Iteration 6 · 2026-11-23" entry that lists only verified changes. Update PRODUCT.md only if it describes excerpt or hours behavior that changed. Update the README only if a documented behavior or command changed.
- Write `STATE/BUILD_REPORT.md` covering: the steps done; each command with its exit code and key output line; the sample before/after table; the quoted excerpts; the calibration summary and spot-check; the files changed; and anything deferred, with the reason.

## Out of scope this round

- New UI features, pages or dependencies.
- Changes to APPLICATION_DRAFT.md.
- CI workflows. `.github/` stays absent because the token lacks `workflow` scope.
- Band threshold or weight retuning.
- Committing any real posting text, ids lists or calibration dumps.
