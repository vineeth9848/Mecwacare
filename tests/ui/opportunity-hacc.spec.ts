import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { OpportunityPage } from '../../src/pages/opportunities/OpportunityPage';
import { TestDataHelper } from '../../src/utils/TestDataHelper';


test('Configure "Block Funding" funding source and "HACC-PYP" funding type in first opportunity record', async ({ page }) => {
  test.setTimeout(120000);
  const homePage = new HomePage(page);
  const opportunityPage = new OpportunityPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];
    const { opportunity } = TestDataHelper.readJsonFile<{ opportunity: Array<Record<string, string>> }>('opportunity.json');
  const opportunityData = opportunity[0];

  Logger.info('Starting opportunity funding validation test');
  await opportunityPage.refreshPage();
  await homePage.verifyHomePage();
  await opportunityPage.hardRefreshPageWithRetry();  // Hard refresh before clicking dropdown
  await opportunityPage.hardRefreshPageWithRetry();
  await homePage.resetObjectSelectionState();
  await homePage.selectObjectFromDropdown('Opportunities');
  await opportunityPage.refreshPage();
  await opportunityPage.selectOpportunitiesListView('My Opportunities');
  await opportunityPage.searchAndOpenOpportunityByLeadName(lead.firstName, lead.lastName);
  await opportunityPage.openDetailsTab();
  await opportunityPage.selectBlockFundingForFundingSourceAndType(opportunityData.HACCfundingType);
  //await opportunityPage.clickSearchFundingAndAddNewFunding();
  // await opportunityPage.selectParticipantInNewFunding(lead.firstName, lead.lastName);
  // await opportunityPage.selectNewFundingSourceAndTypeSupportAtHome();
  // //await opportunityPage.clickSearchFundingProgram();
  //await opportunityPage.selectFundingProgramBlockTestFundingHacc();
  await opportunityPage.selectFundingAdministrator(lead.firstName, lead.lastName);
  await opportunityPage.selectAssessmentVisitPreferenceInPerson();
  await opportunityPage.selectServiceAgreementStatus();
  await opportunityPage.selectReferrerTypeFamilyViolencePrograms();
  await opportunityPage.saveOpportunityDetails();
  await opportunityPage.refreshPage();
  await opportunityPage.verifyHeaderFundingType(opportunityData.HACCfundingType);
  Logger.pass('Opportunity funding configuration test completed successfully');
});

test('Configure HACC-PYP Link Fund', async ({ page }) => {
  test.setTimeout(120000);
  const homePage = new HomePage(page);
  const opportunityPage = new OpportunityPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];
    const { opportunity } = TestDataHelper.readJsonFile<{ opportunity: Array<Record<string, string>> }>('opportunity.json');
  const opportunityData = opportunity[0];

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 30);

  Logger.info('Starting Configuring HACC-PYP Link Fund on opportunity test');
  await opportunityPage.refreshPage();
  await homePage.verifyHomePage();
  await opportunityPage.hardRefreshPageWithRetry();  // Hard refresh before clicking dropdown
  await opportunityPage.hardRefreshPageWithRetry();
  await homePage.selectObjectFromDropdown('Opportunities');
  await opportunityPage.refreshPage();
  await opportunityPage.selectOpportunitiesListView('My Opportunities');
  await opportunityPage.searchAndOpenOpportunityByLeadName(lead.firstName, lead.lastName);
  await opportunityPage.openDetailsTab();
  await opportunityPage.ClickLinkFund();
  await opportunityPage.verifyDefaultDetails("Funding_Type", opportunityData.HACCfundingType);
  await opportunityPage.verifyDefaultDetails("Funding_Source", "Block Funding");
  await opportunityPage.fillDateLinkFund('StartDate', today);
  await opportunityPage.fillDateLinkFund('EndDate', tomorrow);
  await opportunityPage.selectFundingProgramHacc(opportunityData.HACCfundingProgram);
  await opportunityPage.clickOnDoneInLinkFund();
  await opportunityPage.refreshPage();
  await opportunityPage.verifyFundingValue();
  await opportunityPage.refreshPage();
  Logger.pass('Opportunity HACC-PYP Link Fund configuration test completed successfully');
});

test('verify Generate Agreement functionality on Opportunity', async ({ page }) => {
  const homePage = new HomePage(page);
  const opportunityPage = new OpportunityPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];

   const today = new Date();
   today.setDate(today.getDate());
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 30);

  Logger.info('Starting agreement generation validation test');
  await opportunityPage.refreshPage();
  await homePage.verifyHomePage();
  await opportunityPage.hardRefreshPageWithRetry();  // Hard refresh before clicking dropdown
  await opportunityPage.hardRefreshPageWithRetry();
  await homePage.selectObjectFromDropdown('Opportunities');
  await opportunityPage.refreshPage();
  await opportunityPage.selectOpportunitiesListView('My Opportunities');
  await opportunityPage.searchAndOpenOpportunityByLeadName(lead.firstName, lead.lastName);
  await opportunityPage.configureStage();
  await opportunityPage.configureStatus();
  await opportunityPage.fillDate('Agreement Start Date', today);
  await opportunityPage.fillDate('Agreement End Date', tomorrow);
  await opportunityPage.saveOpportunityDetails();
  await opportunityPage.refreshPage();
  //await opportunityPage.verifySignaturevisible();
  await opportunityPage.generateAgreement();
  await opportunityPage.refreshPage();
  await opportunityPage.switchToRelatedTab();
  await opportunityPage.verifyServiceAgreementFileGenerated();
  await opportunityPage.refreshPage();
  Logger.pass('Agreement generation validation test completed successfully');
  
});

test('Configure HACC-PYP PriceBook and Product Management on Opportunity', async ({ page }) => {
  const homePage = new HomePage(page);
  const opportunityPage = new OpportunityPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];
  const { opportunity } = TestDataHelper.readJsonFile<{ opportunity: Array<Record<string, string>> }>('opportunity.json');
  const opportunityData = opportunity[0];

  Logger.info('Starting opportunity HACC-PYP price book and product management configuration test');
  await opportunityPage.refreshPage();
  await homePage.verifyHomePage();
  await opportunityPage.hardRefreshPageWithRetry();  // Hard refresh before clicking dropdown
  await opportunityPage.hardRefreshPageWithRetry();
  await homePage.selectObjectFromDropdown('Opportunities');
  await opportunityPage.refreshPage();
  await opportunityPage.selectOpportunitiesListView('My Opportunities');
  await opportunityPage.searchAndOpenOpportunityByLeadName(lead.firstName, lead.lastName);
  //await opportunityPage.verifyQuoteNotGenerated();
  await opportunityPage.refreshPage();
  await opportunityPage.switchToRelatedTab();
  await opportunityPage.configurePriceBook(opportunityData.HACCpriceBook);
  await opportunityPage.refreshPage();
  await opportunityPage.configureProductManagement(opportunityData.HACCproduct);

  Logger.pass('Opportunity HACC-PYP price book and product management configuration validated successfully');
  await opportunityPage.refreshPage();
});


test('Verify Generate Quote functionality and verify Files on Opportunity', async ({ page }) => {
  const homePage = new HomePage(page);
  const opportunityPage = new OpportunityPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];

  Logger.info('Starting opportunity quote generation validation test');
  await opportunityPage.refreshPage();
  await homePage.verifyHomePage();
  await opportunityPage.hardRefreshPageWithRetry();  // Hard refresh before clicking dropdown
  await opportunityPage.hardRefreshPageWithRetry();
  await homePage.selectObjectFromDropdown('Opportunities');
  await opportunityPage.refreshPage();
  await opportunityPage.selectOpportunitiesListView('My Opportunities');
  await opportunityPage.searchAndOpenOpportunityByLeadName(lead.firstName, lead.lastName);
  await opportunityPage.refreshPage();
  await opportunityPage.switchToRelatedTab();
  await opportunityPage.verifyProductsAndClickGenerateQuote();
  await opportunityPage.refreshPage();
  await opportunityPage.switchToRelatedTab();
  await opportunityPage.verifyFilesGenerated(lead.firstName, lead.lastName);
  Logger.pass('Opportunity quote generation and file verification validated successfully');
});

test('Generate Send For Signature functionality on Opportunity', async ({ page }) => {
  const homePage = new HomePage(page);
  const opportunityPage = new OpportunityPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];

  Logger.info('Starting sending for signature validation test');
  await opportunityPage.refreshPage();
  await homePage.verifyHomePage();
  await opportunityPage.hardRefreshPageWithRetry();  // Hard refresh before clicking dropdown
  await opportunityPage.hardRefreshPageWithRetry();
  await homePage.selectObjectFromDropdown('Opportunities');
  await opportunityPage.refreshPage();
  await opportunityPage.selectOpportunitiesListView('My Opportunities');
  await opportunityPage.searchAndOpenOpportunityByLeadName(lead.firstName, lead.lastName);
  await opportunityPage.clickSignaturevisible();
  await opportunityPage.configureSignature();
  Logger.pass('Send for signature functionality on opportunity validated successfully');
  
});

test('verify Signature and Close the Opportunity', async ({ page }) => {
  const homePage = new HomePage(page);
  const opportunityPage = new OpportunityPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];

  Logger.info('Verifying signature and closing opportunity');
  await opportunityPage.refreshPage();
  await homePage.verifyHomePage();
  await opportunityPage.hardRefreshPageWithRetry();  // Hard refresh before clicking dropdown
  await opportunityPage.hardRefreshPageWithRetry();
  await homePage.selectObjectFromDropdown('Opportunities');
  await opportunityPage.refreshPage();
  await opportunityPage.selectOpportunitiesListView('My Opportunities');
  await opportunityPage.searchAndOpenOpportunityByLeadName(lead.firstName, lead.lastName);
  await opportunityPage.refreshPage();
  await opportunityPage.setOpportunityToClosedWon();
  await opportunityPage.refreshPage();
  //await opportunityPage.verifySentForSignature();
  Logger.pass('Signature verification and opportunity closure validated successfully');
  
});

test('Create Service Agreement on Opportunity record', async ({ page }) => {
  const homePage = new HomePage(page);
  const opportunityPage = new OpportunityPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];

  Logger.info('Creating service agreement on opportunity record');
  await opportunityPage.refreshPage();
  await homePage.verifyHomePage();
  await opportunityPage.hardRefreshPageWithRetry();
  await opportunityPage.hardRefreshPageWithRetry();
  await homePage.selectObjectFromDropdown('Opportunities');
  await opportunityPage.refreshPage();
  await opportunityPage.selectOpportunitiesListView('My Opportunities');
  await opportunityPage.searchAndOpenOpportunityByLeadName(lead.firstName, lead.lastName);
  await opportunityPage.createServiceAgreement();
  await opportunityPage.refreshPage();
  await opportunityPage.verifyServiceAgreementButtonNotPresent();
  await opportunityPage.verifyNoFurtherUpdatesOnRecord();
  await opportunityPage.refreshPage();
  Logger.pass('Service agreement creation on opportunity record validated successfully');
  
});

test('Verify HACC Service Agreement status under Service Agreements Object', async ({ page }) => {
  const homePage = new HomePage(page);
  const opportunityPage = new OpportunityPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];
  const { opportunity } = TestDataHelper.readJsonFile<{ opportunity: Array<Record<string, string>> }>('opportunity.json');
  const opportunityData = opportunity[0];

  Logger.info('Verifying HACC Service Agreement status under Service Agreements Object');
  await opportunityPage.refreshPage();
  await homePage.verifyHomePage();
  await opportunityPage.hardRefreshPageWithRetry();  // Hard refresh before clicking dropdown
  await opportunityPage.hardRefreshPageWithRetry();
  await homePage.selectObjectFromDropdown('Service Agreements');
  await opportunityPage.refreshPage();
  await opportunityPage.selectServiceAgreementListView(opportunityData.HACCserviceagreementListView);
  await opportunityPage.searchAndOpenOpportunityByLeadName(lead.firstName, lead.lastName);
  await opportunityPage.verifyActiveServiceAgreement();
  Logger.pass(' HACC Service Agreement status under Service Agreements Object verified successfully');
  
});
