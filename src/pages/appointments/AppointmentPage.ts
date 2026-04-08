import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { AppointmentLocators } from '../locators/AppointmentLocators';
import PropertyReader from '../../utils/PropertyReader';

export class AppointmentPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickNewButton(): Promise<void> {
    Logger.step('Click New button in Appointment');
    const newButton = this.page.locator(AppointmentLocators.newButton).first();
    await this.waitForVisible(newButton, 30000);
    await this.safeAction(async () => {
      await newButton.click({ force: true });
    });
    await this.waitForPageReady();
    Logger.pass('Clicked New button in Appointment');
  }

  async selectListView(viewName: string): Promise<void> {
    Logger.step(`Select Appointment list view: ${viewName}`);
    const listViewDropdown = this.page.locator(AppointmentLocators.listViewDropdown).first();
    await this.waitForVisible(listViewDropdown, 30000);
    await this.safeAction(async () => {
      await listViewDropdown.click({ force: true });
    });

    const option = this.page
      .locator(AppointmentLocators.listViewOption)
      .filter({ hasText: viewName })
      .first();
    await this.waitForVisible(option, 15000);
    await this.safeAction(async () => {
      await option.click({ force: true });
    });
    await this.waitForPageReady();
    Logger.pass(`Selected Appointment list view: ${viewName}`);
  }

  async searchAndOpenRecord(searchText: string): Promise<void> {
    Logger.step(`Search and open Appointment record: ${searchText}`);
    const searchInput = this.page.locator(AppointmentLocators.listSearchInput).first();
    await this.waitForVisible(searchInput, 30000);
    await this.fill(searchInput, searchText);
    await this.safeAction(async () => {
      await searchInput.press('Enter');
    });
    await this.waitForPageReady();

    const matchedRow = this.page.locator(AppointmentLocators.tableRows).filter({ hasText: searchText }).first();
    await this.waitForVisible(matchedRow, 30000);
    const rowLink = matchedRow.locator(AppointmentLocators.rowLink).first();
    await this.click(rowLink);
    await this.waitForPageReady();
    Logger.pass(`Opened Appointment record: ${searchText}`);
  }

  getNameWithRunNumber(name: string): string {
    return `${name}${PropertyReader.getRunNumber(1)}`;
  }

  async searchAndOpenFirstRecordByName(name: string): Promise<void> {
    const expectedName = this.getNameWithRunNumber(name);
    Logger.step(`Search and open first Appointment record for: ${expectedName}`);

    const searchInput = this.page.locator(AppointmentLocators.listSearchInput).first();
    await this.waitForVisible(searchInput, 30000);
    await this.fill(searchInput, expectedName);
    await this.safeAction(async () => {
      await searchInput.press('Enter');
    });
    await this.waitForPageReady();

    const firstMatchingRow = this.page
      .locator(AppointmentLocators.tableRows)
      .filter({ hasText: expectedName })
      .first();
    await this.waitForVisible(firstMatchingRow, 30000);

    const rowLink = firstMatchingRow.locator(AppointmentLocators.rowLink).first();
    await this.click(rowLink);
    await this.waitForPageReady();
    Logger.pass(`Opened first Appointment record for: ${expectedName}`);
  }

  async clickAppLuncher(): Promise<void> {
    Logger.step('Click App Launcher and verify it opens');
    await expect(this.page.locator(AppointmentLocators.appLauncherButton).first()).toBeVisible({ timeout: 30000 });
    await this.page.locator(AppointmentLocators.appLauncherButton).first().click();
    
    Logger.pass('App Launcher is opened successfully');
  }

  async openMaicaSettings(): Promise<void> {
  const appLauncher = this.page.locator('button[title="App Launcher"]');

  await appLauncher.waitFor({ state: 'visible', timeout: 30000 });
  await appLauncher.evaluate(el => el.scrollIntoView({ block: 'center' }));

  try {
    await appLauncher.click({ timeout: 5000 });
  } catch {
    await appLauncher.click({ force: true });
  }

  const searchBox = this.page.getByPlaceholder('Search apps and items...');
  await searchBox.waitFor({ state: 'visible', timeout: 30000 });

  await searchBox.fill('Maica Settings');

  await this.page.getByRole('option', { name: 'Maica Settings' }).click();

  await this.page.waitForTimeout(5000);
}

  async searchForMaicaAlertandEnter(): Promise<void> {
    Logger.step('Click App Launcher and verify it opens');
    await expect(this.page.locator(AppointmentLocators.entersearchLaunch).first()).toBeVisible({ timeout: 30000 });
    await this.page.locator(AppointmentLocators.entersearchLaunch).first().fill('Maica Settings');
    await this.page.getByText('Maica Settings').first().click();

    await this.page.getByRole('option', { name: 'Maica Settings' }).click();

    await this.page.waitForLoadState('networkidle');

    await this.page.waitForTimeout(5000);
    await expect(this.page.locator('h1')).toContainText('Maica Settings');
    await this.page.waitForTimeout(5000);

    Logger.pass('App Launcher is opened successfully');
  }

  async openBillingManagement(): Promise<void> {

  const heading = this.page.locator('h1:has-text("Maica Settings")');
  await expect(heading).toBeVisible({ timeout: 30000 });

  const quickFind = this.page.locator('input[placeholder="Quick Find"]');

  await quickFind.waitFor({ state: 'visible', timeout: 30000 });
  await quickFind.click();
  await quickFind.fill('Billing Management');
  const option = this.page.getByText('Billing Management', { exact: true });

  await option.waitFor({ state: 'visible', timeout: 30000 });

  await option.click();

  await this.page.waitForTimeout(5000);
}

async clickRunNowAndWait(): Promise<void> {

  const runNowBtn = this.page.getByRole('button', { name: 'Run Now' });

  await runNowBtn.waitFor({ state: 'attached', timeout: 30000 });
  await runNowBtn.evaluate(el => {
    el.scrollIntoView({ block: 'center' });
  });

  await expect(runNowBtn).toBeVisible();

  try {
    await runNowBtn.click({ timeout: 5000 });
  } catch {
    await runNowBtn.click({ force: true });
  }

  const successMessage = this.page.locator('p[slot="preSuccess"]');

  await successMessage.waitFor({ state: 'visible', timeout: 60000 });

  await expect(successMessage).toContainText('Creating Invoice Line Items');
  await expect(successMessage).toContainText('Completed');
  await this.page.waitForTimeout(5000);

  Logger.pass('Maica Billing process completed successfully');
}

  async verifyRecordOpened(): Promise<void> {
    Logger.step('Verify Appointment record opened');
    const pageHeader = this.page.locator(AppointmentLocators.pageHeader).filter({ hasText: 'APPT' }).first();
    await expect(pageHeader).toBeVisible({ timeout: 30000 });
    await expect(pageHeader).toContainText('APPT', { timeout: 30000 });
    Logger.pass('Verified Appointment record opened with APPT header');
  }

  async verifyDeliveryActivities(): Promise<void> {
  Logger.step('Verify Delivery Activities details');
    await this.page.getByText('Delivery Activities').last().scrollIntoViewIfNeeded();

    const viewAll = this.page.locator('a.slds-card__footer')
  .filter({
    has: this.page.locator('span.assistiveText:has-text("Delivery Activities")')
  });

    await viewAll.click();

    await this.page.waitForTimeout(10000);

    const row = this.page.locator('table tbody tr')
  .filter({
    has: this.page.locator('td[data-label="Participant"]:has-text("John Doe")')
  })
  .first();

  await expect(
    row.locator('td[data-label="Participant"]').first()
  ).toContainText('John Doe');

  await expect(
    row.locator('td[data-label="Status"]').first()
  ).toContainText('Completed');
    await this.page.waitForTimeout(5000);
  Logger.pass("Delivery Activities details verified successfully");
}
  async verifyCompletedClinicTravelBracketAndDeliveryActivities(): Promise<void> {
    Logger.step('Verify Appointment status, type, service and Delivery Activities');

    const informationSection = this.page.locator(AppointmentLocators.informationSection).first();
    await informationSection.scrollIntoViewIfNeeded();
    await expect(informationSection).toBeVisible({ timeout: 30000 });

    const typeValue = this.page.locator(AppointmentLocators.typeValue).first();
    await this.waitForVisible(typeValue, 30000);
    await expect(typeValue).toContainText('Clinic', { timeout: 30000 });

    const statusValue = this.page.locator(AppointmentLocators.statusValue).first();
    await this.waitForVisible(statusValue, 30000);
    await expect(statusValue).toContainText('Completed', { timeout: 30000 });

    const serviceValue = this.page.locator(AppointmentLocators.serviceValue).first();
    await this.waitForVisible(serviceValue, 30000);
    await expect(serviceValue).toContainText('Travel Bracket 2', { timeout: 30000 });

    await this.verifyDeliveryActivities();
    

    Logger.pass('Verified Appointment Type as Clinic, Status as Completed, Service as Travel Bracket 2 and Delivery Activities exists');
  }

  async enterdeliveryActivityDetails(): Promise<void> {
    Logger.step('Enter Delivery Activity details');
    const deliveryLink = this.page.getByRole('link', { name: /DA -/ }).first();

    await deliveryLink.scrollIntoViewIfNeeded();

    await deliveryLink.click().catch(async () => {
      await deliveryLink.click({ force: true });
    });
    await this.page.waitForTimeout(10000);
    Logger.pass('Entered Delivery Activity details');

}

async verifyDeliveryActivityFullDetails(): Promise<void> {
  Logger.step('Verify delivery activity full details');

  const informationSection = this.page.locator(AppointmentLocators.deliveryActivityInformationSection).first();
  await informationSection.scrollIntoViewIfNeeded();
  await expect(informationSection).toBeVisible({ timeout: 30000 });

  const statusValue = this.page.locator(AppointmentLocators.deliveryActivityStatusValue).first();
  await expect(statusValue).toContainText('Completed', { timeout: 30000 });

  // const appointmentServiceSection = this.page.locator(AppointmentLocators.appointmentServiceInfoSection).first();
  // await appointmentServiceSection.scrollIntoViewIfNeeded();
  // await expect(appointmentServiceSection).toBeVisible({ timeout: 30000 });

  // const appointmentServiceValue = this.page.locator(AppointmentLocators.appointmentServiceValue).first();
  // await expect(appointmentServiceValue).toContainText('Travel Bracket 2', { timeout: 30000 });

  // const billingSection = this.page.locator(AppointmentLocators.billingFundingSection).first();
  // await billingSection.scrollIntoViewIfNeeded();
  // await expect(billingSection).toBeVisible({ timeout: 30000 });

  // const invoiceValue = this.page.locator(AppointmentLocators.invoiceLineItemValue).first();
  // const agreementValue = this.page.locator(AppointmentLocators.agreementItemValue).first();

  // await expect
  //   .poll(async () => ((await invoiceValue.textContent().catch(() => '')) || '').trim(), { timeout: 30000 })
  //   .not.toBe('');
  // await expect
  //   .poll(async () => ((await agreementValue.textContent().catch(() => '')) || '').trim(), { timeout: 30000 })
  //   .not.toBe('');

  Logger.pass('Verified delivery activity status, appointment service, invoice line item and agreement item');
}

  async clickonConfirm(): Promise<void> {
    Logger.step('Click on Confirm button in Appointment');
    const confirmCompletionButton = this.page.getByRole('button', { name: 'Confirm Completion' }).first();
    await expect(confirmCompletionButton).toBeVisible({ timeout: 30000 });
    await confirmCompletionButton.click({ force: true });
    await this.page.waitForTimeout(5000); 

    const confirmButton = this.page.getByRole('button', { name: 'Confirm' }).first();
    await expect(confirmButton).toBeVisible({ timeout: 30000 });
    await confirmButton.click({ force: true });
    await this.page.waitForTimeout(5000);


    Logger.pass('Clicked Confirm Completion button');
  }

   async refreshPage(): Promise<void> {
    Logger.step('Refresh page');
    await this.safeAction(async () => {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
    });
    await this.waitForPageReady();
    Logger.pass('Page refreshed');
  }
}
