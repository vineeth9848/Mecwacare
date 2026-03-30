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
    console.log(`Filled participant name: ${usernameWithRunNumber}`);
   

    const participantOption = this.page
      .locator(dropdownOptions)
      .filter({ hasText: usernameWithRunNumber })
      .first();
    await this.page.waitForTimeout(5000);
    await expect(participantOption).toBeVisible({ timeout: 10000 });
    await participantOption.getByText(usernameWithRunNumber).click();
    Logger.pass(`Entered participant name: ${usernameWithRunNumber}`);

    const resource = this.page.getByPlaceholder('Start typing to search or click the filter Icon for more options').nth(1);
    await resource.fill('Direct Care Resource QA');
    const resourceOption = this.page
      .locator(dropdownOptions)
      .filter({ hasText: 'Direct Care Resource QA' })
      .first();
    await expect(resourceOption).toBeVisible({ timeout: 10000 });
    await resource.press('ArrowDown');
    await resource.press('Enter');
    Logger.pass('Entered resource: Direct Care Resource QA');
  }

  async selectAppointmentServiceAndClickNext(): Promise<void> {
    Logger.step('Select Appointment Service and click Next');
    const dropdownOptions = "[role='listbox'] [role='option'], .slds-listbox [role='option'], .slds-listbox li";

    const appointmentService = this.page.getByPlaceholder('Select a Appointment Service').first();
    await appointmentService.scrollIntoViewIfNeeded();
    await appointmentService.click();
    await appointmentService.fill('Annual review - Community Care');

    const appointmentServiceOption = this.page
      .locator(dropdownOptions)
      .filter({ hasText: 'Annual review - Community Care' })
      .first();
    await this.page.waitForTimeout(5000);
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

  async NavigationToNextPages(): Promise<void> {
    Logger.step('Navigate to next set of pages');

    // const parrticipantLocationLabel = this.page.locator(PlannerLocators.participantLocation);
    // await expect(parrticipantLocationLabel).toBeVisible({ timeout: 10000 });
    // await parrticipantLocationLabel.click();

    // const participantLocationDropdown = this.page.locator('select').last();
    // await expect(participantLocationDropdown).toBeVisible({ timeout: 10000 });
    // await participantLocationDropdown.scrollIntoViewIfNeeded();
    // await participantLocationDropdown.click();
    // await participantLocationDropdown.press('ArrowDown');
    // await participantLocationDropdown.press('Enter');
    // Logger.pass('Selected participant location');

    const participantNextButton = this.page.getByRole('button', { name: 'Next' }).first();
    await expect(participantNextButton).toBeVisible({ timeout: 10000 });
    await participantNextButton.click({ force: true });
    Logger.info('Clicked Next button on Participant Location to navigate to Schedule page');

    const scheduleNextButton = this.page.getByRole('button', { name: 'Next' }).first();
    await expect(scheduleNextButton).toBeVisible({ timeout: 10000 });
    await scheduleNextButton.click({ force: true });
    Logger.info('Clicked Next button on Schedule to navigate to Additional Details page');

    const AppointmentType = this.page.locator('select').first();
    await expect(AppointmentType).toBeVisible({ timeout: 10000 });
    await AppointmentType.selectOption({ label: 'Clinic' });
    Logger.pass('Selected Appointment Type as Clinic');

    const AppointmentStatus = this.page.locator('select').last();
    await expect(AppointmentStatus).toBeVisible({ timeout: 10000 });
    await AppointmentStatus.selectOption({ label: 'Scheduled' });
    Logger.pass('Selected Appointment Status as Scheduled');

    const additionalDetailsNextButton = this.page.getByRole('button', { name: 'Next' }).first();
    await expect(additionalDetailsNextButton).toBeVisible({ timeout: 10000 });
    await additionalDetailsNextButton.click({ force: true });
    Logger.pass('Clicked Next button on Additional Details to navigate to Appointment Instructions page');

    const instructionsNextButton = this.page.getByRole('button', { name: 'Next' }).first();
    await expect(instructionsNextButton).toBeVisible({ timeout: 10000 });
    await instructionsNextButton.click({ force: true });
    Logger.pass('Clicked Next button on Appointment Instructions to navigate to Other Information page');

    const titleInput = this.page.getByLabel('Title').first();
    await expect(titleInput).toBeVisible({ timeout: 10000 });
    const runNumberInput = PropertyReader.getRunNumber(1);
    const usernameinput = 'TestUser';
    const usernameWithRunNumber = `${usernameinput}${runNumberInput}`;
    await titleInput.fill(usernameWithRunNumber);
    Logger.pass(`Filled Title with: ${usernameWithRunNumber} on other Information page`);

    const otherInformationNextButton = this.page.getByRole('button', { name: 'Next' }).first();
    await expect(otherInformationNextButton).toBeVisible({ timeout: 10000 });
    await otherInformationNextButton.click({ force: true });
    Logger.pass('Clicked Next button on Other Information to navigate to the Submit page');

    
    const Submit = this.page.getByRole('button', { name: 'Submit' }).first();
    await expect(Submit).toBeVisible({ timeout: 10000 });
    await Submit.click({ force: true });
    Logger.pass('Clicked Submit button on Summary page to submit the appointment creation form');

    await this.page.waitForTimeout(5000);

    Logger.pass("Submitted the appointment creation form and navigated through all pages successfully");
  }

  
}
