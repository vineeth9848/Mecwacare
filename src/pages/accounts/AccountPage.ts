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

    await this.page.waitForTimeout(5000);
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

   async createCarePlan(): Promise<void> {
    Logger.step('Create Care Plan from Planner page');
    const moreTabs = this.page.locator(AccountLocators.more_Tabs);
    await expect(moreTabs).toBeVisible({ timeout: 10000 });
    await moreTabs.click();
    Logger.pass('Clicked More Tabs button');

    const carePlanOption = this.page.getByRole('menuitem', { name: 'Care Plan' }).first();
    await expect(carePlanOption).toBeVisible({ timeout: 10000 });
    await carePlanOption.click();
    await this.page.waitForTimeout(5000);
    Logger.pass('Selected Care Plan from More Tabs');

    const newCarePlanButton = this.page.getByRole('button', { name: 'New Care Plan' }).last();
    await expect(newCarePlanButton).toBeVisible({ timeout: 10000 });
    await newCarePlanButton.click();
    await this.page.waitForTimeout(5000);
    Logger.pass('Clicked New Care Plan button');

    const StoryDescriptionField = this.page.locator(AccountLocators.StoryDescription).first();
    await expect(StoryDescriptionField).toBeVisible({ timeout: 10000 });
    await StoryDescriptionField.fill('Need medication reminders and daily check-ins');
    Logger.pass('Filled Story Description field');

    const Goals = this.page.locator(AccountLocators.Goals).first();
    await expect(Goals).toBeVisible({ timeout: 10000 });
    await Goals.fill('Improve medication adherence and overall health');
    Logger.pass('Filled Goals field');

    const addrowButton = this.page.getByRole('button', { name: 'Add Row' }).nth(1);
    await addrowButton.scrollIntoViewIfNeeded();
    Logger.pass('Clicked Add Row button to add Problem/Need');

    const currentSituation = this.page.locator(AccountLocators.currentSituation).first();
    await expect(currentSituation).toBeVisible({ timeout: 10000 });
    await currentSituation.fill('Patient often forgets to take medications on time');
    Logger.pass('Filled Current Situation field');

    const needstobeDone = this.page.locator(AccountLocators.needstobeDone).first();
    await expect(needstobeDone).toBeVisible({ timeout: 10000 });
    await needstobeDone.fill('Set up medication reminders and daily check-ins');
    Logger.pass('Filled Needs to be Done field');

    const whom = this.page.locator(AccountLocators.whom).first();
    await expect(whom).toBeVisible({ timeout: 10000 });
    await whom.fill('Direct Care Resource QA');
    Logger.pass('Filled By Whom field');

    const byWhen = this.page.locator(AccountLocators.byWhen).first();
    await expect(byWhen).toBeVisible({ timeout: 10000 });
    await byWhen.fill('2026-12-31');
    Logger.pass('Filled By When field');


    const progress = this.page.locator(AccountLocators.progress).first();
    await expect(progress).toBeVisible({ timeout: 10000 });
    await progress.fill('Not Started');
    Logger.pass('Filled Progress field');

    await this.scrollToBottom();

    const checkboxLabel = this.page.locator('label').filter({ hasText: 'Respite Care' }).first();   
    await checkboxLabel.click();
    await expect(this.page.getByRole('checkbox', { name: 'Respite Care' }).first()).toBeChecked();
    await this.page.waitForTimeout(5000);
    Logger.pass('Checked Respite Care checkbox');

    const selectdropdown = this.page.locator(AccountLocators.selectDropdown).first();
    await expect(selectdropdown).toBeVisible({ timeout: 10000 });
    await selectdropdown.click();
    const option = this.page.getByRole('option', { name: 'Respite Care Duties' });
    await option.waitFor({ state: 'visible' });
    await option.click();
    Logger.pass('Selected Respite Care Duties from dropdown');

    await this.page.waitForTimeout(5000);

    const secondselectdropdown = this.page.locator(AccountLocators.selectDropdown).first();
    await expect(secondselectdropdown).toBeVisible({ timeout: 10000 });
    await secondselectdropdown.click();

    const childcheckboxLabel = this.page.locator('label').filter({ hasText: 'Getting in or out of bed' }).first();
    await expect(childcheckboxLabel).toBeVisible({ timeout: 40000 });  
    await childcheckboxLabel.click();
    await expect(this.page.getByRole('checkbox', { name: 'Getting in or out of bed' }).first()).toBeChecked();
    Logger.pass('Checked Child checkbox Getting in or out of bed checkbox');


    const taskField = this.page.locator(AccountLocators.task).first();
    await taskField.evaluate((node) => node.scrollIntoView({ block: 'center' }));
    await taskField.fill('Arrange for respite care services');
    Logger.pass('Filled Task field');

    await this.scrollToBottom();

    const planProvided = this.page.locator(AccountLocators.planprovided).first();
    await planProvided.fill('Caregiver will arrange for respite care by end of month');
    Logger.pass('Filled Plan Provided field');

    const saveButton = this.page.getByRole('button', { name: 'Save' }).first();
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await saveButton.click();
    await this.page.waitForTimeout(10000);
    
    Logger.pass('Created Care Plan from Planner page');
  }
}
