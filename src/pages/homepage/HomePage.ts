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
    for (let attempt = 1; attempt <= 2; attempt++) {
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

      await expect(this.objectDropdownPanel).toBeHidden({ timeout: 10000 });
      await this.waitForPageReady();

      if (await this.isExpectedObjectPageLoaded(objectName)) {
        Logger.pass(`Selected object: ${objectName}`);
        return;
      }

      Logger.info(
        `Wrong or blank page after selecting ${objectName}. Current URL: ${this.page.url()}. Refreshing and retrying. Attempt: ${attempt}`,
      );
      await this.refreshPage();
    }

    throw new Error(
      `Failed to land on the ${objectName} page after retrying navigation. Final URL: ${this.page.url()}`,
    );
  }

  private async isExpectedObjectPageLoaded(objectName: string): Promise<boolean> {
    const checks: Record<string, () => Promise<boolean>> = {
      Accounts: async () => {
        const headerVisible = await this.page.getByText('Accounts', { exact: true }).first().isVisible().catch(() => false);
        return headerVisible || /\/lightning\/o\/Account\//i.test(this.page.url());
      },
      Leads: async () => {
        const headerVisible = await this.page.getByText('Leads', { exact: true }).first().isVisible().catch(() => false);
        return headerVisible || /\/lightning\/o\/Lead\//i.test(this.page.url());
      },
      Opportunities: async () => {
        const headerVisible = await this.page.getByText('Opportunities', { exact: true }).first().isVisible().catch(() => false);
        return headerVisible || /\/lightning\/o\/Opportunity\//i.test(this.page.url());
      },
      Cases: async () => {
        const headerVisible = await this.page.getByText('Cases', { exact: true }).first().isVisible().catch(() => false);
        return headerVisible || /\/lightning\/o\/Case\//i.test(this.page.url());
      },
      Planner: async () => {
        const plannerButtonVisible = await this.page.locator("lightning-button-icon [data-key='add']").first().isVisible().catch(() => false);
        return plannerButtonVisible || /planner|agenda|scheduler/i.test(this.page.url());
      },
    };

    const check = checks[objectName];
    if (!check) {
      return true;
    }

    return check();
  }

}
