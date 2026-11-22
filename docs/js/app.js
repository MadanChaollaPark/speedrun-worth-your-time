import {
  analyze, briefToMarkdown, criteria, decodeShare, encodeShare, isJobSlug,
  normalizeFromApi, normalizeFromText, parseSpeedrunJobUrl,
} from './brief.js';
import { founderFields, founderToMarkdown, founderToText } from './founder.js';
import { samples } from './samples.js';

const $ = id => document.getElementById(id);
const node = (tag, value, className) => {
  const element = document.createElement(tag);
  if (value !== undefined) element.textContent = value;
  if (className) element.className = className;
  return element;
};

function button(label, callback, className) {
  const element = node('button', label, className);
  element.type = 'button';
  element.addEventListener('click', callback);
  return element;
}

const views = { '/': $('check-view'), '/founder': $('founder-view'), '/how': $('how-view') };
const paste = $('paste-input');
const url = $('job-url');
const result = $('result-view');
const generate = $('generate');
const founderPreview = $('founder-preview');
const apiOrigin = 'https://speedrun-talent-network.com';
const founderKey = 'wyt-founder-v1';
const pasteKey = 'wyt-last-v1';
const founderInputs = new Map();
const sampleButtons = new Map();
let selectedSample = null;
let activeRequest = null;
let activeView = '/';
let latestInput = 'paste';
let founderHandoff = null;
let noticeTimer;

function stored(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function persist(key, value) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    // Reading and building a brief still work if storage is disabled or full.
  }
}

function notify(text) {
  const notice = $('notice');
  clearTimeout(noticeTimer);
  notice.textContent = text;
  noticeTimer = setTimeout(() => { notice.textContent = ''; }, 6000);
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    notify(label);
  } catch {
    notify('Clipboard unavailable. You can select the text or use Download .md for the full brief.');
  }
}

function download(text, filename) {
  const link = node('a');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify('Markdown downloaded.');
}

function errorFor(field, message = '') {
  const error = $(field === url ? 'url-error' : 'paste-error');
  error.hidden = !message;
  error.textContent = message;
  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
}

function clearErrors() {
  errorFor(url);
  errorFor(paste);
}

function updateSample(sample = null) {
  selectedSample = sample;
  for (const [id, sampleButton] of sampleButtons) {
    sampleButton.setAttribute('aria-pressed', String(id === sample?.id));
  }
  $('paste-help').hidden = !sample;
}

function loadSample(sample) {
  cancelJob();
  clearErrors();
  paste.value = sample.text;
  url.value = '';
  latestInput = 'paste';
  updateSample(sample);
  showIntake();
}

for (const sample of samples) {
  const pick = button('', () => loadSample(sample), 'sample');
  pick.setAttribute('aria-pressed', 'false');
  const copy = node('span', undefined, 'sample-copy');
  copy.append(node('strong', sample.title), node('span', sample.company, 'sample-company'), node('span', sample.summary));
  const arrow = node('span', '↗', 'sample-arrow');
  arrow.setAttribute('aria-hidden', 'true');
  pick.append(copy, arrow);
  $('samples').append(pick);
  sampleButtons.set(sample.id, pick);
}

function showIntake() {
  views['/'].hidden = false;
  result.hidden = true;
  result.replaceChildren();
  document.title = 'Worth Your Time';
}

function setBusy(busy) {
  generate.disabled = busy;
  generate.setAttribute('aria-busy', String(busy));
  $('intake-status').textContent = busy ? 'Loading the public job posting…' : '';
}

function cancelJob() {
  if (activeRequest) {
    activeRequest.abort();
    activeRequest = null;
  }
  setBusy(false);
}

async function checkJob(slug) {
  cancelJob();
  const request = new AbortController();
  activeRequest = request;
  const timeout = setTimeout(() => request.abort(), 8000);
  setBusy(true);
  let posting;
  try {
    const response = await fetch(apiOrigin + '/api/v1/jobs/' + slug, {
      signal: request.signal,
      credentials: 'omit',
      redirect: 'error',
    });
    if (response.status !== 200) throw new Error('Job request failed');
    const { job } = await response.json();
    posting = normalizeFromApi(job);
    if (posting.status !== 'open' || !posting.description) throw new Error('Job unavailable');
  } catch {
    if (activeRequest === request) {
      errorFor(url, 'We couldn’t load an open posting for this link. Paste the posting text to continue.');
      paste.focus();
    }
    return;
  } finally {
    clearTimeout(timeout);
    if (activeRequest === request) {
      activeRequest = null;
      setBusy(false);
      if (posting?.status === 'open' && posting.description) renderResult(posting, { job: slug });
    }
  }
}

function checkInput(preferred = latestInput) {
  cancelJob();
  clearErrors();
  const text = paste.value.trim();
  const link = url.value.trim();
  if (text && (preferred === 'paste' || !link)) {
    if (!selectedSample) persist(pasteKey, text);
    renderResult(normalizeFromText(text), selectedSample ? { sample: selectedSample.id } : { paste: text });
    return;
  }
  if (!link) {
    errorFor(paste, 'Paste a posting or a speedrun job link first.');
    paste.focus();
    return;
  }
  const job = parseSpeedrunJobUrl(link);
  if (job) {
    checkJob(job.slug);
    return;
  }
  let validUrl = false;
  try {
    validUrl = ['https:', 'http:'].includes(new URL(link).protocol);
  } catch {
    // The inline error below describes the URL format.
  }
  errorFor(url, validUrl
    ? "We don't fetch other sites. Paste the posting text instead."
    : 'Enter a full job link beginning with https://.');
  (validUrl ? paste : url).focus();
}

function shareLink(source) {
  const link = new URL(window.location.href);
  const params = new URLSearchParams();
  if (source.sample) params.set('sample', source.sample);
  else if (source.job) params.set('job', source.job);
  else {
    const encoded = encodeShare(source.paste);
    if (!encoded) return null;
    params.set('paste', encoded);
  }
  link.hash = '/?' + params;
  return link.href;
}

const statusInfo = {
  signal: { word: 'Signal', icon: '✓' },
  risk: { word: 'Risk', icon: '!' },
  unknown: { word: 'Unknown', icon: '?' },
};

function makeLedger(brief) {
  const details = node('details', undefined, 'ledger');
  const rows = node('ul');
  brief.assessment.ledger.forEach(({ delta, reason }, index) => {
    const line = node('li');
    const points = (delta > 0 ? '+' : '') + delta;
    line.append(node('strong', brief.checklist[index].label), node('span', points, 'points'), node('span', reason, 'muted'));
    rows.append(line);
  });
  details.append(node('summary', 'Why this score'), node('p', 'Starts at 50. The final score stays between 0 and 100.', 'muted'), rows);
  return details;
}

function makeChecklist(brief) {
  const section = node('section', undefined, 'result-section');
  section.append(node('h2', 'Signal, Risk and Unknown checklist'));
  const grid = node('ul', undefined, 'checklist');
  for (const item of brief.checklist) {
    const row = node('li', undefined, 'check-item');
    row.dataset.status = item.status;
    const title = node('div', undefined, 'check-item-heading');
    const info = statusInfo[item.status];
    const status = node('span', undefined, 'status-tag ' + item.status);
    const icon = node('span', info.icon, 'status-icon');
    icon.setAttribute('aria-hidden', 'true');
    status.append(icon, node('span', info.word));
    title.append(node('h3', item.label), status);
    row.append(title, node('blockquote', item.evidence), node('p', item.why, 'muted'));
    grid.append(row);
  }
  section.append(grid);
  return section;
}

function makeQuestions(brief) {
  const section = node('section', undefined, 'result-section questions');
  const heading = node('div', undefined, 'section-heading');
  heading.append(node('h2', 'Questions the posting leaves unanswered'));
  if (!brief.unanswered.length) {
    section.append(heading, node('p', 'The checklist found no follow-up questions.'));
    return section;
  }
  heading.append(button('Copy all questions', () => copyText(
    brief.unanswered.map(row => row.question).join('\n'), 'All questions copied.',
  )));
  const list = node('ol', undefined, 'question-list');
  for (const { question, why } of brief.unanswered) {
    const row = node('li');
    const copy = button('Copy', () => copyText(question, 'Question copied.'), 'quiet');
    copy.setAttribute('aria-label', 'Copy question: ' + question);
    const wording = node('div');
    wording.append(node('strong', question), node('p', why, 'muted'));
    row.append(wording, copy);
    list.append(row);
  }
  section.append(heading, list);
  return section;
}

function makeReading(brief) {
  const section = node('section', undefined, 'result-section reading');
  section.append(node('h2', 'Plain-language reading'));
  const facts = node('dl', undefined, 'facts');
  for (const { label, text } of brief.reading.summary) {
    const fact = node('div');
    fact.append(node('dt', label), node('dd', text));
    facts.append(fact);
  }
  section.append(facts);
  if (brief.reading.responsibilities.length) {
    const list = node('ul', undefined, 'responsibilities');
    for (const line of brief.reading.responsibilities) list.append(node('li', line));
    section.append(node('h3', 'What you’d work on'), list);
  }
  if (brief.isEarlyStage) {
    const early = node('details', undefined, 'early-evidence');
    early.append(node('summary', 'Why this looks like an early hire'));
    for (const line of brief.earlyEvidence) early.append(node('blockquote', line));
    section.append(early);
  }
  return section;
}

function renderResult(posting, source) {
  const brief = analyze(posting);
  const title = node('h1', brief.reading.headline, 'result-title');
  title.id = 'result-title';
  title.tabIndex = -1;
  document.title = brief.reading.headline + ' · Worth Your Time';

  const heading = node('header', undefined, 'result-heading');
  const sourceLine = node('p', source.sample ? 'Sample — fictional company' :
    source.job ? 'Source: speedrun talent network public API' : 'Pasted posting', 'eyebrow');
  if (source.job && posting.url) {
    const link = node('a', 'Open original posting ↗');
    link.href = posting.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    sourceLine.append(document.createTextNode(' · '), link);
  }
  heading.append(sourceLine, title);

  const verdict = node('section', undefined, 'verdict verdict-' + brief.status);
  const short = brief.status !== 'ok';
  const assessment = node('div', undefined, 'assessment-main');
  const detail = node('div', undefined, 'assessment-copy');
  detail.append(
    node('p', 'Posting assessment', 'eyebrow'),
    node('h2', brief.assessment.band),
    node('p', short ? 'This posting is too sparse for a verdict. Start with the open questions below.' :
      'This score measures what the posting discloses. Use the open questions to decide what matters for you.', 'muted'),
  );
  const score = node('div', undefined, 'score');
  score.append(node('strong', String(brief.assessment.score)), node('span', '/ 100'), node('small', brief.assessment.confidence + ' confidence'));
  assessment.append(detail, score);
  verdict.append(assessment, makeLedger(brief));

  const actions = node('div', undefined, 'actions result-actions');
  actions.id = 'brief-actions';
  actions.tabIndex = -1;
  actions.setAttribute('role', 'group');
  actions.setAttribute('aria-label', 'Brief actions');
  const jump = node('a', 'Brief actions ↓', 'result-jump');
  jump.href = '#brief-actions';
  jump.addEventListener('click', event => {
    event.preventDefault();
    actions.focus();
  });
  heading.append(jump);
  const markdown = () => briefToMarkdown(brief);
  const share = shareLink(source);
  const shareButton = button('Copy share link', () => copyText(share, 'Share link copied.'));
  const shareHint = node('small', !share ? 'Too long to share as a link, use Copy or Download.' :
    source.paste ? 'A paste link includes the original text.' : '', 'muted share-hint');
  if (!share) shareButton.disabled = true;
  actions.append(
    button('Copy as Markdown', () => copyText(markdown(), 'Brief copied as Markdown.'), 'primary'),
    button('Download .md', () => download(markdown(), 'worth-your-time-brief.md')),
    button('Print', () => window.print()),
    shareButton,
    button('Check another', resetCheck, 'quiet'),
    shareHint,
  );
  result.replaceChildren(heading, verdict, makeReading(brief), makeQuestions(brief), makeChecklist(brief), actions);
  views['/'].hidden = true;
  result.hidden = false;
  title.focus();
}

function resetCheck() {
  cancelJob();
  clearErrors();
  paste.value = '';
  url.value = '';
  latestInput = 'paste';
  updateSample();
  persist(pasteKey, '');
  history.replaceState(null, '', '#/');
  showIntake();
  paste.focus();
}

paste.value = stored(pasteKey) ?? '';
paste.addEventListener('input', () => {
  cancelJob();
  clearErrors();
  latestInput = 'paste';
  if (selectedSample) updateSample();
  persist(pasteKey, paste.value);
});
url.addEventListener('input', () => {
  cancelJob();
  clearErrors();
  latestInput = 'url';
});
paste.addEventListener('keydown', event => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.isComposing) {
    event.preventDefault();
    checkInput('paste');
  }
});
url.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.isComposing) {
    event.preventDefault();
    checkInput('url');
  }
});
generate.addEventListener('click', () => checkInput());

function founderDraft() {
  return Object.fromEntries([...founderInputs].map(([key, field]) => [key, field.value]));
}

function updateFounderPreview(save = true) {
  const draft = founderDraft();
  const text = founderToText(draft);
  if (save) persist(founderKey, text ? JSON.stringify(draft) : '');
  if (!text) {
    founderPreview.replaceChildren(node('p', 'Start with the role title to see your brief here.', 'preview-empty muted'));
  } else {
    const article = node('article', undefined, 'published-brief');
    article.append(node('h3', draft.title.trim() || 'Honest first-hire brief'));
    const facts = node('dl');
    for (const { key, posting } of founderFields) {
      if (key === 'title' || !draft[key].trim()) continue;
      const row = node('div');
      row.append(node('dt', posting), node('dd', draft[key].trim()));
      facts.append(row);
    }
    article.append(facts);
    founderPreview.replaceChildren(article);
  }
  for (const action of $('founder-actions').querySelectorAll('button')) action.disabled = !text;
  $('clear-founder').disabled = !text;
}

let savedDraft = null;
try {
  savedDraft = JSON.parse(stored(founderKey));
} catch {
  // A broken local draft is treated as empty.
}
for (const { key, label, options, multiline, placeholder } of founderFields) {
  const wrapper = node('div', undefined, multiline ? 'full-width' : '');
  const input = node(options ? 'select' : multiline ? 'textarea' : 'input');
  input.id = 'founder-' + key;
  const labelNode = node('label', label);
  labelNode.htmlFor = input.id;
  if (options) {
    const empty = node('option', 'Choose a policy');
    empty.value = '';
    input.append(empty);
    for (const option of options) input.append(node('option', option));
  } else {
    input.placeholder = placeholder;
    if (multiline) input.rows = 3;
  }
  const initial = savedDraft?.[key];
  if (typeof initial === 'string' && (!options || options.includes(initial))) input.value = initial;
  input.addEventListener('input', () => updateFounderPreview());
  wrapper.append(labelNode, input);
  $('founder-fields').append(wrapper);
  founderInputs.set(key, input);
}
updateFounderPreview(false);

$('clear-founder').addEventListener('click', () => $('clear-dialog').showModal());
$('cancel-clear').addEventListener('click', () => $('clear-dialog').close());
$('confirm-clear').addEventListener('click', () => {
  for (const field of founderInputs.values()) field.value = '';
  updateFounderPreview();
  $('clear-dialog').close();
  founderInputs.get('title').focus();
  notify('Draft cleared.');
});
$('copy-founder').addEventListener('click', () => copyText(founderToMarkdown(founderDraft()), 'Founder brief copied.'));
$('download-founder').addEventListener('click', () => download(founderToMarkdown(founderDraft()), 'honest-first-hire-brief.md'));
$('print-founder').addEventListener('click', () => window.print());
$('check-founder').addEventListener('click', () => {
  founderHandoff = founderToText(founderDraft());
  location.hash = '/';
});

for (const { label, reward, penalty } of criteria) {
  const row = node('tr');
  const criterion = node('th', label);
  criterion.scope = 'row';
  row.append(criterion, node('td', '+' + reward), node('td', '−' + penalty), node('td', '0'));
  $('weights').append(row);
}

let shortcutReturnFocus;
const shortcuts = $('shortcuts');
function openShortcuts() {
  if (shortcuts.open || $('clear-dialog').open) return;
  shortcutReturnFocus = document.activeElement;
  shortcuts.showModal();
}
$('open-shortcuts').addEventListener('click', openShortcuts);
$('close-shortcuts').addEventListener('click', () => shortcuts.close());
shortcuts.addEventListener('close', () => shortcutReturnFocus?.focus());
document.addEventListener('keydown', event => {
  if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey &&
      !event.target.closest?.('input, textarea, select, [contenteditable]')) {
    event.preventDefault();
    openShortcuts();
  }
});
document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  $('main').focus();
});

function route(initial = false) {
  cancelJob();
  clearErrors();
  const hash = location.hash.slice(1);
  const [path, query] = hash.startsWith('paste=') ? ['/', hash] : hash.split('?');
  activeView = Object.hasOwn(views, path) ? path : '/';
  for (const [key, view] of Object.entries(views)) view.hidden = key !== activeView;
  for (const nav of document.querySelectorAll('[data-nav]')) {
    if (nav.dataset.nav === activeView) nav.setAttribute('aria-current', 'page');
    else nav.removeAttribute('aria-current');
  }
  result.hidden = true;
  result.replaceChildren();
  if (activeView !== '/') {
    const heading = views[activeView].querySelector('h1');
    document.title = heading.textContent + ' · Worth Your Time';
    if (!initial) heading.focus();
    return;
  }

  showIntake();
  if (founderHandoff) {
    const text = founderHandoff;
    founderHandoff = null;
    renderResult(normalizeFromText(text), { paste: text });
    return;
  }
  const params = new URLSearchParams(query);
  if (params.has('sample')) {
    const sample = samples.find(entry => entry.id === params.get('sample'));
    if (sample) {
      loadSample(sample);
      renderResult(normalizeFromText(sample.text), { sample: sample.id });
      return;
    }
    errorFor(paste, 'This sample is unavailable. Choose one below or paste a posting.');
  } else if (params.has('paste')) {
    const text = decodeShare(params.get('paste'));
    if (text) {
      updateSample();
      paste.value = text;
      url.value = '';
      latestInput = 'paste';
      renderResult(normalizeFromText(text), { paste: text });
      return;
    }
    errorFor(paste, 'This share link couldn’t be read. Paste the posting text to continue.');
  } else if (params.has('job')) {
    const slug = params.get('job');
    if (isJobSlug(slug)) {
      url.value = apiOrigin + '/jobs/' + slug;
      latestInput = 'url';
      checkJob(slug);
      return;
    }
    errorFor(url, 'This job link couldn’t be read. Paste a valid job link or the posting text.');
  }
  if (!initial) $('check-title').focus();
}
for (const link of document.querySelectorAll('a[href="#/"]')) {
  link.addEventListener('click', event => {
    if (location.hash === '#/' && !result.hidden) {
      event.preventDefault();
      showIntake();
      paste.focus();
    }
  });
}
window.addEventListener('hashchange', () => route());
route(true);
