import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { MaicaBillingLocators } from '../locators/MaicaBillingLocators';

export class MaicaBillingPage extends BasePage {
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

  async clickNewButton(): Promise<void> {
    Logger.step('Click New button in MAICA Billing');
    const newButton = this.page.locator(MaicaBillingLocators.newButton).first();
    await this.waitForVisible(newButton, 30000);
    await this.safeAction(async () => {
      await newButton.click({ force: true });
    });
    await this.waitForPageReady();
    Logger.pass('Clicked New button in MAICA Billing');
  }

  async selectListView(viewName: string): Promise<void> {
    Logger.step(`Select MAICA Billing list view: ${viewName}`);
    const listViewDropdown = this.page.locator(MaicaBillingLocators.listViewDropdown).first();
    await this.waitForVisible(listViewDropdown, 30000);
    await this.safeAction(async () => {
      await listViewDropdown.click({ force: true });
    });

    const option = this.page
      .locator(MaicaBillingLocators.listViewOption)
      .filter({ hasText: viewName })
      .first();
    await this.waitForVisible(option, 15000);
    await this.safeAction(async () => {
      await option.click({ force: true });
    });
    await this.waitForPageReady();
    Logger.pass(`Selected MAICA Billing list view: ${viewName}`);
  }

  async searchAndOpenRecord(searchText: string): Promise<void> {
    Logger.step(`Search and open MAICA Billing record: ${searchText}`);
    const searchInput = this.page.locator(MaicaBillingLocators.listSearchInput).first();
    await this.waitForVisible(searchInput, 30000);
    await this.fill(searchInput, searchText);
    await this.safeAction(async () => {
      await searchInput.press('Enter');
    });
    await this.waitForPageReady();

    const matchedRow = this.page.locator(MaicaBillingLocators.tableRows).filter({ hasText: searchText }).first();
    await this.waitForVisible(matchedRow, 30000);
    const rowLink = matchedRow.locator(MaicaBillingLocators.rowLink).first();
    await this.click(rowLink);
    await this.waitForPageReady();
    Logger.pass(`Opened MAICA Billing record: ${searchText}`);
  }

  async verifyRecordOpened(expectedText: string): Promise<void> {
    Logger.step(`Verify MAICA Billing record opened: ${expectedText}`);
    const pageHeader = this.page.locator(MaicaBillingLocators.pageHeader).filter({ hasText: expectedText }).first();
    await expect(pageHeader).toBeVisible({ timeout: 30000 });
    Logger.pass(`Verified MAICA Billing record opened: ${expectedText}`);
  }
}
