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

  async getErrorMessage(): Promise<string> {
    Logger.step('Read login error message');
    return this.getText(this.page.locator(LoginLocators.errorMessage));
  }
}
