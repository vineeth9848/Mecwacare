import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { LeadLocators } from '../locators/LeadLocators';

export class LeadPage extends BasePage {
  private readonly newButton = this.page.locator(LeadLocators.newButton);

  constructor(page: Page) {
    super(page);
  }

  async clickNewButton(): Promise<void> {
    Logger.step('Click New button in Leads page');
    await expect(this.newButton).toBeVisible();
    await this.click(this.newButton);
    Logger.pass('Clicked New button in Leads page');
  }

    async createLead(firstName: string, lastName: string, phone: string, dob: string, lead_source: string, service_request: string, additional_info: string, email: string, lead_score: string, search_address: string, Lead_option: string, service_option: string): Promise<void> {
        Logger.step('Create lead');
        await this.page.waitForTimeout(10000);
        await this.page.getByLabel(LeadLocators.first_name).fill(firstName);
        
        await this.page.getByLabel(LeadLocators.last_name).fill(lastName);

        const dobField = this.page.getByLabel(LeadLocators.dob);
        await dobField.scrollIntoViewIfNeeded();
        await dobField.fill(dob);
        await dobField.press('Tab');
        
        const leadSourceDropdown = this.page.getByRole('combobox', {
        name: LeadLocators.lead_source
        });
        await leadSourceDropdown.click();

        const leadSourceOption = this.page.getByRole('option', {
          name: lead_source
        });
        await leadSourceOption.click();
        
        const emailField = this.page.getByLabel(LeadLocators.email);
        await emailField.scrollIntoViewIfNeeded();
        await emailField.fill(email);

        const phoneField = this.page.getByLabel(LeadLocators.phone);
        await phoneField.scrollIntoViewIfNeeded();
        await phoneField.fill(phone);

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

        const additionalInfoField = this.page.getByLabel(LeadLocators.Additional_information);
        await additionalInfoField.scrollIntoViewIfNeeded();
        await additionalInfoField.fill(additional_info);

              const score = this.page.getByRole('combobox', {
              name: LeadLocators.lead_Score
              });
              await score.scrollIntoViewIfNeeded();
              await score.click();
        
              const individualOption = this.page.getByRole('option', {
                name: Lead_option
              });
              await individualOption.click();

        const save_button = await this.page.getByRole('button', { name: LeadLocators.save_button });
        await save_button.scrollIntoViewIfNeeded();
        await save_button.click();

        const toast = this.page.getByText(/Lead got created successfully/i);

        await expect(toast).toBeVisible();

        Logger.pass('Lead created successfully');
    }

  async searchAddress(searchAddress: string): Promise<void> {
    Logger.step(`Search lead address: ${searchAddress}`);
    const addressField = this.page.getByRole('combobox', {
      name: LeadLocators.search_address,
    });
    await addressField.scrollIntoViewIfNeeded();
    await addressField.fill(searchAddress);
    await addressField.press('ArrowDown');
    await addressField.press('Enter');
    Logger.pass('Lead address selected');
  }

  async openLeadFromList(leadName: string): Promise<void> {
    Logger.step(`Open lead from list: ${leadName}`);
    const leadLink = this.page.getByRole('link', { name: leadName, exact: true }).first();
    await this.click(leadLink);
    Logger.pass(`Opened lead: ${leadName}`);
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
    const detailsTab = this.page.locator(LeadLocators.detailsTab).first();
    await this.click(detailsTab);
    const dobLocator = this.page.locator(LeadLocators.dobValue).first();
    await this.scrollIntoView(dobLocator);
    const actualDob = (await dobLocator.innerText()).trim();
    const [day, month, year] = expectedDob.split('/');
    const normalizedDob = `${Number(day)}/${Number(month)}/${year}`;
    expect(actualDob).toContain(normalizedDob);
    Logger.pass(`DOB verified. Expected: ${normalizedDob}, Actual: ${actualDob}`);
  }

  async verifyAgeValueFromDob(dob: string): Promise<void> {
    Logger.step('Verify lead age value is not empty and matches DOB');
    const ageLocator = this.page.locator(LeadLocators.ageValue).first();
    await this.scrollIntoView(ageLocator);
    const ageText = (await ageLocator.innerText()).trim();
    await expect(ageLocator).not.toHaveText('');
    const actualAge = Number(ageText);
    const expectedAge = this.calculateAgeFromDob(dob);
    expect(actualAge).toBe(expectedAge);
    Logger.pass(`Lead age verified. Expected: ${expectedAge}, Actual: ${actualAge}`);
  }

  async verifyAddressValue(expectedAddressText: string): Promise<void> {
    Logger.step('Verify lead address in details page');
    const addressLocator = this.page.locator(LeadLocators.addressValue).first();
    await this.scrollIntoView(addressLocator);
    await expect(addressLocator).toContainText(expectedAddressText, { ignoreCase: true });
    Logger.pass(`Lead address contains: ${expectedAddressText}`);
  }

  async updateAddressFromLaunchVerify(searchAddress: string): Promise<void> {
    Logger.step(`Update address from Launch Address / Verify: ${searchAddress}`);
    const launchVerifyLink = this.page.locator(LeadLocators.launchAddressVerifyLink).first();
    await this.scrollIntoView(launchVerifyLink);
    await this.click(launchVerifyLink);

    const searchInput = this.page.locator(LeadLocators.verifyAddressInput).first();
    await this.waitForVisible(searchInput);
    await searchInput.fill(searchAddress);

    const firstSuggestion = this.page.locator(LeadLocators.addressSuggestionItems).first();
    await this.waitForVisible(firstSuggestion);
    await firstSuggestion.click();

    const verifyAndSaveButton = this.page.locator(LeadLocators.verifyAndSaveButton).first();
    await this.click(verifyAndSaveButton);
    Logger.pass('Address verified and saved');
  }

  private calculateAgeFromDob(dob: string): number {
    const year = Number(dob.split('/')[2]);
    const currentYear = new Date().getFullYear();
    return currentYear - year;
  }

}
