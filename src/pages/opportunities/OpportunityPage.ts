import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { OpportunityLocators } from '../locators/OpportunityLocators';

export class OpportunityPage extends BasePage {
  private readonly newButton = this.page.locator(OpportunityLocators.newButton).first();
  private readonly accountNameInput = this.page.locator(OpportunityLocators.accountNameInput).first();

  constructor(page: Page) {
    super(page);
  }

  async clickNewButton(): Promise<void> {
    Logger.step('Click New button in Opportunities page');
    await this.click(this.newButton);
    Logger.pass('Clicked New button in Opportunities page');
  }

  async selectAccountName(accountName: string): Promise<void> {
    Logger.step(`Select account name in Opportunity: ${accountName}`);
    await this.waitForVisible(this.accountNameInput);
    await this.accountNameInput.fill(accountName);

    const matchingOption = this.page
      .locator(OpportunityLocators.accountNameOptions)
      .filter({ hasText: accountName })
      .first();

    await this.waitForVisible(matchingOption);
    await matchingOption.click();
    await expect(this.accountNameInput).toHaveValue(new RegExp(accountName, 'i'));
    Logger.pass(`Selected account name in Opportunity: ${accountName}`);
  }
}
