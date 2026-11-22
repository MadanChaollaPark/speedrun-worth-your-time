import { expect, test } from '@playwright/test';
import { founderDraft, pastedPosting } from '../fixtures.js';

const pagesOrigin = 'https://madanchaollapark.github.io';
const screenshot = (page, name) => page.screenshot({ path: 'tests/screenshots/live-' + name + '.png', fullPage: true });

test.beforeEach(async ({ page }) => {
  await page.route('**/*', async route => {
    if (new URL(route.request().url()).origin !== pagesOrigin) return route.abort();
    // Playwright routes see only the first request in a redirect chain.
    const response = await route.fetch({ maxRedirects: 0 });
    const status = response.status();
    if (status >= 300 && status < 400 && response.headers().location) return route.abort();
    await route.fulfill({ response });
  });
});

test('opens the public app without a login or browser errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  const response = await page.goto('./');
  expect(response.status()).toBe(200);
  expect(new URL(page.url()).origin).toBe(pagesOrigin);
  await expect(page).toHaveTitle(/Worth Your Time/);
  await expect(page.getByLabel('Paste the job posting')).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('generates a brief from the public founding-role sample', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /Founding Product Engineer/ }).click();
  await page.getByRole('button', { name: 'Get the brief' }).click();
  await expect(page.getByRole('heading', { name: 'Founding Product Engineer' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Worth a conversation' })).toBeVisible();
  const score = page.locator('.score');
  await expect(score).toBeVisible();
  await expect(score).toHaveText(/\d+\s*\/ 100/);
  await expect(page.locator('[data-status="signal"]').first()).toBeVisible();
  await screenshot(page, 'a-sample-brief');
});

test('generates a brief from pasted text with Ctrl+Enter', async ({ page }) => {
  await page.goto('./');
  const field = page.getByLabel('Paste the job posting');
  await field.fill(pastedPosting);
  await field.press('Control+Enter');
  await expect(page.getByRole('heading', { name: 'Product Engineer', exact: true })).toBeVisible();
  await expect(page.getByText('Pencil Cloud Studio', { exact: true })).toBeVisible();
  await screenshot(page, 'b-paste-brief');
});

test('updates the public founder template preview', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: 'Founder template' }).click();
  await page.getByLabel('Role title').fill(founderDraft.title);
  await page.locator('#founder-company').fill(founderDraft.company);
  const preview = page.locator('#founder-preview');
  await expect(preview).toBeVisible();
  await expect(preview).toContainText(founderDraft.title);
  await expect(preview).toContainText(founderDraft.company);
  await screenshot(page, 'c-founder');
});
