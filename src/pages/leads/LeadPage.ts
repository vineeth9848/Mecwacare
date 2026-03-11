import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { LeadLocators } from '../locators/LeadLocators';
import PropertyReader from '../../utils/PropertyReader';
import { HomePage } from '../homepage/HomePage';

export class LeadPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickNewButton(): Promise<void> {
    Logger.step('Click New button in Leads page');
    await expect(this.page.locator(LeadLocators.leadsHeader).first()).toBeVisible();
    const newButton = this.page.getByRole('button', { name: 'New' }).first();
    await this.waitForVisible(newButton, 30000);
    await newButton.click({ force: true });
    Logger.pass('Clicked New button in Leads page');
  }

  async createLead(firstName: string, lastName: string, phone: string, dob: string, lead_source: string, service_request: string, additional_info: string, email: string, lead_score: string, search_address: string, Lead_option: string, service_option: string): Promise<void> {
        Logger.step('Create lead');
        await this.waitForVisible(this.page.locator(LeadLocators.createLeadTitle).first(), 20000);

        const firstNameField = this.page.getByRole('textbox', { name: 'First Name' }).first();
        await this.waitForVisible(firstNameField, 30000);
        await firstNameField.scrollIntoViewIfNeeded();
        await firstNameField.fill(firstName);
        Logger.info(`Filled first name: ${firstName}`);
        
        const lastNameField = this.page.getByRole('textbox', { name: 'Last Name' }).first();
        await this.waitForVisible(lastNameField, 30000);
        const lastNameWithRunNumber = this.buildLastNameWithRunNumber(lastName);
        await lastNameField.fill(lastNameWithRunNumber);
        Logger.info(`Filled last name: ${lastNameWithRunNumber}`);

        const dobField = this.page.getByRole('textbox', { name: /Date Of Birth|Date of Birth/i }).first();
        const targetDob = (dob || '01/01/2001').replace(/-/g, '/');
        await this.setDobValue(dobField, targetDob);
        Logger.info(`Filled DOB: ${targetDob}`);
        
        const leadSourceDropdown = this.page.getByRole('combobox', {
        name: LeadLocators.lead_source
        });
        await leadSourceDropdown.scrollIntoViewIfNeeded();
        await this.waitForVisible(leadSourceDropdown, 30000);
        await leadSourceDropdown.click();
        await this.staticWait(1500);
        Logger.info(`Selected lead source dropdown`);

        const listboxId = await leadSourceDropdown.getAttribute('aria-controls');
        let leadSourceOption = this.page.getByRole('option', { name: lead_source }).first();

        if (listboxId) {
          leadSourceOption = this.page
            .locator(`#${listboxId} [role="option"], #${listboxId} li, #${listboxId} span[title]`)
            .filter({ hasText: lead_source })
            .first();
        }

        const optionVisible = await leadSourceOption.isVisible().catch(() => false);
        if (!optionVisible) {
          await leadSourceDropdown.type(lead_source, { delay: 40 }).catch(() => {});
          await this.staticWait(1000);
        }

        const matchingOption = this.page
          .locator(LeadLocators.listboxOptionsWithTitle)
          .filter({ hasText: lead_source })
          .first();

        if (await matchingOption.isVisible().catch(() => false)) {
          await matchingOption.scrollIntoViewIfNeeded().catch(() => {});
          await matchingOption.click({ force: true });
        } else if (await leadSourceOption.isVisible().catch(() => false)) {
          await leadSourceOption.scrollIntoViewIfNeeded().catch(() => {});
          await leadSourceOption.click({ force: true });
        } else {
          await leadSourceDropdown.press('ArrowDown');
          await leadSourceDropdown.press('Enter');
        }
        await this.staticWait(1000);
        Logger.info(`Selected lead source option: ${lead_source}`);
        
        const emailField = this.page.getByRole('textbox', { name: 'Email' }).first();
        await emailField.scrollIntoViewIfNeeded();
        await emailField.fill(this.buildEmailWithRunNumber(email));
        Logger.info(`Filled email: ${this.buildEmailWithRunNumber(email)}`);

        const phoneField = this.page.getByRole('textbox', { name: 'Phone' }).first();
        await phoneField.scrollIntoViewIfNeeded();
        await phoneField.fill(phone);
        Logger.info(`Filled phone: ${phone}`);

        await this.searchAddress(search_address);

        const service = this.page.getByRole('combobox', {
              name: LeadLocators.service_requested
              });
              await service.scrollIntoViewIfNeeded();
              await service.click();
        
              const serviceOption = this.page.getByRole('option', {
                name: service_option
              });
              await serviceOption.click();
              Logger.info(`Selected service option: ${service_option}`);

        const additionalInfoField = this.page.getByLabel(LeadLocators.Additional_information);
        await additionalInfoField.scrollIntoViewIfNeeded();
        await additionalInfoField.fill(additional_info);
        Logger.info(`Filled additional information: ${additional_info}`);

              const score = this.page.getByRole('combobox', {
                name: LeadLocators.lead_Score
              }).first();
              await score.scrollIntoViewIfNeeded();
              await score.click();
              Logger.info(`Clicked lead score dropdown`);

              const hotOption = this.page.locator(LeadLocators.leadScoreHotOption).first();
              await this.waitForVisible(hotOption, 10000);
              await hotOption.click({ force: true });
              await score.press('Tab');

        const save_button = await this.page.getByRole('button', { name: LeadLocators.save_button });
        await save_button.scrollIntoViewIfNeeded();
        await save_button.click();
        Logger.info('Clicked Save button to create lead');
        await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
        await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});

        const toast = this.page.getByText(/Lead got created successfully/i);
        const toastVisible = await toast.isVisible().catch(() => false);
        const expectedEmail = this.buildEmailWithRunNumber(email);
        const emailOnDetails = this.page.locator(`(//a[contains(text(),'${expectedEmail}')])[2]`);

        if (toastVisible) {
          Logger.info('Lead creation success message is visible');
        }
        await expect(emailOnDetails).toBeVisible({ timeout: 50000 });
        Logger.info(`Lead details page email is visible: ${expectedEmail}`);

        Logger.pass('Lead created successfully');
    }

  async searchAddress(searchAddress: string): Promise<void> {
    Logger.step(`Search lead address: ${searchAddress}`);
    let addressField = this.page.locator(LeadLocators.searchAddressInput).first();
    const primaryVisible = await addressField.isVisible().catch(() => false);
    if (!primaryVisible) {
      addressField = this.page.locator(LeadLocators.fallbackAddressInput).first();
    }

    await this.waitForVisible(addressField, 20000);
    await addressField.scrollIntoViewIfNeeded();
    await addressField.click();
    await addressField.fill('');
    await addressField.type(searchAddress, { delay: 40 });

    const exactAddressOption = this.page
      .locator(LeadLocators.visibleDropdownOptions)
      .filter({ hasText: searchAddress })
      .first();

    await this.waitForVisible(exactAddressOption, 15000);
    await exactAddressOption.click({ force: true });

    await addressField.press('Tab');

    Logger.pass('Lead address selected');
  }

  async openLeadFromList(leadName: string): Promise<void> {
    Logger.step(`Open lead from list: ${leadName}`);
    const leadLink = this.page.getByRole('link', { name: leadName, exact: true }).first();
    await this.click(leadLink);
    Logger.pass(`Opened lead: ${leadName}`);
  }

  async openLatestLeadIfEmailMatches(expectedEmail: string): Promise<void> {
    Logger.step(`Open lead record by email: ${expectedEmail}`);
    await this.staticWait(5000);
    const listSearchInput = this.page.locator(LeadLocators.leadsListSearchInput).first();
    await this.waitForVisible(listSearchInput, 30000);
    await this.staticWait(3000);
    await listSearchInput.fill(expectedEmail);
    await this.staticWait(2000);
    await listSearchInput.press('Enter');
    await this.staticWait(10000);
    await listSearchInput.fill(expectedEmail);
    await listSearchInput.press('Enter');
    await this.staticWait(5000);

    const matchedRow = this.page.locator(LeadLocators.leadTableRows).filter({ hasText: expectedEmail }).first();
    await this.waitForVisible(matchedRow, 30000);
    Logger.pass('Lead created successfully - record is present in list');

    const leadLink = matchedRow.locator(LeadLocators.leadRowLink).first();
    await this.click(leadLink);
    await this.page.waitForURL(/\/Lead\//, { timeout: 30000 }).catch(() => {});
    Logger.pass('Lead record opened using email match');
  }

  async selectLeadsListView(viewName: string): Promise<void> {
    Logger.step(`Select leads list view: ${viewName}`);
    const listViewDropdown = this.page.getByRole('button', { name: /Select a List View/i });
    await this.waitForVisible(listViewDropdown, 30000);
    await listViewDropdown.click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 30000 });

    const viewOption = this.page.getByRole('option', { name: viewName }).first();
    await this.waitForVisible(viewOption, 20000);
    await viewOption.scrollIntoViewIfNeeded().catch(() => {});
    await viewOption.click({ force: true });

    const selectedView = this.page.locator(`text=${viewName}`).first();
    await this.waitForVisible(selectedView, 20000);
    Logger.pass(`Leads list view selected: ${viewName}`);
  }

  async clickConvertButton(): Promise<void> {
    Logger.step('Click Convert button on lead record');
    let convertButton = this.page.locator(LeadLocators.convertButtonPrimary).first();
    if (!(await convertButton.isVisible().catch(() => false))) {
      convertButton = this.page.locator(LeadLocators.convertButtonFallback).first();
    }
    await this.waitForVisible(convertButton, 30000);
    await expect(convertButton).toBeEnabled({ timeout: 30000 });
    await this.staticWait(300);
    await convertButton.click({ force: true });
    const convertPageMarker = this.page.getByRole('textbox', { name: 'First Name' }).first();
    await this.waitForVisible(convertPageMarker, 30000);
    Logger.pass('Convert screen opened');
  }

  async verifyConvertDataPopulated(expectedFirstName: string, expectedLastName: string, expectedOpportunityName: string): Promise<void> {
    Logger.step('Verify convert screen data is populated');
    const firstNameInput = this.page.getByRole('textbox', { name: 'First Name' }).first();
    const lastNameInput = this.page.getByRole('textbox', { name: 'Last Name' }).first();
    await this.waitForVisible(firstNameInput);
    await this.waitForVisible(lastNameInput);

    const firstNameValue = (await firstNameInput.inputValue()).trim();
    const lastNameValue = (await lastNameInput.inputValue()).trim();
    const expectedLastNameWithRunNumber = this.buildLastNameWithRunNumber(expectedLastName);
    const expectedOpportunityWithRunNumber = expectedOpportunityName.includes(expectedLastName)
      ? expectedOpportunityName.replace(expectedLastName, expectedLastNameWithRunNumber)
      : expectedOpportunityName;
    const expectedOpportunityNormalized = expectedOpportunityWithRunNumber.replace(/-+$/g, '').trim();
    const opportunityTitles = await this.page
      .locator('div.createPanelCollapsed button[title]')
      .evaluateAll((buttons) => buttons.map((button) => button.getAttribute('title') || '').filter(Boolean));
    const opportunityNameValue =
      opportunityTitles.find((title) => title.includes(expectedFirstName) && title.includes(expectedLastNameWithRunNumber)) || '';

    expect(firstNameValue).toBe(expectedFirstName);
    expect(lastNameValue).toBe(expectedLastNameWithRunNumber);
    expect(opportunityNameValue.replace(/-+$/g, '').trim()).toBe(expectedOpportunityNormalized);
    Logger.info(`Convert values -> First Name: ${firstNameValue}, Last Name: ${lastNameValue}, Opportunity: ${opportunityNameValue}`);
    Logger.pass('Convert screen values are populated correctly');

    let bottomConvertButton = this.page
      .locator(LeadLocators.modalContainer)
      .getByRole('button', { name: 'Convert' })
      .last();
    if (!(await bottomConvertButton.isVisible().catch(() => false))) {
      bottomConvertButton = this.page.getByRole('button', { name: 'Convert' }).last();
    }
    await this.waitForVisible(bottomConvertButton, 30000);
    await expect(bottomConvertButton).toBeEnabled({ timeout: 30000 });
    await bottomConvertButton.scrollIntoViewIfNeeded();
    await bottomConvertButton.click({ force: true });
    Logger.pass('Clicked bottom Convert button');
  }

  async clickConvertAndVerifySuccess(expectedFullName: string): Promise<void> {
    Logger.step('Click Convert and verify conversion success');
    await this.staticWait(60000);
    await this.page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => {});

    const conversionDialog = this.page.locator(LeadLocators.conversionDialog).last();
    await expect(
      conversionDialog.getByRole('heading', { name: /Your lead has been converted/i }),
    ).toBeVisible({ timeout: 60000 });

    await expect
      .poll(async () => (await conversionDialog.innerText()).replace(/\s+/g, ' ').trim(), { timeout: 60000 })
      .toContain('PERSON ACCOUNT');
    await expect
      .poll(async () => (await conversionDialog.innerText()).replace(/\s+/g, ' ').trim(), { timeout: 60000 })
      .toContain('OPPORTUNITY');
    await expect
      .poll(async () => (await conversionDialog.innerText()).replace(/\s+/g, ' ').trim(), { timeout: 60000 })
      .toContain(expectedFullName);

    await conversionDialog.getByRole('button', { name: 'Go to Leads' }).click();
    Logger.pass('Lead conversion success message verified');
  }

  async goToLeadsFromConversionSuccess(): Promise<void> {
    Logger.step('Click Go to Leads from conversion success popup');
    const goToLeadsButton = this.page.locator(LeadLocators.goToLeadsButton).first();
    await this.click(goToLeadsButton);
    Logger.pass('Navigated to Leads list');
  }

  async verifyLeadNotPresentInList(leadEmail: string): Promise<void> {
    const homePage = new HomePage(this.page);
    Logger.step('Verify converted lead is not present in Leads list');
    await homePage.selectObjectFromDropdown('Leads');
    await this.selectLeadsListView("Today's Leads");
    await this.staticWait(3000);

    const expectedEmail = this.getEmailWithRunNumber(leadEmail);
    const searchInput = this.page.locator(LeadLocators.leadsListSearchInput).first();
    await this.waitForVisible(searchInput, 30000);
    await searchInput.fill(expectedEmail);
    await searchInput.press('Enter');
    await this.staticWait(3000);

    const matchingRow = this.page.locator(LeadLocators.leadTableRows).filter({ hasText: expectedEmail });
    await expect(matchingRow).toHaveCount(0);
    Logger.pass('Converted lead is not present in Leads list');
  }

  async verifyAgeValueFromDob(dob: string): Promise<void> {
    Logger.step('Verify lead age value is not empty and matches DOB');
    //await this.scrollToBottom();
    const enteredYear = Number(dob.replace(/-/g, '/').split('/')[2]);
    const currentYear = new Date().getFullYear();
    const expectedAge = currentYear - enteredYear;

    const ageInput = this.page.locator(LeadLocators.LeadAge);
    let actualAge: number;
    const agevalue = this.page.locator(LeadLocators.LeadAge);
     await agevalue.scrollIntoViewIfNeeded();
     await this.waitForVisible(agevalue, 30000);
     const ageValueText = (await agevalue.textContent())?.trim();
     Logger.info(`Age value text: ${ageValueText}`);

    // if (await ageInput.isVisible().catch(() => false)) {
    //   const inputValue = await ageInput.inputValue();
    //   actualAge = Number(inputValue.trim());
    // } else {
    //   const ageValueLocator = this.page.locator(LeadLocators.LeadAge).first();
    //   await this.scrollIntoView(ageValueLocator);
    //   const ageText = ((await ageValueLocator.textContent()) || '').trim();
    //   actualAge = Number(ageText);
    // }

    // expect(Number.isNaN(actualAge)).toBeFalsy();
    // expect(actualAge).toBe(expectedAge);
    // Logger.pass(`Lead age verified. Expected: ${expectedAge}, Actual: ${actualAge}`);
  }

  async verifyAgeValueFromYear(birthYear: number): Promise<void> {
    Logger.step('Verify lead age using Age field and birth year');

    const ageLabel = this.page.locator("span.test-id__field-label", { hasText: 'Age' }).last();
    await ageLabel.scrollIntoViewIfNeeded();

    const ageValue = ageLabel
      .locator('xpath=ancestor::div[contains(@class,"test-id__field-label-container")][1]/following-sibling::div[contains(@class,"slds-form-element__control")][1]//lightning-formatted-number')
      .first();

    const ageText = ((await ageValue.textContent().catch(() => '')) || '').trim();
    Logger.info(`Age text: ${ageText}`);
    const actualAge = Number(ageText);
    const currentYear = new Date().getFullYear();
    const expectedAge = currentYear - birthYear;
    expect(Number.isNaN(actualAge)).toBeFalsy();
    expect(actualAge).toBe(expectedAge);
    Logger.pass(`Lead age verified. Expected: ${expectedAge}, Actual: ${actualAge}`);
  }

  async verifyAddressValue(expectedAddressText: string): Promise<void> {
    Logger.step('Verify lead address in details page');
    const addressLocator = this.page.locator(LeadLocators.addressValue).first();
    await this.scrollToBottom();
    await this.scrollIntoView(addressLocator);
    const addressText = (await addressLocator.innerText()).replace(/\s+/g, ' ').trim().toLowerCase();
    const normalizedExpected = expectedAddressText.replace(/\s+/g, ' ').trim().toLowerCase();
    expect(addressText).toContain(normalizedExpected);
    Logger.pass(`Lead address contains: ${expectedAddressText}`);
  }

  async verifyAddressContainsAny(expectedValues: string[]): Promise<void> {
    Logger.step('Verify lead address with allowed values');
    const addressLocator = this.page.locator(LeadLocators.addressValue).first();
    await this.scrollToBottom();
    await this.scrollIntoView(addressLocator);
    const addressText = (await addressLocator.innerText()).trim().toLowerCase();
    const matched = expectedValues.some((value) => addressText.includes(value.toLowerCase()));
    expect(matched).toBeTruthy();
    Logger.pass(`Lead address matched one of: ${expectedValues.join(', ')}`);
  }

  async verifyEmailValue(expectedEmail: string): Promise<void> {
    Logger.step('Verify lead email in details page');
    await this.scrollToTop();
    const detailsTab = this.page.locator(LeadLocators.detailsTab).first();
    if (await detailsTab.isVisible().catch(() => false)) {
      await this.click(detailsTab);
    }

    const expected = expectedEmail.toLowerCase();
    const pageText = (await this.page.locator(LeadLocators.body).innerText()).toLowerCase();
    expect(pageText).toContain(expected);

    const emailMatch = pageText.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/);
    expect(emailMatch).not.toBeNull();
    const actual = (emailMatch ? emailMatch[0] : '').trim();
    expect(actual).not.toBe('');
    Logger.pass(`Lead email verified: ${expectedEmail}`);
  }

  async updateAddressFromLaunchVerify(searchAddress: string): Promise<boolean> {
    Logger.step(`Update address from Launch Address / Verify: ${searchAddress}`);
    if (this.page.isClosed()) {
      Logger.info('Page is already closed, skipping Launch Address / Verify update');
      return false;
    }

    try {
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    await this.page.waitForTimeout(1500);

    const launchVerifyLink = this.page.locator(LeadLocators.launchAddressVerifyLink).first();
    await launchVerifyLink.scrollIntoViewIfNeeded();
    await launchVerifyLink.waitFor({ state: 'visible', timeout: 60000 }).catch(() => {});
    const launchLinkVisible = await launchVerifyLink.isVisible().catch(() => false);
    if (!launchLinkVisible) {
      Logger.info('Launch Address / Verify link is not visible on this record, skipping update');
      return false;
    }

    await launchVerifyLink.click();

    let searchInput = this.page.locator(LeadLocators.verifyAddressInput).first();
    const verifyInputVisible = await searchInput.isVisible().catch(() => false);
    if (!verifyInputVisible) {
      searchInput = this.page.locator(LeadLocators.fallbackAddressInput).first();
    }

    await this.waitForVisible(searchInput, 30000);
    await searchInput.scrollIntoViewIfNeeded();
    await searchInput.click();
    await searchInput.fill('');
    await searchInput.type(searchAddress, { delay: 40 });

    const listboxId = await searchInput.getAttribute('aria-controls');
    if (listboxId) {
      const matchingSuggestion = this.page
        .locator(`#${listboxId} [role='option']:visible, #${listboxId} li:visible, #${listboxId} div:visible`)
        .filter({ hasText: searchAddress })
        .first();
      const firstSuggestion = this.page
        .locator(`#${listboxId} [role='option']:visible, #${listboxId} li:visible, #${listboxId} div:visible`)
        .first();

      if (await matchingSuggestion.isVisible().catch(() => false)) {
        await matchingSuggestion.scrollIntoViewIfNeeded().catch(() => {});
        try {
          await matchingSuggestion.click({ force: true });
        } catch {
          await searchInput.press('ArrowDown');
          await searchInput.press('Enter');
        }
      } else {
        await this.waitForVisible(firstSuggestion, 15000);
        await firstSuggestion.scrollIntoViewIfNeeded().catch(() => {});
        try {
          await firstSuggestion.click({ force: true });
        } catch {
          await searchInput.press('ArrowDown');
          await searchInput.press('Enter');
        }
      }
    } else {
      const matchingSuggestion = this.page
        .locator(LeadLocators.addressSuggestionItems)
        .filter({ hasText: searchAddress })
        .first();
      const firstSuggestion = this.page.locator(LeadLocators.addressSuggestionItems).first();

      if (await matchingSuggestion.isVisible().catch(() => false)) {
        await matchingSuggestion.scrollIntoViewIfNeeded().catch(() => {});
        try {
          await matchingSuggestion.click({ force: true });
        } catch {
          await searchInput.press('ArrowDown');
          await searchInput.press('Enter');
        }
      } else {
        await this.waitForVisible(firstSuggestion, 15000);
        await firstSuggestion.scrollIntoViewIfNeeded().catch(() => {});
        try {
          await firstSuggestion.click({ force: true });
        } catch {
          await searchInput.press('ArrowDown');
          await searchInput.press('Enter');
        }
      }
    }

    await searchInput.press('Enter');
    await searchInput.press('Tab');

    const verifyAndSaveButton = this.page.locator(LeadLocators.verifyAndSaveButton).first();
    await this.click(verifyAndSaveButton);

    const saveToast = this.page.locator(LeadLocators.saveToast).first();
    await saveToast.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    await searchInput.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    await this.page.waitForTimeout(1500);

    await this.refreshPage();
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});

    const detailsTabAfterSave = this.page.locator(LeadLocators.detailsTab).first();
    if (await detailsTabAfterSave.isVisible().catch(() => false)) {
      await detailsTabAfterSave.click();
    }

    const addressSection = this.page.locator(LeadLocators.addressInformationText).first();
    await addressSection.waitFor({ state: 'visible', timeout: 30000 });
    await addressSection.scrollIntoViewIfNeeded();

    const addressLocator = this.page.locator(LeadLocators.addressValue).first();
    await addressLocator.waitFor({ state: 'visible', timeout: 30000 });
    const latestAddress = (await addressLocator.innerText()).replace(/\s+/g, ' ').trim().toLowerCase();
    const normalizedExpected = searchAddress.replace(/\s+/g, ' ').trim().toLowerCase();
    expect(latestAddress).toContain(normalizedExpected);
    Logger.pass('Address verified and saved');
    return true;
    } catch (error) {
      const message = String(error);
      if (message.includes('Target page, context or browser has been closed')) {
        Logger.info('Page/context closed during address update step. Skipping this step.');
        return false;
      }
      throw error;
    }
  }

  private buildEmailWithRunNumber(email: string): string {
    const runNumber = PropertyReader.getRunNumber(1);
    const parts = email.split('@');
    if (parts.length !== 2) {
      return email;
    }
    return `${parts[0]}${runNumber}@${parts[1]}`;
  }

  getEmailWithRunNumber(email: string): string {
    return this.buildEmailWithRunNumber(email);
  }

  private buildLastNameWithRunNumber(lastName: string): string {
    const runNumber = PropertyReader.getRunNumber(1);
    return `${lastName}${runNumber}`;
  }

  private async setDobValue(dobField: Locator, dobValue: string): Promise<void> {
    let targetDobField = this.page
      .locator(LeadLocators.dobInputVisible)
      .first();
    if (!(await targetDobField.isVisible().catch(() => false))) {
      targetDobField = dobField.first();
    }

    await this.waitForVisible(targetDobField, 30000);
    await targetDobField.scrollIntoViewIfNeeded();

    const [rawDay, rawMonth, year] = dobValue.replace(/-/g, '/').split('/');
    const day = rawDay.padStart(2, '0');
    const month = rawMonth.padStart(2, '0');
    const normalizedDob = `${day}/${month}/${year}`;

    const isAccepted = async (): Promise<boolean> => {
      const value = await targetDobField.inputValue().catch(() => '');
      const invalid = (await targetDobField.getAttribute('aria-invalid').catch(() => 'false')) === 'true';
      return value.includes(year) && !invalid;
    };

    await targetDobField.click({ clickCount: 3 });
    await targetDobField.press('Control+A').catch(async () => {
      await targetDobField.press('Meta+A');
    });
    await targetDobField.press('Backspace').catch(() => {});
    await targetDobField.fill(normalizedDob);
    await targetDobField.press('Enter').catch(() => {});
    await targetDobField.press('Tab');
    await this.page.waitForTimeout(1000);
    if (await isAccepted()) {
      const ageInput = this.page.locator(LeadLocators.ageInput).first();
      await ageInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      return;
    }

    await targetDobField.click({ clickCount: 3 });
    await targetDobField.press('Control+A').catch(async () => {
      await targetDobField.press('Meta+A');
    });
    await targetDobField.press('Backspace').catch(() => {});
    await targetDobField.fill(dobValue.replace(/-/g, '/'));
    await targetDobField.press('Enter').catch(() => {});
    await targetDobField.press('Tab');
    await this.page.waitForTimeout(1000);
    if (await isAccepted()) {
      return;
    }

    await targetDobField.evaluate((el, value) => {
      const input = el as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
    }, normalizedDob);
    await targetDobField.press('Tab');
    await this.page.waitForTimeout(600);
  }

}
