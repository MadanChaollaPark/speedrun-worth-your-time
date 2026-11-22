import { escapeMarkdown } from './brief.js';

export const founderFields = [
  { key: 'title', label: 'Role title', posting: 'Role', placeholder: 'Founding Product Engineer' },
  { key: 'company', label: 'Company name or stealth', posting: 'Company', placeholder: 'Company name or Stealth' },
  { key: 'stage', label: 'Funding stage', posting: 'Funding stage', placeholder: 'Seed, bootstrapped, Series A…' },
  { key: 'team', label: 'Team size today', posting: 'Team size today', placeholder: '6 people across engineering, product and operations' },
  { key: 'runway', label: 'Capital raised and runway', posting: 'Funding raised and runway', placeholder: '$3M raised, 18–22 months of runway' },
  { key: 'salary', label: 'Salary range', posting: 'Salary', placeholder: '$140,000–$175,000 USD per year' },
  { key: 'equity', label: 'Equity range (%)', posting: 'Equity', placeholder: '0.3%–0.6% options, or no equity' },
  { key: 'vesting', label: 'Vesting, cliff and exercise window', posting: 'Vesting, cliff and exercise window', placeholder: 'Four years, one-year cliff, 12-month exercise window' },
  { key: 'location', label: 'Location and on-site days', posting: 'Location and on-site days', placeholder: 'Brooklyn, NY · on-site four days a week' },
  { key: 'reporting', label: 'Who they report to', posting: 'Reports to', placeholder: 'CTO, who owns the roadmap with the product lead' },
  { key: 'first90', label: 'First 90 days', posting: 'First 90 days', placeholder: 'What will they own, ship or improve by day 90?', multiline: true },
  { key: 'hard', label: 'What’s genuinely hard', posting: 'What’s genuinely hard', placeholder: 'Where will this person face real constraints or ambiguity?', multiline: true },
  { key: 'interview', label: 'Interview steps and total time', posting: 'Interview process', placeholder: '25-minute call, 60-minute pairing, 30-minute team chat. About two hours total.', multiline: true },
  { key: 'visa', label: 'Visa sponsorship', posting: 'Visa sponsorship', options: ['Yes', 'No', 'Case-by-case'] },
  { key: 'contact', label: 'Contact or apply link', posting: 'Contact or apply link', placeholder: 'https://example.com/apply or a hiring email' },
];

const valueOf = (draft, key) => typeof draft?.[key] === 'string' ? draft[key].trim() : '';

export function founderToText(draft) {
  return founderFields.flatMap(({ key, posting }) => {
    const value = valueOf(draft, key);
    return value ? [posting + ': ' + value] : [];
  }).join('\n\n');
}

export function founderToMarkdown(draft) {
  const title = valueOf(draft, 'title') || 'Honest first-hire brief';
  const entries = founderFields.filter(({ key }) => key !== 'title').flatMap(({ key, posting }) => {
    const value = valueOf(draft, key);
    return value ? ['## ' + posting + '\n\n' + escapeMarkdown(value)] : [];
  });
  return ['# ' + escapeMarkdown(title), ...entries].join('\n\n') + '\n';
}
