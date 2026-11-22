import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  analyze, briefToMarkdown, criteria, decodeShare, encodeShare,
  normalizeFromApi, normalizeFromText, parseSpeedrunJobUrl,
} from '../../docs/js/brief.js';
import { founderToMarkdown, founderToText } from '../../docs/js/founder.js';
import { apiFixture, samples } from '../../docs/js/samples.js';
import { founderDraft, hostileText } from '../fixtures.js';

const fromText = text => analyze(normalizeFromText(text));
const row = (brief, id) => brief.checklist.find(item => item.id === id);
const excerptText = evidence => evidence.replace(/^… | …$/g, '');

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

test('long evidence trims whole words on both sides of its match', () => {
  const line = 'Our onboarding includes a series of hands-on workshops for new engineers across the product organization. ' +
    'We use TypeScript for the scheduling tools that help dispatchers coordinate multiple locations and give clinic administrators a reliable view of their queue. ' +
    'The systems are deployed weekly alongside improvements proposed by clinic staff across the pilot program.';
  const { evidence } = row(fromText(line), 'stack');
  assert.match(evidence, /^… .+ …$/);
  assert.ok(evidence.length <= 160);
  const excerpt = evidence.slice(2, -2);
  assert.match(excerpt, /\bTypeScript\b/);
  const start = line.indexOf(excerpt);
  assert.ok(start > 0);
  assert.match(line[start - 1], /\s/);
  assert.match(line[start + excerpt.length], /\s/);
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
  const sum = brief.assessment.ledger.reduce((total, row) => total + row.delta, 50);
  assert.equal(brief.assessment.score, Math.min(100, Math.max(0, sum)));
  assert.equal(brief.assessment.ledger.length, criteria.length);
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
