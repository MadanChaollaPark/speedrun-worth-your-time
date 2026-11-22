import { expect, test } from '@playwright/test';
import { apiFixture, apiFixtureSlug, samples } from '../../docs/js/samples.js';
import { founderDraft, hostileText } from '../fixtures.js';

const api = 'https://speedrun-talent-network.com/**';
const screenshot = (page, name) => page.screenshot({ path: 'tests/screenshots/' + name + '.png', fullPage: true });
const generate = page => page.getByRole('button', { name: 'Get the brief' });
const resultTitle = page => page.locator('#result-title');

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.route(api, route => route.abort());
});

test('keyboard sample to brief, with verdict, checklist and Markdown copy', async ({ page }) => {
  await page.goto('/');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toHaveCSS('clip-path', 'inset(50%)');
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await expect(skip).toHaveCSS('clip-path', 'none');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(skip).toHaveCSS('clip-path', 'inset(50%)');

  const sample = page.getByRole('button', { name: /Founding Product Engineer/ });
  for (let step = 0; step < 14 && !(await sample.evaluate(element => element === document.activeElement)); step++) {
    await page.keyboard.press('Tab');
  }
  await expect(sample).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(sample).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Shift+Tab');
  await expect(generate(page)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(resultTitle(page)).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Worth a conversation' })).toBeVisible();
  for (const status of ['signal', 'risk', 'unknown']) {
    await expect(page.locator('[data-status="' + status + '"]').first()).toBeVisible();
  }
  await screenshot(page, 'a-sample-brief');
  await page.getByRole('button', { name: 'Copy as Markdown' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toMatch(/^# Founding Product Engineer/);
});

test('pasted posting shortcut and hostile markup rendered as text', async ({ page }) => {
  let dialogAppeared = false;
  page.on('dialog', async dialog => {
    dialogAppeared = true;
    await dialog.dismiss();
  });
  await page.goto('/');
  const field = page.getByLabel('Paste the job posting');
  await field.fill(samples[2].text.replace('Paper Comet Systems', 'Pencil Cloud Studio'));
  await field.press('Control+Enter');
  await expect(resultTitle(page)).toBeFocused();
  await expect(resultTitle(page)).toHaveText('Product Engineer');
  await expect(page.getByText('Pencil Cloud Studio', { exact: true })).toBeVisible();
  await screenshot(page, 'b-paste-brief');

  await page.getByRole('button', { name: 'Check another' }).click();
  await expect(field).toBeFocused();
  await field.fill('Role: Software Engineer\nResponsibilities\n- Build ' + hostileText);
  await field.press('Control+Enter');
  await expect(page.getByRole('heading', { name: 'Not enough to judge' })).toBeVisible();
  await expect(page.getByText('Build ' + hostileText, { exact: true }).first()).toBeVisible();
  await expect(page.locator('#result-view script, #result-view img')).toHaveCount(0);
  expect(dialogAppeared).toBe(false);
});

test('founder fields, preview updates, autosave and analyzer handoff', async ({ page }) => {
  await page.goto('/#/founder');
  for (const [key, value] of Object.entries(founderDraft)) {
    const field = page.locator('#founder-' + key);
    if (key === 'visa') await field.selectOption(value);
    else await field.fill(value);
  }
  const preview = page.locator('#founder-preview');
  await expect(preview).toContainText(founderDraft.company);
  await expect(preview).toContainText('19 months of runway');
  await page.reload();
  for (const [key, value] of Object.entries(founderDraft)) await expect(page.locator('#founder-' + key)).toHaveValue(value);
  await expect(preview).toContainText('two pilot customers');
  await expect(page.getByRole('link', { name: 'Skip to content' })).not.toBeFocused();
  await screenshot(page, 'c-founder-template');
  await page.getByRole('button', { name: 'Check it with Worth Your Time' }).click();
  await expect(resultTitle(page)).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Worth a conversation' })).toBeVisible();

  await page.getByRole('link', { name: 'Check a role' }).click();
  await expect(page.getByLabel('Paste the job posting')).toBeFocused();
  await page.getByRole('link', { name: 'Founder template' }).click();
  await page.getByRole('button', { name: 'Clear draft' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Clear draft' }).click();
  await expect(preview).toContainText('Start with the role title');
  await page.reload();
  await expect(page.getByLabel('Role title')).toHaveValue('');
});

test('public API-shaped response and safe original posting link', async ({ page }) => {
  await page.route('https://speedrun-talent-network.com/api/v1/jobs/' + apiFixtureSlug, route =>
    route.fulfill({ json: { job: apiFixture } }),
  );
  await page.goto('/');
  const field = page.getByLabel('Speedrun job link');
  await field.fill(apiFixture.url);
  await field.press('Enter');
  await expect(page.getByText('Source: speedrun talent network public API')).toBeVisible();
  await expect(resultTitle(page)).toBeFocused();
  const original = page.getByRole('link', { name: /Open original posting/ });
  await expect(original).toHaveAttribute('href', apiFixture.url);
  await expect(original).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(original).toHaveAttribute('target', '_blank');
  await expect(page.getByText('140,000–175,000 USD / year', { exact: true })).toBeVisible();
  await screenshot(page, 'd-api-brief');
});

test('API failure preserves the URL and moves focus to paste', async ({ page }) => {
  await page.goto('/');
  const field = page.getByLabel('Speedrun job link');
  await field.fill(apiFixture.url);
  await generate(page).click();
  await expect(page.getByRole('alert')).toHaveText('We couldn’t load an open posting for this link. Paste the posting text to continue.');
  await expect(field).toHaveValue(apiFixture.url);
  await expect(page.getByLabel('Paste the job posting')).toBeFocused();
  await screenshot(page, 'e-api-fallback');
});

test('empty input shows an associated inline error', async ({ page }) => {
  await page.goto('/');
  await generate(page).click();
  await expect(page.getByRole('alert')).toHaveText('Paste a posting or a speedrun job link first.');
  const field = page.getByLabel('Paste the job posting');
  await expect(field).toBeFocused();
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await screenshot(page, 'f-empty-error');
});

test('question mark opens shortcuts and Escape restores focus', async ({ page }) => {
  await page.goto('/');
  const header = page.getByRole('link', { name: 'How it works' });
  await header.focus();
  await page.keyboard.press('?');
  const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(header).toBeFocused();
});

test('pasted share link opens from a fresh page and supports copy, download and print layout', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Paste the job posting').fill(samples[0].text);
  await generate(page).click();
  await page.getByRole('button', { name: /^Copy question:/ }).first().click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toMatch(/\?$/);
  await page.getByRole('button', { name: 'Copy all questions' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toMatch(/\?\n/);
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download .md' }).click();
  expect((await downloaded).suggestedFilename()).toBe('worth-your-time-brief.md');
  await page.getByRole('button', { name: 'Copy share link' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toMatch(/#\/\?paste=/);
  const link = await page.evaluate(() => navigator.clipboard.readText());
  await page.goto(link);
  await expect(resultTitle(page)).toHaveText('Founding Product Engineer');
  await page.keyboard.press('Tab');
  const jump = page.getByRole('link', { name: 'Brief actions ↓' });
  await expect(jump).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('group', { name: 'Brief actions' })).toBeFocused();
  await page.emulateMedia({ media: 'print' });
  await expect(resultTitle(page)).toBeVisible();
  await expect(page.getByRole('navigation')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Print' })).toBeHidden();
});

test('closed, malformed and incomplete API responses fall back to paste', async ({ page }) => {
  const path = 'https://speedrun-talent-network.com/api/v1/jobs/';
  await page.route(path + 'closed', route => route.fulfill({ json: { job: { ...apiFixture, status: 'closed' } } }));
  await page.route(path + 'bad-json', route => route.fulfill({ contentType: 'application/json', body: '{' }));
  await page.route(path + 'missing-description', route => route.fulfill({ json: { job: { ...apiFixture, description_text: null } } }));
  for (const slug of ['closed', 'bad-json', 'missing-description']) {
    await page.goto('/#/?job=' + slug);
    await expect(page.getByRole('alert')).toContainText('Paste the posting text to continue.');
    await expect(page.getByLabel('Paste the job posting')).toBeFocused();
    await expect(page.getByLabel('Speedrun job link')).toHaveValue('https://speedrun-talent-network.com/jobs/' + slug);
  }
});

test('invalid and unsupported links show distinct errors and retain the paste path', async ({ page }) => {
  await page.goto('/');
  const field = page.getByLabel('Speedrun job link');
  await field.fill('not-a-url');
  await generate(page).click();
  await expect(page.getByRole('alert')).toContainText('Enter a full job link');
  await expect(field).toBeFocused();
  await field.fill('https://example.com/jobs/product-engineer');
  await field.press('Enter');
  await expect(page.getByRole('alert')).toHaveText("We don't fetch other sites. Paste the posting text instead.");
  await expect(page.getByLabel('Paste the job posting')).toBeFocused();
});

test('mobile dark layout has no horizontal overflow on editor or brief', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const fits = () => page.evaluate(() => document.documentElement.scrollWidth === innerWidth);
  expect(await fits()).toBe(true);
  await page.getByRole('button', { name: /Founding Product Engineer/ }).click();
  await generate(page).click();
  await expect(resultTitle(page)).toBeFocused();
  expect(await fits()).toBe(true);
});
