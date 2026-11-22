import { defineConfig, devices } from '@playwright/test';

const baseURL = new URL(process.env.LIVE_URL || 'https://madanchaollapark.github.io/speedrun-worth-your-time/');
if (!baseURL.pathname.endsWith('/')) baseURL.pathname += '/';

export default defineConfig({
  testDir: 'tests/live',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: 1,
  use: {
    baseURL: baseURL.href,
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } }],
});
