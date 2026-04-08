import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { TestDataHelper } from '../../src/utils/TestDataHelper';
import { CasePage } from '../../src/pages/cases/CasePage';


test.only('create case from case page', async ({ page }) => {
  test.setTimeout(180000);
  const homePage = new HomePage(page);
  const casePage = new CasePage(page);

  const { caseCreate } = TestDataHelper.readJsonFile<{ caseCreate: Array<Record<string, string>> }>('cases.json');
  const cases = caseCreate[0];

  Logger.info(`Case Create Data: ${JSON.stringify(cases)}`);
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Cases');

  const today = new Date();

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

  await casePage.clickNewButton();
  await casePage.selectCaseType();
  await casePage.selectAccountFromSearch(cases.accountFirstName, cases.accountLastName);
  await casePage.selectCaseDropdown('Case Origin', 'Email');
  await casePage.selectCaseDropdown('Priority', 'High');
  await casePage.fillTextFields('Subject', cases.subject);
  await casePage.selectCaseDropdown('Funding Source', 'Block Funding');
  await casePage.selectCaseDropdown('Funding Type', 'HACC-PYP ');
  await casePage.selectCaseDropdown('Reason for Departure', 'Client unhappy with services');
  await casePage.DateField('Date_Of_Notice__c', today);
  await casePage.DateField('Last_Date_with_mecwacare__c', tomorrow);
  await casePage.saveButtonClick();

  Logger.pass('Case created successfully from Case page');
  
});
