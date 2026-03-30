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

test('Update mandatory DEX fields in Account for Opportunity closure', async ({ page }) => {
  const homePage = new HomePage(page);
  const accountPage = new AccountPage(page);
  const { accountCreate } = TestDataHelper.readJsonFile<{ accountCreate: Array<Record<string, string>> }>('accounts.json');
  const accountData = accountCreate[0];

  Logger.info('Starting account update for opportunity closure test');
  await accountPage.refreshPage();
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Accounts');
  await accountPage.selectAccountsListView('My Accounts');
  const expectedEmail = accountPage.getEmailWithRunNumber(accountData.email);
  await accountPage.searchAndOpenAccountByEmail(expectedEmail);
  await accountPage.editAccountFields();
  await accountPage.updateBasicInformationAccountDetails('Salutation', 'Mr.');
  await accountPage.updateBasicInformationAccountDetails('Country of Birth', 'Australia');
  await accountPage.updateBasicInformationAccountDetails('Indigenous Status', 'Both Aboriginal and Torres Strait Islander origin');
  await accountPage.selectPrimaryLanguage('Afar');
  await accountPage.updateBasicInformationAccountDetails('Interpreter required', 'Yes');
  await accountPage.updateBasicInformationAccountDetails('Gender', 'Male'); 
  await accountPage.updateBasicInformationAccountDetails('DVA Card Type', 'Gold Card');
  await accountPage.updateTextField('DVA Number', '1234567890');
  await accountPage.selectImportantInformationDetails('Pension Type', 'DVA Pension');
  await accountPage.selectImportantInformationDetails('Living Arrangements', 'Lives alone');
  await accountPage.selectImportantInformationDetails('Accommodation/Residential Setting', 'Alcohol and Drugs Treatment Residence');
  await accountPage.saveAccountDetails();
  

});

test.only('Update and  Verify account validations', async ({ page }) => {
  const homePage = new HomePage(page);
  const accountPage = new AccountPage(page);
  const { accountCreate } = TestDataHelper.readJsonFile<{ accountCreate: Array<Record<string, string>> }>('accounts.json');
  const accountData = accountCreate[0];

  Logger.info('Starting account validation test');
  const expectedEmail = accountPage.getEmailWithRunNumber(accountData.email);
  const birthYear = Number(accountData.dob.split('/')[2]);
  await accountPage.refreshPage();
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Accounts');
  await accountPage.selectAccountsListView('My Accounts');
  await accountPage.searchAndOpenAccountByEmail(expectedEmail);

  await accountPage.verifyEmailValue(expectedEmail);
  await accountPage.verifyAgeValueFromYear(birthYear);
  const addressUpdated = await accountPage.updateAddressFromLaunchVerify(accountData.verifySearchAddress);
  if (page.isClosed()) {
    Logger.info('Page closed during address flow. Skipping address validation');
  } 
});

test('Verify Creation of care plan form under Accounts', async ({ page }) => {
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
