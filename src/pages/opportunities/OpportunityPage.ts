import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { OpportunityLocators } from '../locators/OpportunityLocators';
import PropertyReader from '../../utils/PropertyReader';


export class OpportunityPage extends BasePage {

  constructor(page: Page) {
    super(page);
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
    await this.page.waitForTimeout(5000);
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

  async selectBlockFundingForFundingSourceAndType(): Promise<void> {
    Logger.step('Update Funding Source to Block Funding');

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
    let supportAtHomeOption = this.page.getByRole('option', { name: 'Block Funding' }).first();

    if (listboxId) {
      supportAtHomeOption = this.page
        .locator(`#${listboxId} [role='option'], #${listboxId} li, #${listboxId} span[title]`)
        .filter({ hasText: 'Block Funding' })
        .first();
    }

    const optionVisible = await supportAtHomeOption.isVisible().catch(() => false);
    if (!optionVisible) {
      await fundingSourceDropdown.type('Block Funding', { delay: 40 }).catch(() => {});
      await this.staticWait(1000);
    }

    const matchingOption = this.page
      .locator(OpportunityLocators.listboxOptions)
      .filter({ hasText: 'Block Funding' })
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

    await expect(fundingSourceDropdown).toContainText('Block Funding', { timeout: 30000 });
    Logger.pass('Funding Source updated to Block Funding');

    // const fundingTypeButton = this.page.locator(OpportunityLocators.fundingTypeComboboxButton).first();
    // const fundingTypeInput = this.page.locator(OpportunityLocators.fundingTypeComboboxInput).first();
    // const fundingTypeButtonVisible = await fundingTypeButton.isVisible().catch(() => false);

    // if (fundingTypeButtonVisible) {
    //   await expect(fundingTypeButton).toContainText('Support at Home', { timeout: 30000 });
    // } else {
    //   await expect(fundingTypeInput).toHaveValue(/Support at Home/i, { timeout: 30000 });
    // }

    const fundingTypeDropdown = this.page.locator('button[aria-label="Funding Type"]');

    await fundingTypeDropdown.click();

    const option = this.page.getByRole('option', { name: 'HACC-PYP' });
    await option.waitFor({ state: 'visible' });
    await option.click();
    await expect(fundingTypeDropdown).toContainText('HACC-PYP', { timeout: 30000 });
    await this.page.waitForTimeout(5000);

    await this.staticWait(1200);
    Logger.pass('Funding Type updated to HACC-PYP');
  }

  async clickSearchFundingAndAddNewFunding(): Promise<void> {
    Logger.step('Click Search Funding and select New Funding');

    // const fundingInput = this.page.getByRole('combobox', { name: /^Funding$/i }).first();
    // await this.waitForVisible(fundingInput, 60000);
    // await this.scrollIntoView(fundingInput);
    // await fundingInput.click({ force: true });
    // await this.staticWait(1000);

    // const listboxId = await fundingInput.getAttribute('aria-controls');
    // const newFundingRowScoped = listboxId
    //   ? this.page
    //       .locator(`#${listboxId} [role='option'], #${listboxId} li, #${listboxId} span[title]`)
    //       .filter({ hasText: /^\s*New Funding\s*$/ })
    //       .first()
    //   : this.page
    //       .locator(OpportunityLocators.listboxOptions)
    //       .filter({ hasText: /^\s*New Funding\s*$/ })
    //       .first();

    // const newFundingRowGlobal = this.page
    //   .locator(OpportunityLocators.listboxOptions)
    //   .filter({ hasText: /^\s*New Funding\s*$/ })
    //   .first();

    // const rowVisible = await newFundingRowScoped.isVisible().catch(() => false);
    // if (rowVisible) {
    //   await newFundingRowScoped.scrollIntoViewIfNeeded().catch(() => {});
    //   await newFundingRowScoped.click({ force: true });
    // } else if (await newFundingRowGlobal.isVisible().catch(() => false)) {
    //   await newFundingRowGlobal.scrollIntoViewIfNeeded().catch(() => {});
    //   await newFundingRowGlobal.click({ force: true });
    // } else {
    //   await fundingInput.press('ArrowDown');
    //   await fundingInput.press('Enter');
    // }

    // //await this.staticWait(10000);

    const fundingInput = this.page.getByRole('combobox', { name: 'Funding', exact: true });

    await fundingInput.waitFor({ state: 'visible', timeout: 60000 });
    await fundingInput.scrollIntoViewIfNeeded();
    await fundingInput.click();

    const newFunding = this.page.getByText('New Funding', { exact: false });

    await newFunding.waitFor({ state: 'visible', timeout: 10000 });
    await newFunding.scrollIntoViewIfNeeded();  
    await newFunding.click();

    Logger.pass('Clicked New Funding from search');
  }

  async clickSearchFundingProgram(): Promise<void> {
    Logger.step('Click Search Funding program and select New Funding');

    // const fundingInput = this.page.getByRole('combobox', { name: /^Funding Program$/i }).first();
    // await this.waitForVisible(fundingInput, 30000);
    // await this.scrollIntoView(fundingInput);
    // await fundingInput.click({ force: true });
    // await this.staticWait(1000);

    // const listboxId = await fundingInput.getAttribute('aria-controls');
    // const newFundingRowScoped = listboxId
    //   ? this.page
    //       .locator(`#${listboxId} [role='option'], #${listboxId} li, #${listboxId} span[title]`)
    //       .filter({ hasText: /^\s*New Funding Program\s*$/ })
    //       .first()
    //   : this.page
    //       .locator(OpportunityLocators.listboxOptions)
    //       .filter({ hasText: /^\s*New Funding Program\s*$/ })
    //       .first();

    // const newFundingRowGlobal = this.page
    //   .locator(OpportunityLocators.listboxOptions)
    //   .filter({ hasText: /^\s*New Funding Program\s*$/ })
    //   .first();

    // const rowVisible = await newFundingRowScoped.isVisible().catch(() => false);
    // if (rowVisible) {
    //   await newFundingRowScoped.scrollIntoViewIfNeeded().catch(() => {});
    //   await newFundingRowScoped.click({ force: true });
    // } else if (await newFundingRowGlobal.isVisible().catch(() => false)) {
    //   await newFundingRowGlobal.scrollIntoViewIfNeeded().catch(() => {});
    //   await newFundingRowGlobal.click({ force: true });
    // } else {
    //   await fundingInput.press('ArrowDown');
    //   await fundingInput.press('Enter');
    // }

    const fundingProgram = this.page.getByRole('combobox', { name: 'Funding Program', exact: true });

    await fundingProgram.waitFor({ state: 'visible', timeout: 60000 });
    await fundingProgram.scrollIntoViewIfNeeded();
    await fundingProgram.click();

    // const option = this.page.getByText('New Funding Program', { exact: false });
    // await option.waitFor({ state: 'visible', timeout: 10000 });
    // await option.scrollIntoViewIfNeeded();
    // await option.click();

    const option = this.page.getByText('Test CHSP Block Funding', { exact: true });//HACC - Ballarat
    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.scrollIntoViewIfNeeded();
    await option.click();

    await expect(fundingProgram).toContainText('Test CHSP Block Funding', { timeout: 30000 });
    await this.page.waitForTimeout(5000);

    // Logger.step('Save opportunity details');
    // const saveButton = this.page.getByRole('button', { name: 'Save' }).first();
    // await this.waitForVisible(saveButton, 30000);
    // await saveButton.scrollIntoViewIfNeeded();
    // await saveButton.click();

    Logger.pass('Clicked New Funding Program from search');
  }

  async newFundingProgram(): Promise<void> {
    Logger.step('Enter details in New Funding Program');

    const programName = this.page.getByLabel(/Funding Program Name/i).first();
    await programName.waitFor({ state: 'visible', timeout: 30000 });
    await programName.fill('Automation Funding Type' + PropertyReader.getRunNumber(1));

    const fundingPeriodDropdown = this.page.locator('button[aria-label="Funding Period"]');
    await fundingPeriodDropdown.click();
    const op = await this.page.getByRole('option', { name: 'Weekly' })
    await op.waitFor({ state: 'visible' });
    await op.click();

    const reportingPeriodDropdown = this.page.locator('button[aria-label="Reporting Period"]');
    await reportingPeriodDropdown.click();
    const option = this.page.getByRole('option', { name: 'Weekly' });
    await option.waitFor({ state: 'visible' });
    await option.click();

    Logger.step('Save opportunity details');
    const saveButton = this.page.getByRole('button', { name: 'Save' }).first();
    await this.waitForVisible(saveButton, 30000);
    await saveButton.scrollIntoViewIfNeeded();
    await saveButton.click();
    
    Logger.pass('New Funding Program created successfully');
  }

  async selectParticipantInNewFunding(firstName: string, lastName: string): Promise<void> {
    const runNumber = PropertyReader.getRunNumber(1);
    const participantName = `${firstName} ${lastName}${runNumber}`;

    Logger.step(`Select participant in New Funding: ${participantName}`);
    const participantInput = this.page.locator(OpportunityLocators.participantSearchInput).first();
    await this.waitForVisible(participantInput, 60000);
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

  async selectFundingAdministrator(firstName: string, lastName: string): Promise<void> {
    const runNumber = PropertyReader.getRunNumber(1);
    const administratorName = `${firstName} ${lastName}${runNumber}`;

    Logger.step(`Select Funding Administrator: ${administratorName}`);
    const EnterFundingAdministratorInput = this.page.locator(OpportunityLocators.EnterFundingAdministratorInput);
    await this.waitForVisible(EnterFundingAdministratorInput, 30000);
    await this.scrollIntoView(EnterFundingAdministratorInput);
    await EnterFundingAdministratorInput.click({ force: true });
    await EnterFundingAdministratorInput.fill(administratorName);
    await this.staticWait(1500);
    await EnterFundingAdministratorInput.click({ force: true });
    await this.staticWait(800);

    const showMoreResults = this.page
      .locator(OpportunityLocators.listboxOptions)
      .filter({ hasText: `Show more results for "${administratorName}"` })
      .first();

    if (await showMoreResults.isVisible().catch(() => false)) {
      await showMoreResults.click({ force: true });

      const advancedSearchHeading = this.page.getByRole('heading', { name: 'Advanced Search' }).first();
      await expect(advancedSearchHeading).toBeVisible({ timeout: 30000 });

      const advancedSearchInput = this.page
        .locator(OpportunityLocators.advancedSearchFundingAdministratorInput)
        .first();
      await this.waitForVisible(advancedSearchInput, 30000);
      await advancedSearchInput.fill(administratorName);

      const searchButton = this.page.locator(OpportunityLocators.advancedSearchSearchButton).last();
      if (await searchButton.isVisible().catch(() => false)) {
        await searchButton.click({ force: true });
      }

      const firstRadioLabel = this.page.locator(OpportunityLocators.advancedSearchFirstRowRadio).first();
      await this.waitForVisible(firstRadioLabel, 30000);
      await firstRadioLabel.click({ force: true });

      const selectButton = this.page.locator(OpportunityLocators.advancedSearchSelectButton).first();
      await this.waitForVisible(selectButton, 30000);
      await expect.poll(async () => selectButton.isEnabled(), { timeout: 30000 }).toBeTruthy();
      await selectButton.click({ force: true });

      await expect(advancedSearchHeading).toBeHidden({ timeout: 30000 });
    } else {
      const listboxId = await EnterFundingAdministratorInput.getAttribute('aria-controls');
      const escapedName = administratorName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const administratorResult = listboxId
        ? this.page
            .locator(`#${listboxId} [role='option'], #${listboxId} li`)
            .filter({ hasText: new RegExp(`^\\s*${escapedName}(\\s|$)`, 'i') })
            .first()
        : this.page
            .locator(OpportunityLocators.listboxOptions)
            .filter({ hasText: new RegExp(`^\\s*${escapedName}(\\s|$)`, 'i') })
            .first();

      await this.waitForVisible(administratorResult, 30000);
      await administratorResult.click({ force: true });
    }

    Logger.pass(`Funding Administrator selected : ${administratorName}`);
  }

  // ✅ reusable method
async fillDate(label: string, date: Date): Promise<void> {
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formattedDate = formatDate(date);

  const field = this.page
    .locator(`label:has-text("${label}")`)
    .locator('xpath=following::input[1]')
    .first();

  await field.waitFor({ state: 'visible', timeout: 30000 });

  await field.evaluate(el => el.scrollIntoView({ block: 'center' }));

  await field.click();
  await field.fill('');
  await field.fill(formattedDate);

  await field.press('Tab');

  await this.page.waitForTimeout(5000);
}

  async selectFundingProgramBlockTestFundingHacc(): Promise<void> {
    const today = new Date();

    const fundingProgramSearch = 'HACC - Ballarat';
    const expectedFundingProgram = 'HACC - Ballarat';

    Logger.step(`Select Funding Program: ${expectedFundingProgram}`);
    const fundingProgramInput = this.page.locator(OpportunityLocators.fundingProgramInput).first();
    await this.waitForVisible(fundingProgramInput, 30000);
    await this.scrollIntoView(fundingProgramInput);
    await fundingProgramInput.click({ force: true });
    await fundingProgramInput.fill(fundingProgramSearch);
    await this.staticWait(1500);
    await fundingProgramInput.click({ force: true });
    await this.staticWait(800);

    const showMoreResults = this.page
      .locator(OpportunityLocators.listboxOptions)
      .filter({ hasText: `Show more results for "${fundingProgramSearch}"` })
      .first();

    if (await showMoreResults.isVisible().catch(() => false)) {
      await showMoreResults.click({ force: true });

      const advancedSearchHeading = this.page.getByRole('heading', { name: 'Advanced Search' }).first();
      await expect(advancedSearchHeading).toBeVisible({ timeout: 30000 });

      const advancedSearchInput = this.page
        .locator(OpportunityLocators.advancedSearchFundingProgramInput)
        .first();
      await this.waitForVisible(advancedSearchInput, 30000);
      await advancedSearchInput.fill(fundingProgramSearch);

      const searchButton = this.page.locator(OpportunityLocators.advancedSearchSearchButton).last();
      if (await searchButton.isVisible().catch(() => false)) {
        await searchButton.click({ force: true });
      }

      const firstRadioLabel = this.page.locator(OpportunityLocators.advancedSearchFirstRowRadio).first();
      await this.waitForVisible(firstRadioLabel, 30000);
      await firstRadioLabel.click({ force: true });

      const selectButton = this.page.locator(OpportunityLocators.advancedSearchSelectButton).first();
      await this.waitForVisible(selectButton, 30000);
      await expect.poll(async () => selectButton.isEnabled(), { timeout: 30000 }).toBeTruthy();
      await selectButton.click({ force: true });

      await expect(advancedSearchHeading).toBeHidden({ timeout: 30000 });
    } else {
      const listboxId = await fundingProgramInput.getAttribute('aria-controls');
      const fundingProgramResult = listboxId
        ? this.page
            .locator(`#${listboxId} [role='option'], #${listboxId} li`)
            .filter({ hasText: expectedFundingProgram })
            .first()
        : this.page
            .locator(OpportunityLocators.listboxOptions)
            .filter({ hasText: expectedFundingProgram })
            .first();

      await this.waitForVisible(fundingProgramResult, 30000);
      await fundingProgramResult.click({ force: true });
    }

    await expect
      .poll(
        async () =>
          (await fundingProgramInput.getAttribute('data-value').catch(() => '')) ||
          (await fundingProgramInput.inputValue().catch(() => '')) ||
          (await fundingProgramInput.getAttribute('placeholder').catch(() => '')) ||
          '',
        { timeout: 30000 },
      )
      .toContain(expectedFundingProgram);

      // this.DateField('Start Date', today);
      // Logger.info(`Filled Start Date with today's date: ${today.toDateString()}`);
      // this.DateField('End Date', tomorrow);
      // Logger.info(`Filled End Date with tomorrow's date: ${tomorrow.toDateString()}`);

    Logger.step('Save opportunity details');
    const saveButton = this.page.getByRole('button', { name: 'Save' }).first();
    await this.waitForVisible(saveButton, 30000);
    await saveButton.scrollIntoViewIfNeeded();
    await saveButton.click();
    await this.page.waitForTimeout(10000);

    Logger.pass(`Funding Program selected: ${expectedFundingProgram}`);
  }

  async selectNewFundingSourceAndTypeSupportAtHome(): Promise<void> {
    Logger.step('Select New Funding Source as Hacc-PYP Funding');
    const fundingSourceDropdown = this.page.locator(OpportunityLocators.newFundingSourceDropdownInModal);
    await this.waitForVisible(fundingSourceDropdown, 30000);
    await fundingSourceDropdown.click({ force: true });
    const fundingSourceListboxId = await fundingSourceDropdown.getAttribute('aria-controls');
    const fundingSourceOption = fundingSourceListboxId
      ? this.page
          .locator(
            `#${fundingSourceListboxId} [data-value='Support at Home'], #${fundingSourceListboxId} [role='option'], #${fundingSourceListboxId} li`,
          )
          .filter({ hasText: /^Block Funding$/ })
          .first()
      : this.page
          .locator(OpportunityLocators.listboxOptions)
          .filter({ hasText: /^Block Funding$/ })
          .first();
    await this.waitForVisible(fundingSourceOption, 30000);
    await fundingSourceOption.scrollIntoViewIfNeeded().catch(() => {});
    await fundingSourceOption.click({ force: true });
    await expect(fundingSourceDropdown).toContainText('Block Funding', { timeout: 30000 });
    Logger.pass('New Funding Source selected as Block Funding');

    Logger.step('Select New Funding Type as HACC-PYP');
    const fundingTypeDropdown = this.page.locator(OpportunityLocators.newFundingTypeDropdownInModal);
    await this.waitForVisible(fundingTypeDropdown, 30000);
    await fundingTypeDropdown.click({ force: true });
    const fundingTypeListboxId = await fundingTypeDropdown.getAttribute('aria-controls');
    const fundingTypeOption = fundingTypeListboxId
      ? this.page
          .locator(
            `#${fundingTypeListboxId} [data-value='HACC-PYP'], #${fundingTypeListboxId} [role='option'], #${fundingTypeListboxId} li`,
          )
          .filter({ hasText: /^HACC-PYP$/ })
          .first()
      : this.page
          .locator(OpportunityLocators.listboxOptions)
          .filter({ hasText: /^HACC-PYP$/ })
          .first();
    await this.waitForVisible(fundingTypeOption, 30000);
    await fundingTypeOption.scrollIntoViewIfNeeded().catch(() => {});
    await fundingTypeOption.click({ force: true });
    await expect(fundingTypeDropdown).toContainText('HACC-PYP', { timeout: 30000 });
    Logger.pass('New Funding Type selected as HACC-PYP');

  }


  async selectAssessmentVisitPreferenceInPerson(): Promise<void> {
    Logger.step('Select Assessment visit preference as In-Person');
    const assessmentDropdown = this.page.locator(OpportunityLocators.assessmentVisitPreferenceDropdownByAria);

    await assessmentDropdown.scrollIntoViewIfNeeded();

    await assessmentDropdown.click();

    await this.page.getByText(OpportunityLocators.inPersonOptionText, { exact: true }).first().click();

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

    await expect(serviceAgreementStatusDropdown).toContainText('Signed', { timeout: 30000 });
    Logger.pass('Service Agreement Status set to Signed');
  }

  async selectReferrerTypeFamilyViolencePrograms(): Promise<void> {
    Logger.step('Select Referrer Type as Family violence programs');
    const referrerDetailsSection = this.page.locator(OpportunityLocators.referrerTypeDropdownByAria);
    
    await referrerDetailsSection.scrollIntoViewIfNeeded();

    const referrerTypeDropdown = this.page.locator(OpportunityLocators.referrerTypeDropdownByAria);
    
    await referrerTypeDropdown.click();

    await this.page.getByText(OpportunityLocators.referrerTypeFamilyViolenceOptionText, { exact: true }).first().click();

    await expect(referrerTypeDropdown).toContainText('Family violence programs', { timeout: 30000 });

    Logger.pass('Referrer Type set to Family violence programs');
  }

  async saveOpportunityDetails(): Promise<void> {
    Logger.step('Save opportunity details');
    const saveButton = this.page.getByRole('button', { name: 'Save' }).first();
    await this.waitForVisible(saveButton, 30000);
    await saveButton.scrollIntoViewIfNeeded();
    const urlBeforeSave = this.page.url();
    await saveButton.click();

    await Promise.race([
      this.page.locator('.forceVisualMessageQueue, [data-key="success"], .toastMessage').waitFor({ state: 'visible', timeout: 15000 }).catch(() => null),
      saveButton.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => null),
      this.page.waitForURL(url => url.toString() !== urlBeforeSave, { timeout: 15000 }).catch(() => null),
    ]);

    await this.waitForPageReady();

    if (await saveButton.isVisible().catch(() => false)) {
      throw new Error('Opportunity save did not complete. Save button is still visible.');
    }
    
    Logger.pass('Opportunity details saved');
  }

  async verifyHeaderFundingType(expectedFundingType: string): Promise<void> {
    Logger.step(`Verify header Funding Type is ${expectedFundingType}`);

    const fundingTypeValue = this.page.locator(OpportunityLocators.headerFundingTypeValue).first();
    await this.waitForVisible(fundingTypeValue, 30000);
    await fundingTypeValue.scrollIntoViewIfNeeded().catch(() => {});
    await expect(fundingTypeValue).toContainText(expectedFundingType, { timeout: 30000 });

    Logger.pass(`Verified header Funding Type is ${expectedFundingType}`);
  }

  async verifyQuoteNotGenerated(): Promise<void> {
    Logger.step('Verify the quote is not generated ');
    const generateQuote = this.page.locator('button:has-text("Generate Quote"):visible');
    await generateQuote.waitFor({ state: 'visible', timeout: 90000 });
    await generateQuote.scrollIntoViewIfNeeded();
    await generateQuote.click();
    
    Logger.pass('Generate Quote button clicked');

    const QuoteText = this.page.locator(OpportunityLocators.quoteErrorText);

    await expect(QuoteText).toContainText('Quote cannot be generated as no products available for this opportunity.', { timeout: 30000 });

      Logger.pass('Verified that quote cannot be generated due to no products available');

    const quoteCloseButton = this.page.locator(OpportunityLocators.closeButtonByText);
    await this.waitForVisible(quoteCloseButton, 30000);
    await quoteCloseButton.click();

    Logger.pass('Closed the quote dialog');

  }

  async switchToRelatedTab(): Promise<void> {
    Logger.step('Select Switch to related tab');
    const relatedTab = this.page.getByText(OpportunityLocators.relatedTabText, { exact: true }).first();
    //await relatedTab.scrollIntoViewIfNeeded();
    await relatedTab.click();

    Logger.pass('Switched to Related tab');
  }

  async verifyProductsAndClickGenerateQuote(): Promise<void> {
    Logger.step('Verify products section and click Generate Quote');
    await this.page.mouse.wheel(0, 4000);
    await this.page.waitForTimeout(2000);

    await expect(
      this.page.locator('table tbody tr', { hasText: 'Annual' }).first()
    ).toBeVisible();
    Logger.pass('Verified Annual text is present under Products section');

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
    // await this.page.waitForTimeout(10000);

    const runNumber = PropertyReader.getRunNumber(1);
    const expectedFileText = `${firstName} ${lastName}${runNumber}`;

    const filesHeaders = this.page.locator(OpportunityLocators.filesHeaderWithCount);
    await this.waitForVisible(filesHeaders.last(), 30000);
    await filesHeaders.last().scrollIntoViewIfNeeded().catch(() => {});

    await expect
      .poll(
        async () => {
          const texts = await filesHeaders.allTextContents();
          const counts = texts
            .map(text => (text || '').trim())
            .map(text => {
              const match = text.match(/\((\d+)\)/);
              return Number(match ? match[1] : '0');
            });
          return counts.length ? Math.max(...counts) : 0;
        },
        { timeout: 30000 },
      )
      .toBeGreaterThan(0);

    const fileNameLink = this.page.getByText(expectedFileText, { exact: false }).last();
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
    await enterPriceBook.fill('HACC - Ballarat - Low Fee');

    const option = this.page.getByText('HACC - Ballarat - Low Fee', { exact: true });
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
    await this.page.waitForTimeout(10000);

    const addProductsButton = this.page.getByRole('button', { name: 'Add' });
    await this.waitForVisible(addProductsButton, 90000);
    await addProductsButton.click();
    await this.page.waitForTimeout(5000);

    const customPeriodOption = this.page.getByText('Custom', { exact: true });
    await this.waitForVisible(customPeriodOption, 90000);
    await customPeriodOption.click();
    
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

    const availableFundingSection = this.page.locator(OpportunityLocators.availableFundingSection).first();
    await this.waitForVisible(availableFundingSection, 90000);
    await availableFundingSection.scrollIntoViewIfNeeded();

    const supportItemsLabel = this.page.locator(OpportunityLocators.supportItemLabel).first();
    await this.waitForVisible(supportItemsLabel, 90000);
    await supportItemsLabel.scrollIntoViewIfNeeded();

    const searchBox = this.page.locator(OpportunityLocators.searchSupportItemInput).first();
    await this.waitForVisible(searchBox, 90000);
    await searchBox.fill('Annual review - Community Care');
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
        Logger.pass('Product Management configured Successfully');
      }


      async configureStage(): Promise<void> {
        Logger.step('Select Stage as In-Progress');
        await this.page.waitForTimeout(5000);
        const StageEditButton = this.page.locator(OpportunityLocators.stageEditButton);
        await this.waitForVisible(StageEditButton, 30000);
        await StageEditButton.click({ force: true });

        const stageDropdown = await this.page.getByRole('combobox', { name: 'Stage', exact: true });
        await stageDropdown.waitFor({ state: 'visible', timeout: 30000 });
        await stageDropdown.scrollIntoViewIfNeeded();
        await stageDropdown.click();
        
        await this.page
            .locator('lightning-base-combobox-item')
            .filter({ hasText: 'In Progress' }).first()
            .click();

        await expect(stageDropdown).toContainText('In Progress', { timeout: 30000 });

        Logger.pass('Stage set to In-Progress');

}

      async configureStatus(): Promise<void> {
        Logger.step('Select Status as Initial Consultation');

        await this.page.waitForTimeout(5000);
        const statusDropdown = this.page.locator('button[aria-label="Status"]').first();
        await statusDropdown.evaluate(el => el.scrollIntoView({ block: 'center' }));
        await statusDropdown.click();

        const option = this.page.locator('[role="option"]').filter({ hasText: 'Initial Consultation' }).first();
        await option.waitFor({ state: 'visible' });
        await option.click();
        await expect(statusDropdown).toContainText('Initial Consultation', { timeout: 30000 });
        await this.page.waitForTimeout(5000);

        Logger.pass('Status set to Initial Consultation');

}


      async verifySignaturevisible(): Promise<void> {
        Logger.step('Verify signature is visible');
        const moreActions = this.page.locator(OpportunityLocators.moreActionsButton).first();
        await this.waitForVisible(moreActions, 30000);
        await moreActions.click({ force: true });

        const signatureOption = this.page.getByRole('menuitem', { name: 'Send for Signature' });

        await expect(signatureOption).toBeVisible({ timeout: 30000 });

        Logger.pass('Signature is visible');
}

      async clickSignaturevisible(): Promise<void> {
              Logger.step('Click signature option');
              const moreActions = this.page.locator(OpportunityLocators.moreActionsButton).first();
              await this.waitForVisible(moreActions, 30000);
              await moreActions.click({ force: true });

              const signatureOption = this.page.getByRole('menuitem', { name: 'Send for Signature' });

              await expect(signatureOption).toBeVisible({ timeout: 30000 });

              await signatureOption.click({ force: true });

              Logger.pass('clicked signature option');
      }

      async configureSignature(): Promise<void> {
              Logger.step('Click on Next Button on Document screen');
              
              // await this.page.waitForSelector('iframe[title="Send with Docusign"]');

              // let frame = this.page.frameLocator('iframe[title="Send with Docusign"]');

            
              // await frame.getByRole('button', { name: 'Next' }).click();
              const docusignFrame = this.page.frameLocator('iframe[title="Send with Docusign"] >> visible=true').first();

              const frame = docusignFrame.locator('button.slds-button_brand', { hasText: 'Next' });

              Logger.step('Click on Next Button on Document screen');

            
              await frame.waitFor({ state: 'visible', timeout: 30000 });
              await frame.click();
              Logger.step('Clicked on Next Button on Document screen');

              
              // await frame.getByRole('button', { name: 'Next' }).waitFor({ state: 'visible' });

              
              // await frame.getByRole('button', { name: 'Next' }).click();
              const nextBtnRecipients = docusignFrame.getByRole('button', { name: 'Next' });


              await nextBtnRecipients.waitFor({ state: 'visible', timeout: 30000 });
              await nextBtnRecipients.click();
              Logger.step('Clicked on Next Button on Recipients screen');

              // const editorFrame = frame.frameLocator('iframe');

              // await editorFrame.locator('[data-qa="Signature"]').waitFor({ state: 'visible', timeout: 60000 });

            
              // await editorFrame.locator('[data-qa="Signature"]').click();

              
              // await editorFrame.locator('svg image').click({
              //   position: { x: 295, y: 421 }
              // });

              // await this.page.waitForSelector('iframe[title="Send with Docusign"]');

              // const Newframe = this.page.frameLocator('iframe[title="Send with Docusign"]');

              // await Newframe.locator('[data-qa="footer-send-button"]').waitFor({ state: 'visible', timeout: 60000 });

              // await Newframe.locator('[data-qa="footer-send-button"]').click();

              // const Finalframe = this.page.frameLocator('iframe[title="Send with Docusign"]');

              // await Finalframe.locator('[data-qa="send-without-fields"]').waitFor({
              //   state: 'visible',
              //   timeout: 150000
              // });

              // await Finalframe.locator('[data-qa="send-without-fields"]').click();

              // // await this.page.waitForTimeout(10000);

              // const Envelopeframe = this.page.frameLocator('iframe[title="Send with Docusign"]').last();

              // await Envelopeframe.locator('[data-id="envelopeSentLabel"]').waitFor({
              //   state: 'visible',
              //   timeout: 150000
              // });

              // await expect(
              //   Envelopeframe.locator('[data-id="envelopeSentLabel"]')
              // ).toContainText('Your envelope was sent!');

              // 1. Target the correct visible frame (Same as your working section)
const activeFrame = this.page.frameLocator('iframe[title="Send with Docusign"] >> visible=true').first();

Logger.step('Attempting to click Footer Send Button');

// 2. Click Footer Send Button
const footerSendBtn = activeFrame.locator('[data-qa="footer-send-button"]');
await footerSendBtn.waitFor({ state: 'visible', timeout: 60000 });
await footerSendBtn.click();

// 3. Handle the "Send Without Fields" popup (if it appears)
Logger.step('Checking for "Send Without Fields" confirmation');
const sendWithoutFieldsBtn = activeFrame.locator('[data-qa="send-without-fields"]');

// We use a shorter timeout here as this popup might not always appear immediately
await sendWithoutFieldsBtn.waitFor({ state: 'visible', timeout: 30000 });
await sendWithoutFieldsBtn.click();

// 4. Verify the Envelope was sent
Logger.step('Verifying Envelope Sent status');

// Note: We use the same 'activeFrame' because the success message is usually in the same frame
const successLabel = activeFrame.locator('[data-id="envelopeSentLabel"]');

await successLabel.waitFor({ state: 'visible', timeout: 60000 });
await expect(successLabel).toContainText('Your envelope was sent!');

Logger.pass('Signature process completed and envelope sent');

              Logger.pass('Signature process completed and envelope sent');
      }

async generateAgreement(): Promise<void> {
        Logger.step('Verify Generate agreement');
        const GenerateAgreementButton = this.page.getByRole('button', { name: 'Generate Agreement' }).first();
        await this.waitForVisible(GenerateAgreementButton, 30000);
        await GenerateAgreementButton.click({ force: true });

        const generateagreementDialogMessage = this.page.locator(OpportunityLocators.GenerateAgreementText).first();
        await this.waitForVisible(generateagreementDialogMessage, 30000);
        await expect(generateagreementDialogMessage).toContainText('Generate the Service Agreement for', { timeout: 30000 });

        const generateButton = this.page.getByRole('button', { name: 'Generate', exact: true }).first();
        await this.waitForVisible(generateButton, 30000);
        await generateButton.click({ force: true });

        const agreementGeneratedMessage = this.page.locator(OpportunityLocators.GenerateAgreementsuccessMessage).first();
        await this.waitForVisible(agreementGeneratedMessage, 30000);
        await expect(agreementGeneratedMessage).toContainText('Agreement Generated Successfully. Check the Files related list on this Opportunity', { timeout: 30000 });
        
        const finishButton = this.page.getByRole('button', { name: 'Finish', exact: true }).first();
        await this.waitForVisible(finishButton, 30000);
        await finishButton.click({ force: true });
        
        Logger.pass('Generated agreement successfully');
}

      async verifyServiceAgreementFileGenerated(): Promise<void> {
        Logger.step('Verify Service agreement file is generated');

        const AddFilesButton = this.page.getByRole('button', { name: 'Add Files' }).first();
        await AddFilesButton.scrollIntoViewIfNeeded();

        const serviceAgreementText = this.page.locator(OpportunityLocators.ServiceAgreementtext);

        const text = await serviceAgreementText.textContent();
        Logger.info(`Service agreement file text: ${text}`);

        await expect(serviceAgreementText).toContainText('Service Agreement');

        Logger.pass('Service agreement file is generated');
}

async verifySentForSignature(): Promise<void> {
        Logger.step('Verify Send for Signature is generated');

        await this.page.getByRole('button', { name: 'Show All Activities' }).scrollIntoViewIfNeeded();

        await this.page.waitForTimeout(5000);
        await this.page.locator('h3:has-text("Sent for Signature")').first().waitFor();

        const count = await this.page.locator('h3:has-text("Sent for Signature")').count();

        expect(count).toBeGreaterThan(0);

        Logger.pass('Sent for Signature is generated');
}

async setOpportunityToClosedWon(): Promise<void> {
        Logger.step('Set opportunity to Closed Won');

        const EditstageDropdown = this.page.locator(OpportunityLocators.EditStageDropdown);
        await EditstageDropdown.scrollIntoViewIfNeeded().catch(() => {});
        await EditstageDropdown.click();

        const stageDropdown = this.page.locator(OpportunityLocators.stageDropdown);
        stageDropdown.scrollIntoViewIfNeeded().catch(() => {});
    
        await stageDropdown.click();

        // await this.page.getByText('Closed Won', { exact: true }).click();
        // const closedWonOption = stageDropdown;

        // await expect(closedWonOption).toBeVisible({ timeout: 30000 });
        // await expect(closedWonOption).toHaveText('Closed Won');
        // Logger.pass('Stage set to Closed Won');

        const option = this.page.getByRole('option', { name: 'Closed Won' });
        await option.click();
        await option.waitFor({ state: 'hidden' }); 

        await expect(stageDropdown).toHaveText(/Closed Won/);

        await stageDropdown.press('Tab');

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const date = `${String(tomorrow.getDate()).padStart(2, '0')}/${String(
          tomorrow.getMonth() + 1
        ).padStart(2, '0')}/${tomorrow.getFullYear()}`;


        await this.page.locator("input[name='Agreement_Start_Date__c']").fill(date);
        Logger.info(`Filled Agreement Start Date with tomorrow's date: ${date}`);

        
      const closeButton = this.page.locator("//button[text()='Cancel']").last();
      await expect(closeButton).toBeVisible({ timeout: 5000 });
      await closeButton.scrollIntoViewIfNeeded().catch(() => {});
      Logger.info('Confirmed: Record is in edit mode (Cancel button visible).');

const saveButton = this.page.locator("//button[text()='Save']").last();
        await this.waitForVisible(saveButton, 10000);
        await saveButton.scrollIntoViewIfNeeded().catch(() => {});
        await saveButton.click({ force: true });
        Logger.info('Clicked Save button after setting Stage to Closed Won');

// 3. After Save: Verify the "Cancel" button is removed from the DOM
try {
    
    await closeButton.waitFor({ state: 'detached', timeout: 10000 });
    Logger.pass('Success: Cancel button is gone. Record saved successfully.');
} catch (error) {
    
    Logger.error('Save failed: The form is still in Edit Mode.');
    throw new Error('Form stayed in edit mode. Check for validation errors on the page.');
}
        Logger.pass('Record saved successfully and exited edit mode.');

      
        Logger.pass('Opportunity set to Closed Won');
        await this.page.waitForTimeout(10000);
}

async verifyNoFurtherUpdatesOnRecord(): Promise<void> {
        Logger.step('Verify no further updates on record');

        const noFurtherUpdatesText = this.page.getByText('No further updates are allowed on this Opportunity').first();
        await expect(noFurtherUpdatesText).toBeVisible({ timeout: 30000 });

        Logger.pass('No further updates on record is verified');
}

async createServiceAgreement(): Promise<void> {
        Logger.step('Create service agreement');

        const createServiceAgreementButton = this.page.getByRole('button', { name: 'Create Service Agreement' });
        await expect(createServiceAgreementButton).toBeVisible({ timeout: 30000 });
       
        await createServiceAgreementButton.click();
      
        // const AgreementStartDate = this.page.getByLabel('Agreement Start Date').first();
        //   await this.waitForVisible(AgreementStartDate, 30000);
        //     await AgreementStartDate.click(); 
        //     await AgreementStartDate.clear();   

        //  const todaysDate = new Date();
        //  const tomorrow = new Date();
        //  tomorrow.setDate(tomorrow.getDate() + 1);
        //  const formattedTodaysDate = `${String(todaysDate.getDate()).padStart(2, '0')}/${String(
        //   todaysDate.getMonth() + 1
        // ).padStart(2, '0')}/${todaysDate.getFullYear()}`;

        // await AgreementStartDate.fill(formattedTodaysDate);

        // await this.page.waitForTimeout(5000);

        // const formattedTomorrowsDate = `${String(tomorrow.getDate()).padStart(2, '0')}/${String(
        //   tomorrow.getMonth() + 1
        // ).padStart(2, '0')}/${tomorrow.getFullYear()}`;

        // const AgreementEndDate = this.page.getByLabel('Agreement End Date').first();
        // await this.waitForVisible(AgreementEndDate, 30000);
        // await AgreementEndDate.click(); 
        // await AgreementEndDate.clear(); 
        // await AgreementEndDate.fill(formattedTomorrowsDate);

        await this.page.waitForTimeout(5000);

        const confirmButton = this.page.getByRole('button', { name: 'Confirm' }).first();
        await confirmButton.scrollIntoViewIfNeeded();
        await this.waitForVisible(confirmButton, 30000);
        await confirmButton.click();

        await this.page.waitForTimeout(20000);

        Logger.pass('Service agreement is created');
}

async verifyServiceAgreementButtonNotPresent(): Promise<void> {
        Logger.step('Verify Create Service Agreement button is not present');

        const createServiceAgreementButton = this.page.getByRole('button', { name: 'Create Service Agreement' });
        await expect(createServiceAgreementButton).toBeHidden({ timeout: 30000 });

        Logger.pass('Create Service Agreement button is not present');
}

async verifyActiveServiceAgreement(): Promise<void> {
        Logger.step('Verify service agreement status is Active');

        
        const section = this.page.locator('button:has-text("Agreement Period Information")').first();

        await section.scrollIntoViewIfNeeded();
        
        const status = this.page
            .locator('lightning-formatted-text')
            .filter({ hasText: 'Active' })
            .first();

          await expect(status).toBeVisible({ timeout: 30000 });

        Logger.pass('Service agreement status verified as Active');
}

}
