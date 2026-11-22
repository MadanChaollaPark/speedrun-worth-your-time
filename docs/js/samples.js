export const samples = [
  {
    id: 'founding',
    title: 'Founding Product Engineer',
    company: 'Figment Ferry',
    summary: 'Seed stage · clear pay, scope and milestones',
    text: `Role: Founding Product Engineer
Company: Figment Ferry
Location: Brooklyn, NY · on-site four days a week
Employment: Full-time
Salary: $160,000–$195,000 USD per year
Equity: 0.4%–0.8% options, four-year vesting with a one-year cliff and a 12-month exercise window.

Figment Ferry makes scheduling software for municipal ferry operators. We are a 6-person team at seed stage with 19 months of runway at current burn. Three paying customers use our product on their daily routes.

You report directly to the CTO and work with our product designer and the dispatch team at a pilot operator. We describe launch weeks as fast-paced. Ask us about the pace on a typical week.

Responsibilities
- Build a dispatch board in React and TypeScript that operators can use during a service disruption.
- Integrate live vessel locations with our PostgreSQL-backed schedule.
- Run two workflow reviews a month with dispatchers and prioritize the fixes with our designer.

First 90 days: Ship the dispatch board to one operator and cut the time to publish a disruption alert from five minutes to two.
Interview process: 25-minute intro call, 60-minute pairing session in a sample app, then a 45-minute founder chat. We aim to decide within two weeks.`,
  },
  {
    id: 'rockstar',
    title: 'First Engineering Hire',
    company: 'Moonbutton Rocketworks',
    summary: 'Pre-seed · broad scope and unanswered terms',
    text: `Role: First Engineering Hire
Company: Moonbutton Rocketworks
Location: Austin, TX · hybrid
Employment: Full-time

We're building scheduling tools for people who book pop-up markets. Join at pre-seed and help turn a collection of prototypes into a real product. This is an equity-heavy opportunity for a rockstar who wants to get in on the ground floor.

Responsibilities
- Build the first booking flow for vendors.
- Support market organizers when onboarding hits a snag.
- Run quick experiments with the founder whenever a new opportunity appears.

You'll wear many hats. This is a fast-paced environment where we work hard and expect nights and weekends when it takes them to make a launch happen. We are looking for someone comfortable moving between product, infrastructure and customer calls before the roadmap is set.`,
  },
  {
    id: 'series-b',
    title: 'Product Engineer',
    company: 'Paper Comet Systems',
    summary: 'Series B · hybrid work and a defined team',
    text: `Role: Product Engineer
Company: Paper Comet Systems
Location: Chicago, IL · hybrid, two days a week in office
Employment: Full-time
Salary: $140,000–$175,000 USD annually

We are a Series B vendor portal company. The onboarding squad is an 8-person team inside a larger engineering organization. You report to the Onboarding Engineering Manager and work closely with the product team and a frontend designer.

Responsibilities
- Build import tools for purchasing teams using TypeScript and React.
- Improve the form validation and measure completion by cohort.
- Maintain the Python services that reconcile supplier records.

First 90 days: Launch the guided importer to 30 existing customers and document how support teams can debug failures.
Interview process: 30-minute recruiter screen, one-hour pairing session and a team interview. Plan for three hours total.
Visa sponsorship: Available on a case-by-case basis.`,
  },
  {
    id: 'thin',
    title: 'Backend Engineer',
    company: 'Puddle Satellite',
    summary: 'Three lines · too little to assess',
    text: `Role: Backend Engineer
Company: Puddle Satellite
Help us build the next version of our platform.`,
  },
];

export const apiFixtureSlug = 'product-engineer-paper-comet-systems-a1b2c3d4';
export const apiFixture = {
  id: 'a1b2c3d4-267d-4bec-8d0a-abbc38cb3131',
  status: 'open',
  url: 'https://speedrun-talent-network.com/jobs/' + apiFixtureSlug,
  title: 'Product Engineer',
  company: 'Paper Comet Systems',
  company_slug: 'paper-comet-systems',
  company_url: 'https://paper-comet.example/',
  tier: 'speedrun',
  stealth: false,
  location: 'Chicago, IL',
  workplace_type: 'hybrid',
  employment_type: 'FullTime',
  function: 'engineering',
  seniority: null,
  remote: false,
  comp_summary: null,
  comp_min: 140000,
  comp_max: 175000,
  comp_currency: 'USD',
  comp_period: 'year',
  published_at: '2026-11-22T03:00:00.000Z',
  apply: { kind: 'external', url: 'https://paper-comet.example/jobs/product-engineer' },
  description_text: samples[2].text.split('\n').slice(6).join('\n'),
  labels: {
    function: 'engineering',
    specialty: null,
    seniority: 'mid',
    min_experience: '3_5',
    workplace: 'hybrid',
    engagement: 'full_time',
    founding_role: false,
    ai_native_role: false,
  },
};
