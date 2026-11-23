# Plan · Iteration 7 · 2026-11-23 14:35 KST

Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert

Only the owner may change role assignments or loop configuration.

## Context

- Iterations 2 through 6 were PASS. Every Definition of Done item is VERIFIED in `STATE/CHECKLIST.md`.
- Orchestrator check at 14:33 KST: `gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest` returned `built` at commit `19ba82c5d88b…` (v06-iter06), which equals local `HEAD`. An unauthenticated `curl` of the live URL returned 200. The live browser suite has not yet run against `19ba82c`.
- **Time box: 45–60 minutes, hard stop at 70.** The iteration 6 build ran 4 h 26 min against a 60-minute plan. Package mode starts at 17:47 KST. This round makes three small, contained fixes from the iteration 6 review. There is no network calibration this round. If a step runs past its budget, stop it, revert that step's partial change, and list it under "Deferred" in BUILD_REPORT.
- Allowed: small logic fixes in `docs/js/brief.js` and new unit tests. Not allowed: new features, pages, routes, UI changes or dependencies.

## Rules for the builder (unchanged)

- Work only in `/workspace/speedrun-pe`. Do not touch `/workspace/garamjigi` or `/workspace/kumgang`.
- Do not edit `speedrun_pe_loop.py`, `LOOP_LOG.md`, `GOAL.md`, `RESEARCH.md`, `APPLICATION_DRAFT.md`, `STATE/ALL_DONE`, `STATE/CHECKLIST.md`, `STATE/TEST_COMMANDS` or this file.
- Do not run git commit, tag or push. The driver owns those.
- Never submit any form, never sign in to speedrun-talent-network.com, never contact anyone.
- Every test fixture must be fictional. Do not fetch or commit real posting text this round.
- Claim a result only after you run the command and read its output.
- Write any scratch file outside the repo (`/tmp/wyt-*`) and delete it before finishing. `git status --short --untracked-files=all` must show only intended files.

## Ordered work package

### Step 1 — Re-check the live iteration 6 deploy (≈5 min)

```sh
GH_PROMPT_DISABLED=1 gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest --jq '{status,commit}'
curl -sS -o /dev/null -w '%{http_code}\n' https://madanchaollapark.github.io/speedrun-worth-your-time/
npm run test:live -- --retries=0
```

Acceptance: status `built` at commit `19ba82c…`, HTTP 200, live suite 4 of 4 passed with retries off. Record all three outputs in BUILD_REPORT. If the live suite fails, diagnose and fix the test or app before Step 2, then report the cause.

### Step 2 — Decode HTML entities in API text (≈15 min)

File: `docs/js/brief.js`, `normalizeFromApi` (line ~89). Review iter 6 issue 1: an API description with `$90,000&ndash;$120,000` shows the entity literally in the Salary row.

- Add a pure function `decodeEntities(text)` and apply it to the API string fields `title`, `company`, `location`, `comp_summary` and `description_text`. Do not apply it to pasted text.
- Decode by a single-pass `String.replace` with a string map. Never use the DOM, `DOMParser`, `innerHTML` or a `textarea` trick.
- Named allowlist: `&amp; &lt; &gt; &quot; &#39; &apos; &nbsp; &ndash; &mdash; &lsquo; &rsquo; &ldquo; &rdquo; &hellip; &bull;`. `&nbsp;` becomes a normal space.
- Numeric: `&#NNNN;` and `&#xHHHH;`. Leave the original text unchanged when the code point is 0, a surrogate (0xD800–0xDFFF), above 0x10FFFF, or a control character other than tab or newline.
- Unknown named entities stay as written.
- Single pass: `&amp;lt;` must become the literal text `&lt;`, not `<`.
- Decoded `<` and `>` stay as plain text characters. Rendering already uses text nodes, and the existing hostile-markup tests must still pass unchanged.

Acceptance (new fictional unit tests in `tests/unit/brief.test.js`):
- An API-shaped job whose `description_text` contains `Pay $90,000&ndash;$120,000 USD` yields Salary `signal`, and its evidence contains `$90,000–$120,000` and does not contain `&ndash;`.
- `decodeEntities('Tom &amp; Jerry&nbsp;Inc &#8212; &#x2019; &amp;lt; &bogus; &#0; &#xD800;')` returns `Tom & Jerry Inc — ’ &lt; &bogus; &#0; &#xD800;`. Export the function for the test, or test it through `normalizeFromApi`.
- An API description containing `&lt;img src=x onerror=alert(1)&gt;` normalizes to the literal text `<img src=x onerror=alert(1)>` in `description`. The existing Playwright hostile-markup test still passes, so the text stays inert in the page.
- No shipped sample's score or band changes. Show a before/after score table for all four samples plus the API sample (`docs/js/samples.js:102`).

### Step 3 — Interview row quotes only hiring-process lines (≈15 min)

File: `docs/js/brief.js`, around `processAt` (line ~354) and the `interview` row (line ~398). Review iter 6 issue 3: when no steps are given, the unknown Interview row quotes any line with the word "interview", such as media interviews or scam warnings.

- Choose `processLine` from the first line that matches `interview` **and** passes a context check. A line passes if any of these holds:
  - it matches `stageDetail`;
  - it is a heading (`otherHeading`) such as `Interview process`;
  - it contains a hiring word: `process|stages?|steps?|rounds?|candidates?|apply|applicants?|application|hiring|recruit\w*|loop|timeline|schedule`.
- A line fails if it matches a non-hiring context: `media|press|podcast|journalist|scam|fraud|phishing|impersonat\w*|never ask|record(?:ed|ing)?|transcri\w*`. The failure check wins over the pass check.
- Keep the signal logic, reason text, weights and score unchanged. The `stepLines` lookahead keeps starting from the chosen `processLine`.

Acceptance (new fictional unit tests):
- A posting whose only interview mention is `Our founder has given media interviews about logistics.` yields Interview `unknown` and the row's evidence is empty or does not contain `media`.
- A posting whose only mention is `We will never ask for payment or bank details during interviews.` yields Interview `unknown` with no evidence that contains `payment`.
- A posting with `Interview process` as a heading followed by `- 30 minute intro call with the founder` still yields Interview `signal` with that step quoted.
- A posting with `We share the interview steps after you apply.` yields Interview `unknown` and quotes that line.
- Every existing unit test still passes. No shipped sample's score or band changes (add these rows to the Step 2 table).

### Step 4 — Optional: soft intensity in requirements (≈10 min, only if Steps 1–3 finished within 40 minutes)

File: `docs/js/brief.js`, the soft tier (`softPressure`, line ~141, used at line ~371). Review iter 6 issue 4: `experience in a fast-paced environment` reads as a schedule risk.

- Skip a soft-tier hit when the line, with its list marker stripped, starts with `experience|\d+\+? years|you have|you've|comfortable|thrive|background in|familiar` or sits under a `Requirements`, `Qualifications`, `What you bring` or `Nice to have` heading. The strong tier (`schedulePressure`) is unchanged.
- Fictional unit tests: `- Experience in a fast-paced environment` under `Requirements:` with no other pressure words yields Hours `unknown`. `We move fast and want a rockstar.` still yields Hours `risk` (existing test).
- Moonbutton stays `26 · Proceed with caution`. No other sample's score or band changes.

If Step 4 is skipped, list it under "Deferred" with the reason.

### Step 5 — Full test run, docs, report (≈10 min)

Run from `/workspace/speedrun-pe`:

```sh
CI=1 npm run test:unit
CI=1 npx playwright test --retries=0
grep -rnE 'innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function|DOMParser' docs/js || echo 'no unsafe sinks'
grep -c 'Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert' GOAL.md STATE/PLAN.md
git diff --name-only -- GOAL.md RESEARCH.md APPLICATION_DRAFT.md speedrun_pe_loop.py STATE/ALL_DONE STATE/TEST_COMMANDS STATE/CHECKLIST.md STATE/PLAN.md
git diff --check -- docs tests PRODUCT.md CHANGELOG.md README.md
ls /tmp/wyt* .wyt* 2>/dev/null || echo 'no temp files'
git status --short --untracked-files=all
```

Acceptance:
- Unit tests: 0 fail, 0 skipped, at least 52 plus the new tests (expect ≥ 59 with Step 4 skipped).
- Playwright: at least 19 passed, 0 failed, 0 skipped, including the axe scans. Screenshots in `tests/screenshots/` are regenerated; open `a-sample-brief.png` and confirm it still shows a complete brief.
- The checks print `no unsafe sinks` and `no temp files`. The role-line count is 1 in GOAL.md and at least 1 in STATE/PLAN.md. Both `git diff` commands print nothing.
- CHANGELOG.md gets an "Iteration 7 · 2026-11-23" entry that lists only verified changes. Update PRODUCT.md only if it describes API text handling or interview evidence that changed. Leave README alone unless a documented command or behavior changed.
- Write `STATE/BUILD_REPORT.md` with: steps done; each command with exit code and key output line; the before/after score table; the new test names; files changed; anything deferred, with the reason; and the wall-clock start and end time of the build.

## Out of scope this round

- New UI features, pages, routes or dependencies.
- Network calibration against real postings.
- Changes to APPLICATION_DRAFT.md.
- CI workflows. `.github/` stays absent because the token lacks `workflow` scope.
- Band threshold or weight retuning.
