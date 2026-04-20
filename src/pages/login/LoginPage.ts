import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { LoginLocators } from '../locators/LoginLocators';
import PropertyReader from '../../utils/PropertyReader';
import { Logger } from '../../utils/Logger';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToLogin(): Promise<void> {
    Logger.step('Navigate to login page');
    const loginUrl = process.env.SF_LOGIN_URL || PropertyReader.getBaseUrl();
    await this.navigateToLoginUrl(loginUrl);
    Logger.pass('Login page opened');
  }

  async navigateToLoginUrl(loginUrl: string): Promise<void> {
    const normalizedLoginUrl = loginUrl.includes('.lightning.force.com')
      ? loginUrl.replace('.lightning.force.com', '.my.salesforce.com')
      : loginUrl;

    Logger.step(`Navigate to login URL: ${normalizedLoginUrl}`);
    await this.safeAction(async () => {
      await this.page.goto(normalizedLoginUrl, { waitUntil: 'domcontentloaded' });
    });
    await this.waitForPageReady();
    Logger.pass('Custom login URL opened');
  }

  async login(username: string, password: string): Promise<void> {
    const usernameField = this.page.locator(LoginLocators.usernameInput);
    const passwordField = this.page.locator(LoginLocators.passwordInput);

    Logger.step('Wait for login fields to be visible');
    await this.waitForVisible(usernameField, 30000);
    await this.waitForVisible(passwordField, 30000);
    Logger.pass('Login fields are visible');

    Logger.step('Clear and enter username');
    await this.safeAction(async () => {
      await usernameField.click({ force: true });
      await usernameField.fill('');
      await usernameField.press(`${process.platform === 'darwin' ? 'Meta' : 'Control'}+A`).catch(() => {});
      await usernameField.press('Backspace').catch(() => {});
      await usernameField.fill(username);
    });
    await expect(usernameField).toHaveValue(username);

    Logger.step('Clear and enter password');
    await this.safeAction(async () => {
      await passwordField.click({ force: true });
      await passwordField.fill('');
      await passwordField.press(`${process.platform === 'darwin' ? 'Meta' : 'Control'}+A`).catch(() => {});
      await passwordField.press('Backspace').catch(() => {});
      await passwordField.fill(password);
    });
    await expect(passwordField).toHaveValue(password);

    Logger.step('Click login button');
    await this.click(this.page.locator(LoginLocators.loginButton));
    Logger.pass('Login submitted');
  }

  async loginWithConfig(): Promise<void> {
    const username = PropertyReader.getProperty('username');
    const password = PropertyReader.getProperty('password');
    Logger.info('Using credentials from config.properties');
    await this.login(username, password);
  }

  async loginToUrl(loginUrl: string, username: string, password: string): Promise<void> {
    Logger.info(`Logging into secondary URL with username: ${username}`);
    await this.navigateToLoginUrl(loginUrl);
    await this.login(username, password);
  }

  async waitForSalesforceHome(timeout = 300000): Promise<void> {
    Logger.step('Wait for Salesforce home after login/OTP');
    await this.page.waitForURL(/(lightning\.force\.com|\/one\/one\.app)/, { timeout });
    await expect(this.page.locator(LoginLocators.usernameInput)).toBeHidden({ timeout }).catch(() => {});
    await this.waitForPageReady();
    Logger.pass('Salesforce home loaded after login/OTP');
  }

  async logoutFromSalesforce(): Promise<void> {
    Logger.step('Logout from Salesforce');

    const profileMenu = this.page.locator("//span[text()='View profile']").first();
    await this.waitForVisible(profileMenu, 15000);
    await this.safeAction(async () => {
      await profileMenu.click();
    });

    const logoutLink = this.page.locator("//a[text()='Log out']").first();
    await this.waitForVisible(logoutLink, 15000);
    await this.safeAction(async () => {
      await logoutLink.click();
    });

    await this.waitForPageReady();
    Logger.pass('Logged out from Salesforce');
  }

  async saveSessionStorageState(path: string): Promise<void> {
    Logger.step(`Save session storage state to ${path}`);
    await this.page.context().storageState({ path });
    Logger.pass(`Saved session storage state to ${path}`);
  }

  async getErrorMessage(): Promise<string> {
    Logger.step('Read login error message');
    return this.getText(this.page.locator(LoginLocators.errorMessage));
  }
}
