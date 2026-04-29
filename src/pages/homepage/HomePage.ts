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

  /**
   * Combined refresh method: Navigates to fresh URL + Hard refresh with retry logic
   * Use this before clicking object dropdown if it's not responding
   * Combines Option 3 (Fresh URL navigation) + Option 4 (Hard refresh + Retry)
   */
  async hardRefreshPageWithRetry(): Promise<void> {
    Logger.info('Starting hard refresh with retry logic...');
    
    try {
      // Step 1: Navigate to fresh URL (Option 3 approach)
      const baseUrl = PropertyReader.getBaseUrl();
      Logger.step(`Navigating to fresh URL: ${baseUrl}`);
      await this.page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      Logger.step('Navigated to fresh URL');

      // Step 2: Hard refresh the page (Option 4 approach)
      Logger.step('Performing hard refresh (Ctrl+Shift+R)...');
      await this.page.reload({ waitUntil: 'load', timeout: 60000 });
      Logger.step('Hard refresh completed');

      // Step 3: Wait for page stability
      Logger.step('Waiting 2 seconds for page to stabilize');
      await this.page.waitForTimeout(2000);

      // Step 4: Additional stability check
      await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      Logger.step('Page fully loaded and stable');

      Logger.pass('Hard refresh with retry completed successfully');

    } catch (error) {
      Logger.warn(`Hard refresh encountered an error: ${error}`);
      Logger.step('Attempting secondary refresh method...');
      
      try {
        // Fallback: Simple reload
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.page.waitForTimeout(2000);
        Logger.pass('Secondary refresh completed');
      } catch (secondaryError) {
        Logger.error(`Secondary refresh also failed: ${secondaryError}`);
        throw new Error(`Hard refresh failed: ${error}. Secondary refresh also failed: ${secondaryError}`);
      }
    }
  }

  async verifyHomePage(): Promise<void> {
    Logger.step('Verify homepage is loaded with m360Care branding');
    await expect(this.homeLogo).toBeVisible({ timeout: 30000 });
    Logger.pass('Homepage logo is visible');

    Logger.step('Verify m360Care branding text is visible');
    await expect(this.homeText).toBeVisible({ timeout: 30000 });
    Logger.pass('Homepage is loaded and m360Care branding is visible');
  }

  /**
   * Close all open sub-tabs after opening an object
   * Uses multiple strategies to find and close tabs (SVG, buttons, links)
   * OPTIONAL - Will not fail if no tabs are found
   * Call this after selectObjectFromDropdown() to clean up sub-tabs
   */
  async closeAllSubTabs(): Promise<void> {
    Logger.step('Close all open sub-tabs (optional - will not fail if none found)');
    try {
      // Strategy 1: Find buttons that contain SVG with data-key="close" (Lightning tabs)
      let closeButtons = this.page.locator('button:has(svg[data-key="close"])');
      let count = await closeButtons.count();
      Logger.info(`Strategy 1 (Button with SVG close icon): Found ${count} close buttons`);
      
      if (count === 0) {
        // Strategy 2: Find buttons with title starting with "Close" (standard Salesforce)
        closeButtons = this.page.locator('button[title^="Close"]');
        count = await closeButtons.count();
        Logger.info(`Strategy 2 (Title starts with Close): Found ${count} close buttons`);
      }
      
      if (count === 0) {
        // Strategy 3: Try with button[title="Close Tab"]
        closeButtons = this.page.locator('button[title="Close Tab"]');
        count = await closeButtons.count();
        Logger.info(`Strategy 3 (Exact title Close Tab): Found ${count} close buttons`);
      }

      if (count === 0) {
        // Strategy 4: Find buttons with SLDS close button class and ARIA close label
        closeButtons = this.page.locator('button.slds-button_icon-x-small[aria-label*="Close"]');
        count = await closeButtons.count();
        Logger.info(`Strategy 4 (SLDS close button with ARIA): Found ${count} close buttons`);
      }

      if (count === 0) {
        // Strategy 5: Generic approach - any button with close-related class
        closeButtons = this.page.locator('button.slds-button_icon-x-small');
        count = await closeButtons.count();
        Logger.info(`Strategy 5 (SLDS close button class): Found ${count} close buttons`);
      }
      
      if (count === 0) {
        Logger.info('✓ No open sub-tabs found - continuing without error');
        Logger.pass('Sub-tab close check completed (no tabs to close)');
        return;
      }
      
      Logger.info(`Total close buttons found: ${count}`);
      let closedCount = 0;

      // Close each tab with retry logic
      for (let i = 0; i < count; i++) {
        try {
          const button = closeButtons.nth(i);
          const isVisible = await button.isVisible({ timeout: 3000 }).catch(() => false);
          
          if (isVisible) {
            Logger.info(`Closing tab ${i + 1}/${count}`);
            await button.scrollIntoViewIfNeeded().catch(() => {});
            await this.page.waitForTimeout(300);
            
            // Use force click to handle any overlay issues
            try {
              await button.click({ force: true, timeout: 5000 });
              closedCount++;
              Logger.info(`Successfully closed tab ${i + 1}`);
            } catch (clickError) {
              // Retry once with delay
              Logger.info(`First click attempt failed, retrying tab ${i + 1}...`);
              await this.page.waitForTimeout(500);
              await button.click({ force: true, timeout: 5000 });
              closedCount++;
              Logger.info(`Successfully closed tab ${i + 1} on retry`);
            }
            
            await this.page.waitForTimeout(500); // Delay between closes
          } else {
            Logger.info(`Tab ${i + 1} not visible, skipping`);
          }
        } catch (error) {
          Logger.info(`Could not close tab ${i + 1}, continuing...`);
        }
      }

      await this.page.waitForTimeout(1000);
      Logger.pass(`Successfully closed ${closedCount}/${count} sub-tabs`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.info(`✓ Sub-tab close check completed gracefully: ${errorMessage}`);
      Logger.pass('Sub-tab close check completed (optional, no failure)');
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
