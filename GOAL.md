# GOAL (shared brief for every agent in this loop)

Project: **Worth Your Time** — an original, free, public web app for job seekers (and early-team founders) applying to the a16z speedrun talent team Product Engineer contractor role.

Work directory: `/workspace/speedrun-pe` only. Do not touch `/workspace/garamjigi` or `/workspace/kumgang`. Other tasks share this box; leave `speedrun_pe_loop.py` alone.

Applicant: Madan Chaolla Park (GitHub: MadanChaollaPark). He is building 16ram.com, a local AI model + CRM for religious communities, with 4 Korean temples and Radhadesh as users. Do not invent other personal facts.

The application page (JS-rendered, researched in RESEARCH.md): https://speedrun-talent-network.com/product-engineer/

Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex gpt-6.2-sol at high reasoning effort / slow mode, by owner decision 2026-11-22; do not revert

## Hard rules

- This is a clean-room original product. Do not copy the speedrun talent network’s visual design, layout, CSS, assets, copy, or code. Do not vendor their JS. Research screenshots and notes are reference only.
- Do **not** submit the Product Engineer form, or any other form, to anyone. Do not email, message, post, tweet, or contact a16z, speedrun, founders, or anyone else. Do not sign in to their site.
- Network use: public docs and package installs, their **public no-auth** jobs API if used as a data source, and GitHub/git as the driver instructs. No paid APIs. No scraping that violates terms. No secrets in the repo.
- Leave git commits, tags, and pushes to the driver. Leave `speedrun_pe_loop.py` to the owner.
- Times are KST. The driver checks the cutoff only at the top of a round; finish an in-flight round if the deadline passes. Last 75 minutes are package mode (docs, draft, deploy, tests — no new features).
- A first PASS does not end the 20-hour loop early. Keep polishing until the cutoff, then package.
- Claim verification only after running the command or test and checking its result. Never fake results.
- Draft `APPLICATION_DRAFT.md` but never submit it.

## What to build

Read `RESEARCH.md` first (Playwright-backed; exact prompts and existing products). The locked product is **Worth Your Time**:

A job seeker pastes a job URL or posting text and gets a structured “is this worth my time?” brief in about five minutes: a plain-language reading of the role, the questions the posting leaves unanswered, a risk-and-signal checklist for early-stage / first-hire roles, and an explained (not magical) assessment. If the URL is a role on the speedrun talent jobs board, use their public `/api/v1` (no auth) instead of scraping. Always support a paste-only path and shipped sample postings so the app works without a network call. Include a founder-facing “honest first-hire brief” template a founder can fill and share. Keyboard-friendly. Original visual design. Static-first (or a static export) so it can go live on GitHub Pages.

Do not clone their jobs board, salary tool, layoff tracker, newsletter, signup, or MCP, and do not clone career-ops, Tsenta, Jack & Jill, Juicebox, or Paraform.

## Definition of Done

Every item is required for a completion PASS.

1. **Research captured.** `RESEARCH.md` records the live page, existing products, inspiration board, and exact step 2 / step 3 prompts and fields, with sources. Keep it accurate if anything is re-checked.
2. **Working product.** End-to-end: paste URL or text (and open a sample), generate a useful brief, view/print/share or copy the result, and fill the founder honest-brief template. Keyboard flow (tab order, Enter where it helps, focus management, shortcuts documented). Works with realistic sample postings including at least one founding/early-hire style role.
3. **Tests.** Automated unit tests for the brief logic (including missing-field / weak-posting cases and API-shaped input) and a scripted Playwright (or equivalent) walkthrough with saved screenshots for: (a) sample posting → brief, (b) pasted text → brief, (c) founder honest-brief template. The driver must be able to run the suites; document the exact commands in the README and `STATE/TEST_COMMANDS` (one command per line).
4. **Live public link.** Deploy to GitHub Pages from this repo (preferred). Vercel/Netlify via CLI only if already logged in — they were not, at loop start. The link must open without a login. Record the URL in the README and `APPLICATION_DRAFT.md`.
5. **Quality and original design.** It should look and feel considered, not a default framework theme and not a copy of the talent-network site. Clear writing, empty and error states, no invented company data presented as fact. If the app uses their public API, handle failure and fall back to paste. No committed secrets, and a brief security pass (XSS on pasted job text, open redirects, unexpected HTML).
6. **Application draft only.** `APPLICATION_DRAFT.md` contains: (a) the step-2 written pitch (`ideas`, ≤1500 characters) plus the demo link; (b) answers for About You / Last Few Questions, using known facts and **placeholders in ALL-CAPS** for anything unknown (location region, visa sponsorship, availability, LinkedIn, personal website, whether he has used the network, whether to join the network, resume, etc.). Known: name Madan Chaolla Park; GitHub MadanChaollaPark; 16ram.com as described above; shipped_url can point at 16ram.com and/or this product. Do not submit.
7. **Docs.** README (what it is, how to run, test, and deploy), a short product write-up of the idea and what is not in v1, and a changelog or round notes as needed.

Each reviewer grades these items with evidence. Any failed or skipped required test is FAIL. A clean test run with unmet requirements is PARTIAL. PASS is only when the entire Definition of Done is verified in that round, including the live link.

## Deliverables (all under /workspace/speedrun-pe)

- `RESEARCH.md` — evidence-backed research (started before the loop).
- The app (source, tests, walkthrough screenshots).
- Public GitHub repo and GitHub Pages URL.
- `APPLICATION_DRAFT.md` — draft only.
- `README.md` and any needed docs.

Files used by the loop: `STATE/PLAN.md` (orchestrator), `STATE/BUILD_REPORT.md` (builder), `STATE/REVIEW.md` (reviewer), `STATE/CHECKLIST.md` (orchestrator owns; every deliverable with TODO / IN-PROGRESS / VERIFIED + evidence), `LOOP_LOG.md` (driver owns; do not edit).

The driver owns per-round commits, tags (`vNN-iterNN`), and pushes to the public repository `speedrun-worth-your-time`.
