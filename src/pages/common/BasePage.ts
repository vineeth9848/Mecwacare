import { Page, Locator, expect } from '@playwright/test';
import PropertyReader from '../../utils/PropertyReader';
import { Logger } from '../../utils/Logger';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoBaseUrl(): Promise<void> {
    const baseUrl = PropertyReader.getBaseUrl();
    Logger.step(`Navigate to base URL: ${baseUrl}`);
    await this.safeAction(async () => {
      await this.page.goto(baseUrl, { waitUntil: 'load', timeout: 120000 });
    });
    await this.waitForPageReady();
    const escaped = baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(this.page).toHaveURL(new RegExp(escaped));
    Logger.pass('Base URL loaded');
  }

  async refreshPage(): Promise<void> {
    Logger.step('Refresh page');
    await this.safeAction(async () => {
      await this.page.reload({ waitUntil: 'load', timeout: 120000 });
    });
    await this.waitForPageReady();
    Logger.pass('Page refreshed');
  }

  async safeAction<T>(action: () => Promise<T>): Promise<T> {
    if (this.page.isClosed()) {
      throw new Error('Page is already closed');
    }

    try {
      return await action();
    } catch (error) {
      if (this.page.isClosed()) {
        throw error;
      }

      await this.waitForPageReady().catch(() => {});
      return await action();
    }
  }

  async waitForPageReady(): Promise<void> {
    if (this.page.isClosed()) {
      throw new Error('Page is already closed');
    }

    await this.page.waitForLoadState('load', { timeout: 120000 }).catch(() => {
      Logger.warn('Page load state timed out, continuing with test');
    });
  }

  /**
   * Force reset object selection state - Use at the START of each test workflow
   * This ensures the object dropdown is cleared and ready for a fresh object selection
   * Solves issue where dropdown stays on previous object (e.g., Accounts) when transitioning to new workflow (e.g., Opportunities)
   * Call this BEFORE selectObjectFromDropdown() when starting a new workflow
   */
  async resetObjectSelectionState(): Promise<void> {
    Logger.info('Resetting object selection state for fresh workflow...');
    
    try {
      // Step 1: Navigate to base URL to reset UI state
      const baseUrl = PropertyReader.getBaseUrl();
      Logger.step(`Navigating to base URL to reset state: ${baseUrl}`);
      await this.page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      Logger.step('Navigated to base URL');

      // Step 2: Wait for page stability
      await this.page.waitForTimeout(1500);

      // Step 3: Close any open dropdowns
      const objectDropdownButton = this.page.locator("button[aria-label='Show Navigation Menu']").first();
      const isDropdownOpen = await this.page.locator('#navMenuList').isVisible().catch(() => false);
      
      if (isDropdownOpen) {
        Logger.step('Closing open object dropdown panel');
        // Click outside dropdown or press Escape to close
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(1000);
        Logger.step('Object dropdown panel closed');
      }

      // Step 4: Hard refresh to clear any cached dropdown state
      Logger.step('Performing hard refresh to clear cached state');
      await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
      Logger.step('Hard refresh completed');

      // Step 5: Wait for final stability
      await this.page.waitForTimeout(2000);
      await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });

      Logger.pass('Object selection state reset successfully - ready for fresh object selection');

    } catch (error) {
      Logger.warn(`Reset object selection encountered error: ${error}`);
      Logger.step('Attempting fallback reset...');
      
      try {
        // Fallback: Simple reload
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.page.waitForTimeout(2000);
        Logger.pass('Fallback reset completed');
      } catch (fallbackError) {
        Logger.error(`Fallback reset also failed: ${fallbackError}`);
        throw new Error(`Reset failed: ${error}. Fallback also failed: ${fallbackError}`);
      }
    }
  }

  /**
   * Close all open sub-tabs after opening an object
   * Uses multiple strategies to find and close tabs (CSS selectors only - no XPath)
   * OPTIONAL - Will NOT fail if no tabs are found
   * Call this after navigating to an object to clean up any open sub-tabs
   * Graceful error handling - script continues even if no tabs exist or close fails
   */
  async closeAllOpenSubTabs(): Promise<void> {
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
      Logger.info(`✓ Sub-tab close completed gracefully: ${errorMessage}`);
      Logger.pass('Sub-tab close check completed (optional, no failure)');
    }
  }

  async staticWait(milliseconds: number): Promise<void> {
    Logger.step(`Static wait for ${milliseconds} ms`);
    await this.page.waitForTimeout(milliseconds);
  }

  async verifyPageTitle(expectedTitle: string): Promise<void> {
    Logger.step(`Verify page title: ${expectedTitle}`);
    await expect(this.page).toHaveTitle(expectedTitle);
    Logger.pass('Page title verified');
  }

  async waitForVisible(target: Locator, timeout = 20000): Promise<void> {
    if (this.page.isClosed()) {
      throw new Error('Page is already closed before waiting for element visibility');
    }
    try {
      await expect(target).toBeVisible({ timeout });
    } catch (error) {
      const message = String(error);
      if (message.includes('Target page, context or browser has been closed')) {
        throw new Error('Page got closed while waiting for element visibility');
      }
      throw error;
    }
  }

  async click(target: Locator): Promise<void> {
    Logger.step('Click element');
    await this.waitForVisible(target);
    await this.safeAction(async () => {
      await target.click();
    });
    Logger.pass('Clicked element');
  }

  async fill(target: Locator, value: string): Promise<void> {
    Logger.step('Fill input field');
    await this.waitForVisible(target);
    await target.fill(value);
    Logger.pass('Input value entered');
  }

  async getInputValue(target: Locator): Promise<string> {
    Logger.step('Get input value');
    await this.waitForVisible(target);
    return target.inputValue();
  }

  async selectDropdownByValue(target: Locator, value: string): Promise<void> {
    Logger.step(`Select dropdown by value: ${value}`);
    await this.waitForVisible(target);
    await this.safeAction(async () => {
      await target.selectOption({ value });
    });
    await this.waitForPageReady();
    Logger.pass('Dropdown value selected');
  }

  async selectDropdownByLabel(target: Locator, label: string): Promise<void> {
    Logger.step(`Select dropdown by label: ${label}`);
    await this.waitForVisible(target);
    await this.safeAction(async () => {
      await target.selectOption({ label });
    });
    await this.waitForPageReady();
    Logger.pass('Dropdown label selected');
  }

  async selectDropdownByIndex(target: Locator, index: number): Promise<void> {
    Logger.step(`Select dropdown by index: ${index}`);
    await this.waitForVisible(target);
    await this.safeAction(async () => {
      await target.selectOption({ index });
    });
    await this.waitForPageReady();
    Logger.pass('Dropdown index selected');
  }

  async selectDropdown(label: string, value: string): Promise<void> {
    Logger.step(`Select dropdown ${label}: ${value}`);

    const dropdown = this.page.locator(`[role="combobox"][aria-label="${label}"]`).first();
    await dropdown.waitFor({ state: 'visible', timeout: 30000 });

    await this.safeAction(async () => {
      await dropdown.click();
    });

    const option = this.page
      .locator(`lightning-base-combobox-item[role="option"]:has-text("${value}"), [role="option"]:has-text("${value}")`)
      .first();

    try {
      await option.waitFor({ state: 'visible', timeout: 5000 });
      await this.safeAction(async () => {
        await option.click();
      });
    } catch {
      const inputValue = await dropdown.getAttribute('readonly').catch(() => null);
      if (inputValue === null) {
        await dropdown.fill(value).catch(() => {});
      }
      await this.page.keyboard.press('ArrowDown');
      await this.page.keyboard.press('Enter');
    }

    await this.waitForPageReady();
    await expect
      .poll(async () =>
        (
          (await dropdown.textContent().catch(() => '')) ||
          (await dropdown.inputValue().catch(() => '')) ||
          (await dropdown.getAttribute('data-value').catch(() => '')) ||
          ''
        ).trim(),
      )
      .toContain(value);

    Logger.pass(`Selected dropdown ${label}: ${value}`);
  }

  async getSelectedDropdownValue(target: Locator): Promise<string> {
    Logger.step('Get selected dropdown value');
    await this.waitForVisible(target);
    return target.inputValue();
  }

  async getSelectedDropdownText(target: Locator): Promise<string> {
    Logger.step('Get selected dropdown text');
    await this.waitForVisible(target);
    const option = target.locator('option:checked');
    return option.innerText();
  }

  async check(target: Locator): Promise<void> {
    Logger.step('Check checkbox');
    await this.waitForVisible(target);
    await target.check();
    Logger.pass('Checkbox checked');
  }

  async uncheck(target: Locator): Promise<void> {
    Logger.step('Uncheck checkbox');
    await this.waitForVisible(target);
    await target.uncheck();
    Logger.pass('Checkbox unchecked');
  }

  async setChecked(target: Locator, shouldBeChecked: boolean): Promise<void> {
    Logger.step(`Set checkbox to ${shouldBeChecked ? 'checked' : 'unchecked'}`);
    await this.waitForVisible(target);
    if (shouldBeChecked) {
      await target.check();
    } else {
      await target.uncheck();
    }
    Logger.pass('Checkbox state updated');
  }

  async isChecked(target: Locator): Promise<boolean> {
    Logger.step('Verify checkbox state');
    await this.waitForVisible(target);
    return target.isChecked();
  }

  async getText(target: Locator): Promise<string> {
    Logger.step('Get text from element');
    await this.waitForVisible(target);
    return target.innerText();
  }

  async isVisible(target: Locator): Promise<boolean> {
    return target.isVisible();
  }

  async scrollIntoView(target: Locator): Promise<void> {
    Logger.step('Scroll element into view');
    if (this.page.isClosed()) {
      Logger.info('Page is closed. Skipping scroll into view');
      return;
    }
    await this.waitForVisible(target, 10000);
    try {
      await target.scrollIntoViewIfNeeded();
    } catch {
      const handle = await target.elementHandle().catch(() => null);
      if (!handle) {
        throw new Error('Element not found while scrolling into view');
      }
      await handle.evaluate((el) => {
        (el as HTMLElement).scrollIntoView({ block: 'center', inline: 'nearest' });
      });
    }
    Logger.pass('Element is in view');
  }

  async scrollToTop(): Promise<void> {
    Logger.step('Scroll to top');
    await this.page.evaluate(() => window.scrollTo(0, 0));
    Logger.pass('Scrolled to top');
  }

  async scrollToBottom(): Promise<void> {
    Logger.step('Scroll to bottom');
    if (this.page.isClosed()) {
      Logger.info('Page is closed. Skipping scroll to bottom');
      return;
    }
    try {
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      Logger.pass('Scrolled to bottom');
    } catch (error) {
      const message = String(error);
      if (message.includes('Target page, context or browser has been closed')) {
        Logger.info('Page/context closed while scrolling to bottom. Skipping scroll');
        return;
      }
      throw error;
    }
  }
}
