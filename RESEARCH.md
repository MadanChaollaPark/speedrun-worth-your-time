# Research: a16z speedrun Talent Team — Product Engineer (Contractor)

Captured 2026-11-22 22:52–22:59 KST on the box, with a full Playwright Chromium render of the JS-driven application and a read of the hydrated `TalentSystemsPitch` client bundle. **No form was submitted.** Submit calls to `/api/talent-systems/submit` were blocked in the browser. Screenshots live in `research/screenshots/`.

Source page: https://speedrun-talent-network.com/product-engineer/
User link: https://speedrun-talent-network.com/product-engineer/#step-3

The page is an Astro island (`TalentSystemsPitch`) with hash routing `#step-N` (N = 1–9). The marketing “How it works” list has three public steps; the actual wizard has an intro plus **8 form stages** (progress reads “Step X of 8”). Deep-linking past an unfilled required stage is clamped backward — `#step-7` and later stay on `#step-6` until the ideas field is filled. `#pitch` is an alias for stage 5 (Your Idea). `#step-3` is **not** “Tell us about yourself”; it is **“Where This Could Go”** (progress: “Step 2 of 8”).

The site’s `<meta name="robots" content="noindex, nofollow">`. Role: in-person contractor in San Francisco; students and co-ops welcome.

---

## Role and values (intro, `#step-1`)

Headline: “The a16z speedrun Talent Team Is Hiring a Product Engineer.”

a16z speedrun invests up to $1M in new startups and backs them with customers and talent. The talent team helps speedrun founders build their early teams — the first engineers, designers, and operators.

What drives us:

1. **Founders first.** Hiring an early team is hard, and it matters. We help founders do it well.
2. **Early teams, built right.** The first hires shape everything that comes after. We help get them right.
3. **Job hunting sux.** For job seekers and founders alike. We build tools that are genuinely useful to job seekers, not ads for our own companies, and that trust is what earns us the right to point people to speedrun roles worth their time.

The Product Engineer would own the products candidates and founders use, end to end: from the idea and the design to shipping and deploying it.

How it works (marketing list):

1. See what we've built.
2. Share one idea, with a link.
3. Tell us about yourself.

CTA: **Get started**.

---

## Wizard map (exact labels, observed in the live UI and confirmed in the client bundle)

Progress titles (`Ke`): 1 Intro, 2 What We've Built, 3 Where This Could Go, 4 Who We're Looking For, 5 Your Idea, 6 The Short Version, 7 Resume or GitHub, 8 About You, 9 Logistics.

Nav: **← Back**, **Continue** (Press Enter), final button **Send your pitch**. Drafts autosave to `localStorage` key `tsp-draft-v1`. A hidden honeypot field is named `fax`.

### Stage 2 / `#step-2` — “Job Hunting Sux. Here's What We've Built So Far.” (public step 1)

Copy: “We run a jobs board, signup and profiles, salary and layoff tools, job hunting sux, and an MCP server for AI agents.” “Not pictured: the tools speedrun founders use to hire from the network. Those stay behind the curtain, but you'd work on them too.”

| Tile | Path | What it is (official blurb) |
|---|---|---|
| Jobs board | `/jobs` | Searchable board of open roles at speedrun companies. Filter by function, location, remote work, and posted pay, then go straight to the role. |
| Signup and profiles | `/join` | The way into the speedrun talent network. Sign up once; keep a profile up to date. |
| Salary tool | `/founding-engineer-salary` | Founding engineer pay from real job postings with posted pay bands: median, typical band, and the open founding roles behind them. |
| Layoffs tracker | `/layoffs` | Tech layoffs since March 2020, with headcounts, industries, and sources. Every event links to companies that are hiring. |
| job hunting sux | https://www.jobhuntingsux.com/ | Substack about finding and landing great jobs across tech: open roles, startup spotlights, job-search advice. |
| MCP server for AI agents | `/developers` | Public read API and remote MCP server over the jobs board: live roles, hiring companies, and comp data. No auth, no keys. |

Observed live (2026-11-22 KST), not from memory:

- Jobs board title: “Startup jobs across the a16z portfolio · search 22,800+ open roles.” Live count on the page: **22,844** open roles across the a16z portfolio plus wider market. Scopes include a16z portfolio + wider market / a16z speedrun / Everywhere. The board also advertises two talent-team roles, both in person in SF: this Product Engineer contract, and “Partner 18, Talent, Speedrun” (full-time recruiting).
- Join: “welcome to the a16z speedrun talent network”; join to be considered for roles at 300+ a16z speedrun startups; free for candidates; a partner introduces you to founders. ~1 minute to join. “Hundreds of placements.”
- Salary tool: “Founding Engineer Salary & Equity (2026).” Data from **35 real startup job postings** with posted pay bands, computed live from the speedrun and a16z portfolio jobs board. No survey, no self-reported numbers. Median posted salary **$200k**; typical posted band **$160k–$227k**; **82** open founding roles; **9%** open to remote. Clear distinction: a founding engineer is an early employee (salary + options), not a founder.
- Layoffs tracker: “Every tech layoff since March 2020, and the 2,318 companies hiring on the other side of each one.” 2026 reported headcounts **710,357+**; 2026 events **938**; companies tracked **3,413** since March 2020; AI-company share **15%** of 2026 events.
- Developers: REST API at `https://speedrun-talent-network.com/api/v1` (OpenAPI at `/api/v1/openapi.json`), open CORS, no auth, edge-cached 1–5 minutes. Endpoints for jobs, companies, collections, hiring stats. Optional `?source=` stamps UTM on job URLs. MCP at `mcp.speedrun-talent-network.com`. Stealth companies are masked in the query layer.
- Network stats (`/network`): **197,000+** in the network; **3,146** joined this month; **42%** of recent signups “founding-curious”; **17%** currently students. Engineering 88,914+ (63%), Design 58,362+ (41%), Data & ML 26,029+ (18%), Product 25,719+ (18%), and more.
- jobhuntingsux.com is Jordan Mazer’s Substack. A recent homepage item mentioned a Sunday speedrun-related deadline for a *different* program (dropouts / recent grads). Do not conflate that with this Product Engineer contractor application.

### Stage 3 / `#step-3` — “Where This Could Go”  ← the user’s hash

This is the inspiration board, not the bio form.

Copy: “There are a lot of directions we could take this. The goal is to help both founders and job seekers, and a handful of products out there have really inspired us.”

- **For job seekers:** [career-ops](https://github.com/career-ops-hq/career-ops) is an open-source job search agent that runs in your terminal. It scores each job against your CV and tailors your resume, and you still press Submit. [Tsenta](https://tsenta.com/) is an AI career agent that finds roles that fit and applies for you.
- **For both sides:** [Jack & Jill](https://www.jackandjill.ai/) gives each side of the market its own AI agent. Jack works for the job seeker, Jill works for the company, and together they make the introduction.
- **For founders:** [Juicebox](https://juicebox.ai/) and [Paraform](https://www.paraform.com/) help founders hit their hiring goals: Juicebox with AI search and sourcing agents, Paraform by putting their hardest roles in front of a network of expert recruiters.
- **A nod to** [gstack](https://github.com/garrytan/gstack). “It has nothing to do with hiring, but it is genuinely useful to builders, and that kind of usefulness builds a brand people want to work with.”

Next up: “What you'd build.”

### Stage 4 / `#step-4` — “Who We're Looking For”

“One person who can take an idea all the way to a live product.”

| Trait | Body |
|---|---|
| Product | You can spot what's broken for job seekers and decide what's worth building. |
| Design | You have taste, and what you make looks and feels right. |
| Ship | You get it live, deployment included, using AI tools to move fast. |
| Lived It | You've been a job seeker recently and know the pain firsthand. |

“No specific tech stack required. Recruiting experience is neither necessary nor preferred.”

### Stage 5 / `#step-5` — “Your Idea” / “We Want Your Opinion” (public step 2, the link)

Goals they want the idea to move:

1. Help more job seekers find work they love.
2. Grow the network: more signups, and more people landing jobs, at speedrun companies and beyond.
3. Bring more great founders to speedrun and the speedrun alpha fellowship.

Prompt: “Show us how you'd move one of those, by improving something we've already built or by building something new. Your idea is the best window into how you think and where you'd spend your time and calories.”

**Field: `demo_url`**

- Label: **Your link**
- Helper: “Send one link: a concept, mockup, demo, or anything that shows your thinking.”
- Badge: “This is optional!!!”
- Placeholder: `https://`
- Type: url
- Extra hint: “Make sure it opens without requesting access.”
- On blur the client POSTs to `/api/talent-systems/link-check`. Status messages: “Opens without a login. Nice.” / “Heads up: this looks like it asks for access or a login. Make sure it opens for anyone with the link.” / “We couldn't open this link. Double-check it loads in a private window.” / “That looks like a private or local address. Use a public link.”
- Validation if present: must be a public web address (“That link doesn't look like a web address.”). Optional — may be left blank.

### Stage 6 / `#step-6` — “The Short Version” / “What Should We Change, Improve, or Add?”

**Field: `ideas` (required)**

- Label / heading: **What Should We Change, Improve, or Add?**
- Helper: “Anything candidate-facing: the jobs board, signup, profiles, intros, our tools and content, or something we don't do yet. Or how we could help speedrun founders hire better.”
- `<textarea id="tsp-ideas" name="ideas" rows="6" maxLength="1500">`
- Counter: `0 / 1500`
- Empty error: “This is the pitch. Tell us what you would build.”
- Over-limit error: “Keep it under 1500 characters.”

This is the written idea, complementary to the optional link on the previous stage. Together they are public step 2 (“Share one idea, with a link.”).

### Stage 7 / `#step-7` — “Your Resume or GitHub”

Heading: “Your Resume or GitHub.” Helper: “Share a resume, your GitHub, or both. At least one.”

- **Resume** (`resume_id` via upload): “We'll use it to fill in what we can. You can edit everything.” Drop zone: “Drop your resume here” / “PDF, DOCX, or TXT, up to 5 MB.” / “Choose file.” Accept: pdf, docx, txt. Max 5 MB (“That file is over 5 MB.”). POST `/api/talent-systems/resume`. May prefill name/email/linkedin/github/website. Messages include “Filled N field(s) from it. Give them a look.” and “Uploaded. We couldn't read the details, so fill them in yourself.”
- **Your GitHub** (`github_url`): placeholder `github.com/`. Validated as a github.com profile. POST `/api/talent-systems/github`. Success: “Found @login with N public repos. Top: ….” 404: “We couldn't find that GitHub profile. Double-check the username.”
- If neither: “Share a resume or a GitHub. Both is even better.”

### Stage 8 / `#step-8` — “About You” (public step 3, first half)

| Field | Label | Notes |
|---|---|---|
| `email` (required) | Your email | type=email, placeholder `name@email.com`, max 254. Error: add a valid email. |
| `full_name` (required) | Your full name | max 120. Error: “Add your name.” |
| `linkedin_url` (required) | Your LinkedIn profile | placeholder `linkedin.com/in/`. Must be a linkedin.com/in/ profile. Errors: “Add your LinkedIn.” / “Use your linkedin.com/in/ profile link.” |
| `website_url` (optional) | Your personal website | helper “Optional.” placeholder `https://` |
| `shipped_url` (required) | Something you've built and shipped | helper “A live product, repo, app store page, or demo video.” placeholder `https://`. Error: “Link something you've shipped.” |

### Stage 9 / `#step-9` — “Last Few Questions” (public step 3, logistics)

| Field | Label | Options / rules |
|---|---|---|
| `region` (required, single) | Where do you live? | North America; Central / South America; Europe; Africa; Asia; Australia. Error: “Pick where you live.” |
| `availability` (required, multi) | When could you work with us? | Helper: “Pick any that fit.” Options: “Full-time, starting now”; “Spring 2027 (co-op or semester off)”; “Summer 2027”; “Part-time during the school year.” |
| `sponsorship` (required, yes/no) | Will you need visa sponsorship to work in the US? | Yes / No |
| `usage` (required, multi) | How have you used the speedrun talent network so far? | Helper: “Pick any that fit.” Options: “Joined the network”; “Browsed the jobs board”; “Went for a role I found there”; “Read job hunting sux”; “Saw a jobs list on LinkedIn”; “Haven't used it yet”. “Haven't used it yet” cannot be combined with the others. |
| `join_network` (required if not already a member) | Want us to add you to the speedrun talent network too? | Yes / No. Helper: “One profile, every founder. We'd set it up from what you've shared here.” Hidden if a `tn_me` cookie indicates an existing member (prefill via `/api/talent-systems/prefill`). |

Final CTA: **Send your pitch**. Errors: “A few things need a look above.” / “Something went wrong on our side. Your answers are still here, try again.” / “Network hiccup. Your answers are still here, try again.”

**Do not submit this form. Do not contact anyone.**

---

## Product decision (locked for this build)

Do **not** clone the jobs board, salary tool, layoff tracker, newsletter, signup, or MCP server. Do **not** clone career-ops, Tsenta, Jack & Jill, Juicebox, or Paraform.

The hole that matches their own words (“roles worth their time”) and is not already a product of theirs: job seekers can *find* early-stage roles and even see posted pay, but they still cannot tell, in a few minutes, whether a specific founding / first-hire role is actually worth applying to — what the post leaves unsaid, which questions to walk in with, and whether the trade (scope, risk, equity, runway, constraints) is honest.

**Product name: Worth Your Time**

A free, public, keyboard-friendly web app. A job seeker pastes a job URL or the posting text and gets a structured brief in about five minutes: a plain-language reading of the role, the questions the posting does not answer, a risk-and-signal checklist, and an explained (not magical) assessment of whether it is worth their time. If the URL is a role on the speedrun talent jobs board, the app should use their **public, no-auth** jobs API (`/api/v1/jobs/{id}`) rather than scraping. Otherwise the paste path is enough. Ship a founder-facing “honest first-hire brief” template so a founder can publish the answers seekers actually need. Original visual design. Static-first so it can go live on GitHub Pages.

This is a new candidate-facing tool, not an ad, and it can also sit beside their existing board (improve something they've built *and* build something new).

---

## Evidence index

- Playwright screenshots: `research/screenshots/00_intro.png`, `01_after_get_started.png`, `step_01.png`–`step_06.png` (live stages 1–6), `user_link_step_3.png`, and `site_*.png` for built products.
- Live text and field JSON: `research/step_N_text.txt`, `research/step_N_fields.json`, `research/site_*_text.txt`, `research/playwright_findings.json`.
- Client bundle used only as a local research artifact to confirm later-stage field labels after hash-gating: `research/TalentSystemsPitch.CFp3g4Y4.js` (gitignored; not for redistribution). Stages 1–6 in that bundle matched the live UI exactly.
