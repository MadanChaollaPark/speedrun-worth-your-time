import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { founderDraft } from '../fixtures.js';

async function scan(page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const summarize = ({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) });
  const minor = violations.filter(({ impact }) => impact === 'minor' || impact === 'moderate');
  for (const violation of minor) console.log('axe:', JSON.stringify(summarize(violation)));
  const serious = violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(serious.map(summarize)).toEqual([]);
}

for (const colorScheme of ['light', 'dark']) {
  test.describe(colorScheme, () => {
    test.use({ colorScheme });

    test.beforeEach(async ({ page }) => {
      await page.route('https://speedrun-talent-network.com/**', route => route.abort());
      await page.goto('/');
    });

    test('empty intake has no serious or critical accessibility violations', async ({ page }) => {
      await expect(page.getByLabel('Paste the job posting')).toBeEmpty();
      await expect(page.getByRole('button', { name: /Founding Product Engineer/ })).toBeVisible();
      await scan(page);
    });

    test('generated brief has no serious or critical accessibility violations', async ({ page }) => {
      await page.getByRole('button', { name: /Founding Product Engineer/ }).click();
      await page.getByRole('button', { name: 'Get the brief' }).click();
      await expect(page.getByRole('heading', { name: 'Worth a conversation' })).toBeVisible();
      await scan(page);
    });

    test('founder template has no serious or critical accessibility violations', async ({ page }) => {
      await page.getByRole('link', { name: 'Founder template' }).click();
      await page.getByLabel('Role title').fill(founderDraft.title);
      await page.getByLabel('Company name or stealth').fill(founderDraft.company);
      await expect(page.locator('#founder-preview')).toContainText(founderDraft.company);
      await scan(page);
    });

    test('shortcuts dialog has no serious or critical accessibility violations', async ({ page }) => {
      await page.keyboard.press('?');
      await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible();
      await scan(page);
    });
  });
}
