import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { LeadLocators } from '../locators/LeadLocators';
import PropertyReader from '../../utils/PropertyReader';

export class LeadPage extends BasePage {
  private readonly newButton = this.page.locator(LeadLocators.newButton);

  constructor(page: Page) {
    super(page);
  }

  async clickNewButton(): Promise<void> {
    Logger.step('Click New button in Leads page');
    await expect(this.page.locator(LeadLocators.leadsHeader).first()).toBeVisible();
    await expect(this.newButton.first()).toBeVisible();
    await this.click(this.newButton.first());
    Logger.pass('Clicked New button in Leads page');
  }

  async createLead(firstName: string, lastName: string, phone: string, dob: string, lead_source: string, service_request: string, additional_info: string, email: string, lead_score: string, search_address: string, Lead_option: string, service_option: string): Promise<void> {
        Logger.step('Create lead');
        await this.waitForVisible(this.page.locator(LeadLocators.createLeadTitle).first(), 20000);

        const firstNameField = this.page.locator(LeadLocators.firstNameInput).first();
        await this.waitForVisible(firstNameField, 30000);
        await firstNameField.scrollIntoViewIfNeeded();
        await firstNameField.fill(firstName);
        Logger.info(`Filled first name: ${firstName}`);
        
        const lastNameField = this.page.locator(LeadLocators.lastNameInput).first();
        await this.waitForVisible(lastNameField, 30000);
        await lastNameField.fill(lastName);
        Logger.info(`Filled last name: ${lastName}`);

        const dobField = this.page.locator(LeadLocators.leadDobInput).first();
        const targetDob = (dob || '01/01/2001').replace(/-/g, '/');
        await this.setDobValue(dobField, targetDob);
        Logger.info(`Filled DOB: ${targetDob}`);
        
        const leadSourceDropdown = this.page.getByRole('combobox', {
        name: LeadLocators.lead_source
        });
        await leadSourceDropdown.click();
        Logger.info(`Selected lead source dropdown`);

        const leadSourceOption = this.page.getByRole('option', {
          name: lead_source
        });
        await leadSourceOption.click();
        Logger.info(`Selected lead source option: ${lead_source}`);
        
        const emailField = this.page.locator(LeadLocators.leadEmailInput).first();
        await emailField.scrollIntoViewIfNeeded();
        await emailField.fill(this.buildEmailWithRunNumber(email));
        Logger.info(`Filled email: ${this.buildEmailWithRunNumber(email)}`);

        const phoneField = this.page.locator(LeadLocators.leadPhoneInput).first();
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
        await this.staticWait(10000);

        const toast = this.page.getByText(/Lead got created successfully/i);
        await expect(toast).toBeVisible({ timeout: 20000 });
        Logger.info('Lead creation success message is visible');

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

    const matchedRow = this.page.locator('table tbody tr').filter({ hasText: expectedEmail }).first();
    await this.waitForVisible(matchedRow, 30000);

    const leadLink = matchedRow.locator('th a, a').first();
    await this.click(leadLink);
    await this.page.waitForURL(/\/Lead\//, { timeout: 30000 }).catch(() => {});
    Logger.pass('Lead record opened using email match');
  }

  async selectLeadsListView(viewName: string): Promise<void> {
    Logger.step(`Select leads list view: ${viewName}`);
    const listViewPicker = this.page.locator(LeadLocators.leadsListViewPicker).first();
    await this.waitForVisible(listViewPicker, 30000);
    await listViewPicker.click({ force: true });

    const viewOption = this.page
      .locator('[role="listbox"] [role="option"], [role="listbox"] li')
      .filter({ hasText: viewName })
      .first();
    await this.waitForVisible(viewOption, 20000);
    await viewOption.scrollIntoViewIfNeeded().catch(() => {});
    try {
      await viewOption.click();
    } catch {
      await viewOption.click({ force: true });
    }

    const selectedView = this.page.locator(`text=${viewName}`).first();
    await this.waitForVisible(selectedView, 20000);
    Logger.pass(`Leads list view selected: ${viewName}`);
  }

  async clickConvertButton(): Promise<void> {
    Logger.step('Click Convert button on lead record');
    const convertButton = this.page.getByRole('button', { name: 'Convert', exact: true }).first();
    await this.click(convertButton);
    Logger.pass('Convert screen opened');
  }

  async verifyConvertDataPopulated(firstName: string, lastName: string): Promise<void> {
    Logger.step('Verify convert screen data is populated');
    const firstNameInput = this.page.locator(LeadLocators.convertFirstNameInput).first();
    const lastNameInput = this.page.locator(LeadLocators.convertLastNameInput).first();
    const opportunityNameInput = this.page.locator(LeadLocators.convertOpportunityNameInput).first();

    await this.waitForVisible(firstNameInput);
    await this.waitForVisible(lastNameInput);
    await this.waitForVisible(opportunityNameInput);

    const firstNameValue = (await firstNameInput.inputValue()).trim();
    const lastNameValue = (await lastNameInput.inputValue()).trim();
    const opportunityNameValue = (await opportunityNameInput.inputValue()).trim().toLowerCase();

    expect(firstNameValue).not.toBe('');
    expect(lastNameValue).not.toBe('');
    expect(firstNameValue.toLowerCase()).toContain(firstName.toLowerCase());
    expect(lastNameValue.toLowerCase()).toContain(lastName.toLowerCase());
    expect(opportunityNameValue).toContain(firstName.toLowerCase());
    expect(opportunityNameValue).toContain(lastName.toLowerCase());
    Logger.pass('Convert screen values are populated correctly');
  }

  async clickConvertAndVerifySuccess(): Promise<void> {
    Logger.step('Click Convert and verify conversion success');
    const convertConfirmButton = this.page.getByRole('button', { name: 'Convert', exact: true }).last();
    await this.click(convertConfirmButton);
    await expect(this.page.locator(LeadLocators.conversionSuccessMessage)).toBeVisible();
    Logger.pass('Lead conversion success message verified');
  }

  async goToLeadsFromConversionSuccess(): Promise<void> {
    Logger.step('Click Go to Leads from conversion success popup');
    const goToLeadsButton = this.page.locator(LeadLocators.goToLeadsButton).first();
    await this.click(goToLeadsButton);
    Logger.pass('Navigated to Leads list');
  }

  async verifyLeadNotPresentInList(leadName: string): Promise<void> {
    Logger.step(`Verify converted lead is not present in Leads list: ${leadName}`);
    const searchInput = this.page.locator(LeadLocators.leadsListSearchInput).first();
    await this.waitForVisible(searchInput);
    await searchInput.fill(leadName);

    const leadLink = this.page.getByRole('link', { name: leadName, exact: true });
    await expect(leadLink).toHaveCount(0);
    Logger.pass('Converted lead is not present in Leads list');
  }

  async verifyDobValue(expectedDob: string): Promise<void> {
    Logger.step('Verify DOB value in lead details');
    await this.scrollToTop();
    const detailsTab = this.page.locator(LeadLocators.detailsTab).first();
    if (await detailsTab.isVisible().catch(() => false)) {
      await this.click(detailsTab);
    }
    const dobRow = this.page.locator(LeadLocators.dobRow).first();
    await this.scrollIntoView(dobRow);
    const dobValueLocator = this.page.locator(LeadLocators.dobValue).first();
    const dobValueText = (await dobValueLocator.innerText().catch(() => '')).trim();
    const dobRowText = (await dobRow.innerText()).trim();
    const combinedDobText = `${dobValueText} ${dobRowText}`.replace(/\s+/g, ' ').trim();
    const normalizedExpected = expectedDob.replace(/-/g, '/');
    const [day, month, year] = normalizedExpected.split('/');
    const dayValue = String(Number(day));
    const monthValue = String(Number(month));
    const expectedYear = year;

    expect(combinedDobText).toContain(expectedYear);

    const numericDateMatch = combinedDobText.match(/(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/);
    if (numericDateMatch) {
      const actualDob = numericDateMatch[1].replace(/-/g, '/');
      const normalizedDob = `${dayValue}/${monthValue}/${expectedYear}`;
      expect(actualDob).toContain(normalizedDob);
      Logger.pass(`DOB verified. Expected: ${normalizedDob}, Actual: ${actualDob}`);
      return;
    }

    Logger.pass(`DOB year verified in details: ${expectedYear}`);
  }

  async verifyAgeValueFromDob(dob: string): Promise<void> {
    Logger.step('Verify lead age value is not empty and matches DOB');
    await this.scrollToBottom();
    const enteredYear = Number(dob.replace(/-/g, '/').split('/')[2]);
    const currentYear = new Date().getFullYear();
    const expectedAge = currentYear - enteredYear;

    const ageInput = this.page.locator('input[aria-label="Age"]').first();
    let actualAge: number;

    if (await ageInput.isVisible().catch(() => false)) {
      const inputValue = await ageInput.inputValue();
      actualAge = Number(inputValue.trim());
    } else {
      const ageValueLocator = this.page.locator(LeadLocators.ageValue).first();
      await this.scrollIntoView(ageValueLocator);
      const ageText = ((await ageValueLocator.textContent()) || '').trim();
      actualAge = Number(ageText);
    }

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
    const pageText = (await this.page.locator('body').innerText()).toLowerCase();
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

    await this.page.locator('text=Address Information').scrollIntoViewIfNeeded();
    const launchVerifyLink = this.page.locator(LeadLocators.launchAddressVerifyLink).first();
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

    const saveToast = this.page.locator("text=Address verified and saved, text=Saved, [role='alert']").first();
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

    const addressSection = this.page.locator('text=Address Information').first();
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

  private async setDobValue(dobField: Locator, dobValue: string): Promise<void> {
    let targetDobField = this.page
      .locator('input[aria-label="Date Of Birth"]:visible, input[aria-label="Date of Birth"]:visible')
      .first();
    if (!(await targetDobField.isVisible().catch(() => false))) {
      targetDobField = dobField.first();
    }

    await this.waitForVisible(targetDobField, 30000);
    await targetDobField.scrollIntoViewIfNeeded();

    const [day, month, year] = dobValue.replace(/-/g, '/').split('/');
    const normalizedDob = `${Number(day)}/${Number(month)}/${year}`;

    const isAccepted = async (): Promise<boolean> => {
      const value = await targetDobField.inputValue().catch(() => '');
      const invalid = (await targetDobField.getAttribute('aria-invalid').catch(() => 'false')) === 'true';
      return value.includes(year) && !invalid;
    };

    await targetDobField.click();
    await targetDobField.fill('');
    await targetDobField.type(normalizedDob, { delay: 40 });
    await targetDobField.press('Enter').catch(() => {});
    await targetDobField.press('Tab');
    await this.page.waitForTimeout(600);
    if (await isAccepted()) {
      return;
    }

    await targetDobField.click();
    await targetDobField.fill('');
    await targetDobField.type(dobValue, { delay: 40 });
    await targetDobField.press('Enter').catch(() => {});
    await targetDobField.press('Tab');
    await this.page.waitForTimeout(600);
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
