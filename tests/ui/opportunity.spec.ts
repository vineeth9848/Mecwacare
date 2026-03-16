import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { OpportunityPage } from '../../src/pages/opportunities/OpportunityPage';
import { TestDataHelper } from '../../src/utils/TestDataHelper';
import { time } from 'console';

test('verify funding source and funding type in first opportunity record', async ({ page }) => {
  const homePage = new HomePage(page);
  const opportunityPage = new OpportunityPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];

  Logger.info('Starting opportunity funding validation test');
  await opportunityPage.refreshPage();
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Opportunities');
  await opportunityPage.selectOpportunitiesListView('My Opportunities');
  await opportunityPage.searchAndOpenOpportunityByLeadName(lead.firstName, lead.lastName);
  await opportunityPage.openDetailsTab();
  await opportunityPage.selectSupportAtHomeForFundingSourceAndType();
  await opportunityPage.clickSearchFundingAndAddNewFunding();
  await opportunityPage.selectParticipantInNewFunding(lead.firstName, lead.lastName);
  await opportunityPage.selectNewFundingSourceAndTypeSupportAtHomeAndSave();
  await opportunityPage.selectFundingAdministrator(lead.firstName, lead.lastName);
  await opportunityPage.selectAssessmentVisitPreferenceInPerson();
  await opportunityPage.selectServiceAgreementStatus();
  await opportunityPage.selectReferrerTypeFamilyViolencePrograms();
  await opportunityPage.saveOpportunityDetails();
  Logger.pass('Opportunity funding validation test completed successfully');
});

test('verify Generate Quote functionality on Opportunity', async ({ page }) => {
  const homePage = new HomePage(page);
  const opportunityPage = new OpportunityPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];

  Logger.info('Starting opportunity quote generation validation test');
  await opportunityPage.refreshPage();
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Opportunities');
  await opportunityPage.selectOpportunitiesListView('My Opportunities');
  await opportunityPage.searchAndOpenOpportunityByLeadName(lead.firstName, lead.lastName);
  await opportunityPage.verifyQuoteNotGenerated();
  await opportunityPage.refreshPage();
  await opportunityPage.switchToRelatedTab();
  await opportunityPage.configurePriceBook();
  await opportunityPage.configureProductManagement();
  await opportunityPage.verifyProductsAndClickGenerateQuote();
  await opportunityPage.refreshPage();
  await opportunityPage.switchToRelatedTab();
  await opportunityPage.verifyFilesGenerated(lead.firstName, lead.lastName);
});

test('verify Generate Service Agreement functionality on Opportunity', async ({ page }) => {
  const homePage = new HomePage(page);
  const opportunityPage = new OpportunityPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];

  Logger.info('Starting service agreement generation validation test');
  await opportunityPage.refreshPage();
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Opportunities');
  await opportunityPage.selectOpportunitiesListView('My Opportunities');
  await opportunityPage.searchAndOpenOpportunityByLeadName(lead.firstName, lead.lastName);
  await opportunityPage.configureStage();
  await opportunityPage.configureStatus();
  await opportunityPage.saveOpportunityDetails();
  await opportunityPage.refreshPage();
  await opportunityPage.verifySignaturevisible();
  await opportunityPage.generateAgreement();
  await opportunityPage.refreshPage();
  await opportunityPage.switchToRelatedTab();
  await opportunityPage.verifyServiceAgreementFileGenerated();
  
});

test('Generate Send For Signature functionality on Opportunity', async ({ page }) => {
  const homePage = new HomePage(page);
  const opportunityPage = new OpportunityPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];

  Logger.info('Starting sending for signature validation test');
  await opportunityPage.refreshPage();
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Opportunities');
  await opportunityPage.selectOpportunitiesListView('My Opportunities');
  await opportunityPage.searchAndOpenOpportunityByLeadName(lead.firstName, lead.lastName);
  await opportunityPage.clickSignaturevisible();
  await opportunityPage.configureSignature();
  
});

test.only('verify Signature and Close the Opportunity', async ({ page }) => {
  const homePage = new HomePage(page);
  const opportunityPage = new OpportunityPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];

  Logger.info('Verifying signature and closing opportunity');
  await opportunityPage.refreshPage();
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Opportunities');
  await opportunityPage.selectOpportunitiesListView('My Opportunities');
  await opportunityPage.searchAndOpenOpportunityByLeadName(lead.firstName, lead.lastName);
  await opportunityPage.verifySentForSignature();
  await opportunityPage.selectFundingAdministrator(lead.firstName, lead.lastName);
  await opportunityPage.refreshPage();
  await opportunityPage.setOpportunityToClosedWon();
  
  
});
