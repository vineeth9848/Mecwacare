import { test as base, expect, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../pages/login/LoginPage';
import { Logger } from '../utils/Logger';

type WorkerFixtures = {
  sharedContext: BrowserContext;
  sharedPage: Page;
};

const profileMenu = "//span[text()='View profile']";
const logoutLink = "//a[text()='Log out']";

export const test = base.extend<{}, WorkerFixtures>({
  sharedContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      await use(context);
      await context.close();
    },
    { scope: 'worker' },
  ],

  sharedPage: [
    async ({ sharedContext }, use) => {
      const page = await sharedContext.newPage();
      const loginPage = new LoginPage(page);

      Logger.info('Auto login before test run');
      await loginPage.navigateToLogin();
      await loginPage.loginWithConfig();
      Logger.info('If OTP is shown, complete it manually. Waiting for home page...');
      await page.waitForURL(/(lightning\.force\.com|\/one\/one\.app)/, { timeout: 300000 });
      await page.waitForLoadState('domcontentloaded');
      Logger.pass('Login completed');

      try {
        await use(page);
      } finally {
        if (!page.isClosed() && (await page.locator(profileMenu).isVisible().catch(() => false))) {
          Logger.info('Auto logout after test run');
          await page.locator(profileMenu).click();
          await page.locator(logoutLink).click();
        }
      }
    },
    { scope: 'worker', timeout: 360000 },
  ],

  page: async ({ sharedPage }, use) => {
    await use(sharedPage);
  },
});

export { expect };
