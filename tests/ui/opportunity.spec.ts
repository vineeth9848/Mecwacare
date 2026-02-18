import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { OpportunityPage } from '../../src/pages/opportunities/OpportunityPage';
import { TestDataHelper } from '../../src/utils/TestDataHelper';

test('navigate to opportunity and select account name', async ({ page }) => {
  const homePage = new HomePage(page);
  const opportunityPage = new OpportunityPage(page);
  const { accountCreate } = TestDataHelper.readJsonFile<{ accountCreate: Array<Record<string, string>> }>('accounts.json');
  const accountData = accountCreate[0];

  Logger.info('Starting opportunity account selection test');
  await opportunityPage.refreshPage();
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Opportunities');

  const accountName = `${accountData.firstName} ${accountData.lastName}`;
  await opportunityPage.clickNewButton();
  await opportunityPage.selectAccountName(accountName);
});
