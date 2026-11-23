import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  analyze, BASELINE, briefToMarkdown, criteria, decodeEntities, decodeShare, encodeShare,
  normalizeFromApi, normalizeFromText, parseSpeedrunJobUrl,
} from '../../docs/js/brief.js';
import { founderToMarkdown, founderToText } from '../../docs/js/founder.js';
import { apiFixture, samples } from '../../docs/js/samples.js';
import { founderDraft, hostileText } from '../fixtures.js';

const fromText = text => analyze(normalizeFromText(text));
const row = (brief, id) => brief.checklist.find(item => item.id === id);
const excerptText = evidence => evidence.replace(/^… | …$/g, '');
const pastedSample = samples[2].text.replace('Paper Comet Systems', 'Pencil Cloud Studio');
const ledgerTotal = brief => brief.assessment.ledger.reduce((total, { delta }) => total + delta, BASELINE);

test('founding role is detailed, early and supported by verbatim evidence', () => {
  const { text } = samples[0];
  const brief = fromText(text);
  assert.equal(brief.isEarlyStage, true);
  assert.equal(brief.assessment.band, 'Worth a conversation');
  assert.equal(row(brief, 'salary').status, 'signal');
  assert.equal(row(brief, 'equity').status, 'signal');
  for (const { evidence } of brief.checklist) {
    assert.ok(evidence.length <= 160);
    if (evidence !== 'Not mentioned in the posting') {
      assert.ok(text.includes(excerptText(evidence)), evidence);
    }
  }
});

test('long evidence starts at a sentence boundary when it fits before the match', () => {
  const line = 'Our onboarding includes a series of hands-on workshops for new engineers across the product organization. ' +
    'We use TypeScript for the scheduling tools that help dispatchers coordinate multiple locations and give clinic administrators a reliable view of their queue. ' +
    'The systems are deployed weekly alongside improvements proposed by clinic staff across the pilot program.';
  const { evidence } = row(fromText(line), 'stack');
  assert.match(evidence, /^… We use TypeScript\b/);
  assert.ok(evidence.length <= 160);
  assert.ok(line.includes(excerptText(evidence)));
});

test('a long three-sentence line ends at the last complete sentence that fits', () => {
  const first = 'We use TypeScript for the intake tools.';
  const second = 'The tools help clinic staff track available appointments.';
  const third = 'The operations group also keeps a shared calendar for weekly planning and coordinates schedule changes with the outreach group.';
  const line = [first, second, third].join(' ');
  assert.ok(line.length >= 220);
  assert.equal(row(fromText(line), 'stack').evidence, `${first} ${second}`);
});

test('a single long sentence cuts at a whole word and adds an ellipsis', () => {
  const line = 'We use TypeScript to help clinic administrators find and remove duplicate bookings across multiple locations during busy seasons ' +
    'when patients call about changes and need staff to confirm their updated appointment details by phone.';
  const { evidence } = row(fromText(line), 'stack');
  assert.ok(line.length >= 200);
  assert.match(evidence, / …$/);
  assert.ok(evidence.length <= 160);
  const excerpt = excerptText(evidence);
  assert.ok(line.startsWith(excerpt));
  assert.match(line[excerpt.length], /\s/);
});

test('a long line keeps the complete salary range near the end', () => {
  const line = 'Base salary reflects the scope of the position and the experience needed to guide the technical roadmap. '.repeat(2) +
    'The range for this role is $135,000 to $170,000 USD per year.';
  const { evidence } = row(fromText(line), 'salary');
  assert.match(evidence, /^… .+\$135,000 to \$170,000 USD per year\.$/);
  assert.ok(evidence.length <= 160);
});

test('short evidence is returned unchanged', () => {
  const line = 'You will work with React and TypeScript.';
  assert.equal(row(fromText(line), 'stack').evidence, line);
});

test('shared evidence has a distinct excerpt around each criterion’s anchor', () => {
  const line = 'We are a team of 6; we are at seed stage, and we have 12 paying customers.';
  const brief = fromText(line);
  const expected = {
    team: 'We are a team of 6 …',
    funding: '… we are at seed stage …',
    traction: '… we have 12 paying customers.',
  };
  for (const [id, excerpt] of Object.entries(expected)) {
    assert.equal(row(brief, id).evidence, excerpt);
    assert.ok(line.includes(excerptText(excerpt)), excerpt);
  }
});

test('founding sample reporting stops at the clause before the team anchor', () => {
  assert.equal(row(fromText(samples[0].text), 'reporting').evidence, 'You report directly to the CTO …');
});

test('founding sample team evidence begins at its own clause and includes both collaborators', () => {
  assert.equal(row(fromText(samples[0].text), 'team').evidence,
    '… work with our product designer and the dispatch team at a pilot operator.');
});

test('paste sample funding excerpt ends at the sentence punctuation', () => {
  assert.equal(row(fromText(pastedSample), 'funding').evidence, 'We are a Series B vendor portal company.');
});

test('sample evidence never puts an ellipsis after sentence punctuation', () => {
  for (const { title, text } of samples) {
    for (const { label, evidence } of fromText(text).checklist) {
      assert.doesNotMatch(evidence, /[.!?] …$/, `${title}: ${label}`);
    }
  }
});

test('paste sample keeps the customer count in the milestone and traction excerpts', () => {
  const brief = fromText(pastedSample);
  assert.equal(row(brief, 'success').evidence, 'First 90 days: Launch the guided importer to 30 existing customers …');
  assert.match(row(brief, 'traction').evidence, /30 existing customers/);
});

test('list markers are omitted from the displayed stack evidence', () => {
  const line = 'Build the import tool in TypeScript';
  for (const marker of ['- ', '* ', '• ', '1. ', '1) ']) {
    assert.equal(row(fromText(marker + line), 'stack').evidence, line, marker);
  }
});

test('funding prefers a separate evidence line even when the shared line comes first', () => {
  const funding = 'Funding stage: seed.';
  const brief = fromText('We are a team of 6 at seed stage with 12 paying customers.\n' + funding);
  assert.equal(row(brief, 'funding').evidence, funding);
  assert.match(row(brief, 'team').evidence, /team of 6/);
  assert.match(row(brief, 'traction').evidence, /12 paying customers/);
});

test('funding quotes the seed round when runway is stated on a separate line', () => {
  const funding = 'We raised a $4M seed round.';
  const runway = 'We have 22 months of runway.';
  for (const posting of [funding + '\n' + runway, runway + '\n' + funding]) {
    const finding = row(fromText(posting), 'funding');
    assert.equal(finding.status, 'signal');
    assert.equal(finding.evidence, funding);
    assert.equal(finding.why, 'The posting gives a funding detail and also states a runway figure.');
  }
});

test('later criteria prefer unused lines that support the same finding', () => {
  const team = 'The product team has 6 engineers.';
  const traction = 'Over 12 organizations use our scheduling service.';
  const brief = fromText(`We are a team of 6 at seed stage with 12 paying customers.\n${team}\n${traction}`);
  assert.equal(row(brief, 'team').evidence, team);
  assert.equal(row(brief, 'traction').evidence, traction);
});

test('rockstar language earns a caution with useful questions about missing terms', () => {
  const { text } = samples[1];
  const brief = fromText(text);
  assert.equal(brief.assessment.band, 'Proceed with caution');
  assert.ok(['unknown', 'risk'].includes(row(brief, 'salary').status));
  assert.ok(brief.unanswered.length >= 6);
  assert.equal(row(brief, 'hours').status, 'risk');
  assert.ok(text.includes(excerptText(row(brief, 'hours').evidence)));
  assert.ok(brief.unanswered.some(item => item.question.includes('next funding round')));
});

test('Moonbutton quotes the schedule separately from equity and broad scope', () => {
  const brief = fromText(samples[1].text);
  const hours = row(brief, 'hours').evidence;
  const equity = row(brief, 'equity').evidence;
  assert.equal(brief.assessment.score, 26);
  assert.match(hours, /nights and weekends/);
  assert.notEqual(hours, equity);
  assert.match(equity, /equity-heavy/);
  assert.equal(row(brief, 'scope').evidence, "You'll wear many hats.");
});

test('soft intensity wording still earns a risk without a schedule match', () => {
  const hours = row(fromText('We move fast and want a rockstar.'), 'hours');
  assert.equal(hours.status, 'risk');
  assert.match(hours.evidence, /rockstar/);
});

test('soft intensity in candidate qualifications leaves hours unknown', () => {
  for (const text of [
    'Requirements:\n- Experience in a fast-paced environment',
    '## Qualifications\n- Ability to navigate a fast-paced environment',
    'What you bring\n- Motivation to keep up with a fast-paced environment',
    'Nice to have:\n- Previous work at a fast-paced company',
    '1. 3+ years in a fast-paced environment',
    '- You’ve worked in fast-paced teams',
  ]) {
    assert.equal(row(fromText(text), 'hours').status, 'unknown', text);
  }
});

test('expanded qualifications headings keep soft intensity out of hours evidence', () => {
  for (const text of [
    "What you'll bring:\n- Comfort in a fast-paced startup",
    'About you\n- Ability to thrive in a fast-paced team',
    '## What we’re looking for:\n- A portfolio of fast-paced projects',
    'You might be a fit if\n- A fast-paced studio sounds appealing',
    'Who you are\n- A maker who enjoys a fast-paced team',
  ]) {
    assert.equal(row(fromText(text), 'hours').status, 'unknown', text);
  }
});

test('qualification prefixes keep soft intensity out of hours evidence without a heading', () => {
  for (const text of [
    '- Comfort in a fast-paced startup',
    '- Comfort with a fast-paced schedule',
    '- Comfortable working in a fast-paced studio',
    '- Strong judgment in fast-paced teams',
    '- Proven results in fast-paced teams',
    '- Ability to thrive in a fast-paced team',
  ]) {
    assert.equal(row(fromText(text), 'hours').status, 'unknown', text);
  }
});

test('nights and weekends still count under What you’ll bring', () => {
  const hours = row(fromText("What you'll bring:\n- Happy to work nights and weekends during launches"), 'hours');
  assert.equal(hours.status, 'risk');
  assert.match(hours.evidence, /nights and weekends/);
});

test('schedule pressure still counts under requirements and soft wording counts after the section', () => {
  const explicit = row(fromText('Requirements:\n- Comfortable working nights and weekends'), 'hours');
  assert.equal(explicit.status, 'risk');
  assert.match(explicit.evidence, /nights and weekends/);

  const soft = row(fromText('Requirements:\n- Work in a fast-paced environment\nAbout us\nWe move fast and want a rockstar.'), 'hours');
  assert.equal(soft.status, 'risk');
  assert.equal(soft.evidence, 'We move fast and want a rockstar.');
});

test('an explicit Series B stage supersedes a small squad size', () => {
  const brief = fromText(samples[2].text);
  assert.equal(brief.isEarlyStage, false);
  assert.deepEqual(brief.earlyEvidence, []);
  assert.ok(!brief.unanswered.some(item => /next few hires|next funding round/.test(item.question)));
});

test('a thin post receives low confidence and no actionable verdict band', () => {
  const brief = fromText(samples[3].text);
  assert.equal(brief.status, 'thin');
  assert.equal(brief.assessment.band, 'Not enough to judge');
  assert.equal(brief.assessment.confidence, 'low');
});

test('blank and whitespace-only description produce an empty brief', () => {
  for (const input of ['', ' \n\t ', null, undefined]) assert.equal(fromText(input).status, 'empty');
});

test('missing pay and location remain unknown even in a long posting', () => {
  const brief = fromText(`Role: Product Designer
Company: Star Cairn
Responsibilities
- Design a new intake experience for vendors using our invoicing console.
- Work with the product team to build and test the prototypes.
- Prototype the reporting tools for recurring users.
The design system is maintained by the adjacent checkout group. We plan to deprecate the old navigation in the spring while coordinating feedback from a range of communities.`);
  assert.equal(row(brief, 'salary').status, 'unknown');
  assert.equal(row(brief, 'location').status, 'unknown');
  assert.ok(brief.unanswered.some(item => /salary range/.test(item.question)));
  assert.ok(brief.unanswered.some(item => /Where can I work/.test(item.question)));
});

test('media interviews leave the interview row unknown without a quote', () => {
  const interview = row(fromText('Our founder has given media interviews about logistics.'), 'interview');
  assert.equal(interview.status, 'unknown');
  assert.equal(interview.evidence, 'Not mentioned in the posting');
});

test('scam warnings are excluded even when they mention hiring steps', () => {
  for (const line of [
    'We will never ask for payment or bank details during interviews.',
    'We will never ask candidates for payment during the 30-minute interview.',
  ]) {
    const interview = row(fromText(line), 'interview');
    assert.equal(interview.status, 'unknown');
    assert.equal(interview.evidence, 'Not mentioned in the posting');
  }
});

test('concrete interview steps count when a call is recorded', () => {
  const line = 'Interview: take-home, then a recorded 30 minute founder call.';
  const interview = row(fromText(line), 'interview');
  assert.equal(interview.status, 'signal');
  assert.match(interview.evidence, /take-home/);
});

test('a recording or transcription policy alone leaves interview steps unknown', () => {
  for (const line of [
    'Interviews may be recorded for note-taking.',
    'Candidates can request an interview transcript.',
  ]) {
    const interview = row(fromText(line), 'interview');
    assert.equal(interview.status, 'unknown');
    assert.equal(interview.evidence, 'Not mentioned in the posting');
  }
});

test('a scam warning below an interview heading does not count as a step', () => {
  const interview = row(fromText('Interview process\n- We will never ask for payment during the 30-minute interview.'), 'interview');
  assert.equal(interview.status, 'unknown');
  assert.equal(interview.evidence, 'Interview process');
});

test('an interview heading quotes the introductory call after an unrelated interview mention', () => {
  const line = '30 minute intro call with the founder';
  const posting = `Our founder has given media interviews about logistics.\nInterview process\n- ${line}`;
  const interview = row(fromText(posting), 'interview');
  assert.equal(interview.status, 'signal');
  assert.equal(interview.evidence, line);
});

test('undisclosed hiring steps leave the interview row unknown with a quote', () => {
  const line = 'We share the interview steps after you apply.';
  const interview = row(fromText(line), 'interview');
  assert.equal(interview.status, 'unknown');
  assert.equal(interview.evidence, line);
});

test('structured API fields normalize and missing fields remain null', () => {
  const job = normalizeFromApi(apiFixture);
  assert.equal(job.source, 'api');
  assert.equal(job.title, apiFixture.title);
  assert.equal(job.company, apiFixture.company);
  assert.equal(job.location, apiFixture.location);
  assert.equal(job.workplace, apiFixture.workplace_type);
  assert.equal(job.employment, apiFixture.employment_type);
  assert.equal(job.comp, '140,000–175,000 USD / year');
  assert.equal(job.description, apiFixture.description_text);
  assert.equal(job.labels, apiFixture.labels);
  assert.equal(job.url, apiFixture.url);
  assert.equal(job.applyUrl, apiFixture.apply.url);
  assert.equal(job.publishedAt, apiFixture.published_at);
  assert.equal(job.status, 'open');
  assert.equal(row(analyze(job), 'salary').status, 'signal');
  const partial = normalizeFromApi({ description_text: null, company: null, comp_min: null });
  assert.equal(partial.company, null);
  assert.equal(partial.comp, null);
  assert.equal(analyze(partial).status, 'empty');
  assert.equal(normalizeFromApi(null).description, '');
});

test('API salary evidence decodes an encoded dash', () => {
  const job = normalizeFromApi({ description_text: 'Pay $90,000&ndash;$120,000 USD' });
  const salary = row(analyze(job), 'salary');
  assert.equal(salary.status, 'signal');
  assert.match(salary.evidence, /\$90,000–\$120,000/);
  assert.doesNotMatch(salary.evidence, /&ndash;/);
});

test('HTML entities decode once and invalid or unknown entities stay literal', () => {
  assert.equal(decodeEntities('Tom &amp; Jerry&nbsp;Inc &#8212; &#x2019; &amp;lt; &bogus; &#0; &#xD800;'),
    'Tom & Jerry Inc — ’ &lt; &bogus; &#0; &#xD800;');
  assert.equal(decodeEntities('&amp;&lt;&gt;&quot;&#39;&apos;&nbsp;&ndash;&mdash;&lsquo;&rsquo;&ldquo;&rdquo;&hellip;&bull;'),
    '&<>"\'\' –—‘’“”…•');
  assert.equal(decodeEntities('&#9;&#xA;&#x1F680;'), '\t\n🚀');
  const invalid = '&#13; &#x1F; &#127; &#x9F; &#xDFFF; &#x110000;';
  assert.equal(decodeEntities(invalid), invalid);
});

test('API text fields decode entities and preserve decoded markup as text', () => {
  const encodedMarkup = '&lt;img src=x onerror=alert(1)&gt;';
  const job = normalizeFromApi({
    title: 'Design &amp; Product Engineer',
    company: 'Aster &amp; Elm',
    location: 'Remote&nbsp;EU',
    comp_summary: '$90,000&ndash;$120,000 USD',
    description_text: encodedMarkup,
  });
  assert.equal(job.title, 'Design & Product Engineer');
  assert.equal(job.company, 'Aster & Elm');
  assert.equal(job.location, 'Remote EU');
  assert.equal(job.comp, '$90,000–$120,000 USD');
  assert.equal(job.description, '<img src=x onerror=alert(1)>');
  assert.equal(normalizeFromText(encodedMarkup).description, encodedMarkup);
});

test('board job URLs permit only exact hosts and public slug routes', () => {
  for (const input of [
    'https://speedrun-talent-network.com/jobs/my-job-1234abcd',
    'http://www.speedrun-talent-network.com/jobs/my-job-1234abcd/?utm=abc#test',
    '  https://speedrun-talent-network.com/jobs/my-job-1234abcd/  ',
  ]) assert.deepEqual(parseSpeedrunJobUrl(input), { slug: 'my-job-1234abcd' }, input);
  for (const input of [
    null, 'javascript:alert(1)', 'data:text/html,test', 'ftp://speedrun-talent-network.com/jobs/x',
    'https://speedrun-talent-network.com.evil.io/jobs/x', 'https://evil.io/speedrun-talent-network.com/jobs/x',
    'https://speedrun-talent-network.com@evil.io/jobs/x', 'https://evil.io@speedrun-talent-network.com/jobs/x',
    'https://speedrun-talent-network.com:8080/jobs/x', 'https://speedrun-talent-network.com/jobs/x/y',
    'https://speedrun-talent-network.com/jobs/', 'https://speedrun-talent-network.com/jobs/%2E%2E',
    'https://speedrun-talent-network.com/jobs/ContainsCaps', '//speedrun-talent-network.com/jobs/x',
  ]) assert.equal(parseSpeedrunJobUrl(input), null, String(input));
});

test('hostile markup remains plain data and Markdown escapes it', () => {
  const brief = fromText('Role: Product Engineer\nResponsibilities\n- Build ' + hostileText);
  assert.equal(brief.reading.responsibilities[0], 'Build ' + hostileText);
  const markdown = briefToMarkdown(brief);
  assert.doesNotMatch(markdown, /<(?:script|img)/i);
  assert.match(markdown, /&lt;script&gt;/);
  const output = founderToMarkdown({ title: hostileText, contact: '[click](javascript:alert(1))' });
  assert.doesNotMatch(output, /<(?:script|img)|\]\(javascript:/i);
});

test('UTF-8 share URL round-trips and rejects invalid or oversized content', () => {
  const input = '서울에서 일해요 🌿 · ₩92,000,000';
  const encoded = encodeShare(input);
  assert.match(encoded, /^[A-Za-z0-9_-]+$/);
  assert.equal(decodeShare(encoded), input);
  for (const bad of ['', '%*garbage', 'a', '_w', encoded + '=']) assert.equal(decodeShare(bad), null);
  assert.equal(encodeShare(' '.repeat(80)), null);
  assert.equal(encodeShare('x'.repeat(6001)), null);
  assert.equal(decodeShare(encodeShare('한'.repeat(6000))), '한'.repeat(6000));
});

test('analysis is deterministic and the score equals its ledger', () => {
  const posting = normalizeFromText(samples[0].text);
  const brief = analyze(posting);
  assert.deepEqual(analyze(posting), brief);
  const sum = ledgerTotal(brief);
  assert.equal(brief.assessment.score, Math.min(100, Math.max(0, sum)));
  assert.equal(brief.assessment.ledger.length, criteria.length);
});

test('a fictional posting with all signals reaches 100 without the clamp', () => {
  const brief = fromText(pastedSample + '\nEquity: 0.4% options with four-year vesting.\nWe work a 40-hour week.');
  assert.equal(brief.status, 'ok');
  assert.deepEqual(brief.checklist.filter(item => item.status !== 'signal'), []);
  assert.equal(ledgerTotal(brief), 100);
  assert.equal(brief.assessment.score, 100);
  assert.ok(briefToMarkdown(brief).includes(`Starts at ${BASELINE}. A posting with a signal on every checklist row scores 100.`));
});

test('paste sample score reflects its missing equity and hours', () => {
  const brief = fromText(pastedSample);
  assert.equal(row(brief, 'equity').status, 'unknown');
  assert.equal(row(brief, 'hours').status, 'unknown');
  assert.ok(brief.assessment.score < 95);
  assert.equal(ledgerTotal(brief), brief.assessment.score);
});

test('founder template maps complete fields to a top-band brief and omits empty fields', () => {
  const text = founderToText(founderDraft);
  const brief = fromText(text);
  assert.equal(brief.assessment.band, 'Worth a conversation');
  assert.equal(row(brief, 'salary').status, 'signal');
  assert.equal(row(brief, 'visa').status, 'signal');
  assert.match(founderToMarkdown(founderDraft), /^# Founding Product Engineer\n/);
  assert.equal(founderToText({ title: '  ', salary: null }), '');
  assert.equal(fromText(founderToText({})).status, 'empty');
});

test('negated overtime and broad-scope language do not become risks', () => {
  const brief = fromText(`Role: Product Engineer
We do not wear many hats.
No nights and weekends. Standard business hours.
Responsibilities
- Build a clear intake page for renewal requests.
- Maintain the existing reminder service.`);
  assert.equal(row(brief, 'scope').status, 'signal');
  assert.equal(row(brief, 'hours').status, 'signal');
});

test('unknown currency or pay cadence does not get guessed, and API links must be HTTPS', () => {
  const job = normalizeFromApi({
    url: 'javascript:alert(1)', apply: { url: 'http://example.com' },
    comp_min: 45, comp_max: 65, comp_period: 'hour',
  });
  assert.equal(job.comp, '45–65 / hour');
  assert.equal(job.compCurrency, null);
  assert.equal(job.url, null);
  assert.equal(job.applyUrl, null);
});

test('pay extraction selects a later numeric range over generic benefits language', () => {
  const brief = fromText('We offer competitive compensation.\nCompensation\n$95,000–$125,000 annually');
  assert.equal(row(brief, 'salary').status, 'signal');
  assert.equal(row(brief, 'salary').evidence, '$95,000–$125,000 annually');
  assert.equal(brief.reading.summary.find(fact => fact.label === 'Pay').text, '$95,000–$125,000 annually');
});

test('financial reporting does not count as the role’s reporting line', () => {
  const description = 'Role: Product Engineer\nBuild tools for teams that handle bookkeeping and reporting to auditors.';
  assert.equal(row(fromText(description), 'reporting').status, 'unknown');
  const explicit = row(fromText(description + '\nReporting to: Head of Engineering'), 'reporting');
  assert.equal(explicit.status, 'signal');
  assert.equal(explicit.evidence, 'Reporting to: Head of Engineering');
  assert.equal(row(fromText('You’ll be reporting to our CTO.'), 'reporting').status, 'signal');
});

test('hybrid cloud terminology does not supply workplace evidence', () => {
  const description = 'Deploy our monitoring agents across hybrid cloud infrastructure.';
  assert.equal(row(fromText(description), 'location').status, 'unknown');
  assert.equal(normalizeFromText('Hybrid cloud operations are our focus.').location, null);
  const brief = analyze(normalizeFromApi({
    description_text: description, location: 'Bristol, UK', workplace_type: 'Hybrid',
  }));
  assert.equal(row(brief, 'location').evidence, 'Bristol, UK');
  assert.equal(brief.reading.summary.find(fact => fact.label === 'Where and how').text, 'Bristol, UK · Hybrid');
});

test('a count of organizations using the product is evidence of traction', () => {
  const line = 'Over 180 organizations use our scheduling service each week.';
  const traction = row(fromText(line), 'traction');
  assert.equal(traction.status, 'signal');
  assert.equal(traction.evidence, line);
  assert.equal(row(fromText('We hope 180 organizations will use our scheduling service.'), 'traction').status, 'unknown');
});

test('a pasted hourly range retains both bounds and discloses a fixed-term contract', () => {
  const pay = '$80–$120/hr, 6-month contract';
  const posting = normalizeFromText('Role: Product Engineer\nLocation: Remote\n' + pay);
  const brief = analyze(posting);
  assert.equal(posting.employment, 'contract');
  assert.equal(row(brief, 'salary').status, 'signal');
  assert.equal(row(brief, 'salary').evidence, pay);
  assert.equal(brief.reading.summary.find(fact => fact.label === 'Pay').text, pay);
});

test('pasted GBP and EUR pay ranges retain their original currencies and amounts', () => {
  for (const pay of ['£70,000 – £90,000', '€65k–€80k']) {
    const brief = fromText('Role: Product Engineer\n' + pay);
    assert.equal(row(brief, 'salary').status, 'signal', pay);
    assert.equal(brief.reading.summary.find(fact => fact.label === 'Pay').text, pay);
  }
});

test('pasted won ranges are preserved verbatim', () => {
  for (const pay of ['₩60,000,000–₩80,000,000', 'KRW 60M–80M']) {
    const brief = fromText('Role: Product Engineer\n' + pay);
    assert.equal(row(brief, 'salary').status, 'signal', pay);
    assert.equal(brief.reading.summary.find(fact => fact.label === 'Pay').text, pay);
  }
});

test('salary ranges with encoded dashes are recognized in API and pasted text', () => {
  for (const [entity, dash] of [['&ndash;', '–'], ['&mdash;', '—'], ['&#8211;', '–'], ['&#x2014;', '—']]) {
    const pay = `$93,500${entity}$118,250 USD`;
    const description = 'Annual Salary Range\n' + pay;
    const apiSalary = row(analyze(normalizeFromApi({ description_text: description })), 'salary');
    const pastedSalary = row(fromText(description), 'salary');
    assert.equal(apiSalary.status, 'signal', entity);
    assert.equal(apiSalary.evidence, `$93,500${dash}$118,250 USD`);
    assert.equal(pastedSalary.status, 'signal', entity);
    assert.equal(pastedSalary.evidence, pay);
  }
});

test('competitive salary without amounts leaves the range unknown and asks for it', () => {
  const brief = fromText('Role: Product Engineer\nCompetitive salary');
  assert.equal(row(brief, 'salary').status, 'unknown');
  assert.equal(row(brief, 'salary').evidence, 'Competitive salary');
  assert.ok(brief.unanswered.some(item => item.question === 'What is the salary range for this role?'));
});

test('an equity product responsibility leaves the candidate’s equity unknown', () => {
  const duty = 'Build the equity cap table view for our customers';
  const brief = fromText(`Role: Product Engineer\nResponsibilities\n- ${duty}`);
  assert.ok(brief.reading.responsibilities.includes(duty));
  assert.equal(row(brief, 'equity').status, 'unknown');
  assert.doesNotMatch(row(brief, 'equity').evidence, /cap table/);
  assert.ok(brief.unanswered.some(item => /equity range/.test(item.question)));
});

test('candidate equity in a compensation line takes precedence over product duties', () => {
  const pay = 'Compensation: $150k–$180k + 0.5%–1.0% equity, 4-year vesting, 1-year cliff';
  const brief = fromText('Role: Product Engineer\nResponsibilities\n- Build the equity cap table view for our customers\n' + pay);
  assert.equal(row(brief, 'equity').status, 'signal');
  assert.match(row(brief, 'equity').evidence, /0\.5%–1\.0% equity/);
  assert.doesNotMatch(row(brief, 'equity').evidence, /cap table/);
});

test('equity without a percentage prefers an offer line to product context', () => {
  const offer = 'Benefits: We offer stock options.';
  const brief = fromText('Our software helps customers understand equity.\n' + offer);
  assert.equal(row(brief, 'equity').status, 'risk');
  assert.equal(row(brief, 'equity').evidence, offer);
});

test('investor names and internal pay equity do not describe candidate ownership', () => {
  const company = 'Funding came from Tern Harbor Equity Partners.';
  const compensation = 'Base salary reflects leveling and internal equity.';
  for (const line of [company, compensation]) {
    assert.equal(row(fromText(line), 'equity').status, 'unknown', line);
  }
  const offer = 'Employees can receive stock options.';
  const brief = fromText([company, compensation, offer].join('\n'));
  assert.equal(row(brief, 'equity').status, 'risk');
  assert.equal(row(brief, 'equity').evidence, offer);
});

test('API employment conflicts show both sources and a question without affecting the score', () => {
  const description_text = apiFixture.description_text + '\nThis is a 6-month contract.';
  const brief = analyze(normalizeFromApi({ ...apiFixture, description_text }));
  const matching = analyze(normalizeFromApi({ ...apiFixture, description_text, employment_type: 'Contractor' }));
  assert.match(brief.reading.summary.find(fact => fact.label === 'Where and how').text,
    /Full-time \(listing\) · contract \(description\)/);
  assert.ok(brief.unanswered.some(item => item.question === 'The listing says full-time but the description says contract. Which is it, and does it convert?'));
  assert.deepEqual(brief.assessment, matching.assessment);
});

test('API and description employment aliases agree without an extra question', () => {
  const description_text = apiFixture.description_text + '\nEmployment: full time.';
  const brief = analyze(normalizeFromApi({ ...apiFixture, description_text }));
  assert.match(brief.reading.summary.find(fact => fact.label === 'Where and how').text, /Full-time$/);
  assert.ok(!brief.unanswered.some(item => item.question.startsWith('The listing says')));
});

test('a bare Contract heading does not override the API listing type', () => {
  const description_text = apiFixture.description_text + '\nContract\nWe sign a standard offer letter and IP agreement.';
  const brief = analyze(normalizeFromApi({ ...apiFixture, employment_type: 'full_time', description_text }));
  assert.equal(brief.reading.summary.find(fact => fact.label === 'Where and how').text, 'Chicago, IL · hybrid · full_time');
  assert.ok(!brief.unanswered.some(item => item.question.startsWith('The listing says')));
});

test('a client contract in the responsibilities does not describe the job type', () => {
  const description_text = apiFixture.description_text + '\nResponsibilities\n- Manage a 6-month contract with the client.';
  const brief = analyze(normalizeFromApi({ ...apiFixture, description_text }));
  assert.ok(!brief.unanswered.some(item => item.question.startsWith('The listing says')));
});

test('competitive pay with an explicitly withheld range is a risk', () => {
  const line = 'Competitive pay, no range';
  const brief = fromText('Role: Product Engineer\n' + line);
  assert.equal(row(brief, 'salary').status, 'risk');
  assert.equal(row(brief, 'salary').evidence, line);
});

test('TBD and expressly undisclosed pay are risks; unrelated discussion is not', () => {
  for (const line of ['Salary TBD', 'Salary: TBD', 'Range not shared', 'Pay is to be discussed']) {
    assert.equal(row(fromText('Role: Product Engineer\n' + line), 'salary').status, 'risk', line);
  }
  assert.equal(row(fromText('Interview steps to be discussed.'), 'salary').status, 'unknown');
});
