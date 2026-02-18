import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { AccountLocators } from '../locators/AccountLocators';

export class AccountPage extends BasePage {
  private readonly newButton = this.page.locator(AccountLocators.newButton);

  constructor(page: Page) {
    super(page);
  }

  async clickNewButton(): Promise<void> {
    Logger.step('Click New button in Accounts page');
    await expect(this.newButton).toBeVisible();
    await this.click(this.newButton);
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
      await this.page.getByLabel(AccountLocators.first_name).fill(firstName);
      
      await this.page.getByLabel(AccountLocators.last_name).fill(lastName);

      const dobField = this.page.getByLabel(AccountLocators.dob);
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
      
      const emailField = this.page.getByLabel(AccountLocators.email);
      await emailField.scrollIntoViewIfNeeded();
      await emailField.fill(email);

      await this.page.getByLabel(AccountLocators.phone)
        .scrollIntoViewIfNeeded();
      await this.page.getByLabel(AccountLocators.phone)
        .fill(phone);
      await this.page.getByLabel(AccountLocators.dob).fill(dob);

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
