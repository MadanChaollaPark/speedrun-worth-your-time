# Build report · Iteration 7 · 2026-11-23 KST

Wall clock · 2026-11-23 14:33:39 KST to 2026-11-23 14:37:30 KST.

## Result

Completed the three planned logic fixes, including the optional hours refinement, and verified the local build. The public iteration 6 Pages build is `19ba82c5d88b4a6530a43090d7d5fbfe825b72f4`. It returned HTTP 200 without a login and passed all four live Chromium checks with retries disabled. Publishing iteration 7 depends on the driver’s push to `main`. [Public GitHub Pages demo](https://madanchaollapark.github.io/speedrun-worth-your-time/)

- API titles, company names, locations, pay summaries and descriptions now decode the allowed HTML entities in one pass. The fictional salary example shows `$90,000–$120,000` as a signal. Unit tests verify literal markup after normalization, preserved entities in pasted text, and valid, unknown and invalid code points. The existing browser hostile-markup test passed.
- Interview quotes begin at the first interview reference that meets the hiring-context rule. Media and payment warnings give no interview quote. A heading can supply the context for a later step, and a line that defers the steps until after applying is quoted as unknown.
- Soft intensity language in qualifications does not count as hours evidence. Explicit schedule pressure still counts under a requirements heading, and soft wording outside qualifications remains eligible.
- Regenerated six local walkthrough screenshots and three live screenshots. I opened the local founding-role PNG and confirmed the score, role reading, follow-up questions, full checklist and export actions are visible. [Sample brief screenshot](../tests/screenshots/a-sample-brief.png)

## Fixture scores and bands

| Fictional fixture | Before | After API decoding | After interview filtering | After hours filtering |
| --- | --- | --- | --- | --- |
| Figment Ferry | 81 · Worth a conversation | 81 · Worth a conversation | 81 · Worth a conversation | 81 · Worth a conversation |
| Moonbutton Rocketworks | 26 · Proceed with caution | 26 · Proceed with caution | 26 · Proceed with caution | 26 · Proceed with caution |
| Paper Comet Systems | 91 · Worth a conversation | 91 · Worth a conversation | 91 · Worth a conversation | 91 · Worth a conversation |
| Puddle Satellite | 42 · Not enough to judge | 42 · Not enough to judge | 42 · Not enough to judge | 42 · Not enough to judge |
| Paper Comet Systems API fixture | 91 · Worth a conversation | 91 · Worth a conversation | 91 · Worth a conversation | 91 · Worth a conversation |

## Commands and observed results

| Shell command | Exit | Observed result |
| --- | ---: | --- |
| `GH_PROMPT_DISABLED=1 gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest --jq '{status,commit}'` | 0 | `{"commit":"19ba82c5d88b4a6530a43090d7d5fbfe825b72f4","status":"built"}` |
| `curl -sS -o /dev/null -w '%{http_code}\n' https://madanchaollapark.github.io/speedrun-worth-your-time/` | 0 | `200` |
| `npm run test:live -- --retries=0` | 0 | 4 passed, 0 failed, 0 skipped in 3.0s. |
| `git rev-parse HEAD` | 0 | `19ba82c5d88b4a6530a43090d7d5fbfe825b72f4` |
| `node --test --test-name-pattern='API salary evidence\|HTML entities decode\|API text fields decode' tests/unit/brief.test.js` | 0 | 3 passed, 0 failed, 0 skipped in the targeted run. |
| `CI=1 npm run test:unit` during step 3 | 1 | 58 passed, 1 failed, 0 skipped. The previous iteration’s test expected the encoded dash verbatim for API input. Updated it to assert the decoded API dash and the verbatim pasted dash. |
| `CI=1 npm run test:unit` final | 0 | 61 passed, 0 failed, 0 skipped. |
| `CI=1 npx playwright test --retries=0` | 0 | 19 passed, 0 failed, 0 skipped in 6.8s. |
| `CI=1 npx playwright test --list` | 0 | 19 tests in two files, including eight axe scans and the existing hostile-markup walkthrough. |
| `curl -sS --max-time 2 -o /dev/null http://127.0.0.1:4173/` | 7 | Connection failed after the local suite ended. Playwright’s managed server had stopped. |
| `grep -rnE 'innerHTML\|outerHTML\|insertAdjacentHTML\|document\.write\|eval\(\|new Function\|DOMParser' docs/js \|\| echo 'no unsafe sinks'` | 0 | `no unsafe sinks` |
| `grep -c 'Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert' GOAL.md STATE/PLAN.md` | 0 | `GOAL.md:1`, `STATE/PLAN.md:2` |
| `git diff --name-only -- GOAL.md RESEARCH.md APPLICATION_DRAFT.md speedrun_pe_loop.py STATE/ALL_DONE STATE/TEST_COMMANDS STATE/CHECKLIST.md STATE/PLAN.md` | 0 | Initially `STATE/CHECKLIST.md` and `STATE/PLAN.md`. Final output added `STATE/TEST_COMMANDS`, updated under the direct round request. |
| `git diff --name-only -- GOAL.md RESEARCH.md APPLICATION_DRAFT.md speedrun_pe_loop.py STATE/ALL_DONE` | 0 | No output. |
| `git diff --check -- docs tests PRODUCT.md CHANGELOG.md README.md` | 0 | No output. |
| `git diff --check -- docs tests PRODUCT.md CHANGELOG.md README.md STATE/TEST_COMMANDS` | 0 | No output. |
| `ls /tmp/wyt* .wyt* 2>/dev/null \|\| echo 'no temp files'` | 0 | `no temp files` |
| `ls -l tests/screenshots` | 0 | Listed six freshly regenerated local PNGs and three live PNGs. |
| `git status --short --untracked-files=all` | 0 | Round changes listed below plus pre-existing edits to `LOOP_LOG.md` and `STATE/{CHECKLIST.md,ITER,PHASE,PLAN.md}`. No untracked files. |

The following exact score command exited 0 on all four runs and produced the five rows above each time.

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

## Unit coverage

New fictional tests

- `API salary evidence decodes an encoded dash`
- `HTML entities decode once and invalid or unknown entities stay literal`
- `API text fields decode entities and preserve decoded markup as text`
- `media interviews leave the interview row unknown without a quote`
- `scam warnings are excluded even when they mention hiring steps`
- `an interview heading quotes the introductory call after an unrelated interview mention`
- `undisclosed hiring steps leave the interview row unknown with a quote`
- `soft intensity in candidate qualifications leaves hours unknown`
- `schedule pressure still counts under requirements and soft wording counts after the section`

Updated regression

- `salary ranges with encoded dashes are recognized in API and pasted text`

## Files changed

- `docs/js/brief.js` and `tests/unit/brief.test.js`
- `CHANGELOG.md`, `PRODUCT.md` and `README.md`
- `STATE/TEST_COMMANDS` and `STATE/BUILD_REPORT.md`
- `tests/screenshots/live-a-sample-brief.png` regenerated from the public iteration 6 build. The other eight regenerated PNGs matched their tracked bytes.

## Deferred

All planned steps were executed. The public check covers iteration 6. The driver handles iteration 7 publication.
