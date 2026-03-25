import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { AccountPage } from '../../src/pages/accounts/AccountPage';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { TestDataHelper } from '../../src/utils/TestDataHelper';

test.skip('create account', async ({ page }) => {
  const homePage = new HomePage(page);
  const accountPage = new AccountPage(page);
  const { accountCreate } = TestDataHelper.readJsonFile<{ accountCreate: Array<Record<string, string>> }>('accounts.json');
  const accountData = accountCreate[0];

  Logger.info('Starting account creation test');
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Accounts');

  await accountPage.clickNewButton();
  await accountPage.selectPersonAccount();
  await accountPage.clickOnNextButton();

  await accountPage.createAccount(
    accountData.firstName,
    accountData.lastName,
    accountData.phone,
    accountData.dob,
    accountData.categoryOption,
    accountData.serviceDelivery,
    accountData.email,
    accountData.successMessage,
  );
});

test.skip('Verify account validations', async ({ page }) => {
  const homePage = new HomePage(page);
  const accountPage = new AccountPage(page);
  const { accountCreate } = TestDataHelper.readJsonFile<{ accountCreate: Array<Record<string, string>> }>('accounts.json');
  const accountData = accountCreate[0];

  Logger.info('Starting account validation test');
  await accountPage.refreshPage();
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Accounts');

  const accountName = `${accountData.firstName} ${accountData.lastName}`;
  await accountPage.openAccountFromList(accountName);
  await accountPage.verifyAgeValueFromDob(accountData.dob);
  await accountPage.verifyServiceDeliveryAddress(accountData.serviceDelivery);
});

test.only('Verify Creation of care plan form under Accounts', async ({ page }) => {
  const homePage = new HomePage(page);
  const accountPage = new AccountPage(page);
  const { accountCreate } = TestDataHelper.readJsonFile<{ accountCreate: Array<Record<string, string>> }>('accounts.json');
  const accountData = accountCreate[0];

  Logger.info('Starting account Care Plan creation test');
  await accountPage.refreshPage();
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Accounts');
  await accountPage.selectAccountsListView('My Accounts');
  const expectedEmail = accountPage.getEmailWithRunNumber(accountData.email);
  await accountPage.searchAndOpenAccountByEmail(expectedEmail);
  await accountPage.createCarePlan();
  
});
