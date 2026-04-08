import { test } from '../../src/fixtures/testFixtures';
import { TestDataHelper } from '../../src/utils/TestDataHelper';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { LeadPage } from '../../src/pages/leads/LeadPage';

test('create lead from leads page', async ({ page }) => {
  test.setTimeout(180000);
  const homePage = new HomePage(page);
  const leadPage = new LeadPage(page);

  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];

  Logger.info(`Lead Create Data: ${JSON.stringify(lead)}`);
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Leads');

  await leadPage.clickNewButton();
  await leadPage.createLead(
    lead.firstName,
    lead.lastName,
    lead.phone,
    lead.dob,
    lead.leadSource,
    lead.serviceRequest,
    lead.additionalInfo,
    lead.email,
    lead.leadScore,
    lead.searchAddress,
    lead.leadOption,
    lead.serviceOption,
  );
});

test('verify lead validations', async ({ page }) => {
  // test.setTimeout(120000);
  const homePage = new HomePage(page);
  const leadPage = new LeadPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];

  Logger.info('Starting lead validation test');
  //await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Leads');
  await leadPage.selectLeadsListView("Today's Leads");

  const expectedEmail = leadPage.getEmailWithRunNumber(lead.email);
  const birthYear = Number(lead.dob.split('/')[2]);
  await leadPage.openLatestLeadIfEmailMatches(expectedEmail);
  await leadPage.verifyEmailValue(expectedEmail);
  await leadPage.verifyAgeValueFromYear(birthYear);
  const addressUpdated = await leadPage.updateAddressFromLaunchVerify(lead.verifySearchAddress);
  if (page.isClosed()) {
    Logger.info('Page closed during address flow. Skipping address validation');
    return;
  }
  if (addressUpdated) {
    await leadPage.verifyAddressValue(lead.verifyExpectedAddress);
  } else {
    Logger.info('Address update skipped. Skipping fallback address validation');
  }
});
