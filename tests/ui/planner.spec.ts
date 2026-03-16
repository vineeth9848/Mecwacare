import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { PlannerPage } from '../../src/pages/planner/PlannerPage';
import { TestDataHelper } from '../../src/utils/TestDataHelper';

test.skip('verify planner record from list view', async ({ page }) => {
  const homePage = new HomePage(page);
  const plannerPage = new PlannerPage(page);
  const { plannerData } = TestDataHelper.readJsonFile<{ plannerData: Array<Record<string, string>> }>('planner.json');
  const planner = plannerData[0];

  Logger.info('Starting planner validation test');
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Planner');
  await plannerPage.selectPlannerListView(planner.listView);
  await plannerPage.searchAndOpenPlannerRecord(planner.searchText);
  await plannerPage.openDetailsTab();
  await plannerPage.verifyPlannerRecordOpened(planner.recordName);
});
