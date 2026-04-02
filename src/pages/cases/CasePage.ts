import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { CaseLocators } from '../locators/CaseLocators';
import PropertyReader from '../../utils/PropertyReader';
import { HomePage } from '../homepage/HomePage';
import { time } from 'console';

export class CasePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickNewButton(): Promise<void> {
      Logger.step('Click New button in Case page');
      const newButton = this.page.getByRole('button', { name: 'New' }).first();
      await this.waitForVisible(newButton, 30000);
      await newButton.click({ force: true });
      Logger.pass('Clicked New button in Case page');
    }

    async selectCaseType(): Promise<void> {
      Logger.step('Select Case Type');
      
        const caseRadioLabel = this.page.locator('label').filter({ hasText: 'Home Care - Invoice Adjustment' }).first();

        await this.waitForVisible(caseRadioLabel, 20000);
        await caseRadioLabel.click();

        const nextButton = this.page.getByRole('button', { name: 'Next' }).first();
        await this.waitForVisible(nextButton, 10000);
        await nextButton.click();

        await this.page.waitForTimeout(5000);

      Logger.pass('Selected Case Type: Issue');
    }

    async selectCaseDropdown(label: string, value: string): Promise<void> {
      Logger.step(`Select dropdown value for ${label}: ${value}`);

      const dropdown = this.page.locator(`[role="combobox"][aria-label="${label}"]`).first();
      await this.waitForVisible(dropdown, 30000);
      await dropdown.scrollIntoViewIfNeeded();
      await dropdown.click({ force: true });

      const option = this.page.locator('[role="option"]').filter({
        hasText: new RegExp(`^${value}$`, 'i'),
      }).first();

      await this.waitForVisible(option, 30000);
      await option.scrollIntoViewIfNeeded();
      await option.click({ force: true });
      Logger.pass(`Selected dropdown value for ${label}: ${value}`);
    }

    async fillTextFields(label: string, value: string): Promise<void> {
      Logger.step(`Fill text field for ${label}: ${value}`);

      const textField = this.page.locator(`[role="textbox"][aria-label="${label}"]`).first();
      await this.waitForVisible(textField, 30000);
      await textField.scrollIntoViewIfNeeded();
      await textField.fill(value);
      Logger.pass(`Filled text field for ${label}: ${value}`);
    }


      async clickSearchInvoiceAndAddNewInvoice(): Promise<void> {
    Logger.step('Click Search Invoice and select New Invoice');


    const fundingInput = this.page.getByRole('combobox', { name: 'Invoice ID', exact: true });

    // Open dropdown
    await fundingInput.waitFor({ state: 'visible', timeout: 60000 });
    await fundingInput.scrollIntoViewIfNeeded();
    await fundingInput.click();

    // Select "New Funding"
    const newFunding = this.page.getByText('New Invoice', { exact: false });

    await newFunding.waitFor({ state: 'visible', timeout: 10000 });
    await newFunding.scrollIntoViewIfNeeded();   // 👈 scroll here too
    await newFunding.click();

    Logger.pass('Clicked New Invoice from search');
  }


    async selectAccountFromSearch(firstName: string, lastName: string): Promise<void> {
      const runNumber = PropertyReader.getRunNumber(1);
      const accountName = `${firstName} ${lastName}${runNumber}`;

      Logger.step(`Select account in Case: ${accountName}`);

      const accountInput = this.page.locator(CaseLocators.accountSearchInput).last();
      await this.waitForVisible(accountInput, 30000);
      await this.scrollIntoView(accountInput);
      await accountInput.fill(accountName);
      await this.staticWait(1500);
      await accountInput.click({ force: true });

      const anyListboxOption = this.page.locator(CaseLocators.listboxOptions).first();
      const optionsVisible = await anyListboxOption.isVisible().catch(() => false);
      if (!optionsVisible) {
        const searchIconButton = accountInput.locator(CaseLocators.searchIconInCombobox).first();
        if (await searchIconButton.isVisible().catch(() => false)) {
          await searchIconButton.click({ force: true });
          await this.staticWait(1200);
        }
      }

      const showMoreResults = this.page
        .locator(CaseLocators.listboxOptions)
        .filter({ hasText: `Show more results for "${accountName}"` })
        .first();

      if (await showMoreResults.isVisible().catch(() => false)) {
        await showMoreResults.click({ force: true });

        const advancedSearchHeading = this.page.locator(CaseLocators.advancedSearchHeading).first();
        await expect(advancedSearchHeading).toBeVisible({ timeout: 30000 });

        const advancedSearchAccount = this.page.locator(CaseLocators.advancedSearchAccountInput).first();
        await this.waitForVisible(advancedSearchAccount, 30000);
        await advancedSearchAccount.fill(accountName);
        await this.staticWait(1200);

        const firstRadioLabel = this.page.locator(CaseLocators.advancedSearchFirstRowRadio).first();
        await this.waitForVisible(firstRadioLabel, 30000);
        await firstRadioLabel.click({ force: true });

        const selectButton = this.page.locator(CaseLocators.advancedSearchSelectButton).first();
        await this.waitForVisible(selectButton, 30000);
        await expect.poll(async () => selectButton.isEnabled(), { timeout: 30000 }).toBeTruthy();
        await selectButton.click({ force: true });

        await expect(advancedSearchHeading).toBeHidden({ timeout: 30000 });
      } else {
        const listboxId = await accountInput.getAttribute('aria-controls');
        const accountResult = listboxId
          ? this.page
              .locator(`#${listboxId} [role='option'], #${listboxId} li`)
              .filter({ hasText: accountName })
              .first()
          : this.page
              .locator(CaseLocators.listboxOptions)
              .filter({ hasText: accountName })
              .first();

        await this.waitForVisible(accountResult, 30000);
        await accountResult.click({ force: true });
      }

      Logger.pass(`Selected account in Case: ${accountName}`);
    }

    async selectParticipantFromSearch(firstName: string, lastName: string): Promise<void> {
      const runNumber = PropertyReader.getRunNumber(1);
      const accountName = `${firstName} ${lastName}${runNumber}`;

      Logger.step(`Select participant in Case: ${accountName}`);

      const accountInput = this.page.locator(CaseLocators.participantSearchInput).last();
      await this.waitForVisible(accountInput, 30000);
      await this.scrollIntoView(accountInput);
      await accountInput.fill(accountName);
      await this.staticWait(1500);
      await accountInput.click({ force: true });

      const anyListboxOption = this.page.locator(CaseLocators.listboxOptions).first();
      const optionsVisible = await anyListboxOption.isVisible().catch(() => false);
      if (!optionsVisible) {
        const searchIconButton = accountInput.locator(CaseLocators.searchIconInCombobox).first();
        if (await searchIconButton.isVisible().catch(() => false)) {
          await searchIconButton.click({ force: true });
          await this.staticWait(1200);
        }
      }

      const showMoreResults = this.page
        .locator(CaseLocators.listboxOptions)
        .filter({ hasText: `Show more results for "${accountName}"` })
        .first();

      if (await showMoreResults.isVisible().catch(() => false)) {
        await showMoreResults.click({ force: true });

        const advancedSearchHeading = this.page.locator(CaseLocators.advancedSearchHeading).first();
        await expect(advancedSearchHeading).toBeVisible({ timeout: 30000 });

        const advancedSearchAccount = this.page.locator(CaseLocators.advancedSearchAccountInput).first();
        await this.waitForVisible(advancedSearchAccount, 30000);
        await advancedSearchAccount.fill(accountName);
        await this.staticWait(1200);

        const firstRadioLabel = this.page.locator(CaseLocators.advancedSearchFirstRowRadio).first();
        await this.waitForVisible(firstRadioLabel, 30000);
        await firstRadioLabel.click({ force: true });

        const selectButton = this.page.locator(CaseLocators.advancedSearchSelectButton).first();
        await this.waitForVisible(selectButton, 30000);
        await expect.poll(async () => selectButton.isEnabled(), { timeout: 30000 }).toBeTruthy();
        await selectButton.click({ force: true });

        await expect(advancedSearchHeading).toBeHidden({ timeout: 30000 });
      } else {
        const listboxId = await accountInput.getAttribute('aria-controls');
        const accountResult = listboxId
          ? this.page
              .locator(`#${listboxId} [role='option'], #${listboxId} li`)
              .filter({ hasText: accountName })
              .first()
          : this.page
              .locator(CaseLocators.listboxOptions)
              .filter({ hasText: accountName })
              .first();

        await this.waitForVisible(accountResult, 30000);
        await accountResult.click({ force: true });
      }

      Logger.pass(`Selected participant in Case: ${accountName}`);
    }

    async fillDateField(label: string, value: string) {
  const field = this.page.getByRole('textbox', { name: label }).first();

  await field.waitFor({ state: 'visible' });

  await field.click();
  await field.fill(value);

  // trigger Salesforce change event
  await this.page.keyboard.press('Tab');
}

async getFormattedDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
}

async saveButtonClick(): Promise<void> {
  const saveButton = this.page.getByRole('button', { name: 'Save' }).first();
  await saveButton.waitFor({ state: 'visible', timeout: 30000 });
  await saveButton.scrollIntoViewIfNeeded();
  await saveButton.click();

  Logger.info('Clicked Save button');
}

    async createNewInvoiceInCase(firstName: string, lastName: string): Promise<void> {
      Logger.step('Create new invoice from Case page');

      this.selectParticipantFromSearch(firstName, lastName);
      this.selectCaseDropdown('Funding Type', 'HACC-PYP');
      this.selectCaseDropdown('Invoice Recipient', 'Participant');
      this.fillDateField('Invoice Date', await this.getFormattedDate(0));
      this.fillDateField('Invoice ClosureDate', await this.getFormattedDate(1));
      this.selectAccountFromSearch(firstName, lastName);
      this.fillDateField('Dispatch Date', await this.getFormattedDate(1));
      this.selectCaseDropdown('Cancellation Reason', 'Customer Request');
      this.selectCaseDropdown('Dispatch Status', 'To be dispatched');
      this.saveButtonClick();
      
      Logger.pass('Created new invoice from Case page');
    }

    async SubmitforApproval(): Promise<void> {
      Logger.step('Submit case for approval');

      const submitForApprovalButton = this.page.getByRole('button', { name: 'Submit for Approval' }).first();
      await this.waitForVisible(submitForApprovalButton, 30000);
      await submitForApprovalButton.scrollIntoViewIfNeeded();
      await submitForApprovalButton.click();

      Logger.pass('Clicked Submit for Approval button');
    }

    async verifySubmitToProceed(): Promise<void> {
      Logger.step('Verify submit for approval is successful');

      await this.page
      .getByText(/Submit For Approval/i)
      .waitFor({ state: 'visible', timeout: 15000 });

      await this.page.getByRole('button', { name: 'Proceed' }).click();
      await this.page.waitForTimeout(5000); 

      await expect(
        this.page.getByText(/Submit For Approval/i)
      ).toBeVisible({ timeout: 15000 });

      await expect(
        this.page.getByText(/Case successfully submitted for Approval/i)
      ).toBeVisible({ timeout: 15000 });

      const doneBtn = this.page.getByRole('button', { name: 'Done' });

      await doneBtn.waitFor({ state: 'visible', timeout: 10000 });
      await doneBtn.click();

      Logger.pass('Case submitted for approval successfully');
    }

    async approveRequest(): Promise<void> {
      Logger.step('Approve the case approval request');
      await this.page.getByLabel('Approve').check({ force: true });

      await this.page.getByLabel('Approve').check({ force: true });

      await this.page
        .getByRole('textbox', { name: 'Decision Comments' })
        .fill('Approved via automation');

      await this.page.getByRole('button', { name: 'Next' }).click();

      await this.page
        .getByRole('button', { name: 'Next' })
        .click();


        await this.page.waitForTimeout(3000);

        Logger.pass('Approved the case approval request');

    }

}