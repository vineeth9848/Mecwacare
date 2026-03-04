import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { OpportunityLocators } from '../locators/OpportunityLocators';
import PropertyReader from '../../utils/PropertyReader';

export class OpportunityPage extends BasePage {
  private readonly newButton = this.page.locator(OpportunityLocators.newButton).first();
  private readonly accountNameInput = this.page.locator(OpportunityLocators.accountNameInput).first();
  private readonly firstOpportunityLink = this.page.locator(OpportunityLocators.firstOpportunityLink).first();
  private readonly detailsTab = this.page.locator(OpportunityLocators.detailsTab).first();
  private readonly fundingDetailsSection = this.page.locator(OpportunityLocators.fundingDetailsSection).first();
  private readonly fundingSourceEditButton = this.page
    .locator(OpportunityLocators.fundingSourceEditButton)
    .first();
  private readonly fundingSourceLabel = this.page.locator(OpportunityLocators.fundingSourceLabel).first();
  private readonly fundingTypeLabel = this.page.locator(OpportunityLocators.fundingTypeLabel).first();
  private readonly fundingSourceValue = this.page.locator(OpportunityLocators.fundingSourceValue).first();
  private readonly fundingTypeValue = this.page.locator(OpportunityLocators.fundingTypeValue).first();
  private readonly fundingValue = this.page.locator(OpportunityLocators.fundingValue).first();
  private readonly assessmentVisitPreferenceDropdown = this.page
    .locator(OpportunityLocators.assessmentVisitPreferenceDropdown)
    .first();
  private readonly virtualOption = this.page.locator(OpportunityLocators.virtualOption).first();
  private readonly opportunitySaveButton = this.page.locator(OpportunityLocators.opportunitySaveButton).first();
  private readonly fundingSourceDropdown = this.page.locator(OpportunityLocators.fundingSourceDropdown).first();
  private readonly fundingTypeDropdown = this.page.locator(OpportunityLocators.fundingTypeDropdown).first();
  private readonly supportAtHomeOption = this.page.locator(OpportunityLocators.supportAtHomeOption).first();
  private readonly fundingSearchInput = this.page.locator(OpportunityLocators.fundingSearchInput).first();
  private readonly newFundingOption = this.page.locator(OpportunityLocators.newFundingOption).first();
  private readonly participantInput = this.page.locator(OpportunityLocators.participantInput).first();
  private readonly participantFirstResult = this.page.locator(OpportunityLocators.participantFirstResult).first();
  private readonly newFundingSourceDropdown = this.page.locator(OpportunityLocators.newFundingSourceDropdown).first();
  private readonly newFundingTypeDropdown = this.page.locator(OpportunityLocators.newFundingTypeDropdown).first();
  private readonly newFundingSaveButton = this.page.locator(OpportunityLocators.newFundingSaveButton).first();

  constructor(page: Page) {
    super(page);
  }

  private async selectOptionFromCombobox(combobox: Locator, optionText: string): Promise<void> {
    await this.waitForVisible(combobox, 30000);
    await combobox.scrollIntoViewIfNeeded();
    await combobox.click({ force: true });

    const listboxId = await combobox.getAttribute('aria-controls');
    const optionInScopedListbox = listboxId
      ? this.page
          .locator(`#${listboxId} [role='option'], #${listboxId} li, #${listboxId} span[title]`)
          .filter({ hasText: new RegExp(`^\\s*${optionText}\\s*$`, 'i') })
          .first()
      : this.page
          .locator("[role='listbox'] [role='option'], [role='listbox'] li, [role='listbox'] span[title]")
          .filter({ hasText: new RegExp(`^\\s*${optionText}\\s*$`, 'i') })
          .first();

    const optionInAnyListbox = this.page
      .locator("[role='listbox'] [role='option'], [role='listbox'] li, [role='listbox'] span[title]")
      .filter({ hasText: new RegExp(`^\\s*${optionText}\\s*$`, 'i') })
      .first();

    if (await optionInScopedListbox.isVisible().catch(() => false)) {
      await optionInScopedListbox.scrollIntoViewIfNeeded().catch(() => {});
      await optionInScopedListbox.click({ force: true });
    } else if (await optionInAnyListbox.isVisible().catch(() => false)) {
      await optionInAnyListbox.scrollIntoViewIfNeeded().catch(() => {});
      await optionInAnyListbox.click({ force: true });
    } else {
      await combobox.press('ArrowDown').catch(() => {});
      await combobox.press('Enter').catch(() => {});
    }

    await this.page.keyboard.press('Enter').catch(() => {});
    await this.page.keyboard.press('Tab').catch(() => {});
    if (listboxId) {
      await this.page.locator(`#${listboxId}`).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }
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

  async selectOpportunitiesListView(viewName: string): Promise<void> {
    Logger.step(`Select opportunities list view: ${viewName}`);
    const listViewDropdown = this.page.locator(OpportunityLocators.listViewDropdown).first();
    await this.waitForVisible(listViewDropdown, 30000);
    await listViewDropdown.click({ force: true });

    await this.page.waitForSelector('[role="listbox"]', { timeout: 30000 });
    const listViewOption = this.page
      .locator(OpportunityLocators.listViewOption)
      .filter({ hasText: viewName })
      .first();
    await this.waitForVisible(listViewOption, 30000);
    await listViewOption.scrollIntoViewIfNeeded().catch(() => {});
    await listViewOption.click({ force: true });
    Logger.pass(`Opportunities list view selected: ${viewName}`);
  }

  async searchAndOpenOpportunityByLeadName(firstName: string, lastName: string): Promise<void> {
    const runNumber = PropertyReader.getRunNumber(1);
    const fullNameWithRunNumber = `${firstName} ${lastName}${runNumber}`;
    Logger.step(`Search and open opportunity for: ${fullNameWithRunNumber}`);

    const searchInput = this.page.locator(OpportunityLocators.listSearchInput).first();
    await this.waitForVisible(searchInput, 30000);
    await searchInput.fill(fullNameWithRunNumber);
    await searchInput.press('Enter');
    await this.staticWait(3000);

    const matchedRow = this.page.locator(OpportunityLocators.tableRows).filter({ hasText: fullNameWithRunNumber }).first();
    await this.waitForVisible(matchedRow, 30000);

    const rowLink = matchedRow.locator(OpportunityLocators.rowLink).first();
    await this.click(rowLink);
    Logger.pass(`Opened opportunity record for: ${fullNameWithRunNumber}`);
  }

  async openDetailsTab(): Promise<void> {
    Logger.step('Open Opportunity details tab');
    await this.page.waitForLoadState('domcontentloaded');
    await this.staticWait(1500);

    const fundingSourceLabelVisible = await this.page
      .locator("span.test-id__field-label:has-text('Funding Source'):visible")
      .first()
      .isVisible()
      .catch(() => false);
    if (fundingSourceLabelVisible) {
      Logger.info('Details tab already open');
      Logger.pass('Opportunity details tab opened');
      return;
    }

    const detailsTabCandidates = [
      this.page.getByRole('tab', { name: 'Details' }).first(),
      this.page.getByRole('link', { name: 'Details' }).first(),
      this.page.locator("a[title='Details']").first(),
    ];

    for (const tab of detailsTabCandidates) {
      const visible = await tab.isVisible().catch(() => false);
      if (visible) {
        await tab.click({ force: true });
        break;
      }
    }

    await this.staticWait(2000);
    Logger.pass('Opportunity details tab opened');
  }

  async selectSupportAtHomeForFundingSourceAndType(): Promise<void> {
    Logger.step('Update Funding Source to Support at Home');

    const fundingDetailsSection = this.page
      .locator("button:has-text('Funding Details'):visible, span[title='Funding Details']:visible")
      .first();
    await this.waitForVisible(fundingDetailsSection, 30000);
    await fundingDetailsSection.scrollIntoViewIfNeeded();
    await this.staticWait(1000);

    const fundingSourceLabelCandidates = this.page
      .locator('span.test-id__field-label')
      .filter({ hasText: /^Funding Source$/ });

    let visibleFundingSourceLabel: Locator | null = null;
    const labelCount = await fundingSourceLabelCandidates.count();
    for (let i = 0; i < labelCount; i++) {
      const candidate = fundingSourceLabelCandidates.nth(i);
      if (await candidate.isVisible().catch(() => false)) {
        visibleFundingSourceLabel = candidate;
        break;
      }
    }

    if (!visibleFundingSourceLabel) {
      throw new Error('Visible Funding Source label not found in details section');
    }

    await visibleFundingSourceLabel.scrollIntoViewIfNeeded();

    const fundingSourceEditButton = visibleFundingSourceLabel
      .locator("xpath=ancestor::record_flexipage-record-field[1]//button[contains(@title,'Edit Funding Source')]")
      .first();
    await this.waitForVisible(fundingSourceEditButton, 30000);
    await fundingSourceEditButton.click({ force: true });

    const fundingSourceDropdown = this.page
      .getByRole('combobox', { name: /Funding Source/i })
      .first();
    await this.waitForVisible(fundingSourceDropdown, 30000);
    await fundingSourceDropdown.click({ force: true });
    await this.staticWait(1200);

    const listboxId = await fundingSourceDropdown.getAttribute('aria-controls');
    let supportAtHomeOption = this.page.getByRole('option', { name: 'Support at Home' }).first();

    if (listboxId) {
      supportAtHomeOption = this.page
        .locator(`#${listboxId} [role='option'], #${listboxId} li, #${listboxId} span[title]`)
        .filter({ hasText: 'Support at Home' })
        .first();
    }

    const optionVisible = await supportAtHomeOption.isVisible().catch(() => false);
    if (!optionVisible) {
      await fundingSourceDropdown.type('Support at Home', { delay: 40 }).catch(() => {});
      await this.staticWait(1000);
    }

    const matchingOption = this.page
      .locator("[role='listbox'] [role='option'], [role='listbox'] li, [role='listbox'] span[title]")
      .filter({ hasText: 'Support at Home' })
      .first();

    if (await matchingOption.isVisible().catch(() => false)) {
      await matchingOption.scrollIntoViewIfNeeded().catch(() => {});
      await matchingOption.click({ force: true });
    } else if (await supportAtHomeOption.isVisible().catch(() => false)) {
      await supportAtHomeOption.scrollIntoViewIfNeeded().catch(() => {});
      await supportAtHomeOption.click({ force: true });
    } else {
      await fundingSourceDropdown.press('ArrowDown');
      await fundingSourceDropdown.press('Enter');
    }

    const fundingTypeButton = this.page.locator("button[role='combobox'][aria-label*='Funding Type']").first();
    const fundingTypeInput = this.page.locator("input[role='combobox'][aria-label*='Funding Type']").first();
    const fundingTypeButtonVisible = await fundingTypeButton.isVisible().catch(() => false);

    if (fundingTypeButtonVisible) {
      await expect(fundingTypeButton).toContainText('Support at Home', { timeout: 30000 });
    } else {
      await expect(fundingTypeInput).toHaveValue(/Support at Home/i, { timeout: 30000 });
    }
    Logger.pass('Funding Type auto-populated as Support at Home');

    // await this.page.getByRole('button', { name: 'Save' }).first().click({ force: true });
    Logger.pass('Funding Source updated to Support at Home');
  }

  async clickSearchFundingAndAddNewFunding(): Promise<void> {
    Logger.step('Click Search Funding and select New Funding');

    const fundingInput = this.page.getByRole('combobox', { name: /^Funding$/i }).first();
    await this.waitForVisible(fundingInput, 30000);
    await this.scrollIntoView(fundingInput);
    await fundingInput.click({ force: true });
    await this.staticWait(1000);

    const listboxId = await fundingInput.getAttribute('aria-controls');
    const newFundingRowScoped = listboxId
      ? this.page
          .locator(`#${listboxId} [role='option'], #${listboxId} li, #${listboxId} span[title]`)
          .filter({ hasText: /^\s*New Funding\s*$/ })
          .first()
      : this.page
          .locator("[role='listbox'] [role='option'], [role='listbox'] li, [role='listbox'] span[title]")
          .filter({ hasText: /^\s*New Funding\s*$/ })
          .first();

    const newFundingRowGlobal = this.page
      .locator("[role='listbox'] [role='option'], [role='listbox'] li, [role='listbox'] span[title]")
      .filter({ hasText: /^\s*New Funding\s*$/ })
      .first();

    const rowVisible = await newFundingRowScoped.isVisible().catch(() => false);
    if (rowVisible) {
      await newFundingRowScoped.scrollIntoViewIfNeeded().catch(() => {});
      await newFundingRowScoped.click({ force: true });
    } else if (await newFundingRowGlobal.isVisible().catch(() => false)) {
      await newFundingRowGlobal.scrollIntoViewIfNeeded().catch(() => {});
      await newFundingRowGlobal.click({ force: true });
    } else {
      await fundingInput.press('ArrowDown');
      await fundingInput.press('Enter');
    }

    await this.staticWait(10000);

    Logger.pass('Clicked New Funding from search');
  }

  async selectParticipantInNewFunding(firstName: string, lastName: string): Promise<void> {
    const runNumber = PropertyReader.getRunNumber(1);
    const participantName = `${firstName} ${lastName}${runNumber}`;

    Logger.step(`Select participant in New Funding: ${participantName}`);
    const participantInput = this.page.getByPlaceholder('Search Contacts...').first();
    await this.waitForVisible(participantInput, 30000);
    await this.scrollIntoView(participantInput);
    await participantInput.fill(participantName);
    await this.staticWait(1500);
    await participantInput.click({ force: true });
    await this.staticWait(800);
    await this.staticWait(1000);

    const anyListboxOption = this.page
      .locator("[role='listbox'] [role='option'], [role='listbox'] li, [role='listbox'] span[title]")
      .first();
    const optionsVisible = await anyListboxOption.isVisible().catch(() => false);
    if (!optionsVisible) {
      const searchIconButton = participantInput
        .locator("xpath=ancestor::div[contains(@class,'slds-combobox')]//button[contains(@title,'Search') or contains(@aria-label,'Search')]")
        .first();
      if (await searchIconButton.isVisible().catch(() => false)) {
        await searchIconButton.click({ force: true });
        await this.staticWait(1200);
      }
    }

    const showMoreResults = this.page
      .locator("[role='listbox'] [role='option'], [role='listbox'] li")
      .filter({ hasText: `Show more results for \"${participantName}\"` })
      .first();

    const showMoreVisible = await showMoreResults.isVisible().catch(() => false);
    if (showMoreVisible) {
      await showMoreResults.click({ force: true });

      const advancedSearchHeading = this.page.getByRole('heading', { name: 'Advanced Search' }).first();
      await expect(advancedSearchHeading).toBeVisible({ timeout: 30000 });

      const advancedSearchParticipant = this.page.locator("input[aria-label='Participant']").first();
      await this.waitForVisible(advancedSearchParticipant, 30000);
      await advancedSearchParticipant.fill(participantName);
      await this.staticWait(1200);

      const firstRadioLabel = this.page.locator('table tbody tr label.slds-radio__label').first();
      await this.waitForVisible(firstRadioLabel, 30000);
      await firstRadioLabel.click({ force: true });

      const selectButton = this.page
        .locator("lightning-modal-footer button.slds-button_brand:has-text('Select'), button.slds-button_brand:has-text('Select')")
        .first();
      await this.waitForVisible(selectButton, 30000);
      await expect.poll(async () => selectButton.isEnabled(), { timeout: 30000 }).toBeTruthy();
      await selectButton.click({ force: true });

      await expect(advancedSearchHeading).toBeHidden({ timeout: 30000 });
    } else {
      const listboxId = await participantInput.getAttribute('aria-controls');
      const escapedName = participantName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const participantResult = listboxId
        ? this.page
            .locator(`#${listboxId} [role='option'], #${listboxId} li`)
            .filter({ hasText: new RegExp(`^\\s*${escapedName}(\\s|$)`, 'i') })
            .first()
        : this.page
            .locator("[role='listbox'] [role='option'], [role='listbox'] li")
            .filter({ hasText: new RegExp(`^\\s*${escapedName}(\\s|$)`, 'i') })
            .first();

      await this.waitForVisible(participantResult, 30000);
      await participantResult.click({ force: true });
    }

    Logger.pass(`Participant selected in New Funding: ${participantName}`);
  }

  async selectNewFundingSourceSupportAtHomeWithoutSave(): Promise<void> {
    Logger.step('Select New Funding Source as Support at Home');
    const participantInput = this.page.getByRole('combobox', { name: 'Participant' }).first();
    await this.waitForVisible(participantInput, 30000);
    await this.selectOptionFromCombobox(this.newFundingSourceDropdown, 'Support at Home');
    await expect
      .poll(async () => (await this.newFundingSourceDropdown.textContent())?.trim() || '')
      .toContain('Support at Home');
    Logger.pass('New Funding Source selected as Support at Home');
  }

  async selectNewFundingSourceAndTypeSupportAtHomeAndSave(): Promise<void> {
    Logger.step('Select New Funding Source as Support at Home');
    const fundingSourceDropdown = this.page.locator("xpath=(//button[@aria-label='Funding Source'])[2]");
    await this.waitForVisible(fundingSourceDropdown, 30000);
    await fundingSourceDropdown.click({ force: true });
    const fundingSourceListboxId = await fundingSourceDropdown.getAttribute('aria-controls');
    const fundingSourceOption = fundingSourceListboxId
      ? this.page
          .locator(
            `#${fundingSourceListboxId} [data-value='Support at Home'], #${fundingSourceListboxId} [role='option'], #${fundingSourceListboxId} li`,
          )
          .filter({ hasText: /^Support at Home$/ })
          .first()
      : this.page
          .locator("[role='listbox'] [data-value='Support at Home'], [role='listbox'] [role='option'], [role='listbox'] li")
          .filter({ hasText: /^Support at Home$/ })
          .first();
    await this.waitForVisible(fundingSourceOption, 30000);
    await fundingSourceOption.scrollIntoViewIfNeeded().catch(() => {});
    await fundingSourceOption.click({ force: true });
    await expect(fundingSourceDropdown).toContainText('Support at Home', { timeout: 30000 });
    Logger.pass('New Funding Source selected as Support at Home');

    Logger.step('Select New Funding Type as Support at Home');
    const fundingTypeDropdown = this.page.locator("xpath=(//button[@aria-label='Funding Type'])[2]");
    await this.waitForVisible(fundingTypeDropdown, 30000);
    await fundingTypeDropdown.click({ force: true });
    const fundingTypeListboxId = await fundingTypeDropdown.getAttribute('aria-controls');
    const fundingTypeOption = fundingTypeListboxId
      ? this.page
          .locator(
            `#${fundingTypeListboxId} [data-value='Support at Home'], #${fundingTypeListboxId} [role='option'], #${fundingTypeListboxId} li`,
          )
          .filter({ hasText: /^Support at Home$/ })
          .first()
      : this.page
          .locator("[role='listbox'] [data-value='Support at Home'], [role='listbox'] [role='option'], [role='listbox'] li")
          .filter({ hasText: /^Support at Home$/ })
          .first();
    await this.waitForVisible(fundingTypeOption, 30000);
    await fundingTypeOption.scrollIntoViewIfNeeded().catch(() => {});
    await fundingTypeOption.click({ force: true });
    await expect(fundingTypeDropdown).toContainText('Support at Home', { timeout: 30000 });
    Logger.pass('New Funding Type selected as Support at Home');

    Logger.step('Save New Funding');
    const saveButton = this.page.locator("xpath=(//button[text()='Save'])[2]");
    await this.waitForVisible(saveButton, 30000);
    await saveButton.click({ force: true });
    Logger.pass('New Funding saved');
  }


  async selectAssessmentVisitPreferenceInPerson(): Promise<void> {
    Logger.step('Select Assessment visit preference as In-Person');
    const assessmentDropdown = this.page.locator(
    "button[aria-label='Assessment visit preference?']"
);

    await assessmentDropdown.scrollIntoViewIfNeeded();

    await assessmentDropdown.click();

    await this.page.getByText('In-Person', { exact: true }).click();

    await this.page.waitForTimeout(5000);

    await expect(assessmentDropdown).toContainText('In-Person', { timeout: 30000 });

    Logger.pass('Assessment visit preference set to In-Person');
  }

  async selectServiceAgreementStatus(): Promise<void> {
    Logger.step('Select Service Agreement Status as Active');
    const serviceAgreementStatus = this.page.locator("button[aria-label='Service Agreement Status']");
    
    await serviceAgreementStatus.scrollIntoViewIfNeeded();

    const serviceAgreementStatusDropdown = this.page.locator("button[aria-label='Service Agreement Status']");
    
    await serviceAgreementStatusDropdown.click();

    await this.page.getByText('Signed', { exact: true }).click();

    await this.page.waitForTimeout(5000);

    await expect(serviceAgreementStatusDropdown).toContainText('Signed', { timeout: 30000 });
    Logger.pass('Service Agreement Status set to Signed');
  }

  async selectReferrerTypeFamilyViolencePrograms(): Promise<void> {
    Logger.step('Select Referrer Type as Family violence programs');
    const referrerDetailsSection = this.page.locator("xpath=(//button[@aria-label='Referrer Type'])");
    
    await referrerDetailsSection.scrollIntoViewIfNeeded();

    const referrerTypeDropdown = this.page.locator('xpath=(//button[@aria-label="Referrer Type"])');
    
    await referrerTypeDropdown.click();

    await this.page.getByText('Family violence programs', { exact: true }).click();

    await this.page.waitForTimeout(5000);

    await expect(referrerTypeDropdown).toContainText('Family violence programs', { timeout: 30000 });
    Logger.pass('Referrer Type set to Family violence programs');
  }

  async saveOpportunityDetails(): Promise<void> {
    Logger.step('Save opportunity details');
    const saveButton = this.page.locator('xpath=(//button[text()="Save"])');
    await this.waitForVisible(saveButton, 30000);
    await saveButton.scrollIntoViewIfNeeded();
    await saveButton.click();
    await this.page.waitForTimeout(5000);
    Logger.pass('Opportunity details saved');
  }

  async verifyQuoteNotGenerated(): Promise<void> {
    Logger.step('Verify the quote is not generated ');
    const generateQuote = this.page.locator('xpath=(//button[text()="Generate Quote"])');
    await this.waitForVisible(generateQuote, 30000);
    await generateQuote.scrollIntoViewIfNeeded();
    await generateQuote.click();
    await this.page.waitForTimeout(5000);
    Logger.pass('Generate Quote button clicked');

    const QuoteText = this.page.locator('xpath=(//p[text()="Quote cannot be generated as no products available for this opportunity."])');

    await expect(QuoteText).toContainText('Quote cannot be generated as no products available for this opportunity.', { timeout: 30000 });

      Logger.pass('Verified that quote cannot be generated due to no products available');

    const quoteCloseButton = this.page.locator('xpath=(//button[text()="Close"])');
    await this.waitForVisible(quoteCloseButton, 30000);
    await quoteCloseButton.click();
    await this.page.waitForTimeout(5000);

    Logger.pass('Closed the quote dialog');

  }

  async switchToRelatedTab(): Promise<void> {
    Logger.step('Select Switch to related tab');
    const relatedTab = this.page.getByText('Related', { exact: true }).first();
    await relatedTab.scrollIntoViewIfNeeded();
    await relatedTab.click();
    await this.page.waitForTimeout(5000);

    Logger.pass('Switched to Related tab');
  }

  async configurePriceBook(): Promise<void> {
    Logger.step('Select Choose Price Book');
    const relatedTab = this.page.getByText('Choose Price Book', { exact: true }).first();
    await relatedTab.scrollIntoViewIfNeeded();
    await relatedTab.click();
    await this.page.waitForTimeout(5000);

    const enterPriceBook = this.page.locator('input[aria-label="Price Book"]');
    await this.waitForVisible(enterPriceBook, 30000);
    await enterPriceBook.click();
    await enterPriceBook.press('Delete');
    await enterPriceBook.clear();
    await enterPriceBook.fill('Support At Home');
    await this.page.waitForTimeout(5000);
    await enterPriceBook.press('ArrowDown');
    await enterPriceBook.press('Enter');
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.page.waitForTimeout(5000);

    Logger.pass('Price Book configured Successfully');
  }
}
