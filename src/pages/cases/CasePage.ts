import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { CaseLocators } from '../locators/CaseLocators';
import PropertyReader from '../../utils/PropertyReader';
import { HomePage } from '../homepage/HomePage';
import { time } from 'console';

export class CasePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickNewButton(): Promise<void> {
      Logger.step('Click New button in Case page');
      const newButton = this.page.getByRole('button', { name: 'New' }).first();
      await this.waitForVisible(newButton, 30000);
      await newButton.click({ force: true });
      Logger.pass('Clicked New button in Case page');
    }

    async selectCaseType(): Promise<void> {
      Logger.step('Select Case Type');
      
        const caseRadioLabel = this.page.locator('label').filter({ hasText: 'Home Care - Leave' }).first();

        await this.waitForVisible(caseRadioLabel, 20000);
        await caseRadioLabel.click();

        const nextButton = this.page.getByRole('button', { name: 'Next' }).first();
        await this.waitForVisible(nextButton, 10000);
        await nextButton.click();

        await this.page.waitForTimeout(5000);

      Logger.pass('Selected Case Type: Issue');
    }

}