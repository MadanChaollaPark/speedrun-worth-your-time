const jobHost = 'speedrun-talent-network.com';
const slugPattern = /^[a-z0-9-]+$/;
const missing = 'Not mentioned in the posting';
const shareLimit = 6000;

const textValue = value => typeof value === 'string' && value.trim() ? value.trim() : null;
const linesOf = text => text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
const matchLine = (lines, pattern) => lines.find(line => pattern.test(line));
const workMode = /\b(?:hybrid(?![- ]+(?:multi[- ]?cloud|cloud)\b)|remote|on[- ]?site|in[- ]office|in[- ]person)\b/i;
const apiEmploymentLabels = new Map([['FullTime', 'Full-time'], ['PartTime', 'Part-time'], ['Intern', 'Internship']]);
const employmentType = /\b(?:full[- ]time|part[- ]time|contract(?:or)?|internship|temporary)\b/i;
const fixedTermContract = /\b\d+[- ](?:days?|weeks?|months?|years?)[- ](contract)\b/i;
const moneyUnit = '(?:[$€£¥₩]\\s*|(?:USD|CAD|AUD|GBP|EUR|KRW)\\s+)';
const amount = '\\d+(?:[,.]\\d+)*\\s*[kKmM]?';
const payRange = new RegExp(
  moneyUnit + amount + '\\s*(?:[-–—~]|to|and)\\s*(?:' + moneyUnit + ')?' + amount +
  '|' + amount + '\\s*(?:[-–—~]|to|and)\\s*' + amount + '\\s*(?:USD|CAD|AUD|GBP|EUR|KRW|\\/\\s*(?:h|hr|hour|year|yr|month)\\b)',
  'i',
);
const cashAmount = new RegExp(moneyUnit + amount, 'i');
const payHeading = /^(?:base )?(?:compensation|salary|pay range|pay band)\s*:?$/i;
const payLabel = /\b(?:base (?:pay|salary)|salar(?:y|ies)|(?:cash |base )?compensation|pay (?:range|band|rate)|hourly (?:pay|rate)|annual pay)\b/i;

export function parseSpeedrunJobUrl(input) {
  if (typeof input !== 'string' || !/^https?:\/\//i.test(input.trim())) return null;
  try {
    const url = new URL(input);
    const match = url.pathname.match(/^\/jobs\/([a-z0-9-]+)\/?$/);
    if (['http:', 'https:'].includes(url.protocol) &&
        [jobHost, 'www.' + jobHost].includes(url.hostname) &&
        !url.port && !url.username && !url.password && match) {
      return { slug: match[1] };
    }
  } catch {
    return null;
  }
  return null;
}

export function safeHttpsUrl(input) {
  if (typeof input !== 'string' || !/^https:\/\//i.test(input.trim())) return null;
  try {
    const url = new URL(input);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function normalizeFromText(text) {
  const description = textValue(text) ?? '';
  const first = linesOf(description).slice(0, 9);
  const field = pattern => first.find(line => pattern.test(line))?.replace(pattern, '').trim();
  const firstLine = first[0]?.replace(/^#{1,6}\s+/, '');
  const titleLike = firstLine?.length <= 95 && !/[.!?:]$/.test(firstLine) &&
    /\b(?:engineer(?:ing hire)?|designer|manager|lead|developer|analyst|specialist|operator|researcher|scientist|director|recruiter|coordinator|architect|consultant|officer|accountant|writer|associate|intern)\b/i.test(firstLine) &&
    !/^(?:company|location|team|salary|about|we |you )\b/i.test(firstLine);
  const named = titleLike ? firstLine.match(/^(.+?)\s+(?:at|\|)\s+(.+)$/i) : null;
  const location = field(/^(?:location(?: and on-site days)?|based in)\s*[:：]\s*/i) ??
    first.find(line => line.length < 100 && workMode.exec(line)?.index === 0) ?? null;
  const comp = getPayLine(linesOf(description)) ?? null;
  const employment = field(/^(?:employment(?: type)?|job type)\s*[:：]\s*/i) ||
    first[1]?.match(employmentType)?.[0] || comp?.match(fixedTermContract)?.[1] || null;
  return {
    source: 'paste',
    title: field(/^(?:job title|role title|position|role|title)\s*[:：]\s*/i) || named?.[1] || (titleLike ? firstLine : null),
    company: field(/^(?:company|employer|organization)\s*[:：]\s*/i) || named?.[2] || null,
    location: location || null,
    workplace: location?.match(workMode)?.[0] ?? null,
    employment,
    comp,
    description,
  };
}

const validAmount = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const formatAmount = value => value.toLocaleString('en-US', { maximumFractionDigits: 4 });

export function normalizeFromApi(job) {
  const { comp_min: low, comp_max: high } = job ?? {};
  const compMin = validAmount(low) ? low : null;
  const compMax = validAmount(high) ? high : null;
  const currency = textValue(job?.comp_currency);
  const period = textValue(job?.comp_period);
  const normalizedRange = compMin !== null && compMax !== null && compMin < compMax;
  let amountText = null;
  if (normalizedRange) amountText = formatAmount(compMin) + '–' + formatAmount(compMax);
  else if (compMin !== null && compMax === compMin) amountText = formatAmount(compMin);
  else if (compMin !== null && compMax === null) amountText = 'From ' + formatAmount(compMin);
  else if (compMax !== null && compMin === null) amountText = 'Up to ' + formatAmount(compMax);
  const summary = textValue(job?.comp_summary);
  return {
    source: 'api',
    title: textValue(job?.title),
    company: textValue(job?.company),
    location: textValue(job?.location),
    workplace: textValue(job?.workplace_type) ?? (job?.remote === true ? 'remote' : null),
    employment: textValue(job?.employment_type),
    comp: summary ?? (amountText ? [amountText, currency, period ? '/ ' + period : null].filter(Boolean).join(' ') : null),
    compSummary: summary,
    compRange: normalizedRange,
    compMin,
    compMax,
    compCurrency: currency,
    compPeriod: period,
    description: textValue(job?.description_text) ?? '',
    labels: job?.labels && typeof job.labels === 'object' && !Array.isArray(job.labels) ? job.labels : null,
    url: safeHttpsUrl(job?.url),
    applyUrl: safeHttpsUrl(job?.apply?.url),
    publishedAt: textValue(job?.published_at),
    status: textValue(job?.status),
  };
}

const action = /^(?:(?:you(?:['’]ll| will)|we expect you to)\s+)?(?:build|ship|design|write|lead|own|maintain|deliver|create|drive|develop|implement|support|work with|partner|improve|scale|shape|debug|test|deploy|operate|hire|mentor|define|run|launch|audit|publish|set up|reduce|document|collaborate|prototype|review|plan|measure|track|migrate|integrate|establish|take ownership|diagnose|facilitate|manage|coordinate|analyze|conduct|train)\b/i;
const roleHeading = /^(?:\d+\.\s*)?(?:key )?(?:responsibilities|what you(?:['’]ll| will) do|your (?:role|impact|responsibilities)|in this role)\s*:?$/i;
const otherHeading = /^(?:#{1,6}\s+|[\w /&’'-]{2,45}:$)|^(?:requirements|qualifications|what you bring|what we offer|benefits|nice to have|about (?:us|you)|compensation|our team|how to apply|interview process|preferred qualifications)\s*:?$/i;
const laterStage = /\b(?:series [b-h]|publicly traded|post[- ]ipo)\b/i;
const smallTeam = /\b(?:(?:[1-9]|1[0-2])[- ]person team|team of (?:[1-9]|1[0-2])\b)\b/i;
const earlyPattern = /\b(?:founding (?:[\w-]+ ){0,3}(?:hire|engineer|team|designer|member|role)|(?:first|first few|first \d+|one of (?:our |the )?first)\s+(?:[\w-]+\s+){0,2}(?:engineers?|engineering hires?|hires?|employees?)|pre[ -]?seed|seed(?:[- ](?:stage|funded|round)|\b(?!\s+(?:data|files|phrase)))|series a\b|employee\s*#\s*\d+|0\s*(?:to|[-–→])\s*1)\b/i;
const fundingPattern = /\b(?:pre[ -]?seed|seed(?:[- ](?:stage|funded|round)|\b(?!\s+(?:data|files|phrase)))|series\s+[a-h]\b|bootstrapped|funding\s*(?:raised|stage|:)|(?:runway[^.\n]{0,45}\d|\d[^.\n]{0,35}\brunway)|backed by|raised\s+[$€£¥₩]|named investors)\b/i;
const runwayPattern = /\b(?:\d+(?:\s*[-–]\s*\d+)?\s*(?:months?|years?)\s+(?:of\s+)?(?:cash\s+)?runway|runway\s*(?::|is|of|today)?\s*\d)/i;
const numericEquity = /\d+(?:\.\d+)?\s*%/;
const optionTerms = /\b(?:exercis\w*|strike(?: price)?|409a)\b/i;
const equityPattern = /\b(?:equity|stock options|share options|employee options|rsus?)\b/i;
const noEquity = /\b(?:no (?:equity|stock options)|equity\s*:\s*(?:none|no)\b|(?:equity|stock options) (?:is |are )?not (?:offered|included|available))\b/i;
const vesting = /\b(?:vest(?:ing|s|ed)?|cliff)\b/i;
const vagueScope = /\b(?:wear (?:many|multiple|all) hats|whatever it takes|do it all|everything from(?= .* to .*\b)|anything and everything|no job is too small)\b/i;
const timePressure = /\b(?:crunch|hustle|grind|work hard|(?:move|work) at breakneck speed|(?:6|six)[ -]days|(?:nights and weekends|weekends (?:expected|required))|long hours|(?:50|55|60|65|70|80)\+?\s*hours|always on|rockstar|fast[ -]paced)\b/i;
const regularHours = /\b(?:no (?:routine )?(?:nights|weekends|after-hours|overtime)|standard (?:working|business) hours|\d{1,2}[- ]hour (?:work)?week|on-call (?:rotation|schedule))\b/i;
const interview = /\b(?:interview(?:s|ing)?|hiring process|recruiter screen|phone screen|take[- ]home|technical screen|onsite loop)\b/i;
const stageDetail = /\b(?:screen|intro(?:ductory)? call|(?:founder|team|technical|panel|final|pairing) (?:call|chat|session|interview)|portfolio review|take[- ]home|\d+\s*(?:minutes?|hours?|weeks?|days?|rounds?|steps?)|\d+\s*min\b|paid exercise|work sample|pair programming|→)\b/i;
const placeholder = /^(?:tbd|tba|unknown|n\/a|not (?:provided|specified|disclosed)|to be (?:determined|announced))\.?$/i;
const negated = /\b(?:no|never|without|not expected to|don['’]t|do not|won['’]t|will not)\b/i;

function evidenceFor(line, anchor) {
  const limit = 160;
  if (!line) return missing;
  if (line.length <= limit) return line;

  const match = anchor?.exec(line);
  const matchStart = match?.index ?? 0;
  const matchEnd = matchStart + (match?.[0].length ?? 0);
  const words = [...line.matchAll(/\S+/g)];
  if (!words.length) return missing;
  const wordEnd = word => word.index + word[0].length;
  const anchorStart = words.findLast(word => word.index <= matchStart) ?? words[0];
  const anchorEnd = words.findLast(word => word.index < matchEnd) ?? anchorStart;
  const capacity = limit - 4; // Leave room for an ellipsis and space on either side.
  const minStart = Math.max(matchStart - 42, wordEnd(anchorEnd) - capacity);
  const first = words.find(word => word.index >= minStart && word.index <= anchorStart.index) ?? anchorStart;
  const last = words.findLast(word => word.index >= first.index && wordEnd(word) <= first.index + capacity);
  if (!last) return '…';

  const start = first.index;
  const end = wordEnd(last);
  return (start > 0 ? '… ' : '') + line.slice(start, end) + (end < line.length ? ' …' : '');
}

export const criteria = [
  { id: 'salary', label: 'Posted salary range', reward: 8, penalty: 4, question: 'What is the salary range for this role?' },
  { id: 'equity', label: 'Equity and terms', reward: 6, penalty: 4, question: 'What is the equity range as a percentage, and what are the vesting, cliff, strike price and exercise terms?' },
  { id: 'funding', label: 'Funding and runway', reward: 5, penalty: 5, question: 'What funding stage are you at, who has invested, and how many months of runway do you have at current burn?' },
  { id: 'team', label: 'Team and collaborators', reward: 4, penalty: 3, question: 'How big is the team today, and who would I work with day to day?' },
  { id: 'reporting', label: 'Reporting line', reward: 3, penalty: 3, question: 'Who would I report to, and who sets my priorities?' },
  { id: 'scope', label: 'Scope clarity', reward: 7, penalty: 8, question: 'What would I own, and what should I explicitly put aside when priorities compete?' },
  { id: 'success', label: 'First-quarter outcomes', reward: 5, penalty: 4, question: 'What would success look like after 30, 60 and 90 days?' },
  { id: 'interview', label: 'Interview process', reward: 5, penalty: 3, question: 'What are the interview steps, how much time should I set aside, and when do you expect to decide?' },
  { id: 'location', label: 'Location and office time', reward: 5, penalty: 4, question: 'Where can I work, and how many days a week are expected in the office?' },
  { id: 'hours', label: 'Hours and intensity', reward: 3, penalty: 14, question: 'What hours does the team normally work, and how often are evenings, weekends or on-call shifts expected?' },
  { id: 'visa', label: 'Visa sponsorship', reward: 2, penalty: 3, question: 'Do you sponsor visas for this role, and if so, which situations can you support?' },
  { id: 'traction', label: 'Customers and traction', reward: 3, penalty: 4, question: 'Who uses the product today, and what traction can you share?' },
  { id: 'stack', label: 'Technical stack', reward: 2, penalty: 2, question: 'What would I build with, and which parts of the stack are still being decided?' },
];

function extractResponsibilities(lines) {
  const responsibilities = [];
  let inSection = false;
  for (const line of lines) {
    if (roleHeading.test(line)) {
      inSection = true;
      continue;
    }
    if (otherHeading.test(line)) inSection = false;
    const stripped = line.replace(/^(?:[-*•]|\d+[.)])\s+/, '');
    if (action.test(stripped) || (inSection && stripped.length >= 12 && !stripped.includes(':'))) {
      responsibilities.push(stripped);
    }
  }
  return [...new Set(responsibilities)];
}

function getPayLine(lines) {
  const candidates = lines.flatMap((line, index) => {
    if (!payLabel.test(line)) return [];
    if (!payHeading.test(line)) return [line];
    const next = lines[index + 1];
    return next && (payRange.test(next) || cashAmount.test(next)) ? [next] : [];
  });
  return candidates.find(line => payRange.test(line)) ??
    lines.find(line => payRange.test(line) && !/\b(?:raised|funding|runway|arr|revenue|equity|valuation|budget|bonus|commission)\b/i.test(line)) ??
    candidates[0];
}

function inspect(posting, lines, responsibilities) {
  const hit = pattern => matchLine(lines, pattern);
  const item = (status, line, why, anchor) => ({ status, evidence: evidenceFor(line, anchor), why });
  const signal = (line, why, anchor) => item('signal', line, why, anchor);
  const risk = (line, why, anchor) => item('risk', line, why, anchor);
  const unknown = (why, line, anchor) => item('unknown', line, why, anchor);

  const pay = getPayLine(lines);
  const apiPay = posting.source === 'api' ? posting.compSummary : null;
  const weakPay = /\b(?:market rate|depends on experience|unpaid|equity[- ]only|no (?:cash|salary|base pay)|not disclosed)\b/i;
  const boundedPay = [pay, apiPay].find(line =>
    line && payRange.test(line) && !/\b(?:bonus|commission|equity)[- ](?:only|range)\b/i.test(line),
  );
  const salary = boundedPay || posting.compRange
    ? signal(boundedPay ?? String(posting.compMin), boundedPay ? 'A numeric pay range gives you something concrete to weigh.' : 'The excerpt shows the lower bound from the public job record. The posted range is ' + posting.comp + '.', payRange)
    : weakPay.test(pay ?? apiPay ?? '')
      ? risk(pay ?? apiPay, 'The post describes pay without usable cash bounds.', weakPay)
      : unknown(pay || posting.comp ? 'Pay is referenced without a clear range.' : 'A posted range helps you decide whether to invest time.', pay ?? apiPay, payLabel);

  const equityLines = lines.filter(line => equityPattern.test(line));
  const equityName = equityLines.find(line => !noEquity.test(line));
  const equityPercent = equityLines.find(line => numericEquity.test(line)) ??
    (equityName && /^equity\s*:?$/i.test(equityName) && numericEquity.test(lines[lines.indexOf(equityName) + 1] ?? '') ? lines[lines.indexOf(equityName) + 1] : null);
  const terms = hit(vesting);
  const exercise = hit(optionTerms);
  const equity = equityLines.some(line => noEquity.test(line))
    ? signal(equityLines.find(line => noEquity.test(line)), 'The posting explicitly says equity is unavailable.', noEquity)
    : equityName && equityPercent && terms
      ? signal(equityPercent, exercise ? 'An ownership percentage, vesting and exercise or pricing terms are stated.' : 'An ownership percentage and vesting are stated. Ask about the strike price, 409A and exercise window.', numericEquity)
      : equityName
        ? risk(equityPercent ?? equityName, [
          equityPercent ? 'An ownership percentage is given.' : 'The posting mentions equity without a clear ownership percentage.',
          terms ? 'Vesting is mentioned.' : 'Vesting terms are missing.',
          exercise ? 'Exercise or pricing is mentioned.' : 'Exercise and pricing terms are missing.',
        ].join(' '), equityPattern)
        : unknown('Ownership and the cost of exercising can change the value of an offer.');

  const funding = hit(fundingPattern);
  const runway = hit(runwayPattern);
  const shortRunway = runway && /\b[1-5]\s*months?\b/i.test(runway) && !/\d\s*[-–]/.test(runway);
  const teamPattern = /\b(?:\d+[- ]person team|team of\s+\d+|\d+\s+(?:people|employees|engineers)\b|team size(?: today)?\s*:\s*\d+|work (?:directly |closely )?with (?:our |the )?(?:co[- ]?founders?|[\w-]+ team|product|design|engineering|customers))\b/i;
  const team = hit(teamPattern);
  const reportingPattern = /\b(?:reports? (?:directly )?to|you(?: (?:will be|are)|['’]ll be) reporting (?:directly )?to|reporting\s+line|^reporting\s+to(?=\s*:)|your manager(?: will be| is))\s*:?\s*(?=([^:\s].*))/i;
  const reporting = lines.find(line => {
    const value = line.match(reportingPattern)?.[1];
    return value && !placeholder.test(value);
  });
  const scope = lines.find(line => {
    const at = line.search(vagueScope);
    return at >= 0 && !negated.test(line.slice(Math.max(0, at - 28), at));
  });
  const responsibilityLine = responsibilities.length && lines.find(line => line.includes(responsibilities[0]));
  const successPattern = /\b(?:first\s+(?:30|60|90)\s+days|30\s*\/\s*60\s*\/\s*90|first[- ]quarter|by day\s+(?:30|60|90)|success (?:looks like|will (?:mean|be)))\b/i;
  const goalAt = lines.findIndex(line => successPattern.test(line));
  const goal = lines[goalAt];
  const goalText = goal?.includes(':') ? goal.slice(goal.indexOf(':') + 1).trim() : null;
  const goals = goal && (goalText && !placeholder.test(goalText) ||
    action.test(lines[goalAt + 1]?.replace(/^(?:[-*•]|\d+[.)])\s+/, '') ?? '') ||
    !goalText && /\b(?:ship|launch|own|deliver|reduce|complete|build|publish|roll out|success looks like)\b/i.test(goal));
  const processAt = lines.findIndex(line => interview.test(line));
  const processLine = lines[processAt];
  const nearby = processLine ? lines.slice(processAt, processAt + 5) : [];
  const stepLines = nearby.filter(line => stageDetail.test(line) && !/^[\w /&'-]+:\s/.test(line));
  const interviewEvidence = processLine && (stageDetail.test(processLine) ? processLine : stepLines[0]);
  const officePattern = /\b(?:\d+\s+days?\s+(?:a|per)\s+week\s+(?:in (?:the )?office|on[- ]?site)|office\s+(?:\d+\s+days?|attendance)|fully remote|remote[- ]first)\b/i;
  const office = hit(officePattern);
  const loc = lines.find(line => {
    const label = line.match(/^(?:location(?: and on-site days)?|based in)\s*[:：]\s*(.+)/i);
    return label ? !placeholder.test(label[1]) : (workMode.test(line) || officePattern.test(line)) &&
      !/\b(?:remote teams?|remote sensing|remote control|remote access|remote support)\b/i.test(line);
  });
  const pressure = lines.find(line => {
    const at = line.search(timePressure);
    return at >= 0 && !negated.test(line.slice(Math.max(0, at - 28), at));
  });
  const hours = hit(regularHours);
  const visaPattern = /\b(?:visa(?:s| sponsorship)?|sponsor(?:ship)? (?:work )?visa|work (?:permit|authorization)|h[- ]?1b)\b/i;
  const visa = hit(visaPattern);
  const visaClear = /\b(?:yes|no|case[- ]by[- ]case|available|provided|offered|sponsor\b|cannot|can['’]t|unable|without|must (?:already )?have|required|consider)\b/i;
  const tractionPattern = /\b(?:\d[\d.,kKmM]*\+?\s*(?:(?:paying |active |pilot |enterprise |existing )?(?:customers|users|pilots|design partners|deployments)|(?:companies|organi[sz]ations)\s+(?:use|run on))|paying customers|pre[- ]launch|pre[- ]revenue|no (?:paying )?customers|\barr\s*(?::| of| reached)|revenue\s*(?::| of| reached)|customers? (?:include|are|across)|used by \S+)\b/i;
  const traction = hit(tractionPattern);
  const stackPattern = /\b(?:typescript|javascript|python|rust|golang|react|vue|angular|svelte|postgres(?:ql)?|mysql|redis|sqlite|ruby|rails|django|flask|kubernetes|docker|kotlin|swift|jvm|java|terraform|aws|gcp|azure|node\.js|next\.js|graphql|supabase|grpc|elixir|phoenix)\b|(?:c\+\+|c#|\.net)\b/i;
  const stack = hit(stackPattern);

  return {
    salary,
    equity,
    funding: shortRunway ? risk(runway, 'The posted runway is under six months. Ask how hiring is funded.', runwayPattern)
      : funding || runway ? signal(runway ?? funding, runway ? 'The posting gives a runway figure.' : 'The posting gives a funding detail. Ask how many months of runway remain.', runway ? runwayPattern : fundingPattern)
        : unknown('Funding and runway affect how much time the team has to make the plan work.'),
    team: team ? signal(team, 'The posting names a team size or day-to-day collaborators.', teamPattern) : unknown('It is hard to estimate support and ownership without a picture of the team.'),
    reporting: reporting ? signal(reporting, 'The posting tells you who manages the role.', reportingPattern) : unknown('A reporting line tells you who sets priorities and evaluates your work.'),
    scope: scope ? risk(scope, 'Broad ownership language makes it worth establishing boundaries.', vagueScope)
      : responsibilities.length >= 2 ? signal(responsibilityLine, responsibilities.length + ' distinct responsibilities are stated.')
        : unknown('Concrete responsibilities make it easier to understand what you would own.', responsibilityLine),
    success: goals ? signal(goal, 'The posting describes an outcome or milestone for the first quarter.', successPattern)
      : unknown('Without early milestones, expectations can be hard to compare.', goal, successPattern),
    interview: interviewEvidence ? signal(interviewEvidence, 'The posting gives interview steps or timing. Confirm the full commitment before starting.', stageDetail)
      : unknown('Steps and timing help you budget your time.', processLine, interview),
    location: loc || office || posting.location || posting.workplace
      ? signal(office ?? posting.location ?? posting.workplace ?? loc, 'The posting gives a location or work arrangement. Confirm any office days or geographic limits.', office ? officePattern : workMode)
      : unknown('Office expectations are a practical deal-breaker for some candidates.'),
    hours: pressure ? risk(pressure, 'The wording suggests intensity. Ask for the actual schedule and examples of crunch.', timePressure)
      : hours ? signal(hours, 'The posting sets an expectation about hours, nights, weekends or on-call work.', regularHours)
        : unknown('An explicit schedule helps you judge whether the role is sustainable for you.'),
    visa: visa && visaClear.test(visa) ? signal(visa, 'The posting states a sponsorship policy. Check how it applies to you.', visaPattern)
      : unknown('Eligibility depends on your situation and the employer’s policy.', visa, visaPattern),
    traction: traction ? signal(traction, 'The posting describes current customers, usage or commercial stage.', tractionPattern)
      : unknown('Product usage and traction help you understand what is already working.'),
    stack: stack ? signal(stack, 'The posting names at least one technology you would encounter.', stackPattern)
      : unknown('A named stack helps you estimate how you would get started.'),
  };
}

export function analyze(posting) {
  const description = textValue(posting?.description) ?? '';
  const lines = linesOf(description);
  const responsibilities = extractResponsibilities(lines);
  const allowTeamHint = !lines.some(line => laterStage.test(line));
  const earlyLines = lines.filter(line => earlyPattern.test(line) || (allowTeamHint && smallTeam.test(line)));
  if (posting?.title && earlyPattern.test(posting.title) && !earlyLines.some(line => line.includes(posting.title))) {
    earlyLines.unshift(posting.title);
  }
  const isEarlyStage = earlyLines.length > 0 || posting?.labels?.founding_role === true;
  const earlyEvidence = earlyLines.slice(0, 4).map(line => evidenceFor(line, earlyPattern.test(line) ? earlyPattern : smallTeam));
  if (!earlyEvidence.length && isEarlyStage) earlyEvidence.push('The public job record classifies this as a founding role.');

  const observations = inspect(posting ?? {}, lines, responsibilities);
  const checklist = criteria.map(({ id, label }) => ({ id, label, ...observations[id] }));
  const coreFacts = [
    observations.salary.status === 'signal',
    observations.location.status !== 'unknown',
    responsibilities.length > 0,
    observations.funding.status !== 'unknown' || observations.team.status !== 'unknown',
    observations.interview.status !== 'unknown',
  ].filter(Boolean).length;
  const status = !description ? 'empty' : description.length < 350 || coreFacts < 3 ? 'thin' : 'ok';
  const unanswered = criteria.filter(({ id }) => observations[id].status !== 'signal' ||
    (id === 'equity' && observations.equity.why.includes('Ask about')))
    .map(({ id, question }) => ({ question, why: observations[id].why }));
  if (isEarlyStage) {
    if (observations.funding.status === 'signal' && !lines.some(line => runwayPattern.test(line))) {
      unanswered.push({ question: 'How many months of runway do you have at current burn?', why: 'A funding stage alone does not say how much time is left.' });
    }
    unanswered.push(
      { question: 'Who are the next few hires, and how will ownership change as they join?', why: 'Early roles often change as the team grows.' },
      { question: 'What changes for this role if the next funding round slips?', why: 'This surfaces whether the role and its goals depend on a near-term raise.' },
    );
  }

  const ledger = criteria.map(({ id, reward, penalty }) => {
    const { status: finding, why } = observations[id];
    return { id, delta: finding === 'signal' ? reward : finding === 'risk' ? -penalty : 0, reason: why };
  });
  const score = Math.min(100, Math.max(0, 50 + ledger.reduce((total, row) => total + row.delta, 0)));
  const band = status !== 'ok' ? 'Not enough to judge' : score >= 70 ? 'Worth a conversation' :
    score >= 50 ? 'Worth it if they answer the open questions' : 'Proceed with caution';
  const known = checklist.filter(row => row.status !== 'unknown').length;
  const confidence = status !== 'ok' || known < 5 ? 'low' : known < 9 ? 'medium' : 'high';
  const location = posting?.location ?? (observations.location.evidence !== missing ? observations.location.evidence : null);
  const workplace = posting?.workplace ?? location?.match(workMode)?.[0];
  const place = location && workplace && !location.toLowerCase().includes(workplace.toLowerCase())
    ? location + ' · ' + workplace : location ?? workplace;
  const compensation = status === 'empty' ? null : posting?.comp ?? getPayLine(lines);
  const employment = apiEmploymentLabels.get(posting?.employment) ?? posting?.employment;
  const summary = [
    { label: 'Company', text: posting?.company ?? 'Company not named' },
    { label: 'Where and how', text: [place, employment].filter(Boolean).join(' · ') || 'Location and work arrangement not stated' },
    { label: 'Pay', text: compensation ?? 'Pay not posted' },
  ];
  return {
    status,
    reading: { headline: posting?.title ?? 'Role title not found', summary, responsibilities: responsibilities.slice(0, 5) },
    isEarlyStage, earlyEvidence, checklist, unanswered,
    assessment: { score, band, label: band, ledger, confidence },
  };
}

export function escapeMarkdown(value) {
  return String(value).replace(/[&<>]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char])
    .replace(/[\\`*_~\[\]()#!|+\-]/g, '\\$&')
    .replace(/^(\s*\d+)\./gm, '$1\\.');
}

export function briefToMarkdown(brief) {
  const { reading, assessment, isEarlyStage, earlyEvidence } = brief;
  const sections = [
    '# ' + escapeMarkdown(reading.headline),
    '## ' + assessment.band,
    assessment.score + '/100 · ' + assessment.confidence + ' confidence',
    'The score starts at 50 and measures what the posting discloses. It reflects the wording of the posting, without verifying its claims.',
    '## Why this score',
    ...assessment.ledger.map(({ id, delta, reason }, index) =>
      '- ' + (delta > 0 ? '+' : '') + delta + ' ' + brief.checklist[index].label + ' · ' + escapeMarkdown(reason)),
    '## Plain-language reading',
    ...reading.summary.map(({ label, text }) => '- **' + label + '** ' + escapeMarkdown(text)),
    ...reading.responsibilities.map(line => '- ' + escapeMarkdown(line)),
    ...(isEarlyStage ? ['**Early-stage indicators**', ...earlyEvidence.map(line => '> ' + escapeMarkdown(line))] : []),
    '## Questions the posting leaves unanswered',
    ...(brief.unanswered.length ? brief.unanswered.map(({ question, why }) => '- ' + question + ' ' + escapeMarkdown(why)) : ['The checklist found no follow-up questions.']),
    '## Signal / Risk / Unknown checklist',
    ...brief.checklist.flatMap(row => ['**' + row.label + ' · ' + row.status + '**', '> ' + escapeMarkdown(row.evidence), escapeMarkdown(row.why)]),
  ];
  return sections.join('\n\n') + '\n';
}

export function encodeShare(text) {
  if (typeof text !== 'string' || text.length > shareLimit || !text.trim()) return null;
  const bytes = new TextEncoder().encode(text);
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

export function decodeShare(fragment) {
  if (typeof fragment !== 'string' || fragment.length > shareLimit * 4 || !/^[\w-]+$/.test(fragment)) return null;
  try {
    const bytes = Uint8Array.from(atob(fragment.replaceAll('-', '+').replaceAll('_', '/')), char => char.charCodeAt(0));
    const value = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return encodeShare(value) === fragment ? value : null;
  } catch {
    return null;
  }
}

export function isJobSlug(value) {
  return typeof value === 'string' && slugPattern.test(value);
}
