import { chromium } from '@playwright/test';
import { existsSync } from 'fs';
import PropertyReader from './src/utils/PropertyReader';

function getValue(envName: string, fallback?: string): string {
  const value = process.env[envName] || fallback;
  if (!value) throw new Error(`Missing value for ${envName}`);
  return value;
}

async function globalSetup(): Promise<void> {
  if (existsSync('auth.json')) {
    return;
  }

  const loginUrl = getValue('SF_LOGIN_URL', PropertyReader.getBaseUrl());
  const username = getValue('SF_USERNAME', PropertyReader.getProperty('username'));
  const password = getValue('SF_PASSWORD', PropertyReader.getProperty('password'));

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
  await page.locator('#Login').click();

  await page.waitForURL(/(lightning\.force\.com|\/one\/one\.app)/, { timeout: 300000 });
  await context.storageState({ path: 'auth.json' });

  await browser.close();
}

export default globalSetup;
