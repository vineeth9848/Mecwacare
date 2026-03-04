import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { OpportunityPage } from '../../src/pages/opportunities/OpportunityPage';
import { TestDataHelper } from '../../src/utils/TestDataHelper';

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
  await opportunityPage.selectAssessmentVisitPreferenceInPerson();
  await opportunityPage.selectServiceAgreementStatus();
  await opportunityPage.selectReferrerTypeFamilyViolencePrograms();
  await opportunityPage.saveOpportunityDetails();
  await opportunityPage.verifyQuoteNotGenerated();
  await opportunityPage.switchToRelatedTab();
  Logger.pass('Opportunity funding validation test completed successfully');
});

test.only('verify Generate Quote functionality on Opportunity', async ({ page }) => {
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
  await opportunityPage.switchToRelatedTab();
  await opportunityPage.configurePriceBook();
});
