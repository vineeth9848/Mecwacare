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

  async closeAllSubTabs(): Promise<void> {
    Logger.step('Close all open sub-tabs in Salesforce (optional)');
    try {
      // Try multiple locator strategies to handle Shadow DOM and various Salesforce versions
      let closeButtons = this.page.locator('button[title="Close Tab"]');
      let count = await closeButtons.count();
      Logger.info(`Strategy 1: Found ${count} close buttons with title attribute`);
      
      if (count === 0) {
        // Try with specific class that matches the close button icon
        closeButtons = this.page.locator('button.slds-button_icon-x-small');
        count = await closeButtons.count();
        Logger.info(`Strategy 2: Found ${count} buttons with slds-button_icon-x-small class`);
      }
      
      if (count === 0) {
        Logger.info('No sub-tabs to close');
        return;
      }
      
      Logger.info(`Total close buttons found: ${count}`);
      for (let i = 0; i < count; i++) {
        try {
          const button = closeButtons.nth(i);
          Logger.info(`Attempting to close tab ${i + 1}/${count}`);
          
          // Check if button is visible and enabled
          const isVisible = await button.isVisible().catch(() => false);
          Logger.info(`Button ${i + 1} visible: ${isVisible}`);
          
          if (isVisible) {
            // Scroll into view if needed
            await button.scrollIntoViewIfNeeded().catch(() => {});
            await this.page.waitForTimeout(300);
            
            // Try force click
            await button.click({ force: true, timeout: 5000 });
            Logger.info(`Clicked close button ${i + 1}`);
            await this.page.waitForTimeout(500); // Delay between closes
          } else {
            Logger.info(`Button ${i + 1} is not visible, skipping`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          Logger.info(`Failed to close tab ${i + 1}: ${errorMessage}`);
        }
      }
      await this.page.waitForTimeout(1000); // Wait after closing all tabs
      Logger.pass('Closed all open sub-tabs');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.info(`Error in closeAllSubTabs: ${errorMessage}`);
    }
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
