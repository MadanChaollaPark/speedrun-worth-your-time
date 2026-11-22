# Build report · Iteration 3 · 2026-11-23 KST

The two driver suites passed with 25 unit tests and 19 browser tests. Three independent Chromium smoke runs passed all four tests with retries disabled. GitHub Pages returned HTTP 200 without a login and reported iteration 2 commit `abecb7164e383c7f14858ecff3268ac7b0508089` as built. Iteration 3 is ready for the driver’s publication. [Public demo](https://madanchaollapark.github.io/speedrun-worth-your-time/)

## Work and files

1. Stabilized the live founder check in `tests/live/live.spec.js` by waiting for the company field. Set a 60-second test timeout, 15-second assertion timeout, and failure trace retention in `playwright.live.config.js`. The standalone config still defaults to one retry. All three verification runs used zero retries.
2. Adjusted the grid gap in `docs/css/app.css`. Opened `tests/screenshots/a-sample-brief.png` after both local runs. The underlined **Brief actions ↓** link sits fully above the focus outline of the fictional Founding Product Engineer heading. A Chromium geometry check measured 6 px of clearance at 1280 px and 390 px, verified no horizontal overflow, and confirmed Tab reaches the link and Enter focuses the actions. Opened `tests/screenshots/live-c-founder.png` and saw the entered title and company under **Live preview**.
3. Calibrated `docs/js/brief.js` against 25 public postings. Financial reporting no longer counts as a manager relationship. Hybrid cloud wording no longer supplies workplace evidence, and explicit office or structured location data takes precedence. A count of companies or organizations using the product now counts as customer traction. Added one fictional test per fix in `tests/unit/brief.test.js`.
4. Added four pay tests in the same unit file. The engine now recognizes a fixed-term contract named on the pasted pay line while retaining the hourly range as written. Generic competitive salary leaves the range unknown and still prompts for it. GBP, EUR and KRW ranges already worked and now have coverage for verbatim display.
5. Added the sample screenshot to `README.md`, updated the scoring description in `PRODUCT.md`, and added iteration notes to `CHANGELOG.md`. The application draft remains unsubmitted, and the pitch is 926 characters.
6. Wrote this report and rewrote `STATE/TEST_COMMANDS` with its original two commands, one per line. The role assignment remains intact in `GOAL.md` and `STATE/PLAN.md`.

All six local and three live walkthrough PNGs were regenerated. The files with changed bytes are `tests/screenshots/{a-sample-brief,b-paste-brief,d-api-brief,live-a-sample-brief,live-c-founder}.png`. No new files are required.

## Verification commands

All shell commands ran from `/workspace/speedrun-pe`.

| Command | Exit | Observed result |
| --- | ---: | --- |
| `gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest --jq '{status,commit}'` | 0 | `built`, `abecb7164e383c7f14858ecff3268ac7b0508089` |
| `curl --fail --silent --show-error --max-time 20 https://madanchaollapark.github.io/speedrun-worth-your-time/ -o /dev/null -w '%{http_code}\n'` | 0 | HTTP 200 without authentication |
| `npm run test:live -- --retries=0` (round run 1) | 0 | 4 passed, 0 failed, 0 skipped in 5.4 s |
| `npm run test:live -- --retries=0` (round run 2) | 0 | 4 passed, 0 failed, 0 skipped in 2.7 s |
| `CI=1 npx playwright test --list \| grep -c live` | 1 | Printed `0`. Grep returns 1 for zero matches. |
| `CI=1 npx playwright test` (spacing check) | 0 | 19 passed, 0 failed, 0 skipped in 7.7 s |
| Chromium geometry command below | 0 | 6 px clearance, no overflow, and keyboard checks passed at both widths |
| First OpenAPI command below | 1 | JSON parsed, but the lookup used `/jobs` instead of the documented full path and raised a TypeError |
| Corrected OpenAPI command below | 0 | Listed `/api/v1/jobs` parameters, including `founding=1` |
| Calibration command below | 0 | 20 general, 5 founding-filtered, 25 successful detail analyses, 0 errors |
| `npm run test:unit` (before calibration fixes) | 1 | 18 passed, 3 failed, 0 skipped. The three new tests reproduced the misreads. |
| `npm run test:unit` (after calibration fixes) | 0 | 21 passed, 0 failed, 0 skipped |
| `npm run test:unit` (before pay fixes) | 1 | 23 passed, 2 failed, 0 skipped. Contract was absent and competitive salary was marked as risk. |
| `npm run test:unit` (after pay fixes) | 0 | 25 passed, 0 failed, 0 skipped |
| `CI=1 npm run test:unit` (final) | 0 | 25 passed, 0 failed, 0 skipped |
| `CI=1 npx playwright test` (final) | 0 | 19 passed, 0 failed, 0 skipped in 6.5 s. Eleven walkthroughs and eight axe scans passed, including mobile overflow and zero serious or critical accessibility violations. |
| `npm run test:live -- --retries=0` (final) | 0 | 4 passed, 0 failed, 0 skipped in 2.7 s. No failure traces were produced. |
| Test command comparison below | 0 | Printed `0` before and after rewriting `STATE/TEST_COMMANDS` |
| Unsafe DOM sink check below | 0 | Printed `no unsafe sinks` |
| `ls .github 2>&1` | 2 | Directory absent |
| Owner role checks below | 0 | `GOAL.md:1`, `STATE/PLAN.md:2` for counts. The anchored check confirmed the role assignment at `GOAL.md:11` and `STATE/PLAN.md:3`. The plan also quotes the line in its verification command. |
| `git status --short` | 0 | Builder edits listed above alongside pre-existing driver and orchestrator edits in `LOOP_LOG.md` and `STATE/{CHECKLIST.md,ITER,PHASE,PLAN.md}` |
| `git check-ignore test-results/ && git ls-files test-results/` | 0 | Runner output is ignored and no files in it were tracked |
| Credential-pattern check below | 1 | No tracked file paths matched |
| Scoped whitespace check below | 0 | Clean. An earlier whole-tree check exited 2 for pre-existing trailing whitespace at `LOOP_LOG.md:33`. |
| Pitch length check below | 0 | Printed `926` |
| `ss -ltn 'sport = :4173 or sport = :4174'` | 0 | No listeners after both local servers exited |
| `stat -c '%n %s bytes %y' tests/screenshots/{a-sample-brief,b-paste-brief,c-founder-template,d-api-brief,e-api-fallback,f-empty-error,live-a-sample-brief,live-b-paste-brief,live-c-founder}.png && git status --short && date -Iseconds` | 0 | All nine files had fresh timestamps and nonzero sizes. Checked 2026-11-23 at 07:32 KST. |

```sh
printf '%s\n' 'npm run test:unit' 'npx playwright test' > STATE/TEST_COMMANDS
cmp -s STATE/TEST_COMMANDS <(printf '%s\n' 'npm run test:unit' 'npx playwright test'); echo $?
grep -rnE 'innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(' docs/js || echo "no unsafe sinks"
grep -c 'Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert' GOAL.md STATE/PLAN.md
rg -n '^Orchestrator and reviewer are Kiro Claude Opus 5\.5; builder is Codex gpt-6\.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert$' GOAL.md STATE/PLAN.md
git grep -IlE -e '(gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16}|sk-(proj-)?[A-Za-z0-9_-]{30,})' -e '-----BEGIN ([A-Z]+ )*PRIVATE KEY-----' -- .
git diff --check -- CHANGELOG.md PRODUCT.md README.md docs/css/app.css docs/js/brief.js playwright.live.config.js tests/
node --input-type=module -e 'import assert from "node:assert/strict"; import { readFileSync } from "node:fs"; const ideas = readFileSync("APPLICATION_DRAFT.md", "utf8").split("### ideas\n\n")[1].split("\n\n## Step 3")[0]; assert.ok(ideas.length <= 1500); console.log(ideas.length);'
```

### Chromium geometry command

```sh
PORT=4174 node scripts/serve.mjs &
wyt_server=$!
trap 'kill "$wyt_server" 2>/dev/null; wait "$wyt_server" 2>/dev/null' EXIT
node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const url = 'http://127.0.0.1:4174/';
const browser = await chromium.launch();
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(url);
    await page.getByRole('button', { name: /Founding Product Engineer/ }).click();
    await page.getByRole('button', { name: 'Get the brief' }).press('Enter');
    const layout = await page.evaluate(() => {
      const title = document.querySelector('#result-title');
      const link = document.querySelector('.result-jump');
      const style = getComputedStyle(title);
      return {
        titleFocused: document.activeElement === title,
        clearance: title.getBoundingClientRect().top - link.getBoundingClientRect().bottom
          - parseFloat(style.outlineWidth) - parseFloat(style.outlineOffset),
        fits: document.documentElement.scrollWidth === innerWidth,
      };
    });
    assert.ok(layout.titleFocused && layout.clearance > 0 && layout.fits);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.result-jump').evaluate(link => link === document.activeElement), true);
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#brief-actions').evaluate(actions => actions === document.activeElement), true);
    console.log(width, layout, 'Tab and Enter passed');
    await page.close();
  }
} finally {
  await browser.close();
}
NODE
```

## Public API calibration

The OpenAPI schema advertised `founding=1`. The script read the two lists, took up to 20 and 5 locally, and made 25 deduplicated detail requests with sequential unauthenticated GETs. That was 27 requests for the sampling script and 29 including both OpenAPI lookups. The script ran from standard input so it needed no temporary file outside the workspace. For each posting it emitted signal, risk and unknown counts and pay, location and employment detection flags. I compared the descriptions and briefs for `f2bf078d`, `8680cdfe`, `e897c3f7`, `121af49e`, and `d36191a1`. The table records observed baseline output from the live sample before code changes. The three fixes were verified with fictional regression cases.

| Short ID | Job title | Assessment band | Score |
| --- | --- | --- | ---: |
| `f2bf078d` | Technical Customer Support Specialist | Not enough to judge | 64 |
| `d36191a1` | Partner Account Director, South EMEA | Worth it if they answer the open questions | 56 |
| `8680cdfe` | Sr. People Systems Analyst, Advanced Comp | Worth it if they answer the open questions | 52 |
| `2704ed71` | Sr. People Systems Analyst, Advanced Comp | Worth it if they answer the open questions | 52 |
| `e7b8aeec` | Division Operations, AFS | Not enough to judge | 58 |
| `69a6dab3` | Senior Technical Recruiter | Worth it if they answer the open questions | 60 |
| `f35bede4` | Sr. People Systems Analyst, Advanced Comp | Worth it if they answer the open questions | 52 |
| `ac42e082` | Lead Launch Engineer | Worth it if they answer the open questions | 55 |
| `b6dcf218` | Sales Development Representative (SDR) (Night Shift) | Worth it if they answer the open questions | 52 |
| `fdecb657` | Social Media Strategist | Worth a conversation | 89 |
| `1d43719f` | Staff Product Brand Designer | Worth a conversation | 70 |
| `24df283a` | Sr Mgr, Strategic Sourcing Manager, Corporate & Operations | Worth a conversation | 73 |
| `2e6a9f71` | Launch Engineer | Worth it if they answer the open questions | 55 |
| `994d18db` | Sr. People Systems Analyst, Advanced Comp | Worth it if they answer the open questions | 52 |
| `b63650df` | Staff Mission Manager | Worth it if they answer the open questions | 66 |
| `2adc1183` | Sr. People Systems Analyst, Advanced Comp | Worth it if they answer the open questions | 52 |
| `b8e5655f` | Associate Deployment Strategist | Worth a conversation | 73 |
| `98339bce` | Sr. Software Engineer - Container Security | Worth a conversation | 72 |
| `fe5997ef` | Marketing Strategy and Operations Manager | Worth it if they answer the open questions | 56 |
| `64074483` | Sr. Software Engineer - Full Stack | Worth a conversation | 72 |
| `e897c3f7` | Strategic Enterprise Account Executive - India | Not enough to judge | 62 |
| `121af49e` | Founding Security Engineer | Worth a conversation | 76 |
| `89a58a83` | AI GTM Specialist, Model Hub | Worth it if they answer the open questions | 67 |
| `96e07a61` | Director of Repair Engineering | Not enough to judge | 58 |
| `1040ff3a` | Enterprise Customer Success Manager, Korea | Not enough to judge | 65 |

<details>
<summary>Exact calibration commands</summary>

First OpenAPI lookup, exit 1.

```sh
set -o pipefail
curl --fail --silent --show-error --max-time 20 https://speedrun-talent-network.com/api/v1/openapi.json | node --input-type=module -e '
import { readFileSync } from "node:fs";
const spec = JSON.parse(readFileSync(0));
for (const {name, schema, description} of spec.paths["/jobs"].get.parameters) {
  console.log(name, JSON.stringify(schema), description ?? "");
}'
```

Corrected OpenAPI lookup, exit 0.

```sh
set -o pipefail
curl --fail --silent --show-error --max-time 20 https://speedrun-talent-network.com/api/v1/openapi.json | node --input-type=module -e '
import { readFileSync } from "node:fs";
const spec = JSON.parse(readFileSync(0));
const path = Object.keys(spec.paths).find(path => path.endsWith("/jobs"));
console.log(path);
for (const {name, schema, description} of spec.paths[path].get.parameters) {
  console.log(name, JSON.stringify(schema), description ?? "");
}'
```

Sampling and five-posting review, exit 0. Job descriptions appeared in transient command output only.

```sh
node --input-type=module <<'NODE'
import { execFileSync } from 'node:child_process';
import { analyze, normalizeFromApi } from '/workspace/speedrun-pe/docs/js/brief.js';

const api = 'https://speedrun-talent-network.com/api/v1';
let requests = 0;
const get = path => {
  requests += 1;
  return JSON.parse(execFileSync('curl', [
    '--fail', '--silent', '--show-error', '--max-time', '15', api + path,
  ], { encoding: 'utf8' }));
};

const general = get('/jobs?limit=20').jobs.slice(0, 20);
const founding = get('/jobs?founding=1&limit=5').jobs.filter(job => !general.some(other => other.id === job.id)).slice(0, 5);
const records = [];
let errors = 0;
for (const [group, jobs] of [['general', general], ['founding', founding]]) {
  for (const { id } of jobs) {
    try {
      const { job } = get('/jobs/' + encodeURIComponent(id));
      const posting = normalizeFromApi(job);
      const brief = analyze(posting);
      const tally = Object.fromEntries(['signal', 'risk', 'unknown'].map(status =>
        [status, brief.checklist.filter(row => row.status === status).length]));
      const observed = criterion => brief.checklist.find(row => row.id === criterion).status === 'signal';
      const item = [id.slice(0, 8), posting.title, brief.assessment.band, brief.assessment.score];
      console.log('ROW', JSON.stringify([...item, group, tally, observed('salary'), observed('location'), Boolean(posting.employment)]));
      records.push({ group, job, posting, brief });
    } catch (error) {
      errors += 1;
      console.error('DETAIL_ERROR', id.slice(0, 8), error.message);
    }
  }
}
console.log('TOTAL', JSON.stringify({ requests, general: general.length, founding: founding.length, details: records.length, errors }));

const generalRecords = records.filter(record => record.group === 'general');
const foundingRecords = records.filter(record => record.group === 'founding');
const selected = [
  generalRecords.find(({ brief }) => brief.status === 'thin'),
  generalRecords.find(({ brief }) => brief.isEarlyStage),
  generalRecords.find(({ brief }) => brief.checklist.some(row => row.id === 'equity' && row.status === 'risk')),
  ...foundingRecords.slice(0, 2),
].filter(Boolean);
const unique = [...new Set([...selected, ...records])].slice(0, 5);
for (const { job, posting, brief } of unique) {
  console.log('REVIEW', JSON.stringify({
    id: job.id.slice(0, 8), title: posting.title, stage: brief.isEarlyStage,
    earlyEvidence: brief.earlyEvidence, labels: posting.labels, summary: brief.reading.summary,
    description: posting.description, responsibilities: brief.reading.responsibilities,
    checklist: brief.checklist.map(({ id, status, evidence }) => [id, status, evidence]),
  }));
}
process.exitCode = errors ? 1 : 0;
NODE
```

</details>

<details>
<summary>Workspace inspection commands</summary>

The initial file scan found no `AGENTS.md`. The whole-tree whitespace check flagged the existing driver log whitespace recorded above. The final scoped check included this report and passed. The final status showed zero untracked files.

```sh
cat GOAL.md # exit 0
cat RESEARCH.md # exit 0
cat STATE/PLAN.md # exit 0
git status --short --branch && rg --files --hidden -g AGENTS.md -g '!node_modules' -g '!.git' -g '!dist' # exit 1
cat STATE/REVIEW.md STATE/CHECKLIST.md # exit 0
ls -a && cat package.json playwright.live.config.js playwright.config.js # exit 0
cat tests/live/live.spec.js && git remote -v && date -Iseconds # exit 0
rg -n 'result-jump|focus-visible|result-head|mobile|sample-brief' docs/{css/app.css,js/app.js} tests/e2e && cat STATE/TEST_COMMANDS # exit 0
sed -n '36,78p;188,248p;410,500p' docs/css/app.css && sed -n '315,374p' docs/js/app.js && sed -n '1,78p;199,235p' tests/e2e/walkthrough.spec.js # exit 0
sed -n '185,207p' docs/css/app.css && cat scripts/serve.mjs && git diff --check # exit 2
rg -n 'Brief actions|brief-actions' tests/e2e && git status --short tests/screenshots # exit 0
cat PRODUCT.md && sed -n '1,160p' docs/js/brief.js && cat tests/unit/brief.test.js # exit 0
sed -n '172,455p' docs/js/brief.js && sed -n '1,50p' README.md && cat CHANGELOG.md && cat .gitignore # exit 0
sed -n '1,48p' APPLICATION_DRAFT.md && git diff --stat # exit 0
git diff -- README.md PRODUCT.md CHANGELOG.md docs/css/app.css docs/js/brief.js playwright.live.config.js tests/live/live.spec.js tests/unit/brief.test.js && sed -n '1,62p' STATE/BUILD_REPORT.md # exit 0
cat tests/e2e/a11y.spec.js # exit 0
git status --short && git diff --check -- CHANGELOG.md PRODUCT.md README.md STATE/BUILD_REPORT.md STATE/TEST_COMMANDS docs/css/app.css docs/js/brief.js playwright.live.config.js tests/ # exit 0
git diff --name-only -- GOAL.md APPLICATION_DRAFT.md RESEARCH.md speedrun_pe_loop.py && git status --short --untracked-files=all # exit 0
```

</details>

## Pending and limitations

- The public URL serves iteration 2. The driver owns the commit and push for iteration 3.
- The calibration reached the planned three-fix cap. The sample also revealed conflicting employment metadata and one equity evidence excerpt that described job duties. Those cases still require judgment when reading the original posting.
