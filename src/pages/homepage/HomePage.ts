import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { HomePageLocators } from '../locators/HomePageLocators';
import { AppointmentLocators } from '../locators/AppointmentLocators';

export class HomePage extends BasePage {
  private readonly homeLogo = this.page.locator(HomePageLocators.homeLogo).first();
  private readonly homeText = this.page.locator(HomePageLocators.homeText).first();
  private readonly objectDropdownButton = this.page.locator(HomePageLocators.objectDropdownButton);
  private readonly objectDropdownPanel = this.page.locator(HomePageLocators.objectDropdownPanel);

  constructor(page: Page) {
    super(page);
  }

  async verifyHomePage(): Promise<void> {
    Logger.step('Verify homepage is loaded with m360Care branding');
    await expect(this.homeLogo).toBeVisible({ timeout: 30000 });
    Logger.pass('Homepage logo is visible');

    Logger.step('Verify m360Care branding text is visible');
    await expect(this.homeText).toBeVisible({ timeout: 30000 });
    Logger.pass('Homepage is loaded and m360Care branding is visible');
  }


  async openObjectDropdown(): Promise<void> {
    Logger.step('Open object dropdown');
    await this.click(this.objectDropdownButton);
    await expect(this.objectDropdownPanel).toBeVisible();
    Logger.pass('Object dropdown opened');
  }

  async selectObjectFromDropdown(objectName: string): Promise<void> {
    Logger.step(`Select object from dropdown: ${objectName}`);
    for (let attempt = 1; attempt <= 3; attempt++) {
      await this.openObjectDropdown();

      const objectOption = this.objectDropdownPanel.locator(
        `xpath=.//*[normalize-space(text())='${objectName}']`,
      ).first();

      await objectOption.scrollIntoViewIfNeeded().catch(() => {});
      try {
        await objectOption.click();
      } catch {
        await objectOption.click({ force: true });
      }

      if (await this.objectDropdownPanel.isHidden().catch(() => false)) {
        Logger.pass(`Selected object: ${objectName}`);
        return;
      }

      Logger.info(`Retry object selection for ${objectName}. Attempt: ${attempt}`);
    }

    
    await expect(this.objectDropdownPanel).toBeHidden();
    Logger.pass(`Selected object: ${objectName}`);
  }

}
