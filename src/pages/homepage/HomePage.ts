import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { HomePageLocators } from '../locators/HomePageLocators';

export class HomePage extends BasePage {
  private readonly mecwaCareLogo = this.page.locator(HomePageLocators.mecwaCareLogo);
  private readonly mCare360Text = this.page.locator(HomePageLocators.mCare360Text);

  constructor(page: Page) {
    super(page);
  }

  async verifyHomePage(): Promise<void> {
    Logger.step('Verify MecwaCare logo is visible');
    await expect(this.mecwaCareLogo).toBeVisible();
    Logger.pass('MecwaCare logo is visible');

    Logger.step('Verify mCare360 text is visible');
    await expect(this.mCare360Text).toBeVisible();
    Logger.pass('mCare360 text is visible');
  }
}
