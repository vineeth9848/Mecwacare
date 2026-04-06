import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { MaicaBillingPage } from '../../src/pages/maica-billing/MaicaBillingPage';
import { TestDataHelper } from '../../src/utils/TestDataHelper';

test.describe.configure({ mode: 'serial' });

test.skip('Open MAICA Billing object and record scaffold', async ({ page }) => {
  test.setTimeout(120000);

  const homePage = new HomePage(page);
  const maicaBillingPage = new MaicaBillingPage(page);
  const { maicaBillingData } = TestDataHelper.readJsonFile<{ maicaBillingData: Array<Record<string, string>> }>(
    'maica-billing.json',
  );
  const billing = maicaBillingData[0];

  Logger.info(`MAICA Billing Data: ${JSON.stringify(billing)}`);

  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown(billing.objectName);
  await maicaBillingPage.selectListView(billing.listView);
  await maicaBillingPage.searchAndOpenRecord(billing.searchText);
  await maicaBillingPage.verifyRecordOpened(billing.recordName);
});
