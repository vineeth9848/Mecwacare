import { expect, Locator, Page } from '@playwright/test';
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
    const newButton = this.page.locator(PlannerLocators.newButton).first();
    await this.waitForVisible(newButton, 30000);
    await this.safeAction(async () => {
      await newButton.click({ force: true });
    });
    await this.waitForPageReady();
    Logger.pass('Clicked New button in Planner page');
  }

  async createNewAppointment(username: string, resourceName: string): Promise<void> {
    Logger.step('Fill participant and direct care resource');
    const runNumber = PropertyReader.getRunNumber(1);
    const participantName = `${username}${runNumber}`;

    const participantInput = this.page.locator(PlannerLocators.participantInput).first();
    await this.selectLookupOption(participantInput, participantName, participantName);
    Logger.pass(`Selected participant: ${participantName}`);

    const resourceInput = this.page.locator(PlannerLocators.participantInput).nth(1);
    await this.selectLookupOption(resourceInput, resourceName, resourceName);
    Logger.pass(`Selected direct care resource: ${resourceName}`);
  }

  async setStartDateToTomorrow(): Promise<void> {
    Logger.step('Set Start Date to tomorrow');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = `${String(tomorrow.getDate()).padStart(2, '0')} ${tomorrow.toLocaleString('en-US', {
      month: 'short',
    })} ${tomorrow.getFullYear()}`;

    const startDateInput = this.page.locator(PlannerLocators.startDateInput).first();
    await this.waitForVisible(startDateInput, 15000);
    await this.safeAction(async () => {
      await startDateInput.click();
      await startDateInput.fill('');
      await startDateInput.fill(tomorrowDate);
      await startDateInput.press('Tab');
    });
    Logger.pass(`Start Date set to ${tomorrowDate}`);
  }

  async selectAppointmentServiceAndClickNext(serviceName: string): Promise<void> {
    Logger.step(`Select appointment service: ${serviceName}`);
    const appointmentServiceInput = this.page.locator(PlannerLocators.appointmentServiceInput).first();
    await this.scrollIntoView(appointmentServiceInput);
    await this.selectLookupOption(appointmentServiceInput, serviceName, serviceName);

    const nextButton = this.page.getByRole('button', { name: 'Next' }).first();
    await this.waitForVisible(nextButton, 15000);
    await this.safeAction(async () => {
      await nextButton.click({ force: true });
    });
    await this.waitForPageReady();
    Logger.pass('Appointment service selected and Next clicked');
  }

  async navigationToNextPages(appointmentType: string, appointmentStatus: string, titlePrefix: string): Promise<void> {
    Logger.step('Navigate through remaining Planner pages');

    await this.selectParticipantLocationAndClickNext();
    await this.clickNextButton('schedule');

    const appointmentTypeSelect = this.page.locator(PlannerLocators.appointmentTypeSelect).first();
    await this.selectDropdownByLabel(appointmentTypeSelect, appointmentType);
    Logger.pass(`Selected Appointment Type as ${appointmentType}`);

    const appointmentStatusSelect = this.page.locator(PlannerLocators.appointmentTypeSelect).last();
    await this.selectDropdownByLabel(appointmentStatusSelect, appointmentStatus);
    Logger.pass(`Selected Appointment Status as ${appointmentStatus}`);

    await this.clickNextButton('additional details');
    await this.clickNextButton('appointment instructions');

    const titleInput = this.page.locator(PlannerLocators.titleInput).first();
    const title = `${titlePrefix}${PropertyReader.getRunNumber(1)}`;
    await this.fill(titleInput, title);
    Logger.pass(`Filled title with ${title}`);

    await this.clickNextButton('other information');

    const submitButton = this.page.getByRole('button', { name: 'Submit' }).first();
    await this.waitForVisible(submitButton, 15000);
    await this.safeAction(async () => {
      await submitButton.click({ force: true });
    });
    await this.waitForPageReady();
    Logger.pass('Submitted planner appointment');
  }

  async runSecondaryAccountStepsPlaceholder(): Promise<void> {
    Logger.step('Run secondary account steps placeholder');
    Logger.info('Secondary account context is open. Add the required scripting here when details are provided.');
    Logger.pass('Secondary account placeholder completed');
  }

  private async selectParticipantLocationAndClickNext(): Promise<void> {
    Logger.step('Select participant location and click Next');
    const participantLocationSelect = this.page.locator(PlannerLocators.participantLocationSelect).last();
    await this.scrollIntoView(participantLocationSelect);
    await this.waitForVisible(participantLocationSelect, 15000);

    await this.safeAction(async () => {
      await participantLocationSelect.click();
      await participantLocationSelect.press('ArrowDown');
      await participantLocationSelect.press('Enter');
    });

    await this.clickNextButton('participant location');
    Logger.pass('Participant location selected');
  }

  private async clickNextButton(stepName: string): Promise<void> {
    const nextButton = this.page.getByRole('button', { name: 'Next' }).first();
    await this.waitForVisible(nextButton, 15000);
    await this.safeAction(async () => {
      await nextButton.click({ force: true });
    });
    await this.waitForPageReady();
    Logger.pass(`Clicked Next on ${stepName}`);
  }

  private async selectLookupOption(input: Locator, searchValue: string, expectedOptionText: string): Promise<void> {
    await this.waitForVisible(input, 15000);
    await this.safeAction(async () => {
      await input.click({ force: true });
      await input.fill(searchValue);
    });

    const option = this.page
      .locator(PlannerLocators.lookupOptions)
      .filter({ hasText: expectedOptionText })
      .first();

    await expect(option).toBeVisible({ timeout: 15000 });
    await this.safeAction(async () => {
      await input.press('ArrowDown');
      await input.press('Enter');
    });

    await expect
      .poll(async () =>
        (
          (await input.inputValue().catch(() => '')) ||
          (await input.getAttribute('value').catch(() => '')) ||
          ''
        ).trim(),
      )
      .toContain(searchValue);
  }
}
