import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { AccountPage } from '../../src/pages/accounts/AccountPage';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { TestDataHelper } from '../../src/utils/TestDataHelper';

test('Verify Creation of care plan form under Accounts', async ({ page }) => {
  const homePage = new HomePage(page);
  const accountPage = new AccountPage(page);
  const { accountCreate } = TestDataHelper.readJsonFile<{ accountCreate: Array<Record<string, string>> }>('accounts.json');
  const accountData = accountCreate[0];

  Logger.info('Starting account Care Plan creation test');
  await accountPage.refreshPage();
  await homePage.verifyHomePage();
  await accountPage.hardRefreshPageWithRetry();
  await accountPage.hardRefreshPageWithRetry();
  await homePage.resetObjectSelectionState();
  await homePage.selectObjectFromDropdown('Accounts');
  await accountPage.refreshPage();
  await accountPage.selectAccountsListView('My Accounts');
  await accountPage.refreshPage();
  const expectedEmail = accountPage.getEmailWithRunNumber(accountData.email);
  await accountPage.searchAndOpenAccountByEmail(expectedEmail);
  await accountPage.createCarePlan();
  await accountPage.refreshPage();
  
});

test('Verify Creation of client forms under Accounts', async ({ page }) => {
  const homePage = new HomePage(page);
  const accountPage = new AccountPage(page);
  const { accountCreate } = TestDataHelper.readJsonFile<{ accountCreate: Array<Record<string, string>> }>('accounts.json');
  const accountData = accountCreate[0];

  Logger.info('Starting account Client form creation test');
  await accountPage.refreshPage();
  await homePage.verifyHomePage();
  await accountPage.hardRefreshPageWithRetry();
  await accountPage.hardRefreshPageWithRetry();
  await homePage.resetObjectSelectionState();
  await homePage.selectObjectFromDropdown('Accounts');
  await accountPage.refreshPage();
  await accountPage.selectAccountsListView('My Accounts');
  await accountPage.refreshPage();
  const expectedEmail = accountPage.getEmailWithRunNumber(accountData.email);
  await accountPage.searchAndOpenAccountByEmail(expectedEmail);
  await accountPage.createClientForm();
  await accountPage.refreshPage();
  
});

test('Verify Care Plan and Client forms under Account', async ({ page }) => {
  const homePage = new HomePage(page);
  const accountPage = new AccountPage(page);
  const { accountCreate } = TestDataHelper.readJsonFile<{ accountCreate: Array<Record<string, string>> }>('accounts.json');
  const accountData = accountCreate[0];

  Logger.info('Starting account Care Plan and Client form verification test');
  await accountPage.refreshPage();
  await homePage.verifyHomePage();
  await accountPage.hardRefreshPageWithRetry();
  await accountPage.hardRefreshPageWithRetry();
  await homePage.resetObjectSelectionState();
  await homePage.selectObjectFromDropdown('Accounts');
  await accountPage.refreshPage();
  await accountPage.selectAccountsListView('My Accounts');
  const expectedEmail = accountPage.getEmailWithRunNumber(accountData.email);
  await accountPage.searchAndOpenAccountByEmail(expectedEmail);
  await accountPage.verifyCarePlanCreated(accountData.firstName, accountData.lastName);
  await accountPage.verifyClientFormCreated(accountData.firstName, accountData.lastName);
  await accountPage.refreshPage();
  
});
