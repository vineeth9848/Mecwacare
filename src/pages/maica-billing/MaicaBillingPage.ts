import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { MaicaBillingLocators } from '../locators/MaicaBillingLocators';

export class MaicaBillingPage extends BasePage {
  constructor(page: Page) {
    super(page);
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
