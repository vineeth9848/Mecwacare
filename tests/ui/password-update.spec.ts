import { test, expect, Locator, Page } from '@playwright/test';
import { Logger } from '../../src/utils/Logger';
import PropertyReader from '../../src/utils/PropertyReader';

test.describe('Salesforce Password Update - Batch Users 5-500', () => {
  const BASE_EMAIL = 'msouser';
  const DOMAIN = '@mecwacare.org.au.nft';
  const CURRENT_PASSWORD = 'Ptexecution1';//Nft@2026_Test!
  const NEW_PASSWORD = 'Ptexecution1';
  const SECURITY_ANSWER = 'hyderabadi';
  
  const LOGIN_URL = (process.env.SF_LOGIN_URL || PropertyReader.getBaseUrl())
    .replace('.lightning.force.com', '.my.salesforce.com');

  async function fillField(field: Locator, value: string): Promise<void> {
    await field.waitFor({ state: 'visible', timeout: 10000 });
    await field.scrollIntoViewIfNeeded();
    
    
    await field.click({ force: true });
    
    
    await field.evaluate((el: HTMLInputElement, val: string) => {
      el.value = val;
      
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));
    }, value);
  }

  async function updatePasswordForUser(page: Page, userNumber: number): Promise<boolean> {
    const username = `${BASE_EMAIL}${userNumber}${DOMAIN}`;
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });

    // Login logic
    await fillField(page.locator('#username'), username);
    await fillField(page.locator('#password'), CURRENT_PASSWORD);
    await page.locator('#Login').click();

    
    try {
      const currentPwd = page.locator('input[name="currentpassword"]');
      await currentPwd.waitFor({ state: 'visible', timeout: 20000 });
      
      await fillField(currentPwd, CURRENT_PASSWORD);
      await fillField(page.locator('input[name="newpassword"]'), NEW_PASSWORD);
      await fillField(page.locator('input[name="confirmpassword"]'), NEW_PASSWORD);
      await fillField(page.locator('input[name="answer"]'), SECURITY_ANSWER);
      
      await page.locator('button:has-text("Change Password"), input[name="save"]').click();
      
    
      await expect(page).toHaveURL(/.*(lightning\.force\.com|\/one\/one\.app)/, { timeout: 30000 });
      return true;
    } catch (e) {
      Logger.error(`Failed to update user ${username}: ${e}`);
      return false;
    }
  }

  test('Update password for users 5 to 500', async ({ browser }) => {
    const START_USER = Number(process.env.START_USER || 5);
    const END_USER = Number(process.env.END_USER || 500);
    
    for (let i = START_USER; i <= END_USER; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      const success = await updatePasswordForUser(page, i);
      
      if (success) {
        Logger.info(`Successfully processed ${i}`);
      }
      
      await context.close();
      
    
      if (i % 5 === 0) await new Promise(r => setTimeout(r, 3000));
    }
  });
});