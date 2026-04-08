import { chromium } from '@playwright/test';
import { existsSync } from 'fs';
import PropertyReader from './src/utils/PropertyReader';

function getValue(envName: string, fallback?: string): string {
  const value = process.env[envName] || fallback;
  if (!value) throw new Error(`Missing value for ${envName}`);
  return value;
}

async function globalSetup(): Promise<void> {
  const headless = (process.env.HEADLESS || '').toLowerCase() === 'true';
  const loginUrl = getValue('SF_LOGIN_URL', PropertyReader.getBaseUrl());
  const username = getValue('SF_USERNAME', PropertyReader.getProperty('username'));
  const password = getValue('SF_PASSWORD', PropertyReader.getProperty('password'));

  if (existsSync('auth.json')) {
    const browser = await chromium.launch({ headless });
    const context = await browser.newContext({ storageState: 'auth.json' });
    const page = await context.newPage();

    await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
    const sessionIsValid = await page
      .waitForURL(/(lightning\.force\.com|\/one\/one\.app)/, { timeout: 15000 })
      .then(() => true)
      .catch(() => false);

    await browser.close();
    if (sessionIsValid) {
      return;
    }
  }

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
  await page.locator('#Login').click();

  const loggedIn = await page
    .waitForURL(/(lightning\.force\.com|\/one\/one\.app)/, { timeout: 60000 })
    .then(() => true)
    .catch(() => false);

  if (!loggedIn) {
    const currentUrl = page.url();
    await browser.close();
    throw new Error(
      `Salesforce login did not complete within 60 seconds. CI likely hit OTP/MFA or another interactive login step. Current URL: ${currentUrl}`,
    );
  }

  await context.storageState({ path: 'auth.json' });

  await browser.close();
}

export default globalSetup;
