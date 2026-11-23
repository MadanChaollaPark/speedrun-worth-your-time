# Build report · Iteration 4 · 2026-11-23 KST

All six plan steps completed. The local driver suites passed 36 unit tests and 19 browser tests. The public iteration 3 deployment passed all four live browser tests with retries disabled.

## What changed

- Checklist evidence favors unused supporting lines. When criteria share a line, excerpts keep their own anchor, trim at word boundaries, and show ellipses for omitted text. Funding favors a dedicated line when available and retains the short-runway evidence when reporting that risk.
- Equity evidence excludes extracted responsibilities and prioritizes compensation wording. A posting with only an equity-related duty keeps the usual equity question.
- An API listing and its description can show different employment types in **Where and how**, with each source labeled. The disagreement adds an interview question. The unit test compares the assessment ledger and score with the same description under matching metadata.
- Explicit pay nondisclosure such as “no range,” “range not shared,” “salary TBD,” and “to be discussed” is a risk. Bare “competitive salary” stays unknown and still prompts the candidate to ask for the range.
- Added 11 fictional regression tests. Updated the product write-up and changelog.

## Screenshot inspection

Opened `tests/screenshots/a-sample-brief.png` after the final browser run. The 89/100 founding sample shows these three distinct excerpts.

- **Funding and runway** quotes “We are a 6-person team at seed stage with 19 months of runway at current burn.”
- **Team and collaborators** quotes the line about working with the product designer and the dispatch team at a pilot operator.
- **Customers and traction** quotes “Three paying customers use our product on their daily routes.”

## Commands and outcomes

Commands ran from `/workspace/speedrun-pe`.

| Command | Exit | Observed outcome |
| --- | ---: | --- |
| `gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest --jq '{status,commit}'` | 0 | `{"commit":"8c6467454d08b653ea4666b465a2f702a982c89d","status":"built"}` |
| `curl -sS -o /dev/null -w '%{http_code}\n' https://madanchaollapark.github.io/speedrun-worth-your-time/` | 0 | `200` without authentication |
| `npm run test:live -- --retries=0` | 0 | 4 passed, 0 failed, 0 skipped in 2.6 s |
| `npm run test:unit` | 1 | Before the implementation, 27 passed, 6 failed, 0 skipped. The failures reproduced shared snippets, duty equity, the missing employment question, and pay nondisclosure. |
| `CI=1 npm run test:unit` | 0 / 1 / 0 | First implementation run had 33 pass. A follow-up edit had 35 pass and 1 fail because responsibility extraction swallowed a genuine contract statement. Fixed that and reran for **36 pass, 0 fail, 0 skipped**. |
| `CI=1 npx playwright test` | 0 / 0 | 19 passed on both runs, 0 failed, 0 skipped. The final run took 7.1 s and generated the local screenshots. |
| Sink check below | 0 | `no unsafe sinks` |
| `grep -c 'Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert' GOAL.md STATE/PLAN.md` | 0 | `GOAL.md:1` and `STATE/PLAN.md:2` |
| `git diff --name-only -- GOAL.md RESEARCH.md APPLICATION_DRAFT.md speedrun_pe_loop.py STATE/ALL_DONE` | 0 | Empty output |
| `cmp STATE/TEST_COMMANDS <(printf '%s\n' 'npm run test:unit' 'npx playwright test')` | 0 | Identical. The two driver commands are also in the README. |
| `git diff --check` | 2 | Reported a pre-existing trailing space on line 46 of driver-owned `LOOP_LOG.md`. |
| `git diff --check -- CHANGELOG.md PRODUCT.md docs/js/brief.js tests/unit/brief.test.js` | 0 | Empty output |
| `git diff --name-only -- tests/screenshots` | 0 | Five PNGs changed, listed below. |
| `ss -ltn '( sport = :4173 )'` | 0 | No listener after Playwright finished. |
| `rg --files --hidden --no-ignore test-results` | 0 | Only the ignored `test-results/.last-run.json`. |
| `git status --short --untracked-files=all` | 0 | Only intended builder files and the pre-existing driver/orchestrator changes listed below. No untracked entries. |

```sh
grep -rnE 'innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function' docs/js || echo 'no unsafe sinks'
```

A direct Node module run also printed the expected sample excerpts. An optional image-dimension probe using `python -c 'from PIL import Image; print(Image.open("tests/screenshots/a-sample-brief.png").size)'` returned exit 127 because the `python` executable is absent. The screenshot opened directly for visual review.

## Files changed

- `docs/js/brief.js`, `tests/unit/brief.test.js`
- `PRODUCT.md`, `CHANGELOG.md`, `STATE/BUILD_REPORT.md`
- `tests/screenshots/a-sample-brief.png`, `tests/screenshots/b-paste-brief.png`, `tests/screenshots/d-api-brief.png`
- `tests/screenshots/live-a-sample-brief.png`, `tests/screenshots/live-b-paste-brief.png`

The first status check already showed changes to `LOOP_LOG.md`, `STATE/CHECKLIST.md`, `STATE/ITER`, `STATE/PHASE`, and `STATE/PLAN.md`.

## Live URL and handoff

[Worth Your Time on GitHub Pages](https://madanchaollapark.github.io/speedrun-worth-your-time/) serves the verified iteration 3 build. The iteration 4 changes are ready for the driver’s commit, tag, and push. The 25-posting API calibration was outside this round’s scope. No external form was submitted.
