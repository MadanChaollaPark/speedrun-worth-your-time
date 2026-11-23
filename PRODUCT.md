# Worth Your Time

Job discovery gets a candidate to a posting. Worth Your Time helps with the next decision. In one view, a seeker can read the role, see evidence for what the company disclosed, and take concrete questions to the first call. The founder template gives early teams a place to write those answers before publishing the role.

## Who it serves

- Seekers comparing where to spend their time, especially when a first-hire role combines broad ownership with uncertain compensation, runway, or support.
- Founders writing an early job posting who need to communicate practical terms, clear outcomes, and the hardest part of the work.

## How the assessment is computed

The score starts at 42, which is 100 minus the sum of the signal weights. A posting with a signal on every checklist row scores 100. The engine adds or subtracts the weights below and keeps the result between 0 and 100. Unknown criteria add zero. Each criterion includes a reason and a short excerpt when there is one. Pay and location may also come from structured API fields. Exposure to risk depends on the candidate’s own circumstances.

| Criterion | Signal | Risk | Unknown |
| --- | ---: | ---: | ---: |
| Posted salary range | +8 | −4 | 0 |
| Equity and terms | +6 | −4 | 0 |
| Funding and runway | +5 | −5 | 0 |
| Team and collaborators | +4 | −3 | 0 |
| Reporting line | +3 | −3 | 0 |
| Scope clarity | +7 | −8 | 0 |
| First-quarter outcomes | +5 | −4 | 0 |
| Interview process | +5 | −3 | 0 |
| Location and office time | +5 | −4 | 0 |
| Hours and intensity | +3 | −14 | 0 |
| Visa sponsorship | +2 | −3 | 0 |
| Customers and traction | +3 | −4 | 0 |
| Technical stack | +2 | −2 | 0 |

The same weights appear in the app. Some criteria currently recognize only a clear statement or an unknown, so the risk weight is reserved until a rule identifies a specific risk for that criterion. Checklist excerpts prefer a separate supporting line when one is available. When rows share a line, the excerpts focus on the wording that supports each finding. Shortened excerpts use sentence boundaries when they fit. Hours evidence gives priority to explicit schedule pressure, such as required weekends, then uses softer intensity wording if necessary. Equity evidence skips extracted responsibilities and gives priority to compensation language. Reporting-line evidence looks for an explicit manager or reporting relationship, and a stated count of organizations using the product contributes to traction. Office details and structured job location take precedence over general workplace wording. When the listing and description conflict on employment type, the brief shows both and adds a follow-up question with no effect on the score. Bare competitive-pay wording leaves the range unknown. An explicit statement that the range is withheld, undecided, or to be discussed is a risk. An explicit sponsorship policy is a signal of disclosure whichever answer it gives.

API titles, company names, locations, pay summaries, and descriptions decode supported HTML entities once and are displayed as text. Interview evidence accepts concrete stages such as a recorded founder call. A recording or transcription policy alone leaves the steps unknown. Media mentions and scam warnings are excluded. Qualification headings such as “What you’ll bring” and phrases such as “Comfort in” keep soft intensity wording out of the hours row. Explicit schedule pressure such as nights and weekends still counts.

- **70–100** · Worth a conversation
- **50–69** · Worth it if they answer the open questions
- **0–49** · Proceed with caution

A posting under 350 characters or with fewer than three of five core facts gets **Not enough to judge**. The core facts are a pay range, location or work arrangement, responsibilities, team or funding details, and interview steps or timing. Confidence is low below five observed criteria, medium at five to eight, and high at nine or more. Thin postings always have low confidence. Early hiring language adds follow-up questions about runway and ownership when appropriate.

The pure engine exposes `normalizeFromText`, `normalizeFromApi`, `parseSpeedrunJobUrl`, `analyze`, `briefToMarkdown`, `encodeShare` and `decodeShare` in `docs/js/brief.js`. `docs/js/founder.js` exposes `founderToText` and `founderToMarkdown`. The heuristics are English-first and depend on the wording supplied.

## V1 scope

One role at a time, fictional examples, a public speedrun job detail lookup, and draft/export tools. The scope excludes accounts, LLMs, scraping of other job sites, résumé matching, and a jobs board.

## Fit with the talent team’s goals

- **Help seekers find work they love.** A short list of role-specific questions helps someone test whether scope, support and terms align with what they want.
- **Grow the network and help people land jobs.** A role brief can make an existing speedrun listing easier to act on. The paste path gives candidates a reason to use and share the tool for roles across the market. Track repeat use and whether people report taking a next step.
- **Bring more great founders to speedrun and the alpha fellowship.** A free template gives founders something they can use before their first hire. Track whether founders publish the brief and whether candidates report that it answered common screening questions.

See [the captured application prompt](RESEARCH.md#stage-5--step-5--your-idea--we-want-your-opinion-public-step-2-the-link) for the goals.
