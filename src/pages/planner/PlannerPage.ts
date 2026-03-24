import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { PlannerLocators } from '../locators/PlannerLocators';
import PropertyReader from '../../utils/PropertyReader';

export class PlannerPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickNewButton(): Promise<void> {
    Logger.step('Click New button in Planner page');
    const addBtn = this.page.locator('lightning-button-icon').filter({
      has: this.page.locator('[data-key="add"]')
    }).first();

    await addBtn.click();
    await this.page.waitForTimeout(10000); 
    Logger.pass('Clicked New button in Planner page');
  }

  async NewAppointment(username: string): Promise<void> {
    Logger.step('Fill New Appointment in Planner page');
    const runNumber = PropertyReader.getRunNumber(1);
    const usernameWithRunNumber = `${username}${runNumber}`;
    const dropdownOptions = "[role='listbox'] [role='option'], .slds-listbox [role='option'], .slds-listbox li";

    const participant = this.page
      .getByPlaceholder('Start typing to search or click the filter Icon for more options')
      .first();

    await participant.fill(usernameWithRunNumber);

    const participantOption = this.page
      .locator(dropdownOptions)
      .filter({ hasText: usernameWithRunNumber })
      .first();

    await expect(participantOption).toBeVisible({ timeout: 10000 });
    await participant.press('ArrowDown');
    await participant.press('Enter');


    
    const resource = this.page.getByPlaceholder('Start typing to search or click the filter Icon for more options').nth(1);
    await resource.fill('Direct Care Resource QA');
    const resourceOption = this.page
      .locator(dropdownOptions)
      .filter({ hasText: 'Direct Care Resource QA' })
      .first();
    await expect(resourceOption).toBeVisible({ timeout: 10000 });
    await resource.press('ArrowDown');
    await resource.press('Enter');
    Logger.pass('Filled New Appointment in Planner page');
  }

  async selectAppointmentServiceAndClickNext(): Promise<void> {
    Logger.step('Select Appointment Service and click Next');
    const dropdownOptions = "[role='listbox'] [role='option'], .slds-listbox [role='option'], .slds-listbox li";

    const appointmentService = this.page.getByPlaceholder('Select a Appointment Service').first();
    await appointmentService.scrollIntoViewIfNeeded();
    await appointmentService.fill('Travel Bracket 2');

    const appointmentServiceOption = this.page
      .locator(dropdownOptions)
      .filter({ hasText: 'Travel Bracket 2' })
      .first();
    await expect(appointmentServiceOption).toBeVisible({ timeout: 10000 });
    await appointmentService.press('ArrowDown');
    await appointmentService.press('Enter');

    const nextButton = this.page.getByRole('button', { name: 'Next' }).first();
    await expect(nextButton).toBeVisible({ timeout: 10000 });
    await nextButton.click({ force: true });

    Logger.pass('Appointment Service selected and Next clicked');
  }

  async setStartDateToTomorrow(): Promise<void> {
    Logger.step('Set Start Date to tomorrow');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = `${String(tomorrow.getDate()).padStart(2, '0')} ${tomorrow.toLocaleString('en-US', {
      month: 'short',
    })} ${tomorrow.getFullYear()}`;

    const startDateInput = this.page.locator("input[name='start']").first();
    await expect(startDateInput).toBeVisible({ timeout: 10000 });
    await startDateInput.click();
    await startDateInput.fill('');
    await startDateInput.fill(tomorrowDate);
    await startDateInput.press('Tab').catch(() => {});

    Logger.pass(`Start Date set to ${tomorrowDate}`);
  }

  async NavigationtoNext(): Promise<void> {
    Logger.step('Navigate to next page');

    const parrticipantLocationLabel = this.page.locator(PlannerLocators.participantLocation);
    //await expect(parrticipantLocationLabel).toBeVisible({ timeout: 10000 });
    await parrticipantLocationLabel.click();

    const participantLocationDropdown = this.page.locator('select').last();
    await expect(participantLocationDropdown).toBeVisible({ timeout: 10000 });
    await participantLocationDropdown.scrollIntoViewIfNeeded();
    await participantLocationDropdown.click();
    await participantLocationDropdown.press('ArrowDown');
    await participantLocationDropdown.press('Enter');

    const nextButton = this.page.getByRole('button', { name: 'Next' }).first();
    await expect(nextButton).toBeVisible({ timeout: 10000 });
    await nextButton.click({ force: true });

    Logger.pass("Navigated to next page");
  }

  
}
