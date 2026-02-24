import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { OpportunityLocators } from '../locators/OpportunityLocators';

export class OpportunityPage extends BasePage {
  private readonly newButton = this.page.locator(OpportunityLocators.newButton).first();
  private readonly accountNameInput = this.page.locator(OpportunityLocators.accountNameInput).first();
  private readonly firstOpportunityLink = this.page.locator(OpportunityLocators.firstOpportunityLink).first();
  private readonly detailsTab = this.page.locator(OpportunityLocators.detailsTab).first();
  private readonly fundingDetailsSection = this.page.locator(OpportunityLocators.fundingDetailsSection).first();
  private readonly fundingSourceLabel = this.page.locator(OpportunityLocators.fundingSourceLabel).first();
  private readonly fundingTypeLabel = this.page.locator(OpportunityLocators.fundingTypeLabel).first();
  private readonly fundingSourceValue = this.page.locator(OpportunityLocators.fundingSourceValue).first();
  private readonly fundingTypeValue = this.page.locator(OpportunityLocators.fundingTypeValue).first();
  private readonly fundingValue = this.page.locator(OpportunityLocators.fundingValue).first();
  private readonly assessmentVisitPreferenceDropdown = this.page
    .locator(OpportunityLocators.assessmentVisitPreferenceDropdown)
    .first();
  private readonly referrerTypeDropdown = this.page.locator(OpportunityLocators.referrerTypeDropdown).first();
  private readonly virtualOption = this.page.locator(OpportunityLocators.virtualOption).first();
  private readonly familyViolenceProgramsOption = this.page
    .locator(OpportunityLocators.familyViolenceProgramsOption)
    .first();
  private readonly opportunitySaveButton = this.page.locator(OpportunityLocators.opportunitySaveButton).first();
  private readonly fundingSourceDropdown = this.page.locator(OpportunityLocators.fundingSourceDropdown).first();
  private readonly fundingTypeDropdown = this.page.locator(OpportunityLocators.fundingTypeDropdown).first();
  private readonly supportAtHomeOption = this.page.locator(OpportunityLocators.supportAtHomeOption).first();
  private readonly fundingSearchInput = this.page.locator(OpportunityLocators.fundingSearchInput).first();
  private readonly newFundingOption = this.page.locator(OpportunityLocators.newFundingOption).first();
  private readonly newFundingHeader = this.page.locator(OpportunityLocators.newFundingHeader).first();
  private readonly participantInput = this.page.locator(OpportunityLocators.participantInput).first();
  private readonly participantFirstResult = this.page.locator(OpportunityLocators.participantFirstResult).first();
  private readonly newFundingSourceDropdown = this.page.locator(OpportunityLocators.newFundingSourceDropdown).first();
  private readonly newFundingTypeDropdown = this.page.locator(OpportunityLocators.newFundingTypeDropdown).first();
  private readonly newFundingSaveButton = this.page.locator(OpportunityLocators.newFundingSaveButton).first();

  constructor(page: Page) {
    super(page);
  }

  async clickNewButton(): Promise<void> {
    Logger.step('Click New button in Opportunities page');
    await this.click(this.newButton);
    Logger.pass('Clicked New button in Opportunities page');
  }

  async selectAccountName(accountName: string): Promise<void> {
    Logger.step(`Select account name in Opportunity: ${accountName}`);
    await this.waitForVisible(this.accountNameInput);
    await this.accountNameInput.fill(accountName);

    const matchingOption = this.page
      .locator(OpportunityLocators.accountNameOptions)
      .filter({ hasText: accountName })
      .first();

    await this.waitForVisible(matchingOption);
    await matchingOption.click();
    await expect(this.accountNameInput).toHaveValue(new RegExp(accountName, 'i'));
    Logger.pass(`Selected account name in Opportunity: ${accountName}`);
  }

  async openFirstOpportunityRecord(): Promise<void> {
    Logger.step('Open first opportunity record from list');
    await this.waitForVisible(this.firstOpportunityLink);
    await this.click(this.firstOpportunityLink);
    Logger.pass('Opened first opportunity record');
  }

  async openDetailsTab(): Promise<void> {
    Logger.step('Open Opportunity details tab');
    await this.click(this.detailsTab);
    Logger.pass('Opportunity details tab opened');
  }

  async verifyFundingSourceAndType(): Promise<void> {
    Logger.step('Verify Funding Source and Funding Type in details');
    await this.scrollIntoView(this.fundingDetailsSection);
    await expect(this.fundingDetailsSection).toBeVisible();
    await expect(this.fundingSourceLabel).toBeVisible();
    await expect(this.fundingTypeLabel).toBeVisible();
    Logger.pass('Funding Source and Funding Type are visible');
  }

  async selectSupportAtHomeForFundingSourceAndType(): Promise<void> {
    Logger.step('Select Support at Home for Funding Source');
    await this.scrollIntoView(this.fundingDetailsSection);
    await this.click(this.fundingSourceDropdown);
    await this.click(this.supportAtHomeOption);
    await expect(this.fundingSourceDropdown).toContainText('Support at Home');
    Logger.pass('Funding Source selected as Support at Home');

    Logger.step('Select Support at Home for Funding Type');
    await this.click(this.fundingTypeDropdown);
    await this.click(this.supportAtHomeOption);
    await expect(this.fundingTypeDropdown).toContainText('Support at Home');
    Logger.pass('Funding Type selected as Support at Home');
  }

  async clickSearchFundingAndAddNewFunding(): Promise<void> {
    Logger.step('Click Search Funding and select New Funding');
    await this.scrollIntoView(this.fundingSearchInput);
    await this.click(this.fundingSearchInput);
    await this.click(this.newFundingOption);
    Logger.pass('Clicked New Funding from search');
  }

  async fillNewFundingAndSave(participantSearchText: string): Promise<void> {
    Logger.step('Fill New Funding form');
    await expect(this.newFundingHeader).toBeVisible();

    await this.fill(this.participantInput, participantSearchText);
    await this.click(this.participantFirstResult);

    await this.click(this.newFundingSourceDropdown);
    await this.click(this.supportAtHomeOption);
    await expect(this.newFundingSourceDropdown).toContainText('Support at Home');

    await this.click(this.newFundingTypeDropdown);
    await this.click(this.supportAtHomeOption);
    await expect(this.newFundingTypeDropdown).toContainText('Support at Home');

    await this.click(this.newFundingSaveButton);
    Logger.pass('New Funding form saved');
  }

  async verifyFundingDetailsAfterSave(): Promise<void> {
    Logger.step('Verify Funding, Funding Source and Funding Type values');
    await this.scrollIntoView(this.fundingDetailsSection);

    await expect(this.fundingSourceValue).toContainText('Support at Home');
    await expect(this.fundingTypeValue).toContainText('Support at Home');

    const fundingText = (await this.fundingValue.innerText()).trim();
    expect(fundingText).not.toBe('');
    expect(fundingText.toUpperCase()).toContain('FUND');
    Logger.pass('Funding details values verified');
  }

  async updateAssessmentVisitAndReferrerType(): Promise<void> {
    Logger.step('Set Assessment visit preference as Virtual');
    await this.scrollIntoView(this.assessmentVisitPreferenceDropdown);
    await this.click(this.assessmentVisitPreferenceDropdown);
    await this.click(this.virtualOption);
    await expect(this.assessmentVisitPreferenceDropdown).toContainText('Virtual');
    Logger.pass('Assessment visit preference set to Virtual');

    Logger.step('Set Referrer Type as Family violence programs');
    await this.scrollIntoView(this.referrerTypeDropdown);
    await this.click(this.referrerTypeDropdown);
    await this.click(this.familyViolenceProgramsOption);
    await expect(this.referrerTypeDropdown).toContainText('Family violence programs');
    Logger.pass('Referrer Type set to Family violence programs');

    Logger.step('Save opportunity details');
    await this.click(this.opportunitySaveButton);
    Logger.pass('Opportunity details saved');
  }
}
