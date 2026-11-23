# Plan · Iteration 8 · 2026-11-23 15:20 KST

Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert

Only the owner may change role assignments or loop configuration.

## Context

- Iterations 2 through 7 were PASS. Every Definition of Done item is VERIFIED in `STATE/CHECKLIST.md`.
- Orchestrator check at 15:20 KST: `gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest` returned `built` at commit `99054aa144df…` (v07-iter07, updated 06:19:39Z), which equals local `HEAD`. An unauthenticated `curl` of the live URL returned 200. The live browser suite has not yet run against `99054aa`.
- **Time box: 40–60 minutes, hard stop at 70.** Package mode starts at 17:47 KST (cutoff 19:02:24 minus 75 minutes). This round makes two small regex fixes from the iteration 7 review plus a pre-package consistency check. If a step runs past its budget, stop, revert that step's partial change, and list it under "Deferred" in BUILD_REPORT.
- Allowed: small logic fixes in `docs/js/brief.js`, new unit tests, doc updates that match verified changes. Not allowed: new features, pages, routes, UI changes or dependencies.

## Rules for the builder

- Work only in `/workspace/speedrun-pe`. Do not touch `/workspace/garamjigi` or `/workspace/kumgang`.
- Do not edit `speedrun_pe_loop.py`, `LOOP_LOG.md`, `GOAL.md`, `RESEARCH.md`, `APPLICATION_DRAFT.md`, `STATE/ALL_DONE`, `STATE/CHECKLIST.md` or this file.
- `STATE/TEST_COMMANDS` (resolves review iter 7 issue 3): you may edit it only if a test command actually changes, and then README.md's test section must list the identical commands. This round no command should change, so expect to leave it alone. If you do change it, say why in BUILD_REPORT.
- Do not run git commit, tag or push. The driver owns those.
- Never submit any form, never sign in to speedrun-talent-network.com, never contact anyone.
- Every test fixture must be fictional. Do not fetch or commit real posting text.
- Claim a result only after you run the command and read its output.
- Write any scratch file outside the repo (`/tmp/wyt-*`) and delete it before finishing. `git status --short --untracked-files=all` must show only intended files.

## Ordered work package

### Step 1 — Live smoke on the iteration 7 deploy (≈5 min)

```sh
GH_PROMPT_DISABLED=1 gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest --jq '{status,commit}'
curl -sS -o /dev/null -w '%{http_code}\n' https://madanchaollapark.github.io/speedrun-worth-your-time/
npm run test:live -- --retries=0
```

Acceptance: status `built` at commit `99054aa…`, HTTP 200, live suite 4 of 4 passed with retries off. Record all three outputs in BUILD_REPORT. If the live suite fails, diagnose and fix before Step 2 and report the cause.

### Step 2 — Concrete interview steps beat the exclusion list (≈15 min)

File: `docs/js/brief.js`, `processAt` (line ~386) and `nonHiringContext` (line ~167). Review iter 7 issue 1: `Interview: take-home, then a recorded 30 minute founder call.` gives Interview `unknown` because `recorded` matches the exclusion list.

- Change the `processAt` predicate so a line that matches `stageDetail` is accepted even when it matches `nonHiringContext`. Keep the exclusion for lines with no `stageDetail` match. Keep `record*` and `transcri*` in the list so a bare recording-policy line (`Interviews may be recorded for note-taking.`) is still not quoted.
- Guard: a scam-warning line must still be excluded even if it contains a stage word. Apply the stage-detail override only when the line does not match `scam|fraud|phishing|impersonat\w*|never ask`. The simplest form is two regexes: a hard exclusion (scam/fraud/phishing/impersonat/never ask/media/press/podcast/journalist) that always wins, and a soft exclusion (`record(?:ed|ing)?|transcri\w*`) that `stageDetail` overrides.
- Keep signal logic, reason text, weights and score unchanged.

Acceptance (new fictional unit tests in `tests/unit/brief.test.js`):
- `Interview: take-home, then a recorded 30 minute founder call.` yields Interview `signal` and the evidence contains `take-home`.
- A posting whose only interview mention is `Interviews may be recorded for note-taking.` still yields Interview `unknown` with no evidence containing `recorded`.
- The existing iteration 7 tests (`media interviews leave the interview row unknown without a quote`, `scam warnings are excluded even when they mention hiring steps`) still pass unchanged.

### Step 3 — Wider qualifications heading and prefix patterns (≈10 min)

File: `docs/js/brief.js`, `requirementsHeading` and `requirementPrefix` (lines ~161-162). Review iter 7 issue 2: `What you'll bring:` is not recognized as a heading, and `Comfort in` is not a requirement prefix.

- `requirementsHeading`: add `what you['’]?ll bring`, `what we['’]?re looking for`, `about you`, `you might be a fit if`, and `who you are`. Keep the optional markdown `#` and optional trailing colon.
- `requirementPrefix`: add `comfort(?:able)? (?:in|with)` (replace the bare `comfortable`, keeping its old matches), `strong`, `proven`, and `ability to`.
- Strong tier (`schedulePressure`) is unchanged: `nights and weekends` under any of these headings still yields Hours `risk`.

Acceptance (new fictional unit tests):
- `What you'll bring:` followed by `- Comfort in a fast-paced startup` and no other pressure words yields Hours `unknown`.
- `About you` followed by `- Ability to thrive in a fast-paced team` yields Hours `unknown`.
- `What you'll bring:` followed by `- Happy to work nights and weekends during launches` yields Hours `risk`.
- Moonbutton stays `26 · Proceed with caution`. No shipped sample's score or band changes.

### Step 4 — Pre-package consistency check (≈10 min, read-only except README/PRODUCT/CHANGELOG)

Run and record each result. Fix only README, PRODUCT.md or CHANGELOG.md if they are inaccurate; report anything wrong in APPLICATION_DRAFT.md without editing it.

```sh
diff <(sed -n '/^```sh/,/^```/p' README.md | grep -E '^CI=1 ') STATE/TEST_COMMANDS && echo 'readme matches TEST_COMMANDS'
grep -c 'madanchaollapark.github.io/speedrun-worth-your-time' README.md APPLICATION_DRAFT.md
node -e "const t=require('fs').readFileSync('APPLICATION_DRAFT.md','utf8');const m=t.split('### ideas')[1].split('\n## ')[0].trim();console.log('ideas chars', [...m].length)"
grep -nE '\b[A-Z_]{4,}_PLACEHOLDER\b' APPLICATION_DRAFT.md | wc -l
```

Acceptance: README test commands match `STATE/TEST_COMMANDS` line for line (if the first command's extraction does not fit README's layout, compare by reading and say so). The live URL appears in both files. The `ideas` text is ≤1500 characters. Placeholders are ALL-CAPS. Also confirm the keyboard shortcuts listed in README match the in-app `?` dialog (read both; list any mismatch and fix README if it is wrong).

### Step 5 — Full test run, docs, report (≈10 min)

```sh
CI=1 npm run test:unit
CI=1 npx playwright test --retries=0
grep -rnE 'innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function|DOMParser' docs/js || echo 'no unsafe sinks'
grep -c 'Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert' GOAL.md STATE/PLAN.md
git diff --name-only -- GOAL.md RESEARCH.md APPLICATION_DRAFT.md speedrun_pe_loop.py STATE/ALL_DONE STATE/CHECKLIST.md STATE/PLAN.md STATE/TEST_COMMANDS
git diff --check -- docs tests PRODUCT.md CHANGELOG.md README.md
ls /tmp/wyt* .wyt* 2>/dev/null || echo 'no temp files'
git status --short --untracked-files=all
```

Acceptance:
- Unit tests: 0 fail, 0 skipped, at least 61 plus the new tests (expect ≥ 66).
- Playwright: at least 19 passed, 0 failed, 0 skipped, including the axe scans. Open `tests/screenshots/a-sample-brief.png` and confirm it still shows a complete brief.
- `no unsafe sinks` and `no temp files` printed. Role-line count is 1 in GOAL.md and at least 1 in STATE/PLAN.md. The `git diff --name-only` command prints nothing except `STATE/CHECKLIST.md`/`STATE/PLAN.md` (orchestrator edits made before your round) and, only if justified, `STATE/TEST_COMMANDS`.
- Score table (same `node --input-type=module` command as iteration 7 BUILD_REPORT) before and after Steps 2 and 3: Figment Ferry 81, Moonbutton 26, Paper Comet 91, Puddle Satellite 42, API fixture 91, bands unchanged.
- CHANGELOG.md gets an "Iteration 8 · 2026-11-23" entry listing only verified changes. Update PRODUCT.md only where it describes interview or hours evidence that changed.
- Write `STATE/BUILD_REPORT.md` with: steps done; each command with exit code and key output; the score table; new test names; files changed; Step 4 findings; anything deferred with the reason; wall-clock start and end time.

## Out of scope this round

- New UI features, pages, routes or dependencies.
- Network calibration against real postings.
- Changes to APPLICATION_DRAFT.md (report issues only).
- CI workflows. `.github/` stays absent because the token lacks `workflow` scope.
- Band threshold or weight retuning.
