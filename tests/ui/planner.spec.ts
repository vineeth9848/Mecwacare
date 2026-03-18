import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { PlannerPage } from '../../src/pages/planner/PlannerPage';
import { TestDataHelper } from '../../src/utils/TestDataHelper';

test.only('Create New Appointment', async ({ page }) => {
  const homePage = new HomePage(page);
  const plannerPage = new PlannerPage(page);
  const { plannerData } = TestDataHelper.readJsonFile<{ plannerData: Array<Record<string, string>> }>('planner.json');
  const planner = plannerData[0];

  Logger.info('Starting New Appointment creation test');
  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Planner');
  await plannerPage.clickNewButton();
  await plannerPage.NewAppointment(planner.username);
  
});
