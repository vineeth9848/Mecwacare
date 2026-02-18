import { test } from '../../src/fixtures/testFixtures';
import { TestDataHelper } from '../../src/utils/TestDataHelper';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { LeadPage } from '../../src/pages/leads/LeadPage';

test('create lead from leads page', async ({ page }) => {
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
  const homePage = new HomePage(page);
  const leadPage = new LeadPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];

  Logger.info('Starting lead validation test');
  await leadPage.refreshPage();
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Leads');

  const leadName = `${lead.firstName} ${lead.lastName}`;
  await leadPage.openLeadFromList(leadName);
  await leadPage.verifyDobValue(lead.dob);
  await leadPage.verifyAgeValueFromDob(lead.dob);
  await leadPage.verifyAddressValue(lead.searchAddress);
  await leadPage.updateAddressFromLaunchVerify(lead.verifySearchAddress);
  await leadPage.verifyAddressValue(lead.verifyExpectedAddress);
});
