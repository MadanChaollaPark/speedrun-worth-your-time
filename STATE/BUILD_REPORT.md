# Build report · Iteration 5 · 2026-11-23 KST

Completed all six plan steps. The local build passed 44 unit tests and 19 Playwright tests, including the axe scans. The public iteration 4 build passed all four live browser tests with retries disabled.

## What changed

- Shared checklist evidence ends at clause boundaries and retains the supporting words when two findings rely on the same clause. The display removes one list marker and keeps the 160-character word-boundary limit and omission ellipses.
- The score starts at 42, derived from the 58 available signal points. The ledger adds to that baseline and clamps to 0–100. An all-signal fictional posting reaches 100 before clamping. The app ledger, its How it works page, the Markdown export, and PRODUCT.md explain the baseline. The thresholds and confidence rules are the same.
- A bare “Contract” heading in an API description no longer creates an employment conflict. The existing six-month contract regression still passes. A separate seed funding line is quoted when runway appears on another line, and the Funding row explains that both details are present.
- Added eight fictional unit regressions and browser assertions for the pasted score and both scoring explanations. The existing `shared evidence has a distinct excerpt around each criterion’s anchor` test now uses explicit clause separators and asserts three exact excerpts. Its former fixture put all three anchors in one clause, which required mid-clause cuts to produce three distinct excerpts. The standalone funding and verbatim-substring tests still pass. The browser suite had no old score assertion.

## Sample score comparison

The comparison ran both engines against the same four shipped postings. Pencil Cloud Studio is the paste walkthrough's renamed Paper Comet Systems sample. All four samples retain their bands.

| Sample | Iteration 4 | Iteration 5 |
| --- | --- | --- |
| Figment Ferry · Founding Product Engineer | 89 · Worth a conversation | 81 · Worth a conversation |
| Moonbutton Rocketworks · First Engineering Hire | 34 · Proceed with caution | 26 · Proceed with caution |
| Paper Comet Systems · Product Engineer | 99 · Worth a conversation | 91 · Worth a conversation |
| Puddle Satellite · Backend Engineer | 50 · Not enough to judge | 42 · Not enough to judge |

## Screenshot inspection

Opened the final local captures after Playwright finished.

- **Reporting line**, [founding brief](../tests/screenshots/a-sample-brief.png) — “You report directly to the CTO …”
- **Team and collaborators**, founding brief — “… work with our product designer and the dispatch team at a pilot operator. …”
- **First-quarter outcomes**, [paste brief](../tests/screenshots/b-paste-brief.png) — “First 90 days: Launch the guided importer to 30 existing customers …”
- **Customers and traction**, paste brief — “First 90 days: Launch the guided importer to 30 existing customers and document how support teams can debug failures.”

The founding Scope and Technical stack quotes begin with “Build a dispatch board” and “Integrate live vessel locations,” respectively.

## Commands and outcomes

All commands ran from `/workspace/speedrun-pe`.

| Command | Exit | Observed outcome |
| --- | ---: | --- |
| `gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest --jq '{status,commit}'` | 0 | `{"commit":"90a9a4b721b9795996b36f815291ec28402e74a8","status":"built"}` |
| `curl -sS -o /dev/null -w '%{http_code}\n' https://madanchaollapark.github.io/speedrun-worth-your-time/` | 0 | `200` without authentication |
| `npm run test:live -- --retries=0` | 0 | 4 passed, 0 failed, 0 skipped in 2.8 s |
| `CI=1 npm run test:unit` | 0 | Final run 44 passed, 0 failed, 0 skipped. Three preceding runs also passed 44/44. |
| `CI=1 npx playwright test` | 0 | Final run 19 passed, 0 failed, 0 skipped in 7.0 s. Two preceding runs also passed 19/19. |
| Unsafe sink command below | 0 | `no unsafe sinks` |
| Stale baseline command below | 0 | Initial scan found old copy in `docs/index.html:100`. The final scan printed `no stale baseline`. |
| `grep -c 'Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert' GOAL.md STATE/PLAN.md` | 0 | `GOAL.md:1` and `STATE/PLAN.md:2` |
| `git diff --name-only -- GOAL.md RESEARCH.md APPLICATION_DRAFT.md speedrun_pe_loop.py STATE/ALL_DONE STATE/TEST_COMMANDS` | 0 | Empty output |
| `cmp STATE/TEST_COMMANDS <(printf '%s\n' 'npm run test:unit' 'npx playwright test')` | 0 | Exact match. The driver file already supplies both commands, one per line, as documented in README.md. |
| `git diff --check -- docs tests PRODUCT.md CHANGELOG.md README.md` | 0 | Empty output |
| `git diff --name-only -- tests/screenshots` | 0 | Five PNGs changed, listed below |
| `ss -ltn '( sport = :4173 )'` | 0 | No listener after Playwright finished |
| `rg --files --hidden --no-ignore test-results` | 0 | Only the ignored `test-results/.last-run.json` |
| `git status --short --untracked-files=all` | 0 | Intended builder edits and pre-existing driver and orchestrator edits. Zero untracked entries. |

```sh
grep -rnE 'innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function' docs/js || echo 'no unsafe sinks'
grep -rn 'starts at 50\|Starts at 50' docs PRODUCT.md README.md || echo 'no stale baseline'
```

The following comparison exited 0 and produced the four score and band pairs above.

```sh
node --input-type=module <<'NODE'
import { execFileSync } from 'node:child_process';
import * as after from './docs/js/brief.js';
import { samples } from './docs/js/samples.js';
const previous = execFileSync('git', ['show', '90a9a4b:docs/js/brief.js']);
const before = await import('data:text/javascript;base64,' + previous.toString('base64'));
for (const { company, text } of samples) {
  const result = engine => {
    const { score, band } = engine.analyze(engine.normalizeFromText(text)).assessment;
    return `${score} · ${band}`;
  };
  console.log(`${company} | ${result(before)} | ${result(after)}`);
}
NODE
```

The screenshot OCR cross-check exited 0 and found the expected row text. The ellipses were verified visually.

```sh
for name in a-sample-brief b-paste-brief; do tesseract "tests/screenshots/$name.png" stdout 2>/dev/null | rg -A 5 'Reporting line|Team and collaborators|First-quarter outcomes|Customers and traction|Scope clarity|Technical stack'; done
```

## Files changed

- `docs/index.html`, `docs/js/app.js`, `docs/js/brief.js`
- `tests/unit/brief.test.js`, `tests/e2e/walkthrough.spec.js`
- `tests/screenshots/a-sample-brief.png`, `tests/screenshots/b-paste-brief.png`, `tests/screenshots/d-api-brief.png`
- `tests/screenshots/live-a-sample-brief.png`, `tests/screenshots/live-c-founder.png`
- `PRODUCT.md`, `CHANGELOG.md`, `STATE/BUILD_REPORT.md`

The initial status also showed edits to `LOOP_LOG.md`, `STATE/CHECKLIST.md`, `STATE/ITER`, `STATE/PHASE`, and `STATE/PLAN.md` from the driver or orchestrator.

## Live URL and handoff

The public link serves the verified iteration 4 build. The driver owns publication and live verification of the iteration 5 tree. The 25-posting live API calibration was outside this round's scope. [Worth Your Time on GitHub Pages](https://madanchaollapark.github.io/speedrun-worth-your-time/)
