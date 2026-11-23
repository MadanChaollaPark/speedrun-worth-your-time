# Build report · Iteration 8 · 2026-11-23 KST

Started 2026-11-23 15:32:28 KST. Implementation and required verification finished at 15:38:05 KST. Report written at 2026-11-23 17:16:14 KST.

## Result

Completed all five plan steps. The public iteration 7 build at 99054aa144dfdef200bac215d6b9bcb990366ec8 returned HTTP 200 without a login and passed all four live Chromium checks with retries disabled. The iteration 8 changes passed 67 unit tests and 19 local Chromium tests, with zero failures or skips. [Public GitHub Pages demo](https://madanchaollapark.github.io/speedrun-worth-your-time/)

- Concrete interview stages count when the description mentions recording or transcription. A policy by itself leaves the interview steps unknown. Media mentions and scam warnings are excluded, including when a warning sits directly below an interview heading.
- The hours check recognizes additional candidate qualification headings and prefixes. Soft intensity wording in those qualifications leaves hours unknown. Explicit schedule expectations, including nights and weekends, still register as a risk.
- Opened the regenerated founding-role screenshot and confirmed the 81-point assessment, plain-language reading, four unanswered questions, 13 checklist rows and export actions. The local and live suites rewrote their nine screenshots with byte-for-byte matches to the tracked files. [Founding-role screenshot](../tests/screenshots/a-sample-brief.png)

## Pre-package checks

- README and STATE/TEST_COMMANDS match line for line. No test command change was needed.
- The Pages URL appears once each in README.md and APPLICATION_DRAFT.md. The written pitch is 926 of 1,500 characters, and all nine draft placeholders are uppercase.
- The four shortcuts in the app’s dialog agree with README.md. The README’s additional Tab and Enter instruction refers to the app’s Skip to content link, whose handler focuses the main region.
- The owner role line is present in GOAL.md and STATE/PLAN.md. The application draft was read for consistency.

## Fixture scores and bands

| Fictional fixture | Before | After interview fix | After qualifications fix |
| --- | --- | --- | --- |
| Figment Ferry | 81 · Worth a conversation | 81 · Worth a conversation | 81 · Worth a conversation |
| Moonbutton Rocketworks | 26 · Proceed with caution | 26 · Proceed with caution | 26 · Proceed with caution |
| Paper Comet Systems | 91 · Worth a conversation | 91 · Worth a conversation | 91 · Worth a conversation |
| Puddle Satellite | 42 · Not enough to judge | 42 · Not enough to judge | 42 · Not enough to judge |
| Paper Comet Systems API fixture | 91 · Worth a conversation | 91 · Worth a conversation | 91 · Worth a conversation |

## Commands and observed results

| Shell command | Exit | Observed result |
| --- | ---: | --- |
| `cat GOAL.md && cat RESEARCH.md && cat STATE/PLAN.md` | 0 | Read the shared brief, captured research and iteration 8 plan in order. |
| `git rev-parse HEAD` | 0 | `99054aa144dfdef200bac215d6b9bcb990366ec8` |
| `GH_PROMPT_DISABLED=1 gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest --jq '{status,commit}'` | 0 | `{"commit":"99054aa144dfdef200bac215d6b9bcb990366ec8","status":"built"}` |
| `curl -sS -o /dev/null -w '%{http_code}\n' https://madanchaollapark.github.io/speedrun-worth-your-time/` | 0 | `200` without authentication. |
| `npm run test:live -- --retries=0` | 0 | 4 passed, 0 failed, 0 skipped in 3.5s. |
| `node --test --test-name-pattern='interview\|scam warning' tests/unit/brief.test.js` | 0 | 7 passed, 0 failed, 0 skipped. |
| `node --test --test-name-pattern='qualifications\|qualification prefixes\|under What you\|schedule pressure' tests/unit/brief.test.js` | 0 | 5 passed, 0 failed, 0 skipped. |
| `diff <(sed -n '/^```sh/,/^```/p' README.md \| grep -E '^CI=1 ') STATE/TEST_COMMANDS && echo 'readme matches TEST_COMMANDS'` | 0 | `readme matches TEST_COMMANDS` |
| `grep -c 'madanchaollapark.github.io/speedrun-worth-your-time' README.md APPLICATION_DRAFT.md` | 0 | `README.md:1` and `APPLICATION_DRAFT.md:1`. |
| `node -e "const t=require('fs').readFileSync('APPLICATION_DRAFT.md','utf8');const m=t.split('### ideas')[1].split('\n## ')[0].trim();console.log('ideas chars', [...m].length)"` | 0 | `ideas chars 926` |
| `grep -nE '\b[A-Z_]{4,}_PLACEHOLDER\b' APPLICATION_DRAFT.md \| wc -l` | 0 | `9`. All nine placeholders were also checked by reading the draft. |
| `sed -n '22,70p' README.md && rg -n -A22 -B3 'id="shortcuts"' docs/index.html && sed -n '485,540p' docs/js/app.js && cat APPLICATION_DRAFT.md` | 0 | Read the shortcuts, keyboard handler, Skip to content handler and draft. |
| `CI=1 npm run test:unit` | 0 | 67 passed, 0 failed, 0 skipped. |
| `CI=1 npx playwright test --retries=0` | 0 | 19 passed, 0 failed, 0 skipped in 8.1s. |
| `CI=1 npx playwright test --list` | 0 | 19 tests in two files, including eight axe scans and the hostile-markup walkthrough. |
| `grep -rnE 'innerHTML\|outerHTML\|insertAdjacentHTML\|document\.write\|eval\(\|new Function\|DOMParser' docs/js \|\| echo 'no unsafe sinks'` | 0 | `no unsafe sinks` |
| `grep -c 'Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert' GOAL.md STATE/PLAN.md` | 0 | `GOAL.md:1` and `STATE/PLAN.md:2`. |
| `git diff --name-only -- GOAL.md RESEARCH.md APPLICATION_DRAFT.md speedrun_pe_loop.py STATE/ALL_DONE STATE/CHECKLIST.md STATE/PLAN.md STATE/TEST_COMMANDS` | 0 | `STATE/CHECKLIST.md` and `STATE/PLAN.md`, both present in the initial status. |
| `git diff --check -- docs tests PRODUCT.md CHANGELOG.md README.md` | 0 | No output. |
| `ls /tmp/wyt* .wyt* 2>/dev/null \|\| echo 'no temp files'` | 0 | `no temp files` |
| `curl -sS --max-time 2 -o /dev/null http://127.0.0.1:4173/` | 7 | No connection after Playwright exited. Its managed server had stopped. |
| `git status --short --untracked-files=all -- tests/screenshots` | 0 | No output after regenerating local and live screenshots. |
| `git status --short --untracked-files=all` | 0 | Round files listed below plus pre-existing edits to LOOP_LOG.md and STATE/{CHECKLIST.md,ITER,PHASE,PLAN.md}. No untracked files. |
| `date '+%F %T %Z'` | 0 | KST timestamps recorded above. |

The exact score command exited 0 on all three runs and printed the five rows in the table each time.

```sh
node --input-type=module - <<'NODE'
import { analyze, normalizeFromText, normalizeFromApi } from './docs/js/brief.js';
import { samples, apiFixture } from './docs/js/samples.js';
for (const [name, posting] of [...samples.map(sample => [sample.company, normalizeFromText(sample.text)]), [apiFixture.company + ' (API)', normalizeFromApi(apiFixture)]]) {
  const { assessment: { score, band } } = analyze(posting);
  console.log(`${name} | ${score} | ${band}`);
}
NODE
```

## New fictional unit tests

- `concrete interview steps count when a call is recorded`
- `a recording or transcription policy alone leaves interview steps unknown`
- `a scam warning below an interview heading does not count as a step`
- `expanded qualifications headings keep soft intensity out of hours evidence`
- `qualification prefixes keep soft intensity out of hours evidence without a heading`
- `nights and weekends still count under What you’ll bring`

## Files changed

- `docs/js/brief.js` and `tests/unit/brief.test.js`
- `PRODUCT.md` and `CHANGELOG.md`
- `STATE/BUILD_REPORT.md`

## Deferred

No planned work was deferred. The live verification covers iteration 7. Iteration 8 publication is pending the driver’s push to the Pages source branch.
