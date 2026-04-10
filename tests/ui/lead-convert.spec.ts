import { test } from '../../src/fixtures/testFixtures';
import { TestDataHelper } from '../../src/utils/TestDataHelper';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { LeadPage } from '../../src/pages/leads/LeadPage';

test.only('convert lead and verify conversion details', async ({ page }) => {
  const homePage = new HomePage(page);
  const leadPage = new LeadPage(page);
  const { leadCreate, leadConvert } = TestDataHelper.readJsonFile<{
    leadCreate: Array<Record<string, string>>;
    leadConvert: Array<Record<string, string>>;
  }>('leads.json');
  const lead = leadCreate[0];
  const convertData = leadConvert[0];

  Logger.info('Starting lead conversion test');
  test.setTimeout(900000);
  //await leadPage.staticWait(10000);
  await leadPage.refreshPage();
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Leads');
  await leadPage.selectLeadsListView("Today's Leads");
  await leadPage.staticWait(3000);

  const expectedEmail = leadPage.getEmailWithRunNumber(lead.email);
  await leadPage.openLatestLeadIfEmailMatches(expectedEmail);

  await leadPage.clickConvertButton();
  await leadPage.verifyConvertDataPopulated(
    convertData.expectedFirstName,
    convertData.expectedLastName,
    convertData.expectedOpportunityName,
  );
  await leadPage.clickConvertAndVerifySuccess(`${convertData.expectedFirstName} ${convertData.expectedLastName}`);
  await leadPage.verifyLeadNotPresentInList(lead.email);
  Logger.pass('Lead conversion test completed successfully');
});
