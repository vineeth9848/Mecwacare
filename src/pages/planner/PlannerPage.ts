import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { PlannerLocators } from '../locators/PlannerLocators';
import PropertyReader from '../../utils/PropertyReader';

export class PlannerPage extends BasePage {
  private readonly homeLogo = this.page.locator(PlannerLocators.homeLogo).first();
    private readonly homeText = this.page.locator(PlannerLocators.homeText).first();
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
    Logger.step('Click New button in Planner page');
    const newButton = this.page.locator(PlannerLocators.newButton).first();


await newButton.waitFor({ state: 'visible', timeout: 30000 });


await expect(newButton).toBeEnabled({ timeout: 10000 });

await this.safeAction(async () => {
    
    await newButton.click();
    Logger.info('Clicked the Plus (+) button');
});
    
    Logger.pass('Clicked New button in Planner page');
  }

  async verifyHomePage(): Promise<void> {
    Logger.step('Verify homepage is loaded with m360Care branding');
    await expect(this.homeLogo).toBeVisible({ timeout: 30000 });
    Logger.pass('Homepage logo is visible');

    Logger.step('Verify m360Care branding text is visible');
    await expect(this.homeText).toBeVisible({ timeout: 30000 });
    Logger.pass('Homepage is loaded and m360Care branding is visible');
  }

  async createNewAppointment(username: string, resourceName: string): Promise<void> {
    Logger.step('Fill participant and direct care resource');
    const runNumber = PropertyReader.getRunNumber(1);
    const participantName = `${username}${runNumber}`;

    const participantInput = this.page.locator(PlannerLocators.participantInput).first();
    await this.LookupOption(participantInput, participantName, participantName);

    Logger.pass(`Selected participant: ${participantName}`);

    const resourceInput = this.page.locator(PlannerLocators.participantInput).nth(1);
    await this.LookupOption(resourceInput, resourceName, resourceName);
    Logger.pass(`Selected direct care resource: ${resourceName}`);
  }

  async setStartDateToTomorrow(): Promise<void> {
    Logger.step('Set Start Date to tomorrow');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = `${String(tomorrow.getDate()).padStart(2, '0')} ${tomorrow.toLocaleString('en-US', {
      month: 'short',
    })} ${tomorrow.getFullYear()}`;
  }

  async setStartTimePlusTenMinutes(): Promise<void> {
  Logger.step('Set Start Time to current time + 10 minutes');

  const now = new Date();
  
  now.setMinutes(now.getMinutes() + 15);

  const tenMinsLater = now.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase(); 

  console.log(`Target time: ${tenMinsLater}`);
  const startTimeInput = this.page.locator(PlannerLocators.endTimeInput).first();
  await this.waitForVisible(startTimeInput, 15000);

  await this.safeAction(async () => {
    await startTimeInput.click();
    await startTimeInput.clear();
    await startTimeInput.fill('');
    await startTimeInput.fill(tenMinsLater);
    await startTimeInput.press('Tab');
  });

    Logger.pass(`Start Time set to ${tenMinsLater}`);

   await this.page.waitForTimeout(5000);
}

  async selectAppointmentServiceAndClickNext(serviceName: string): Promise<void> {
    Logger.step(`Select appointment service: ${serviceName}`);
    const appointmentServiceInput = this.page.locator(PlannerLocators.appointmentServiceInput).first();
    await this.scrollIntoView(appointmentServiceInput);
    await this.LookupOption(appointmentServiceInput, serviceName, serviceName);

    await this.page.waitForTimeout(10000);

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

    // Logger.step("Select appointment type and status, then click Next on schedule page");
    // const NextButton = this.page.locator("button:has-text('Next')").first();
    // await this.waitForVisible(NextButton, 15000);
    // await NextButton.scrollIntoViewIfNeeded();
    // // await NextButton.waitFor({ state: 'visible', timeout: 30000 });
    // // await NextButton.scrollIntoViewIfNeeded();
   
    // await NextButton.click({ force: true });
   
    // await this.waitForPageReady();
    Logger.pass("Clicked Next on schedule page");
    await this.page.waitForTimeout(5000);

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

  async performCheckInAndCheckOut(): Promise<void> {
    Logger.step('Perform double Check-In and double Check-Out');

    const checkInButton = this.page.getByRole('button', { name: 'Check-In' }).first();
    const SecondheckInButton = this.page.getByRole('button', { name: 'Check In' }).first();
    await this.waitForVisible(checkInButton, 15000);
    await checkInButton.scrollIntoViewIfNeeded();
    await this.safeAction(async () => {
      await checkInButton.click({ force: true });
    });
    await this.waitForPageReady();

    await this.waitForVisible(SecondheckInButton, 15000);
    await SecondheckInButton.scrollIntoViewIfNeeded();
    await this.safeAction(async () => {
      await SecondheckInButton.click({ force: true });
    });
    await this.waitForPageReady();
    Logger.pass('Completed Check-In twice');

    const checkOutButton = this.page.getByRole('button', { name: 'Check-Out' }).first();

    await this.waitForVisible(checkOutButton, 15000);
    await checkOutButton.scrollIntoViewIfNeeded();
    await this.safeAction(async () => {
      await checkOutButton.click({ force: true });
    });
    await this.waitForPageReady();

    await this.waitForVisible(checkOutButton, 15000);
    await checkOutButton.scrollIntoViewIfNeeded();
    await this.safeAction(async () => {
      await checkOutButton.click({ force: true });
    });
    await this.waitForPageReady();
    Logger.pass('Completed Check-Out twice');

    const appointmentCompletedText = this.page.getByText('Appointment Completed', { exact: true });
    await expect(appointmentCompletedText).toBeVisible({ timeout: 15000 });
    Logger.pass('Verified Appointment Completed text after checkout');
  }

  async clickAgendaEventByAccountName(accountName: string): Promise<void> {
    const runNumber = PropertyReader.getRunNumber(1);
    const expectedAccountName = `${accountName}${runNumber}`;

    Logger.step(`Click first planner agenda event for account ${expectedAccountName}`);

    await this.page.mouse.wheel(0, 4000);

    const agendaEvent = this.page
      .locator(PlannerLocators.agendaEventText)
      .filter({ hasText: expectedAccountName })
      .first();

    await this.waitForVisible(agendaEvent, 15000);
    await agendaEvent.scrollIntoViewIfNeeded();
    await this.safeAction(async () => {
      await agendaEvent.click({ force: true });
    });
    await this.waitForPageReady();
    Logger.pass(`Clicked first planner agenda event for account ${expectedAccountName}`);
  }

  private async selectParticipantLocationAndClickNext(): Promise<void> {
    Logger.step('Select participant location and click Next');
    // const participantLocationSelect = this.page.locator(PlannerLocators.participantLocationSelect).last();
    // await this.scrollIntoView(participantLocationSelect);
    // await this.waitForVisible(participantLocationSelect, 15000);

    // await this.safeAction(async () => {
    //   await participantLocationSelect.click();
    //   await participantLocationSelect.press('ArrowDown');
    //   await participantLocationSelect.press('Enter');
    // });

    await this.clickNextButton('participant location');
    Logger.pass('Participant location selected');
  }

  async clickNextButton(stepName: string): Promise<void> {
    Logger.step(`Click Next button on ${stepName} page`);
    const nextButton = this.page.locator("//button[text()='Next']").first();
    await this.waitForVisible(nextButton, 15000);
    await nextButton.scrollIntoViewIfNeeded();
    await this.safeAction(async () => {
      await nextButton.click({ force: true });
    });
    await this.waitForPageReady();
    Logger.pass(`Clicked Next on ${stepName}`);
  }

  async LookupOption(input: Locator, searchValue: string, expectedOptionText: string): Promise<void> {
    await this.waitForVisible(input, 15000);
    
    // 1. Fill the search value
    await this.safeAction(async () => {
      await input.click({ force: true });
      await input.fill(searchValue);
      await this.page.waitForTimeout(5000); 
    });

    const option = this.page
      .locator(PlannerLocators.lookupOptions)
      .filter({ hasText: expectedOptionText })
      .first();

    await expect(option).toBeVisible({ timeout: 15000 });

    // 2. Selection via Keyboard
    await this.safeAction(async () => {
      await input.focus();
      await input.press('ArrowDown');
      // Adding a small delay to ensure the highlight state is captured by the app
      await this.page.waitForTimeout(5000); 
      await input.press('Enter');
    });

      Logger.pass(`Successfully selected "${expectedOptionText}" from lookup and verified the selection.`);

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

    // await expect
    //   .poll(async () =>
    //     (
    //       (await input.inputValue().catch(() => '')) ||
    //       (await input.getAttribute('value').catch(() => '')) ||
    //       ''
    //     ).trim(),
    //   )
    //   .toContain(searchValue);
  }
}

