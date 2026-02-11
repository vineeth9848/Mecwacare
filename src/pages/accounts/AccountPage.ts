import { Page } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { AccountLocators } from '../locators/AccountLocators';

export class AccountPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async createAccount(accountName: string): Promise<void> {
    Logger.step('Create account');
    await this.fill(this.page.locator(AccountLocators.accountNameInput), accountName);
    await this.click(this.page.locator(AccountLocators.saveButton));
    Logger.pass('Account saved');
  }

  async verifyAccountCreated(): Promise<void> {
    Logger.step('Verify account created');
    await this.waitForVisible(this.page.locator(AccountLocators.successToast));
    Logger.pass('Account created successfully');
  }
}
