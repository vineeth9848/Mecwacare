import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { HomePageLocators } from '../locators/HomePageLocators';

export class HomePage extends BasePage {
  private readonly mecwaCareLogo = this.page.locator(HomePageLocators.mecwaCareLogo);
  private readonly mCare360Text = this.page.locator(HomePageLocators.mCare360Text);
  private readonly objectDropdownButton = this.page.locator(HomePageLocators.objectDropdownButton);
  private readonly objectDropdownPanel = this.page.locator(HomePageLocators.objectDropdownPanel);

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

  async openObjectDropdown(): Promise<void> {
    Logger.step('Open object dropdown');
    await this.click(this.objectDropdownButton);
    await expect(this.objectDropdownPanel).toBeVisible();
    Logger.pass('Object dropdown opened');
  }

  async selectObjectFromDropdown(objectName: string): Promise<void> {
    Logger.step(`Select object from dropdown: ${objectName}`);
    await this.openObjectDropdown();

    const objectOption = this.objectDropdownPanel.locator(
      `xpath=.//*[normalize-space(text())='${objectName}']`,
    );

    await objectOption.scrollIntoViewIfNeeded();
    await this.click(objectOption);
    await expect(this.objectDropdownButton).toContainText(objectName);
    Logger.pass(`Selected object: ${objectName}`);
  }
}
