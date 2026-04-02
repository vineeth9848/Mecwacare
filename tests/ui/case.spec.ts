import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { TestDataHelper } from '../../src/utils/TestDataHelper';
import { CasePage } from '../../src/pages/cases/CasePage';


test('create case from case page', async ({ page }) => {
  test.setTimeout(180000);
  const homePage = new HomePage(page);
  const casePage = new CasePage(page);

  const { caseCreate } = TestDataHelper.readJsonFile<{ caseCreate: Array<Record<string, string>> }>('cases.json');
  const cases = caseCreate[0];

  Logger.info(`Case Create Data: ${JSON.stringify(cases)}`);
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Cases');

  await casePage.clickNewButton();
  await casePage.selectCaseType();
  await casePage.selectAccountFromSearch(cases.accountFirstName, cases.accountLastName);
  await casePage.selectCaseDropdown('Case Origin', 'Email');
  await casePage.selectCaseDropdown('Priority', 'High');
  await casePage.fillTextFields('Subject', cases.subject);
  await casePage.clickSearchInvoiceAndAddNewInvoice();
  //await casePage.selectParticipantFromSearch(cases.accountFirstName, cases.accountLastName);
  await casePage.createNewInvoiceInCase(cases.accountFirstName, cases.accountLastName);
  //await casePage.selectCaseDropdown('Adjustment type', 'Credit');
  //await casePage.fillTextFields('Adjustment/Refund Amount', '1160');
  //await casePage.selectCaseDropdown('Action', 'Credit to package');
  // await casePage.selectCaseDropdown('Adjustment reason', 'Service quality not met');
  // await casePage.fillTextFields('Adjustment context', 'Testing case creation with credit to package');
  // await casePage.saveButtonClick();
  // await casePage.SubmitforApproval();
  // await casePage.verifySubmitToProceed();

  Logger.pass('Case created successfully from Case page');
  
});
