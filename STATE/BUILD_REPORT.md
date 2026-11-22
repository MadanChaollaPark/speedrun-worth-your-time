# Build report · Iteration 1

Built Worth Your Time as a zero-build static app. A seeker can paste a posting, pick one of four labeled fictional samples, or fetch an open speedrun board posting through the public jobs API. The brief shows a disclosure score with a ledger, role details, suggested questions, and verbatim evidence. The app supports keyboard navigation, Markdown copy and download, share links, and printing. The founder editor autosaves a draft locally, previews and exports it, and checks it with the same engine.

The prescribed local acceptance checks passed. GitHub Pages is enabled from `main:/docs`. The public app is pending the driver push and a successful Pages build.

## Files created or changed

- App and assets — `docs/index.html`, `docs/.nojekyll`, `docs/favicon.svg`, `docs/css/{app,print}.css`, `docs/js/{app,brief,founder,samples}.js`.
- Tooling — `package.json`, `package-lock.json`, `playwright.config.js`, `scripts/serve.mjs`, `.gitignore`.
- Tests and evidence — `tests/fixtures.js`, `tests/unit/brief.test.js`, `tests/e2e/walkthrough.spec.js`, `tests/screenshots/{a-sample-brief,b-paste-brief,c-founder-template,d-api-brief,e-api-fallback,f-empty-error}.png`, `STATE/TEST_COMMANDS`.
- Documentation — `README.md`, `PRODUCT.md`, `CHANGELOG.md`, `RESEARCH.md` (public API wrapper re-check), `APPLICATION_DRAFT.md`, `STATE/BUILD_REPORT.md`.

## Acceptance checks and actual outcomes

| Check | Command | Outcome |
| --- | --- | --- |
| A1 · Unit tests | `CI=1 npm run test:unit` | Exit 0. **15 passed, 0 failed, 0 skipped.** |
| A2 · Playwright | `CI=1 npx playwright test` | Exit 0. **11 passed, 0 failed, 0 skipped** in 4.3 seconds. API requests were mocked or blocked. |
| A2 · Walkthrough evidence | `ls -la tests/screenshots` and `file tests/screenshots/*.png` | Exit 0 for each. Six full-page PNGs, a–f, all 1280 pixels wide. |
| A3 · Rerun commands | `cat STATE/TEST_COMMANDS` | Exit 0. Exactly two lines, `npm run test:unit` and `npx playwright test`. |
| A4 · Unsafe DOM sinks | `grep -rn "innerHTML\|outerHTML\|insertAdjacentHTML\|document.write" docs/js` | Exit 1, zero matches. Hostile-markup tests also confirmed the payload remained literal text. |
| A5 · Workflow directory | `ls .github 2>/dev/null` | Exit 2, directory absent. |
| A5 · Credential-pattern review | `grep -rniE 'gh[pousr]_[A-Za-z0-9]{20,}\|api[_-]?key\|secret' --exclude-dir=node_modules --exclude-dir=research --exclude-dir=.git --exclude-dir=test-results --exclude-dir=logs --binary-files=without-match . \| sed -E 's/gh[pousr]_[A-Za-z0-9]{20,}/[redacted]/g'` | Pipeline exit 0. Matches were existing comments and instructions about credentials. Zero credential-shaped values appeared. |
| A6 · Asset paths | `grep -n 'src="/\|href="/' docs/index.html` | Exit 1, zero absolute asset paths. |
| A7 · Pages source | `gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages --jq '.source'` | Exit 0, `{"branch":"main","path":"/docs"}`. |
| A8 · Static server | `node scripts/serve.mjs >/dev/null 2>&1 &` with a PID trap for cleanup, followed by the curl commands below | Root and JS returned HTTP 200. Encoded traversal and an absent asset returned HTTP 404. |
| A9 · Docs | `ls -la README.md PRODUCT.md CHANGELOG.md APPLICATION_DRAFT.md` | Exit 0. All four present. |
| A10 · Worktree | `git status --short` and `git status --porcelain=v1 --untracked-files=all` | Exit 0. Builder deliverables and pre-existing driver/orchestrator changes only. |
| A10 · Runner artifacts | `git ls-files -- test-results/ playwright-report/ blob-report/` and `git check-ignore test-results/.last-run.json playwright-report/index.html blob-report/test.zip` | Exit 0 for each. No tracked output and all three locations ignored. |
| A10 · Server cleanup | `pgrep -af '[s]erve.mjs'` | Exit 1, zero servers found after the test and HTTP checks. |
| Owner role assignment | `rg -n '^Orchestrator and reviewer are Kiro Claude Opus 5\.5; builder is Codex gpt-6\.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert$' GOAL.md STATE/PLAN.md` | Exit 0. Both files contain the owner-approved line. |

Additional checks and fixes

- `npm install --save-dev @playwright/test` exited 0 with three packages added and zero vulnerabilities reported. `npx playwright --version` returned **1.65.1**. `npx playwright install --dry-run chromium` identified Chromium and Headless Shell revision **1255**, Chrome for Testing **159.0.8154.6**. Both cached browser directories already existed and the Playwright suite launched Chromium successfully. No browser download was needed. Node was **24.22.1** and npm **11.21.1**.
- Initial `npm run test:unit` exited 1 with 0 passed and 1 runner failure because this Node build treated the directory argument as a module. Switching the package script to `node --test "tests/unit/*.test.js"` brought the first complete run to 14 passed. The final suite includes one additional pay-extraction regression test.
- Initial `npx playwright test` exited 1 with 10 passed and 1 failed because the founder heading and input shared an ID. After fixing the ID, `npx playwright test` exited 0 with 11 passed. A later CI run caught an ambiguous API pay text assertion after the evidence copy gained the same amount. The assertion now matches the exact pay summary. The final CI run above passed all 11.
- `git diff --check` reported pre-existing trailing whitespace at `LOOP_LOG.md:5`. The scoped `git diff --check -- .gitignore README.md RESEARCH.md` exited 0. The driver-owned log was left as found.
- The following local HTTP checks each exited 0. The server was stopped by the PID trap after the checks.

```sh
curl -s -o /dev/null -w '/ HTTP %{http_code}\n' 'http://127.0.0.1:4173/'
curl -s -o /dev/null -w '/js/brief.js HTTP %{http_code} %{content_type}\n' 'http://127.0.0.1:4173/js/brief.js'
curl --path-as-is -s -o /dev/null -w 'traversal HTTP %{http_code}\n' 'http://127.0.0.1:4173/%2e%2e/GOAL.md'
curl -s -o /dev/null -w 'missing asset HTTP %{http_code}\n' 'http://127.0.0.1:4173/absent.js'
```

- Public API research used the [OpenAPI document](https://speedrun-talent-network.com/api/v1/openapi.json) and the following no-auth GET. The request returned HTTP 200, CORS `*`, a top-level `job` wrapper, `status: "open"`, and a 2,913-character description.

```sh
curl -fsS --max-time 15 'https://speedrun-talent-network.com/api/v1/jobs/technical-customer-support-specialist-elevenlabs-f2bf078d' -H 'Origin: http://127.0.0.1:4173' -D >(rg -i '^(HTTP|access-control-allow-origin)' >&2) | node --input-type=module -e 'let body=""; for await (const chunk of process.stdin) body += chunk; const response = JSON.parse(body); const {job} = response; console.log(JSON.stringify({responseKeys:Object.keys(response),jobKeys:Object.keys(job),status:job.status,descriptionLength:job.description_text?.length,labels:Object.keys(job.labels ?? {})}));'
```

- The stretch application draft is complete. The counting command below exited 0 and returned **926 characters, 926 UTF-16 units**, within the 1,500 limit. Unknown application details have uppercase placeholders.

```sh
node --input-type=module -e 'import {readFileSync} from "node:fs"; const ideas=readFileSync("APPLICATION_DRAFT.md","utf8").split("### ideas\n\n")[1].split("\n\n## Step 3")[0]; console.log("ideas characters:",Array.from(ideas).length,"UTF-16 units:",ideas.length); if(ideas.length>1500) process.exitCode=1;'
```

## GitHub Pages

Configured URL pending the driver push — https://madanchaollapark.github.io/speedrun-worth-your-time/

```sh
gh api -X POST repos/MadanChaollaPark/speedrun-worth-your-time/pages -f "source[branch]=main" -f "source[path]=/docs"
gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages --jq '.html_url,.source,.status'
gh api repos/MadanChaollaPark/speedrun-worth-your-time/pages/builds/latest --jq '{status,error:.error.message}'
curl --max-time 15 -sS -o /dev/null -w 'Pages HTTP %{http_code}\n' 'https://madanchaollapark.github.io/speedrun-worth-your-time/'
```

The POST exited 0 with `{"status":null,"html_url":"https://madanchaollapark.github.io/speedrun-worth-your-time/","build_type":"legacy","source":{"branch":"main","path":"/docs"},"public":true,"https_enforced":true}` (selected response fields). The GETs exited 0 and reported `building`, with a null build error. The unauthenticated public check returned HTTP **404** before the driver push. Pages enabled, live check pending driver push.

## Pending and limits

- The driver must publish the worktree to `main` before the public Pages app can be verified. No commit, tag, push, form submission, sign-in, or external message was performed.
- The optional axe scan was skipped. Chromium checks covered keyboard focus, clipboard and exports, mobile dark layout, API error recovery, and hostile markup.
- The assessment is based on wording and fields exposed by the posting. Its English-first heuristics can miss unusual phrasing. The live API was verified directly over HTTP. The browser walkthrough uses fixtures for repeatability.
