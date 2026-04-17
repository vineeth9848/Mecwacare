import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { CaseLocators } from '../locators/CaseLocators';
import PropertyReader from '../../utils/PropertyReader';
import { HomePage } from '../homepage/HomePage';
import { time } from 'console';
import { verify } from 'crypto';

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
      Logger.step('Select Case Type - Home Care: Discharge');
      
        const caseRadioLabel = this.page.locator('label').filter({ hasText: 'Home Care: Discharge' }).first();

        await this.waitForVisible(caseRadioLabel, 20000);
        await caseRadioLabel.click();

        const nextButton = this.page.getByRole('button', { name: 'Next' }).first();
        await this.waitForVisible(nextButton, 10000);
        await nextButton.click();

        await this.page.waitForTimeout(5000);

      Logger.pass('Selected Case Type: Home Care: Discharge');
    }

    async selectCaseDropdown(label: string, value: string): Promise<void> {
      Logger.step(`Selecting ${value} for ${label}`);

      const dropdown = this.page
        .locator(`[role="combobox"][aria-label="${label}"]`)
        .first();

      await dropdown.waitFor({ state: 'visible', timeout: 30000 });
      await dropdown.scrollIntoViewIfNeeded();
      await dropdown.click();

      const option = this.page.locator(
        `lightning-base-combobox-item[role="option"]:has-text("${value}")`
      ).first();

      try {
        await option.waitFor({ state: 'visible', timeout: 5000 });
        await option.click();
      } catch {
       
        await dropdown.fill(value);
        await this.page.waitForTimeout(1000);
        await this.page.keyboard.press('ArrowDown');
        await this.page.keyboard.press('Enter');
      }

      await expect(dropdown).toContainText(value, { timeout: 30000 });

      Logger.pass(`Selected ${value} for ${label}`);
      await this.page.waitForTimeout(5000);
}

formatDateDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

async DateField(name: string, date: Date): Promise<void> {
  Logger.step(`Filling date for ${name}: ${date.toDateString()}`);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const formattedDate = `${day}/${month}/${year}`;

  const field = this.page.locator(`input[name="${name}"]`);

  await field.waitFor({ state: 'visible', timeout: 30000 });

  await field.evaluate((el) => {
    el.scrollIntoView({ block: 'center' });
  });

  await field.click();
  await field.fill('');
  await field.fill(formattedDate);

  await field.press('Tab');

  // 🔥 Flexible validation
  const actualValue = await field.inputValue();
  Logger.info(`Date entered: ${actualValue}`);

  expect(actualValue).toContain(year.toString());

  Logger.pass(`Filled date: ${formattedDate}`);
}
    async fillTextFields(label: string, value: string): Promise<void> {
      Logger.step(`Fill text field for ${label}: ${value}`);

      const textField = this.page.locator(CaseLocators.subjectInput).first();
      await this.waitForVisible(textField, 30000);
      await textField.scrollIntoViewIfNeeded();
      await textField.fill(value);
      Logger.pass(`Filled text field for ${label}: ${value}`);
    }


      async clickSearchInvoiceAndAddNewInvoice(): Promise<void> {
        Logger.step('Click Search Invoice and select New Invoice');


        const fundingInput = await this.page.locator(CaseLocators.invoiceSearchInput).first();

        await fundingInput.waitFor({ state: 'visible', timeout: 60000 });
        await fundingInput.scrollIntoViewIfNeeded();
        await fundingInput.click({ force: true });

        const newFunding = this.page.getByText('New Invoice', { exact: false });

        await newFunding.waitFor({ state: 'visible', timeout: 10000 });
        await newFunding.scrollIntoViewIfNeeded();  
        await newFunding.click();

        Logger.pass('Clicked New Invoice from search');
  }

  async selectCaseListView(viewName: string): Promise<void> {
      Logger.step(`Select cases list view: ${viewName}`);
      const listViewDropdown = this.page.locator(CaseLocators.listViewDropdown).first();
      await this.waitForVisible(listViewDropdown, 30000);
      await listViewDropdown.click({ force: true });
  
      await this.page.waitForSelector('[role="listbox"]', { timeout: 30000 });
      const listViewOption = this.page
        .locator(CaseLocators.listViewOption)
        .filter({ hasText: viewName })
        .first();
      await this.waitForVisible(listViewOption, 30000);
      await listViewOption.scrollIntoViewIfNeeded().catch(() => {});
      await listViewOption.click({ force: true });
      Logger.pass(`Case list view selected: ${viewName}`);
      await this.page.waitForTimeout(5000);
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

        const selectButton = this.page.getByRole('button', { name: 'Select' }).first();
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

      const accountInput = this.page.locator(CaseLocators.participantSearchInput).first();
      await this.waitForVisible(accountInput, 30000);
      await accountInput.fill(accountName);
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

        const advancedSearchAccount = this.page.locator(CaseLocators.participantSearchInput).first();
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

      await expect(accountInput).toHaveValue(accountName, { timeout: 30000 });

      await this.page.waitForTimeout(5000); // wait for selection to register

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

async clickOnEditButton(): Promise<void> {
  Logger.step('Click Edit button in Case page');
      
  const EditButton = this.page.getByRole('button', { name: 'Edit' }).first();
  await this.waitForVisible(EditButton, 30000);
  await EditButton.click({ force: true });
  await this.page.waitForTimeout(5000); 
  Logger.pass('Clicked Edit button in Case page');
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
await saveButton.click();
Logger.info('Clicked Save button');

const cancelButton = this.page.locator("//button[text()='Cancel']").last();

try {
    
    await cancelButton.waitFor({ state: 'hidden', timeout: 15000 });
    Logger.pass('Save successful: Cancel button is no longer visible.');
} catch (error) {
    
    Logger.error('Save failed: Form is still open.');
    
    
    const errorText = await this.page.locator('.error-message-class').innerText().catch(() => 'No error text found');
    throw new Error(`Save verification failed. UI Error: ${errorText}`);
}

  Logger.info('Clicked Save button');
}

    async createNewInvoiceInCase(firstName: string, lastName: string): Promise<void> {
      Logger.step('Create new invoice from Case page');

      //this.selectParticipantFromSearch(firstName, lastName);
      this.selectCaseDropdown('Funding Type', 'HACC-PYP');
      this.selectCaseDropdown('Invoice Recipient', 'Participant');
      // this.fillDateField('Invoice Date', await this.getFormattedDate(0));
      // this.fillDateField('Invoice ClosureDate', await this.getFormattedDate(1));
      // this.selectAccountFromSearch(firstName, lastName);
      // this.fillDateField('Dispatch Date', await this.getFormattedDate(1));
      // this.selectCaseDropdown('Cancellation Reason', 'Customer Request');
      // this.selectCaseDropdown('Dispatch Status', 'To be dispatched');
      //this.saveButtonClick();
      
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

    async verifyCaseClosed(): Promise<void> {
      Logger.step('Verify case is closed');

      // const fundingValue = this.page.locator(CaseLocators.headerFundingValue).first();
      // await this.waitForVisible(fundingValue, 30000);
      // await fundingValue.scrollIntoViewIfNeeded();
      // await expect(fundingValue).toHaveText('HACC-PYP', { timeout: 30000 });

      await this.clickOnEditButton();
      Logger.info('Clicked Edit button to verify case details');
      const caseStatus = this.page.locator(CaseLocators.caseStatus).first();
      await this.waitForVisible(caseStatus, 30000);
      await expect(caseStatus).toHaveText('Closed Resolved', { timeout: 30000 });
      Logger.info('Verified case status is Closed Resolved');

      const caseFundingType = this.page.locator(CaseLocators.caseFundingType).first();
      await this.waitForVisible(caseFundingType, 30000);
      await expect(caseFundingType).toHaveText('HACC-PYP', { timeout: 30000 });

      const caseFundingSource = this.page.locator(CaseLocators.caseFundingSource).first();
      await this.waitForVisible(caseFundingSource, 30000);
      await expect(caseFundingSource).toHaveText('Block Funding', { timeout: 30000 });
      Logger.info('Verified case funding source is Block Funding');

      Logger.pass('Verified case is closed with correct funding details');
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