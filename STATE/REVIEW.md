# Review · Iteration 6 · 2026-11-23 KST

Reviewer: Kiro Claude Opus 5.5. Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert

## Verdict: PASS

Every Definition of Done item is verified this round. The reviewer ran both required suites and the live suite, and all passed with nothing skipped. The public link opens without a login. Pages still serves the iteration 5 commit `9b46781`, and the live suite passed against it. The iteration 6 tree goes live when the driver pushes after this review.

## Commands run by the reviewer (from `/workspace/speedrun-pe`, 2026-11-23 ~14:30 KST)

| Command | Exit | Result |
| --- | ---: | --- |
| `CI=1 npm run test:unit` | 0 | 52 tests, 52 pass, 0 fail, 0 skipped |
| `CI=1 npx playwright test --retries=0` | 0 | 19 passed (6.6 s), includes the axe scans |
| `curl -sS -o /dev/null -w '%{http_code}' -L https://madanchaollapark.github.io/speedrun-worth-your-time/` | 0 | `200`, no redirect, no auth |
| `GH_PROMPT_DISABLED=1 gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest --jq '{status,commit,updated_at}'` | 0 | `built`, commit `9b46781cf3f5aa871df9a914ef04489b722f3773`, updated 00:57:10Z. This matches local `HEAD`. |
| `npm run test:live -- --retries=0` | 0 | 4 passed (2.7 s) against the live iteration 5 deploy |
| unsafe-sink grep (PLAN Step 6) | 0 | `no unsafe sinks` |
| role-line `grep -c` | 0 | `GOAL.md:1`, `STATE/PLAN.md:2` |
| `git diff --name-only -- GOAL.md RESEARCH.md APPLICATION_DRAFT.md speedrun_pe_loop.py STATE/TEST_COMMANDS` | 0 | empty |
| `git diff --check -- docs tests PRODUCT.md CHANGELOG.md README.md STATE/BUILD_REPORT.md` | 0 | empty |
| `ls .wyt* /tmp/wyt*` and `git status --short --untracked-files=all` | 0 | no temp files; only modified tracked files, no untracked files |
| secret-pattern grep over the repo | 0 | matches only regex text inside gitignored builder logs; no secrets |
| ad hoc `node` probe of Moonbutton rows and of an API posting with `&ndash;` and `<img onerror>` | 0 | see the findings below |

The driver's fresh logs agree: `STATE/logs/iter06_tests_1.txt` (EXIT=0, 0 skipped) and `STATE/logs/iter06_tests_2.txt` (19 passed, EXIT=0). The driver ran these; the reviewer reproduced both.

## Plan steps against the claims in BUILD_REPORT

- **Step 1, live re-check:** holds. The reviewer reproduced `built` at `9b46781`, HTTP 200, and 4/4 live tests with retries off.
- **Step 2, hours tiers:** holds. `docs/js/brief.js` splits `schedulePressure` and `softPressure`. Hours uses the strong tier first, and the anchor matches the tier that chose the line. Reviewer dump of Moonbutton: Hours `… expect nights and weekends when it takes them to make a launch happen.`, Equity `… This is an equity-heavy opportunity for a rockstar who wants to get in on the ground floor.`, Scope `You'll wear many hats.` The Moonbutton score stays at 26. Unit tests `Moonbutton quotes the schedule separately…` and `soft intensity wording still earns a risk…` cover this.
- **Step 3, sentence-bounded excerpts:** holds. Both new fictional tests (three-sentence line, single long sentence) pass, and the verbatim-substring test still passes.
- **Step 4, no `. …`:** holds. A unit test loops over every sample and every row. The reviewer viewed `tests/screenshots/a-sample-brief.png` (Team: `… work with our product designer and the dispatch team at a pilot operator.`) and `b-paste-brief.png` (Funding: `We are a Series B vendor portal company.`). Both match the report.
- **Step 5, calibration:** the reported counts were not independently re-fetched by the reviewer. They are plausible and internally consistent (each row sums to 20). Both fixes are small, and each has a fictional regression that passes. No real posting text is in the diff or in the working tree.
- **Step 6, docs:** holds. CHANGELOG has an Iteration 6 entry, and PRODUCT.md describes the new excerpt and hours behavior. README did not need changes.

## Definition of Done grades

| # | Item | Grade | Evidence |
| --- | --- | --- | --- |
| 1 | Research captured | PASS | `RESEARCH.md` is unchanged this round (`git diff` empty). It still covers the live page, the products, the `#step-3` board and the step 2 and 3 fields, with sources. |
| 2 | Working product | PASS | Playwright 19/19 covers sample, paste, API mock and fallback, the founder template, keyboard flows and the shortcuts dialog. The screenshots show a complete brief with actions (copy Markdown, download, print, share link). Moonbutton (first-hire) and Figment Ferry (founding) are early-hire samples. |
| 3 | Tests | PASS | 52/52 unit, 19/19 Playwright, 0 skipped, reproduced by the reviewer. Screenshots a, b and c were regenerated. `STATE/TEST_COMMANDS` has two lines and is unchanged; the README documents them. |
| 4 | Live public link | PASS | HTTP 200 without auth; Pages `built` at `9b46781`; live suite 4/4. The URL is in `README.md:5` and `APPLICATION_DRAFT.md:5`. |
| 5 | Quality and original design | PASS | The design is original (see screenshots); it is not a framework default and not the talent-network look. `no unsafe sinks`. Hostile markup in an API description stays inert text (reviewer probe; Playwright hostile-markup test). No secrets. See issue 1 for a cosmetic entity leak. |
| 6 | Application draft only | PASS | The `ideas` text is 926 characters (≤1500) and is followed by the demo link. Unknowns are ALL-CAPS placeholders. The file is marked "DRAFT — not submitted" and is unchanged this round. |
| 7 | Docs | PASS | README, PRODUCT.md (idea, scoring, what is not in v1) and CHANGELOG are present and current. |

## Issues (non-blocking)

1. **HTML entities from the API show literally in evidence.** `docs/js/brief.js` `normalizeFromApi` does not decode entities. The new pay-range rule accepts `&ndash;`, so an API posting shows `Pay $90,000&ndash;$120,000 USD` in the Salary row (reviewer probe). The text is safe because it renders as text, but it reads badly. Fix: decode a small allowlist of entities (`&ndash; &mdash; &amp; &nbsp; &#NNNN; &#xHHHH;`) in `normalizeFromApi` with a string map, never through the DOM. Then keep the verbatim test on the decoded text.
2. **The calibration dump was written inside the repo.** The plan asked for `/tmp`, but BUILD_REPORT shows `.wyt-calibration-iter6.json` written to the repo root. It was deleted, never tracked, and the reviewer confirmed it is gone. Next time, write it outside the repo or add the pattern to `.gitignore`.
3. **Unknown Interview row quotes unrelated "interview" lines** (media interviews, scam warnings, recording policy; `docs/js/brief.js:354-399`, where `unknown(..., processLine, interview)` passes the line through). The builder found this and deferred it. It is misleading on real postings. A small guard could require a hiring context (`process`, `stage`, `candidate`, `apply`) before quoting.
4. **Soft intensity in a requirement reads as a current schedule risk.** For example, "experience in a fast-paced environment" (deferred in BUILD_REPORT). Consider skipping soft-tier hits on lines under requirements or qualifications.
5. **Iteration 6 is not live yet.** This is expected because the driver pushes after the review. The next round should re-run `npm run test:live -- --retries=0` against the iteration 6 commit.

## Prioritized must-fix list

No Definition of Done blockers. For the next plan, in order:
1. Re-check that the iteration 6 deploy is live and passes the live suite (issue 5).
2. Decode API HTML entities for display (issue 1), with a fictional unit test.
3. Interview unknown-row evidence guard (issue 3), with a fictional unit test.
4. Optional: soft-tier hours in requirements context (issue 4).

Trivial fixes made by the reviewer: none. `STATE/CHECKLIST.md` statuses were updated where this round's evidence supports them.
