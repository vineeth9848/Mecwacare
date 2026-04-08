import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login/LoginPage';
import { Logger } from '../../src/utils/Logger';

const profileMenu = "//span[text()='View profile']";
const logoutLink = "//a[text()='Log out']";

test('login and logout', async ({ page }) => {
  const loginPage = new LoginPage(page);

  Logger.info('Starting login test');
  await loginPage.navigateToLogin();
  await loginPage.loginWithConfig();

  Logger.step('Verify login success');
  await expect(page).not.toHaveURL(/login\.salesforce\.com/i);
  Logger.pass('Login verified');

  Logger.step('Open profile menu');
  await page.locator(profileMenu).click();

  Logger.step('Click logout');
  await page.locator(logoutLink).click();

  Logger.pass('Logout completed');
});
