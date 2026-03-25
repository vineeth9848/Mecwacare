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

  await casePage.clickNewButton();
  await casePage.selectCaseType();
});