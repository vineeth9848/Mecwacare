import { Page } from '@playwright/test';
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
    await this.gotoBaseUrl();
    Logger.pass('Login page opened');
  }

  async navigateToLoginUrl(loginUrl: string): Promise<void> {
    Logger.step(`Navigate to login URL: ${loginUrl}`);
    await this.safeAction(async () => {
      await this.page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
    });
    await this.waitForPageReady();
    Logger.pass('Custom login URL opened');
  }

  async login(username: string, password: string): Promise<void> {
    const usernameField = this.page.locator(LoginLocators.usernameInput);
    const passwordField = this.page.locator(LoginLocators.passwordInput);

    Logger.step('Clear and enter username');
    await this.fill(usernameField, '');
    await this.fill(usernameField, username);

    Logger.step('Clear and enter password');
    await this.fill(passwordField, '');
    await this.fill(passwordField, password);

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
    await this.navigateToLoginUrl(loginUrl);
    await this.login(username, password);
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

  async getErrorMessage(): Promise<string> {
    Logger.step('Read login error message');
    return this.getText(this.page.locator(LoginLocators.errorMessage));
  }
}
