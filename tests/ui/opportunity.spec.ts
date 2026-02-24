import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { OpportunityPage } from '../../src/pages/opportunities/OpportunityPage';
test('verify funding source and funding type in first opportunity record', async ({ page }) => {
  const homePage = new HomePage(page);
  const opportunityPage = new OpportunityPage(page);

  Logger.info('Starting opportunity funding validation test');
  await opportunityPage.refreshPage();
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Opportunities');
  await opportunityPage.openFirstOpportunityRecord();
  await opportunityPage.openDetailsTab();
  await opportunityPage.updateAssessmentVisitAndReferrerType();
  await opportunityPage.verifyFundingSourceAndType();
  await opportunityPage.selectSupportAtHomeForFundingSourceAndType();
  await opportunityPage.clickSearchFundingAndAddNewFunding();
  await opportunityPage.fillNewFundingAndSave('andrew');
  await opportunityPage.verifyFundingDetailsAfterSave();
});
