import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login/LoginPage';
import { Logger } from '../utils/Logger';

const profileMenu = "//span[text()='View profile']";
const logoutLink = "//a[text()='Log out']";

type TestFixtures = {
  page: Page;
};

type WorkerFixtures = {
  loggedInState: Record<string, unknown>;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  loggedInState: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const loginPage = new LoginPage(page);

      Logger.info('Auto login before all tests');
      await loginPage.navigateToLogin();
      await loginPage.loginWithConfig();

      const state = await context.storageState();

      try {
        await use(state);
      } finally {
        Logger.info('Auto logout after all tests');
        await page.locator(profileMenu).click();
        await page.locator(logoutLink).click();
        await context.close();
      }
    },
    { scope: 'worker' },
  ],

  page: async ({ browser, loggedInState }, use) => {
    const context = await browser.newContext({ storageState: loggedInState as any });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
