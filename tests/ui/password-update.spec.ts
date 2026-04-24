import { test, expect, Locator, Page } from '@playwright/test';
import { Logger } from '../../src/utils/Logger';
import PropertyReader from '../../src/utils/PropertyReader';

test.describe('Salesforce Password Update - Batch Users 5-500', () => {
  const BASE_EMAIL = 'msouser';
  const DOMAIN = '@mecwacare.org.au.nft';
  const CURRENT_PASSWORD = 'Nft@2026_Test!';
  const NEW_PASSWORD = 'Ptexecution1';
  const SECURITY_ANSWER = 'hyderabad';
  const LOGIN_URL = (process.env.SF_LOGIN_URL || PropertyReader.getBaseUrl()).includes('.lightning.force.com')
    ? (process.env.SF_LOGIN_URL || PropertyReader.getBaseUrl()).replace('.lightning.force.com', '.my.salesforce.com')
    : (process.env.SF_LOGIN_URL || PropertyReader.getBaseUrl());

  function passwordResetLocators(page: Page) {
    return {
      currentPassword: page.locator('input[name="currentpassword"], input[type="password"][name*="current"]').first(),
      newPassword: page.locator('input[name="newpassword"], input[type="password"][name*="new"]').first(),
      confirmPassword: page.locator('input[name="confirmpassword"], input[type="password"][name*="confirm"]').first(),
      answer: page.locator('input[name="answer"], input[name*="answer"], input[aria-label*="Answer"]').first(),
      saveButton: page.locator('button[name="save"], input[name="save"], input[type="submit"][value*="Change"], button:has-text("Change Password"), button:has-text("Save")').first(),
    };
  }

  async function fillFieldReliably(field: Locator, value: string, fieldName: string): Promise<void> {
    await field.waitFor({ state: 'visible', timeout: 30000 });
    await field.scrollIntoViewIfNeeded().catch(() => {});
    await field.page().waitForTimeout(500);
    await field.click({ force: true });
    await field.fill('');
    await field.fill(value);

    const entered = await field.inputValue().catch(() => '');
    if (entered !== value) {
      await field.evaluate((element, nextValue) => {
        const input = element as HTMLInputElement;
        input.value = nextValue as string;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, value);
    }

    await expect(field).toHaveValue(value, { timeout: 10000 });
    Logger.step(`Entered ${fieldName}`);
  }

  async function isVisible(locator: Locator, timeout = 5000): Promise<boolean> {
    return locator.isVisible({ timeout }).catch(() => false);
  }

  async function waitForPostLoginPage(page: Page): Promise<'change-password' | 'home' | 'login'> {
    const locators = passwordResetLocators(page);
    const usernameField = page.locator('#username');

    await page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2000);

    if (await isVisible(locators.currentPassword, 10000)) {
      return 'change-password';
    }

    if (/(lightning\.force\.com|\/one\/one\.app)/i.test(page.url())) {
      return 'home';
    }

    if (await isVisible(usernameField, 5000)) {
      return 'login';
    }

    const changePasswordAppeared = await Promise.race([
      locators.currentPassword.waitFor({ state: 'visible', timeout: 30000 }).then(() => 'change-password').catch(() => null),
      page.waitForURL(/(lightning\.force\.com|\/one\/one\.app)/, { timeout: 30000 }).then(() => 'home').catch(() => null),
      usernameField.waitFor({ state: 'visible', timeout: 30000 }).then(() => 'login').catch(() => null),
    ]);

    return changePasswordAppeared || 'login';
  }

  async function logoutFromCurrentSession(page: Page): Promise<void> {
    const logoutUrl = `${LOGIN_URL.split('?')[0].replace(/\/lightning.*/, '')}/secur/logout.jsp`;
    await page.goto(logoutUrl, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2000);
    Logger.step('Logged out');
  }

  async function updatePasswordForUser(page: Page, userNumber: number): Promise<void> {
    const username = `${BASE_EMAIL}${userNumber}${DOMAIN}`;
    
    Logger.info(`\n========== Updating password for user ${userNumber} ==========`);
    Logger.step(`Username: ${username}`);

    try {
      // Navigate to login page
      await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
      Logger.step('Navigated to login page');

      const usernameField = page.locator('#username');
      const passwordField = page.locator('#password');
      const currentPasswordField = passwordResetLocators(page).currentPassword;

      await Promise.race([
        usernameField.waitFor({ state: 'visible', timeout: 30000 }).catch(() => null),
        currentPasswordField.waitFor({ state: 'visible', timeout: 30000 }).catch(() => null),
      ]);

      if (await isVisible(currentPasswordField, 5000)) {
        Logger.info(`User ${username} is already on Change Your Password page. Skipping login entry.`);
      } else if (await isVisible(usernameField, 10000)) {
        await fillFieldReliably(usernameField, username, 'username');
        await fillFieldReliably(passwordField, CURRENT_PASSWORD, 'password');
        await page.locator('#Login').click();
        Logger.step('Clicked login button');
      } else {
        throw new Error(`Neither login page nor change password page became visible for ${username}. Current URL: ${page.url()}`);
      }

      const postLoginPage = await waitForPostLoginPage(page);
      Logger.step(`Post-login state for ${username}: ${postLoginPage}`);

      if (postLoginPage === 'change-password') {
        Logger.step('On password change page - filling fields');
        await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
        await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
        await page.waitForTimeout(2000);
        Logger.step('Waited 2 seconds for page stability');

        const locators = passwordResetLocators(page);
        await locators.currentPassword.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(1000);
        Logger.step('Scrolled to change password form');
        await fillFieldReliably(locators.currentPassword, CURRENT_PASSWORD, 'current password');
        await fillFieldReliably(locators.newPassword, NEW_PASSWORD, 'new password');
        await fillFieldReliably(locators.confirmPassword, NEW_PASSWORD, 'confirm password');
        await fillFieldReliably(locators.answer, SECURITY_ANSWER, 'security answer');

        await page.waitForTimeout(2000);
        Logger.step('Waited 2 seconds before clicking save button');

        await locators.saveButton.waitFor({ state: 'visible', timeout: 30000 });
        await locators.saveButton.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(1000);
        await locators.saveButton.click({ force: true });
        Logger.step('Clicked change password button');

        await page.waitForTimeout(3000);
        Logger.step('Waited 3 seconds for password change to process');
        await page.waitForLoadState('load', { timeout: 120000 }).catch(() => {});
        Logger.step('Password change completed');

        await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
        Logger.step('Page refreshed');
        await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
        await page.waitForTimeout(3000);
        Logger.step('Waited 3 seconds after page refresh');
        await logoutFromCurrentSession(page);

        Logger.pass(`Successfully updated password for user ${userNumber}`);
      } else if (postLoginPage === 'home') {
        Logger.warn(`User ${username} reached Salesforce home instead of password reset page. Logging out.`);
        await logoutFromCurrentSession(page);
      } else {
        throw new Error(`User ${username} stayed on the login page or did not reach the password reset form.`);
      }
    } catch (error) {
      Logger.error(`Failed to update password for user ${userNumber}: ${error}`);
      throw error;
    }
  }

  test('Update password for users 5 to 500', async ({ browser }) => {
    Logger.info('Starting batch password update process');
    
    const START_USER = Number(process.env.START_USER || 5);
    const END_USER = Number(process.env.END_USER || 500);
    let successCount = 0;
    let failureCount = 0;
    const failedUsers: number[] = [];

    for (let userNumber = START_USER; userNumber <= END_USER; userNumber++) {
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        await updatePasswordForUser(page, userNumber);
        successCount++;
      } catch (error) {
        Logger.error(`Error updating user ${userNumber}: ${error}`);
        failureCount++;
        failedUsers.push(userNumber);
      } finally {
        await context.close();
      }

      // Progress update every 50 users
      if (userNumber % 50 === 0) {
        Logger.info(`Progress: Completed ${userNumber - START_USER + 1}/${END_USER - START_USER + 1} users. Success: ${successCount}, Failed: ${failureCount}`);
      }
    }

    // Final summary
    Logger.info('\n========== Password Update Summary ==========');
    Logger.info(`Total Users: ${END_USER - START_USER + 1}`);
    Logger.pass(`Successful: ${successCount}`);
    Logger.error(`Failed: ${failureCount}`);

    if (failedUsers.length > 0) {
      Logger.warn(`Failed user numbers: ${failedUsers.join(', ')}`);
    }

    Logger.info('Password update batch process completed');
  });
});
