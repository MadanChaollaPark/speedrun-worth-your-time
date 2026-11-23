# Changelog

## Iteration 7 · 2026-11-23

- Verified the public iteration 6 GitHub Pages build with four Chromium smoke tests and retries disabled.
- Decoded supported HTML entities in API-supplied text before extracting evidence.
- Restricted interview evidence anchors to hiring context and excluded soft intensity wording in candidate qualifications.
- Checked score and band parity across all four shipped postings and the fictional API fixture.

## Iteration 6 · 2026-11-23

- Verified the public iteration 5 GitHub Pages build with four Chromium smoke tests and retries disabled.
- Quoted explicit schedule expectations ahead of softer intensity wording and separated Moonbutton’s scope, hours, and equity evidence. All four sample scores stayed the same.
- Preferred sentence boundaries in shortened evidence and dropped trailing ellipses after sentence punctuation.
- Checked 20 public job postings. Recognized pay ranges with encoded dash separators and excluded internal pay equity and investor names from ownership evidence.

## Iteration 5 · 2026-11-23

- Verified the public iteration 4 GitHub Pages deployment with four Chromium smoke tests and retries disabled.
- Quoted complete clauses around shared evidence and removed leading list markers from checklist excerpts.
- Derived the starting score from the checklist weights so a posting with a signal on every row scores 100. Updated the score explanation in the app and Markdown export.
- Kept API employment metadata when the description only includes a bare employment heading, and quoted funding details when the runway figure appears on a separate line.

## Iteration 4 · 2026-11-23

- Confirmed the iteration 3 GitHub Pages build opens publicly and passes all four live Chromium smoke tests.
- Improved checklist excerpts by favoring separate lines and focusing shared excerpts on the wording each criterion matched.
- Prioritized compensation language for equity evidence and excluded extracted responsibilities.
- Added an employment-type follow-up when the listing and description disagree. The conflict has no effect on the score.
- Flagged explicit pay nondisclosure while keeping bare competitive-pay wording unknown.

## Iteration 3 · 2026-11-23

- Rechecked the public iteration 2 deployment in Chromium. The live founder test waits for the form and retains a trace if a run fails.
- Added room between the brief actions link and the focused heading at desktop and mobile widths.
- Calibrated on 25 public postings and improved reporting-line, workplace and customer-traction evidence.
- Covered hourly contract pay and GBP, EUR and KRW ranges. Generic competitive-salary wording leaves the range unknown.

## Iteration 2 · 2026-11-23

- Verified the public GitHub Pages demo in Chromium and added a standalone smoke suite with screenshots for sample, paste, and founder flows.
- Kept the skip link keyboard-accessible and hid it from full-page captures when unfocused. Trimmed evidence excerpts at word boundaries with ellipses.
- Added axe scans for the empty intake, generated brief, founder template, and shortcuts dialog in light and dark modes.

## Iteration 1 · 2026-11-22

- Built the static role checker with paste input, four fictional samples, public speedrun job lookup, and paste fallback.
- Added evidence-linked assessment, interview questions, Markdown export, share links, and print layouts.
- Added a locally saved founder template with live preview and a handoff into the role checker.
- Added unit and Playwright coverage and six walkthrough screenshots. Configured public GitHub Pages to publish from `main:/docs`.
