import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { PlannerLocators } from '../locators/PlannerLocators';

export class PlannerPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickNewButton(): Promise<void> {
    Logger.step('Click New button in Planner page');
    const newButton = this.page.locator(PlannerLocators.newButton).first();
    await this.waitForVisible(newButton, 30000);
    await newButton.click({ force: true });
    Logger.pass('Clicked New button in Planner page');
  }

  async selectPlannerListView(viewName: string): Promise<void> {
    Logger.step(`Select planner list view: ${viewName}`);
    const listViewDropdown = this.page.locator(PlannerLocators.listViewDropdown).first();
    await this.waitForVisible(listViewDropdown, 30000);
    await listViewDropdown.click({ force: true });

    await this.page.waitForSelector('[role="listbox"]', { timeout: 30000 });
    const listViewOption = this.page
      .locator(PlannerLocators.listViewOption)
      .filter({ hasText: viewName })
      .first();
    await this.waitForVisible(listViewOption, 20000);
    await listViewOption.scrollIntoViewIfNeeded().catch(() => {});
    await listViewOption.click({ force: true });
    Logger.pass(`Planner list view selected: ${viewName}`);
  }

  async searchAndOpenPlannerRecord(searchText: string): Promise<void> {
    Logger.step(`Search and open planner record: ${searchText}`);
    const searchInput = this.page.locator(PlannerLocators.listSearchInput).first();
    await this.waitForVisible(searchInput, 30000);
    await searchInput.fill(searchText);
    await searchInput.press('Enter');
    await this.staticWait(3000);

    const matchedRow = this.page.locator(PlannerLocators.tableRows).filter({ hasText: searchText }).first();
    await this.waitForVisible(matchedRow, 30000);

    const recordLink = matchedRow.locator(PlannerLocators.rowLink).first();
    await this.click(recordLink);
    Logger.pass(`Opened planner record: ${searchText}`);
  }

  async openDetailsTab(): Promise<void> {
    Logger.step('Open Planner details tab');
    const detailsTab = this.page.locator(PlannerLocators.detailsTab).first();
    await this.waitForVisible(detailsTab, 20000);
    await detailsTab.click({ force: true });
    Logger.pass('Planner details tab opened');
  }

  async verifyPlannerRecordOpened(expectedText: string): Promise<void> {
    Logger.step(`Verify planner record is opened: ${expectedText}`);
    await expect(this.page.getByText(expectedText, { exact: false }).first()).toBeVisible({ timeout: 30000 });
    Logger.pass(`Planner record verified: ${expectedText}`);
  }
}
