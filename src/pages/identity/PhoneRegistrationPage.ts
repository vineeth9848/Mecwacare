import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';

export class PhoneRegistrationPage extends BasePage {
  private readonly skipPhoneRegistrationLink: Locator;

  constructor(page: Page) {
    super(page);
    this.skipPhoneRegistrationLink = this.page.locator('a', {
      hasText: "I Don't Want to Register My Phone",
    });
  }

  async clickSkipPhoneRegistrationLink(): Promise<void> {
    Logger.step('Waiting for skip phone registration link');
    await this.waitForVisible(this.skipPhoneRegistrationLink, 30000);
    Logger.step('Clicking skip phone registration link');
    await this.click(this.skipPhoneRegistrationLink);
    await this.page.waitForLoadState('networkidle');
    Logger.pass('Skip phone registration link clicked');
  }

  async verifySkipFlowCompleted(): Promise<void> {
    Logger.step('Verifying skip phone registration flow completed');
    await expect(this.page).toHaveURL(/home\/home\.jsp|lightning\.force\.com|\/one\/one\.app/, {
      timeout: 30000,
    });
    Logger.pass('Skip phone registration flow completed successfully');
  }
}
