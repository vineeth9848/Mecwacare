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
          .locator(OpportunityLocators.listboxOptions)
          .filter({ hasText: new RegExp(`^\\s*${optionText}\\s*$`, 'i') })
          .first();

    const optionInAnyListbox = this.page
      .locator(OpportunityLocators.listboxOptions)
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
      .locator(OpportunityLocators.fundingSourceVisibleLabel)
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
      this.page.locator(OpportunityLocators.detailsTabByTitle).first(),
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
      .locator(OpportunityLocators.fundingDetailsSection)
      .first();
    await this.waitForVisible(fundingDetailsSection, 30000);
    await fundingDetailsSection.scrollIntoViewIfNeeded();
    await this.staticWait(1000);

    const fundingSourceLabelCandidates = this.page
      .locator(OpportunityLocators.fundingSourceLabels)
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
      .locator(OpportunityLocators.fundingSourceEditInField)
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
      .locator(OpportunityLocators.listboxOptions)
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

    const fundingTypeButton = this.page.locator(OpportunityLocators.fundingTypeComboboxButton).first();
    const fundingTypeInput = this.page.locator(OpportunityLocators.fundingTypeComboboxInput).first();
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
          .locator(OpportunityLocators.listboxOptions)
          .filter({ hasText: /^\s*New Funding\s*$/ })
          .first();

    const newFundingRowGlobal = this.page
      .locator(OpportunityLocators.listboxOptions)
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
    const participantInput = this.page.locator(OpportunityLocators.participantSearchInput).first();
    await this.waitForVisible(participantInput, 30000);
    await this.scrollIntoView(participantInput);
    await participantInput.fill(participantName);
    await this.staticWait(1500);
    await participantInput.click({ force: true });
    await this.staticWait(800);
    await this.staticWait(1000);

    const anyListboxOption = this.page
      .locator(OpportunityLocators.listboxOptions)
      .first();
    const optionsVisible = await anyListboxOption.isVisible().catch(() => false);
    if (!optionsVisible) {
      const searchIconButton = participantInput
        .locator(OpportunityLocators.searchIconInCombobox)
        .first();
      if (await searchIconButton.isVisible().catch(() => false)) {
        await searchIconButton.click({ force: true });
        await this.staticWait(1200);
      }
    }

    const showMoreResults = this.page
      .locator(OpportunityLocators.listboxOptions)
      .filter({ hasText: `Show more results for \"${participantName}\"` })
      .first();

    const showMoreVisible = await showMoreResults.isVisible().catch(() => false);
    if (showMoreVisible) {
      await showMoreResults.click({ force: true });

      const advancedSearchHeading = this.page.getByRole('heading', { name: 'Advanced Search' }).first();
      await expect(advancedSearchHeading).toBeVisible({ timeout: 30000 });

      const advancedSearchParticipant = this.page.locator(OpportunityLocators.advancedSearchParticipantInput).first();
      await this.waitForVisible(advancedSearchParticipant, 30000);
      await advancedSearchParticipant.fill(participantName);
      await this.staticWait(1200);

      const firstRadioLabel = this.page.locator(OpportunityLocators.advancedSearchFirstRowRadio).first();
      await this.waitForVisible(firstRadioLabel, 30000);
      await firstRadioLabel.click({ force: true });

      const selectButton = this.page
        .locator(OpportunityLocators.advancedSearchSelectButton)
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
            .locator(OpportunityLocators.listboxOptions)
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
    const fundingSourceDropdown = this.page.locator(OpportunityLocators.newFundingSourceDropdownInModal);
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
          .locator(OpportunityLocators.listboxOptions)
          .filter({ hasText: /^Support at Home$/ })
          .first();
    await this.waitForVisible(fundingSourceOption, 30000);
    await fundingSourceOption.scrollIntoViewIfNeeded().catch(() => {});
    await fundingSourceOption.click({ force: true });
    await expect(fundingSourceDropdown).toContainText('Support at Home', { timeout: 30000 });
    Logger.pass('New Funding Source selected as Support at Home');

    Logger.step('Select New Funding Type as Support at Home');
    const fundingTypeDropdown = this.page.locator(OpportunityLocators.newFundingTypeDropdownInModal);
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
          .locator(OpportunityLocators.listboxOptions)
          .filter({ hasText: /^Support at Home$/ })
          .first();
    await this.waitForVisible(fundingTypeOption, 30000);
    await fundingTypeOption.scrollIntoViewIfNeeded().catch(() => {});
    await fundingTypeOption.click({ force: true });
    await expect(fundingTypeDropdown).toContainText('Support at Home', { timeout: 30000 });
    Logger.pass('New Funding Type selected as Support at Home');

    Logger.step('Save New Funding');
    const saveButton = this.page.locator(OpportunityLocators.newFundingSaveButtonInModal);
    await this.waitForVisible(saveButton, 30000);
    await saveButton.click({ force: true });
    Logger.pass('New Funding saved');
  }


  async selectAssessmentVisitPreferenceInPerson(): Promise<void> {
    Logger.step('Select Assessment visit preference as In-Person');
    const assessmentDropdown = this.page.locator(OpportunityLocators.assessmentVisitPreferenceDropdownByAria);

    await assessmentDropdown.scrollIntoViewIfNeeded();

    await assessmentDropdown.click();

    await this.page.getByText(OpportunityLocators.inPersonOptionText, { exact: true }).click();

    await this.page.waitForTimeout(5000);

    await expect(assessmentDropdown).toContainText('In-Person', { timeout: 30000 });

    Logger.pass('Assessment visit preference set to In-Person');
  }

  async selectServiceAgreementStatus(): Promise<void> {
    Logger.step('Select Service Agreement Status as Active');
    const serviceAgreementStatus = this.page.locator(OpportunityLocators.serviceAgreementStatusDropdown);
    
    await serviceAgreementStatus.scrollIntoViewIfNeeded();

    const serviceAgreementStatusDropdown = this.page.locator(OpportunityLocators.serviceAgreementStatusDropdown);
    
    await serviceAgreementStatusDropdown.click();

    await this.page.getByText(OpportunityLocators.serviceAgreementSignedOptionText, { exact: true }).click();

    await this.page.waitForTimeout(5000);

    await expect(serviceAgreementStatusDropdown).toContainText('Signed', { timeout: 30000 });
    Logger.pass('Service Agreement Status set to Signed');
  }

  async selectReferrerTypeFamilyViolencePrograms(): Promise<void> {
    Logger.step('Select Referrer Type as Family violence programs');
    const referrerDetailsSection = this.page.locator(OpportunityLocators.referrerTypeDropdownByAria);
    
    await referrerDetailsSection.scrollIntoViewIfNeeded();

    const referrerTypeDropdown = this.page.locator(OpportunityLocators.referrerTypeDropdownByAria);
    
    await referrerTypeDropdown.click();

    await this.page.getByText(OpportunityLocators.referrerTypeFamilyViolenceOptionText, { exact: true }).click();

    await this.page.waitForTimeout(5000);

    await expect(referrerTypeDropdown).toContainText('Family violence programs', { timeout: 30000 });
    Logger.pass('Referrer Type set to Family violence programs');
  }

  async saveOpportunityDetails(): Promise<void> {
    Logger.step('Save opportunity details');
    const saveButton = this.page.locator(OpportunityLocators.saveButtonByText);
    await this.waitForVisible(saveButton, 30000);
    await saveButton.scrollIntoViewIfNeeded();
    await saveButton.click();
    
    Logger.pass('Opportunity details saved');
  }

  async verifyQuoteNotGenerated(): Promise<void> {
    Logger.step('Verify the quote is not generated ');
    const generateQuote = this.page.locator(OpportunityLocators.generateQuoteButton);
    await this.waitForVisible(generateQuote, 30000);
    await generateQuote.scrollIntoViewIfNeeded();
    await generateQuote.click();
    
    Logger.pass('Generate Quote button clicked');

    const QuoteText = this.page.locator(OpportunityLocators.quoteErrorText);

    await expect(QuoteText).toContainText('Quote cannot be generated as no products available for this opportunity.', { timeout: 30000 });

      Logger.pass('Verified that quote cannot be generated due to no products available');

    const quoteCloseButton = this.page.locator(OpportunityLocators.closeButtonByText);
    await this.waitForVisible(quoteCloseButton, 30000);
    await quoteCloseButton.click();
    await this.page.waitForTimeout(5000);

    Logger.pass('Closed the quote dialog');

  }

  async switchToRelatedTab(): Promise<void> {
    Logger.step('Select Switch to related tab');
    const relatedTab = this.page.getByText(OpportunityLocators.relatedTabText, { exact: true }).first();
    await relatedTab.scrollIntoViewIfNeeded();
    await relatedTab.click();
    await this.page.waitForTimeout(5000);

    Logger.pass('Switched to Related tab');
  }

  async verifyProductsAndClickGenerateQuote(): Promise<void> {
    Logger.step('Verify products section and click Generate Quote');

    const productsHeader = this.page.locator(OpportunityLocators.productsHeader).first();
    await this.scrollIntoView(productsHeader);

    const productsCount = this.page.locator(OpportunityLocators.productsCount).filter({ hasText: '(1)' }).first();
    await this.waitForVisible(productsCount, 30000);
    await expect(productsCount).toContainText('(1)', { timeout: 30000 });

    const productNameLink = this.page.locator(OpportunityLocators.productNameLink).filter({ hasText: 'Absorbent product' }).first();
    await this.waitForVisible(productNameLink, 30000);
    await expect(productNameLink).toContainText('Absorbent product', { timeout: 30000 });

    Logger.pass('Verified products count and Absorbent product name');

    //const generateQuoteButton = this.page.locator(OpportunityLocators.generateQuoteButton).first();
    const generateQuoteButton = this.page.getByRole('button', { name: 'Generate Quote', exact: true }).first();
    await this.scrollIntoView(generateQuoteButton);
    await this.waitForVisible(generateQuoteButton, 30000);
    await generateQuoteButton.click();

    const generateQuoteDialogTitle = this.page.locator(OpportunityLocators.generateQuoteDialogTitle).last();
    await this.waitForVisible(generateQuoteDialogTitle, 30000);

    const generateQuoteDialogMessage = this.page.locator(OpportunityLocators.generateQuoteDialogMessage).first();
    await this.waitForVisible(generateQuoteDialogMessage, 30000);
    await expect(generateQuoteDialogMessage).toContainText('Please click on Generate button to generate the quote for this opportunity.', { timeout: 30000 });

    const generateButton = this.page.locator(OpportunityLocators.generateQuoteDialogButton).first();
    await this.waitForVisible(generateButton, 30000);
    await generateButton.click();

    Logger.pass('Generate Quote button clicked');
  }

  async verifyFilesGenerated(firstName: string, lastName: string): Promise<void> {
    Logger.step('Verify generated files');

    const runNumber = PropertyReader.getRunNumber(1);
    const expectedFileText = `${firstName} ${lastName}${runNumber}`;

    const filesHeaderWithCount = this.page.locator(OpportunityLocators.filesHeaderWithCount).first();
    await this.scrollIntoView(filesHeaderWithCount);
    await this.waitForVisible(filesHeaderWithCount, 30000);

    const filesCountText = ((await filesHeaderWithCount.textContent()) || '').trim();
    const countMatch = filesCountText.match(/\((\d+)\)/);
    const countValue = Number(countMatch ? countMatch[1] : '0');
    expect(countValue).toBeGreaterThan(0);

    const fileNameLink = this.page.getByText(expectedFileText, { exact: false }).first();
    await this.waitForVisible(fileNameLink, 30000);
    await expect(fileNameLink).toContainText(expectedFileText, { timeout: 30000 });

    Logger.pass(`Verified generated file: ${expectedFileText}`);
  }

  async configurePriceBook(): Promise<void> {
    Logger.step('Select Choose Price Book');
    const relatedTab = this.page.getByText(OpportunityLocators.choosePriceBookText, { exact: true }).first();
    await relatedTab.scrollIntoViewIfNeeded();
    await relatedTab.click();
    await this.page.waitForTimeout(5000);

    const enterPriceBook = this.page.locator(OpportunityLocators.priceBookInput);
    await this.waitForVisible(enterPriceBook, 90000);
    await enterPriceBook.click();
    await enterPriceBook.press('Delete');
    await enterPriceBook.clear();
    await enterPriceBook.fill('Support At Home');

    const option = this.page.getByText('Support At Home 2025/2026', { exact: true });
    await option.waitFor();
    await option.click();
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.page.waitForTimeout(5000);

    Logger.pass('Price Book configured Successfully');
  }

  async configureProductManagement(): Promise<void> {
    Logger.step('Select Product Management');
    const productManagementButton = this.page.getByRole('button', { name: OpportunityLocators.productManagementText, exact: true }).first();
    await productManagementButton.scrollIntoViewIfNeeded();
    await productManagementButton.click();
    await this.page.waitForTimeout(5000);

    const addProductsButton = this.page.getByRole('button', { name: 'Add' });
    await this.waitForVisible(addProductsButton, 90000);
    await addProductsButton.click();
    await this.page.waitForTimeout(5000);

    const customPeriodOption = this.page.getByText('Custom', { exact: true });
    await this.waitForVisible(customPeriodOption, 90000);
    await customPeriodOption.click();
    await this.page.waitForTimeout(5000);
    
    const endDateInput = this.page.getByLabel('End Date').first();
    await this.waitForVisible(endDateInput, 90000);

    const today = new Date();

    today.setDate(today.getDate() + 10);

    const formattedDate = today.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    await endDateInput.click();
    await endDateInput.press('Backspace');
    await endDateInput.clear();
    await endDateInput.fill('');
    await endDateInput.fill(formattedDate);

    const serviceDay = this.page.locator( "(//span[text()='Anytime'])[1]");
    await this.waitForVisible(serviceDay, 90000);
    await serviceDay.click();
    await this.page.waitForTimeout(5000);

    const availableFundingSection = this.page.locator(OpportunityLocators.availableFundingSection).first();
    await this.waitForVisible(availableFundingSection, 90000);
    await availableFundingSection.scrollIntoViewIfNeeded();

    const supportItemsLabel = this.page.locator(OpportunityLocators.supportItemLabel).first();
    await this.waitForVisible(supportItemsLabel, 90000);
    await supportItemsLabel.scrollIntoViewIfNeeded();

    const searchBox = this.page.locator(OpportunityLocators.searchSupportItemInput).first();
    await this.waitForVisible(searchBox, 90000);
    await searchBox.fill('Absorbent products, washable');
    await this.staticWait(1500);

    const firstCheckbox = this.page.locator(OpportunityLocators.availableFundingFirstRowCheckbox).first();
    await this.waitForVisible(firstCheckbox, 90000);
    await firstCheckbox.scrollIntoViewIfNeeded();
    try {
      await firstCheckbox.check({ force: true });
    } catch {
      const firstCheckboxLabel = this.page.locator(OpportunityLocators.availableFundingFirstRowCheckboxLabel).first();
      if (await firstCheckboxLabel.isVisible().catch(() => false)) {
        await firstCheckboxLabel.click({ force: true });
      }
      await firstCheckbox.evaluate((node) => {
        const input = node as HTMLInputElement;
        input.checked = true;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
    await expect(firstCheckbox).toBeChecked({ timeout: 30000 });

    await this.page.getByRole('button', { name: 'Add' }).click();

    const Submit = this.page.getByRole('button', { name: 'Submit' });
    await Submit.scrollIntoViewIfNeeded();
    await Submit.isVisible({ timeout: 30000 });
    await Submit.click();
    await this.page.waitForTimeout(5000);
        Logger.pass('Product Management configured Successfully');
      }
}
