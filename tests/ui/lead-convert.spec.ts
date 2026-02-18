import { test } from '../../src/fixtures/testFixtures';
import { TestDataHelper } from '../../src/utils/TestDataHelper';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { LeadPage } from '../../src/pages/leads/LeadPage';

test('convert lead and verify conversion details', async ({ page }) => {
  const homePage = new HomePage(page);
  const leadPage = new LeadPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];

  Logger.info('Starting lead conversion test');
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Leads');

  const leadName = `${lead.firstName} ${lead.lastName}`;
  await leadPage.openLeadFromList(leadName);

  await leadPage.clickConvertButton();
  await leadPage.verifyConvertDataPopulated(lead.firstName, lead.lastName);
  await leadPage.clickConvertAndVerifySuccess();
  await leadPage.goToLeadsFromConversionSuccess();
  await leadPage.verifyLeadNotPresentInList(leadName);
});
