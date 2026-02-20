import { test as base, expect, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../pages/login/LoginPage';
import { Logger } from '../utils/Logger';

type WorkerFixtures = {
  sharedContext: BrowserContext;
};

const profileMenu = "//span[text()='View profile']";
const logoutLink = "//a[text()='Log out']";

export const test = base.extend<{}, WorkerFixtures>({
  sharedContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext({
        recordVideo: {
          dir: 'test-results/videos',
          size: { width: 1280, height: 720 },
        },
      });
      const setupPage = await context.newPage();
      const loginPage = new LoginPage(setupPage);

      Logger.info('Auto login before test run');
      await loginPage.navigateToLogin();
      await loginPage.loginWithConfig();
      Logger.info('If OTP is shown, complete it manually. Waiting for home page...');
      await setupPage.waitForURL(/(lightning\.force\.com|\/one\/one\.app)/, { timeout: 300000 });
      await setupPage.waitForLoadState('domcontentloaded');
      Logger.pass('Login completed');
      await setupPage.close();

      try {
        await use(context);
      } finally {
        const logoutPage = await context.newPage();
        if (await logoutPage.locator(profileMenu).isVisible().catch(() => false)) {
          Logger.info('Auto logout after test run');
          await logoutPage.locator(profileMenu).click();
          await logoutPage.locator(logoutLink).click();
        }
        await logoutPage.close();
        await context.close();
      }
    },
    { scope: 'worker', timeout: 360000 },
  ],

  page: async ({ sharedContext }, use, testInfo) => {
    const page = await sharedContext.newPage();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await use(page);

    const video = page.video();
    await page.close();
    if (video) {
      await testInfo.attach('test-video', {
        path: await video.path(),
        contentType: 'video/webm',
      });
    }
  },
});

export { expect };
