import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { AccountPage } from '../../src/pages/accounts/AccountPage';

test('create account', async ({ page }) => {
  const accountPage = new AccountPage(page);

  Logger.info('Starting account creation test');
  await accountPage.createAccount('Sample Account');
  await accountPage.verifyAccountCreated();
});
