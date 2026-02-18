import { test as base, expect } from '@playwright/test';
import PropertyReader from '../utils/PropertyReader';
import { Logger } from '../utils/Logger';

export const test = base.extend({
  page: async ({ page }, use) => {
    const baseUrl = PropertyReader.getBaseUrl();
    Logger.info(`Open base URL before test: ${baseUrl}`);
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await use(page);
  },
});

export { expect };
