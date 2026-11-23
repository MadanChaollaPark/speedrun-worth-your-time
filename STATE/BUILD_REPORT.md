# Build report · Iteration 6 · 2026-11-23 KST

## Result

Implemented and verified the iteration 6 changes locally. The public iteration 5 build at `9b46781cf3f5aa871df9a914ef04489b722f3773` returned HTTP 200 without authentication and passed all four live browser tests with retries disabled. Publishing iteration 6 is pending the driver’s push to `main`. [Public GitHub Pages demo](https://madanchaollapark.github.io/speedrun-worth-your-time/)

Hours now quotes explicit schedule pressure when available, with softer wording as a fallback. The 28-character negation check and scoring weights still apply. Shortened excerpts prefer complete sentence boundaries and retain a trailing ellipsis for a mid-sentence cut. When Scope and Hours share a line in Moonbutton, Scope ends at its own sentence.

The calibration led to two fixes. Pay range detection accepts encoded en and em dashes and preserves the source wording in the excerpt. Equity detection excludes internal pay equity and investor names ending in Equity Partners while preserving genuine equity offers on other lines or elsewhere on the same line. Both fictional regression tests failed before the fixes and passed afterward.

## Shipped sample scores

| Fictional sample | Before | After |
| --- | --- | --- |
| Figment Ferry · Founding Product Engineer | 81 · Worth a conversation | 81 · Worth a conversation |
| Moonbutton Rocketworks · First Engineering Hire | 26 · Proceed with caution | 26 · Proceed with caution |
| Paper Comet Systems · Product Engineer | 91 · Worth a conversation | 91 · Worth a conversation |
| Puddle Satellite · Backend Engineer | 42 · Not enough to judge | 42 · Not enough to judge |

The separate Pencil Cloud Studio paste fixture also remained 91 · Worth a conversation.

## Excerpts verified

- **Team and collaborators** in the opened sample walkthrough PNG — “… work with our product designer and the dispatch team at a pilot operator.” The existing unit test `founding sample team evidence begins at its own clause and includes both collaborators` now expects the final period. [Sample screenshot](../tests/screenshots/a-sample-brief.png)
- **Funding and runway** in the opened paste walkthrough PNG — “We are a Series B vendor portal company.” [Paste screenshot](../tests/screenshots/b-paste-brief.png)
- **Moonbutton Equity and terms** (risk, Node dump) — “… This is an equity-heavy opportunity for a rockstar who wants to get in on the ground floor.”
- **Moonbutton Hours and intensity** (risk, Node dump) — “… expect nights and weekends when it takes them to make a launch happen.”
- **Moonbutton Scope clarity** (risk, Node dump) — “You'll wear many hats.”

The existing long-excerpt test was updated to verify a clean sentence start. New tests cover a complete sentence end, a whole-word fallback, punctuation across all samples, the paste funding excerpt, and the distinct Moonbutton and soft-intensity paths.

## Public API calibration

One no-auth GET of the jobs list returned 50 records. The first 20 unique IDs were used for 20 detail GETs, with a 550 ms delay before each detail call. The same 20 responses were analyzed before and after the two calibration fixes. This is a single list slice, and the manual review covered positions 1, 5, 10, 15, and 20.

| Assessment band | Before calibration fixes | After |
| --- | ---: | ---: |
| Worth a conversation | 4 | 4 |
| Worth it if they answer the open questions | 4 | 5 |
| Proceed with caution | 10 | 10 |
| Not enough to judge | 2 | 1 |
| **Total** | **20** | **20** |

Minimum, median, and maximum were **44 / 49.5 / 81** before the calibration fixes and **44 / 50.5 / 81** after. The recognized salary supplied a third core fact to one posting, moving it from Not enough to judge into Worth it if they answer the open questions. Equity excerpt corrections kept the row’s status when another line disclosed employee equity.

| Checklist criterion | Signal | Risk | Unknown |
| --- | ---: | ---: | ---: |
| Posted salary range | 17 | 0 | 3 |
| Equity and terms | 0 | 10 | 10 |
| Funding and runway | 7 | 0 | 13 |
| Team and collaborators | 4 | 0 | 16 |
| Reporting line | 2 | 0 | 18 |
| Scope clarity | 19 | 0 | 1 |
| First-quarter outcomes | 2 | 0 | 18 |
| Interview process | 0 | 0 | 20 |
| Location and office time | 20 | 0 | 0 |
| Hours and intensity | 0 | 11 | 9 |
| Visa sponsorship | 3 | 0 | 17 |
| Customers and traction | 3 | 0 | 17 |
| Technical stack | 2 | 0 | 18 |

Before the two calibration fixes, Salary was 16 signal / 0 risk / 4 unknown. All other row counts matched the table.

### Five postings read

| Public short ID and title | Findings |
| --- | --- |
| `4f76ad03` Executive Communications Lead | Equity missed the listing’s offer. Team missed the named cross-functional collaborators. Scope missed detailed duties under the ownership heading. First-quarter outcomes signaled from general success measures without a first-quarter timeframe. Traction missed named product users, revenue, and search volume. The unknown Interview process row quoted a media duty. |
| `8d300218` Counsel, Intellectual Property | Equity correctly remained a risk for incomplete terms. Its evidence moved from an investor name to the actual equity benefit. Team missed explicit collaboration with engineers and inventors. Hours flagged prior fast-paced work experience as a current schedule risk. The unknown Interview process row quoted recording and transcription policy. |
| `e7b8aeec` Division Operations, AFS | Salary missed a numeric range with an encoded dash. The fix moved Salary to signal. Team missed explicit partnership with the corporate development team. The unknown Interview process row quoted an impersonation warning. |
| `fdecb657` Social Media Strategist | Equity missed the listing’s offer. First-quarter outcomes signaled from general success measures without a first-quarter timeframe. Traction missed named product users, revenue, and search volume. The unknown Interview process row quoted a content-production duty. |
| `b63650df` Staff Mission Manager | Equity correctly remained a risk for incomplete terms. Its evidence moved from internal pay equity to a stock-option benefit. Funding missed an explicit qualified raise amount. Team missed named collaborators across engineering, manufacturing, supply chain, and mission services. |

### Deferred

- **Equity from listing summaries** on two jobs. Adding API metadata requires deciding how it should rank against more detailed or conflicting description terms.
- **Team collaborators and scope extraction.** Several jobs name collaborators using different verbs or use labeled duties under an unrecognized heading. Broader matching needs fixtures to distinguish company descriptions from role-specific details.
- **General success measures as first-quarter outcomes.** Tightening the timeframe would alter existing scoring behavior and needs separate calibration.
- **Traction figures and named users, and funding amounts with qualifiers.** These need more context checks to distinguish current company facts from goals, broader market numbers, or amounts a posting attributes to another party.
- **Prior experience presented as a schedule risk.** The Hours match needs requirements context before treating soft wording there differently. This round kept soft wording as a risk when it is the available evidence.
- **Interview evidence on unknown rows.** Media interviews, recruitment scam warnings, and interview recording policy are weak excerpts for hiring steps. The unknown statuses were appropriate. Fixing evidence selection would require separating these contexts.

## Commands and outcomes

Commands ran from `/workspace/speedrun-pe`.

| Command | Exit | Observed result |
| --- | ---: | --- |
| `gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest --jq '{status,commit}'` | 1 | TLS handshake timeout on the initial request |
| `GH_PROMPT_DISABLED=1 gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest --jq '{status,commit}'` | 0 | `{"commit":"9b46781cf3f5aa871df9a914ef04489b722f3773","status":"built"}` |
| `curl -sS -o /dev/null -w '%{http_code}\n' https://madanchaollapark.github.io/speedrun-worth-your-time/` | 0 | `200` |
| `npm run test:live -- --retries=0` | 0 | 4 passed, 0 failed, 0 skipped (17.2 s) |
| Sample snapshot command below | 0 | Four before-and-after sample rows and the paste fixture matched. An initial invocation exited 1 because it tried to import the test-local `pastedSample` from `samples.js`. The corrected command ran successfully before production edits. |
| `CI=1 npm run test:unit` with the new excerpt assertions and the original engine | 1 | 50 tests, 44 passed, 6 failed, 0 skipped |
| `CI=1 npm run test:unit` after the excerpt fixes | 0 | 50 passed, 0 failed, 0 skipped |
| Targeted Node regression command below, before calibration fixes | 1 | 0 passed, 2 failed, 0 skipped |
| Targeted Node regression command below, after calibration fixes | 0 | 2 passed, 0 failed, 0 skipped |
| Calibration fetch, aggregate, and spot-check commands below | 0 | 50 list results, 20 details. Both aggregate passes and all five manual reads completed. The focused recheck found the expected salary signal and two corrected equity excerpts. |
| `rm -- .wyt-calibration-iter6.json && printf '%s\n' 'npm run test:unit' 'npx playwright test' > STATE/TEST_COMMANDS` | 0 | Deleted the transient data and wrote the same two driver commands, one per line |
| `CI=1 npm run test:unit` final | 0 | **52 passed, 0 failed, 0 skipped** |
| `CI=1 npx playwright test` final | 0 | **19 passed, 0 failed, 0 skipped** (6.5 s), including the axe scans, API fallback, keyboard flows, hostile markup, and founder template |
| Unsafe-sink check below | 0 | `no unsafe sinks` |
| `grep -c 'Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert' GOAL.md STATE/PLAN.md` | 0 | `GOAL.md:1` and `STATE/PLAN.md:2` |
| `git diff --name-only -- GOAL.md RESEARCH.md APPLICATION_DRAFT.md speedrun_pe_loop.py STATE/ALL_DONE STATE/TEST_COMMANDS` | 0 | Empty output |
| `git diff --check -- docs tests PRODUCT.md CHANGELOG.md README.md` | 0 | Empty output |
| `git diff --check -- STATE/BUILD_REPORT.md docs tests PRODUCT.md CHANGELOG.md README.md` | 0 | Empty output |
| Temporary-file check below | 0 | `no temp files` |
| `git status --short --untracked-files=all` | 0 | Intended round files and the pre-existing orchestrator/driver edits listed below. No scratch or untracked files. |
| TCP cleanup check below | 0 | `no local Playwright server listening` |

```sh
node --test --test-name-pattern 'encoded dash separators|investor names and internal pay equity' tests/unit/brief.test.js
grep -rnE 'innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function' docs/js || echo 'no unsafe sinks'
ls /tmp/wyt* 2>/dev/null || echo 'no temp files'
node --input-type=module -e 'import net from "node:net"; const client = net.connect(4173, "127.0.0.1"); client.on("connect", () => { console.error("server still listening"); process.exitCode = 1; client.destroy(); }); client.on("error", error => { if (error.code !== "ECONNREFUSED") throw error; console.log("no local Playwright server listening"); });'
```

Playwright regenerated six local walkthrough screenshots and three live walkthrough screenshots. I opened both requested local PNGs and checked the quoted rows. A TCP check confirmed that Playwright shut down its local server.

## Files changed

- `docs/js/brief.js`, `tests/unit/brief.test.js`, `PRODUCT.md`, `CHANGELOG.md`, and this report.
- Changed PNGs under `tests/screenshots/` are `a-sample-brief.png`, `b-paste-brief.png`, `d-api-brief.png`, `live-a-sample-brief.png`, `live-b-paste-brief.png`, and `live-c-founder.png`. The other three local PNGs regenerated identically.
- The existing changes to `LOOP_LOG.md`, `STATE/CHECKLIST.md`, `STATE/ITER`, `STATE/PHASE`, and `STATE/PLAN.md` were present at the start of the round.

## Sample and calibration commands

Sample snapshot, run before edits, after excerpt fixes, and after calibration fixes.

```sh
node --input-type=module <<'NODE'
import { analyze, normalizeFromText } from './docs/js/brief.js';
import { samples } from './docs/js/samples.js';
const pasteFixture = { title: 'Paste test fixture', text: samples[2].text.replace('Paper Comet Systems', 'Pencil Cloud Studio') };
for (const sample of [...samples, pasteFixture]) {
  const b = analyze(normalizeFromText(sample.text));
  console.log(sample.title, b.assessment.score, b.assessment.band);
  console.log(b.checklist.filter(({ id }) => ['team', 'funding', 'scope', 'equity', 'hours'].includes(id)).map(({ id, evidence }) => `${id}: ${evidence}`).join('\n'));
}
NODE
```

Fetch the public snapshot. The command ran from stdin so the transient file was the only calibration artifact on disk.

```sh
node --input-type=module <<'NODE'
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';
const api = 'https://speedrun-talent-network.com/api/v1/jobs';
const get = url => JSON.parse(execFileSync('curl', ['--fail', '--silent', '--show-error', '--max-time', '25', url], { maxBuffer: 4 * 1024 * 1024 }));
const { jobs } = get(api + '?limit=20');
if (!Array.isArray(jobs) || jobs.length < 20) throw new Error('Fewer than 20 entries in the list');
const ids = jobs.slice(0, 20).map(job => job.id);
if (new Set(ids).size !== 20 || ids.some(id => typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id))) throw new Error('Unexpected job IDs');
console.log('List entries:', jobs.length);
const details = [];
for (const id of ids) {
  await setTimeout(550);
  const { job } = get(api + '/' + id);
  if (job?.id !== id) throw new Error('Mismatched job detail');
  details.push(job);
}
writeFileSync('.wyt-calibration-iter6.json', JSON.stringify(details), { mode: 0o600, flag: 'wx' });
console.log('Job details fetched:', details.length);
NODE
```

Aggregate the same snapshot before and after the calibration fixes.

```sh
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';
import { analyze, criteria, normalizeFromApi } from './docs/js/brief.js';
const jobs = JSON.parse(readFileSync('.wyt-calibration-iter6.json', 'utf8'));
const briefs = jobs.map(job => analyze(normalizeFromApi(job)));
const bands = Object.groupBy(briefs, brief => brief.assessment.band);
const scores = briefs.map(brief => brief.assessment.score).sort((a, b) => a - b);
const middle = scores.length / 2;
console.log('Bands:', Object.fromEntries(Object.entries(bands).map(([band, entries]) => [band, entries.length])));
console.log('Score min/median/max:', scores[0], (scores[middle - 1] + scores[middle]) / 2, scores.at(-1));
console.table(Object.fromEntries(criteria.map(({ id }) => {
  const counts = { signal: 0, risk: 0, unknown: 0 };
  for (const brief of briefs) counts[brief.checklist.find(row => row.id === id).status]++;
  return [id, counts];
})));
NODE
```

Read the five selected descriptions and review their rows. The shown command was used first with `1 5` and then with `10 15 20`.

```sh
node --input-type=module - 1 5 <<'NODE'
import { readFileSync } from 'node:fs';
import { analyze, normalizeFromApi } from './docs/js/brief.js';
const jobs = JSON.parse(readFileSync('.wyt-calibration-iter6.json', 'utf8'));
for (const index of process.argv.slice(2).map(Number)) {
  const job = jobs[index - 1];
  const posting = normalizeFromApi(job);
  const brief = analyze(posting);
  console.log('\n' + index, job.id.slice(0, 8), job.title, posting.location, posting.workplace, posting.comp);
  for (const { id, status, evidence } of brief.checklist) console.log(id, status, evidence);
  console.log(posting.description);
}
NODE
```

Recheck the three affected rows against the snapshot after the fixes.

```sh
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';
import { analyze, normalizeFromApi } from './docs/js/brief.js';
const jobs = JSON.parse(readFileSync('.wyt-calibration-iter6.json', 'utf8'));
for (const [position, rowId] of [[5, 'equity'], [10, 'salary'], [20, 'equity']]) {
  const { status, evidence } = analyze(normalizeFromApi(jobs[position - 1])).checklist.find(row => row.id === rowId);
  console.log(position, rowId, status, evidence.split(/\s+/).slice(0, 12).join(' '));
}
NODE
```
