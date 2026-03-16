import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { AccountLocators } from '../locators/AccountLocators';
import PropertyReader from '../../utils/PropertyReader';

export class AccountPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickNewButton(): Promise<void> {
    Logger.step('Click New button in Accounts page');
    await expect(this.page.getByText('Accounts', { exact: true }).first()).toBeVisible();
    const newButton = this.page.getByRole('button', { name: 'New' }).first();
    await this.waitForVisible(newButton, 30000);
    await newButton.click({ force: true });
    Logger.pass('Clicked New button in Accounts page');
  }

  async selectPersonAccount(): Promise<void> {
    Logger.step('Select Person Account');
    await this.page.locator(AccountLocators.personaccount).click();
    Logger.pass('Person Account selected');
  }

  async clickOnNextButton(): Promise<void> {
    Logger.step('Click on Next button');
    await this.page.getByRole('button', { name: AccountLocators.button }).click();
    Logger.pass('Clicked on Next button');
  }

  async createAccount(firstName: string, lastName: string, phone: string, dob: string, category_option: string, service_delivery: string, email: string, success_msg: string): Promise<void> {
      Logger.step('Create account');
      await this.page.waitForTimeout(10000);
      await this.page.getByLabel(AccountLocators.first_name, { exact: true }).first().fill(firstName);
      
      await this.page.getByLabel(AccountLocators.last_name, { exact: true }).first().fill(lastName);

      const dobField = this.page.getByLabel(AccountLocators.dob, { exact: true }).first();
      await dobField.scrollIntoViewIfNeeded();
      await dobField.fill(dob);
      await dobField.press('Tab');
      
      const categoryDropdown = this.page.getByRole('combobox', {
      name: AccountLocators.customer_category
      });
      await categoryDropdown.scrollIntoViewIfNeeded();
      await categoryDropdown.click();

      const individualOption = this.page.getByRole('option', {
        name: category_option
      });
      await individualOption.click();
      
      const emailField = this.page.getByLabel(AccountLocators.email, { exact: true }).first();
      await emailField.scrollIntoViewIfNeeded();
      await emailField.fill(email);

      await this.page.getByLabel(AccountLocators.phone, { exact: true }).first()
        .scrollIntoViewIfNeeded();
      await this.page.getByLabel(AccountLocators.phone, { exact: true }).first()
        .fill(phone);
      await this.page.getByLabel(AccountLocators.dob, { exact: true }).first().fill(dob);

      await this.searchServiceDeliveryAddress(service_delivery);

      const copyAddress = await this.page.getByRole('link', { 
      name: AccountLocators.copy_address
      });
      await copyAddress.scrollIntoViewIfNeeded();
      await copyAddress.click();

      const save_button = await this.page.getByRole('button', { name: AccountLocators.saveButton });
      await save_button.scrollIntoViewIfNeeded();
      await save_button.click();

      await expect(this.page.getByRole('alert'))
      .toContainText(success_msg);

      Logger.pass('Account created successfully');
  }

  async searchServiceDeliveryAddress(serviceDelivery: string): Promise<void> {
    Logger.step(`Search service delivery address: ${serviceDelivery}`);
    const addressField = this.page.getByRole('combobox', {
      name: AccountLocators.Search_Service_address,
    });
    await addressField.scrollIntoViewIfNeeded();
    await addressField.fill(serviceDelivery);
    await addressField.press('ArrowDown');
    await addressField.press('Enter');
    Logger.pass('Service delivery address selected');
  }

    async verifySuccessToast(message: string) {
    await expect(this.page.getByRole('alert'))
      .toContainText(message);
  }

  async verifyAccountCreated(): Promise<void> {
    Logger.step('Verify account created');
    await this.waitForVisible(this.page.locator(AccountLocators.successToast));
    Logger.pass('Account created successfully');
  }

  async openAccountFromList(accountName: string): Promise<void> {
    Logger.step(`Open account from list: ${accountName}`);
    const accountLink = this.page.getByRole('link', { name: accountName, exact: true }).first();
    await this.click(accountLink);
    Logger.pass(`Opened account: ${accountName}`);
  }

  async selectAccountsListView(viewName: string): Promise<void> {
    Logger.step(`Select accounts list view: ${viewName}`);
    const listViewDropdown = this.page.locator(AccountLocators.listViewDropdown).first();
    await this.waitForVisible(listViewDropdown, 30000);
    await listViewDropdown.click({ force: true });

    await this.page.waitForSelector('[role="listbox"]', { timeout: 30000 });
    const listViewOption = this.page
      .locator(AccountLocators.listViewOption)
      .filter({ hasText: viewName })
      .first();
    await this.waitForVisible(listViewOption, 20000);
    await listViewOption.scrollIntoViewIfNeeded().catch(() => {});
    await listViewOption.click({ force: true });
    Logger.pass(`Accounts list view selected: ${viewName}`);
  }

  getEmailWithRunNumber(email: string): string {
    const runNumber = PropertyReader.getRunNumber(1);
    const [localPart, domain] = email.split('@');
    return `${localPart}${runNumber}@${domain}`;
  }

  async searchAndOpenAccountByEmail(email: string): Promise<void> {
    Logger.step(`Search and open account by email: ${email}`);
    const searchInput = this.page.locator(AccountLocators.listSearchInput).first();
    await this.waitForVisible(searchInput, 30000);
    await searchInput.fill(email);
    await searchInput.press('Enter');
    await this.staticWait(3000);

    const matchedRow = this.page.locator(AccountLocators.tableRows).filter({ hasText: email }).first();
    await this.waitForVisible(matchedRow, 30000);

    const accountLink = matchedRow.locator(AccountLocators.rowLink).first();
    await this.click(accountLink);
    Logger.pass(`Opened account record using email: ${email}`);
  }

  async verifyAgeValueFromDob(dob: string): Promise<void> {
    Logger.step('Verify age value is not empty and matches DOB');
    const detailsTab = this.page.locator(AccountLocators.detailsTab).first();
    await this.click(detailsTab);
    const ageLocator = this.page.locator(AccountLocators.ageValue).first();
    await this.scrollIntoView(ageLocator);
    const ageText = (await ageLocator.innerText()).trim();

    await expect(ageLocator).not.toHaveText('');

    const actualAge = Number(ageText);
    const expectedAge = this.calculateAgeFromDob(dob);
    expect(actualAge).toBe(expectedAge);
    Logger.pass(`Age verified. Expected: ${expectedAge}, Actual: ${actualAge}`);
  }

  async verifyServiceDeliveryAddress(expectedAddressText: string): Promise<void> {
    Logger.step('Verify Service Delivery Address in details page');
    const addressLocator = this.page.locator(AccountLocators.serviceDeliveryAddressValue).first();
    await this.scrollIntoView(addressLocator);
    await expect(addressLocator).toContainText(expectedAddressText, { ignoreCase: true });
    Logger.pass(`Service Delivery Address contains: ${expectedAddressText}`);
  }

  private calculateAgeFromDob(dob: string): number {
    const year = Number(dob.split('/')[2]);
    const currentYear = new Date().getFullYear();
    return currentYear - year;
  }
}
