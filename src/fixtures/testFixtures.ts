import { test as base, expect } from '@playwright/test';

const gapMs = Number(process.env.TEST_GAP_MS || '3000');

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await use(page);
  },
});

test.afterEach(async ({ page }) => {
  if (!page.isClosed() && gapMs > 0) {
    await page.waitForTimeout(gapMs);
  }
});

export { expect };
