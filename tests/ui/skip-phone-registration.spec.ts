import { test, expect, Locator, Page } from '@playwright/test';
import { Logger } from '../../src/utils/Logger';
import PropertyReader from '../../src/utils/PropertyReader';

test.describe('Salesforce Skip Phone Registration - High Speed Batch', () => {
  const BASE_EMAIL = 'msouser';
  const DOMAIN = '@mecwacare.org.au.nft';
  const CURRENT_PASSWORD = 'Ptexecution1';
  
  const LOGIN_URL = (process.env.SF_LOGIN_URL || PropertyReader.getBaseUrl())
    .replace('.lightning.force.com', '.my.salesforce.com');

  /**
   * High-speed field filler using direct DOM evaluation (Your optimized method)
   */
  async function fillField(field: Locator, value: string): Promise<void> {
    try {
      await field.waitFor({ state: 'visible', timeout: 10000 });
      await field.evaluate((el: HTMLInputElement, val: string) => {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      }, value);
    } catch (_e) {
      // Catching errors to keep the batch moving
    }
  }

  test('Skip phone registration for users 5 to 500', async ({ browser }) => {
    test.setTimeout(0); // Ensure the test doesn't timeout for large batches
    
    const START_USER = Number(process.env.START_USER || 5);
    const END_USER = Number(process.env.END_USER || 500);
    
    // Create a single context/page to reuse for maximum speed
    const context = await browser.newContext();
    const page = await context.newPage();

    for (let i = START_USER; i <= END_USER; i++) {
      const username = `${BASE_EMAIL}${i.toString().padStart(3, '0')}${DOMAIN}`;
      
      try {
        Logger.info(`>>> Processing User ${i}: ${username}`);

        // 1. Clear session and navigate (Sequential but fast)
        await context.clearCookies();
        await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });

        // 2. Login Logic using your fillField method
        await fillField(page.locator('#username'), username);
        await fillField(page.locator('#password'), CURRENT_PASSWORD);
        await page.locator('#Login').click();

        // 3. Skip Link Logic
        try {
          const skipLink = page.locator('text="I Don\'t Want to Register My Phone", a:has-text("skip")').first();
          
          // Use a short timeout (3s) so we don't hang if the user already skipped
          await skipLink.waitFor({ state: 'visible', timeout: 3000 });
          await skipLink.click({ force: true });
          
          Logger.info(`Successfully clicked skip for User ${i}`);
        } catch (_skipError) {
          Logger.info(`Skip link not found for User ${i} (Likely already skipped or redirected)`);
        }

      } catch (err: any) {
        Logger.error(`Failed to process user ${username}: ${err?.message || err}`);
      }

      // Small break every 10 users to allow the browser to garbage collect
      if (i % 10 === 0) {
        await page.waitForTimeout(1000);
      }
    }

    await context.close();
  });
});