import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login/LoginPage';
import { LoginLocators } from '../pages/locators/LoginLocators';
import { Logger } from '../utils/Logger';

const gapMs = Number(process.env.TEST_GAP_MS || '3000');

export const test = base.extend({
  page: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const usernameField = page.locator(LoginLocators.usernameInput);
    await loginPage.navigateToLogin();
    const isLoginScreen =
      (await usernameField.isVisible({ timeout: 30000 }).catch(() => false)) ||
      /login|my\.salesforce\.com/i.test(page.url());

    if (isLoginScreen) {
      Logger.info('Fresh browser detected login screen. Logging in with configured credentials.');
      await loginPage.loginWithConfig();
      await loginPage.waitForSalesforceHome(60000);
    } else {
      Logger.info('Login screen not detected. Proceeding with current page session.');
    }

    await use(page);
  },
});

test.afterEach(async ({ page }) => {
  if (!page.isClosed() && gapMs > 0) {
    await page.waitForTimeout(gapMs);
  }
});

export { expect };
