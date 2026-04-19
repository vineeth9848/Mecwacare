import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { TestDataHelper } from '../../src/utils/TestDataHelper';
import { CasePage } from '../../src/pages/cases/CasePage';
import { OpportunityPage } from '../../src/pages/opportunities/OpportunityPage';



test('create case from case page', async ({ page }) => {
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
  await casePage.refreshPage();

  Logger.pass('Case created successfully from Case page');
  
});

test('Close the Case and Verify Funding details on Case', async ({ page }) => {
  test.setTimeout(180000);
  const homePage = new HomePage(page);
  const casePage = new CasePage(page);
  const opportunityPage = new OpportunityPage(page);
  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];

  const { caseCreate } = TestDataHelper.readJsonFile<{ caseCreate: Array<Record<string, string>> }>('cases.json');
  const cases = caseCreate[0];

  Logger.info(`Case Update Data: ${JSON.stringify(cases)}`);
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Cases');
  await casePage.selectCaseListView("All Cases");
  await opportunityPage.searchAndOpenOpportunityByLeadName(lead.firstName, lead.lastName);
  await casePage.clickOnEditButton();
  await casePage.selectCaseDropdown('Status', 'Closed Resolved');
  await casePage.saveButtonClick();
  await casePage.refreshPage();
  await casePage.verifyCaseClosed();
  
  Logger.pass('Case details verified and Closed successfully from Case page');
  
});

