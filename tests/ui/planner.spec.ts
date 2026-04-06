import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { PlannerPage } from '../../src/pages/planner/PlannerPage';
import { TestDataHelper } from '../../src/utils/TestDataHelper';
import { LoginPage } from '../../src/pages/login/LoginPage';

test.describe.configure({ mode: 'serial' });

test('Create New Appointment', async ({ page }) => {
  test.setTimeout(180000);

  const homePage = new HomePage(page);
  const plannerPage = new PlannerPage(page);
  const { plannerData } = TestDataHelper.readJsonFile<{ plannerData: Array<Record<string, string>> }>('planner.json');
  const planner = plannerData[0];

  Logger.info(`Planner Data: ${JSON.stringify(planner)}`);

  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown(planner.objectName);
  await plannerPage.clickNewButton();
  await plannerPage.createNewAppointment(planner.username, planner.resourceName);
  await plannerPage.setStartDateToTomorrow();
  await plannerPage.selectAppointmentServiceAndClickNext(planner.appointmentService);
  await plannerPage.navigationToNextPages(
    planner.appointmentType,
    planner.appointmentStatus,
    planner.titlePrefix,
  );
});

test('Planner secondary account isolated login flow', async ({ page, browser }) => {
  test.setTimeout(180000);

  const homePage = new HomePage(page);
  const { plannerData } = TestDataHelper.readJsonFile<{ plannerData: Array<Record<string, string>> }>('planner.json');
  const planner = plannerData[0];

  Logger.info('Starting secondary account isolated login flow');
  await homePage.verifyHomePage();

  const isolatedContext = await browser.newContext({ baseURL: planner.secondaryLoginUrl });
  const isolatedPage = await isolatedContext.newPage();
  const isolatedLoginPage = new LoginPage(isolatedPage);
  const isolatedPlannerPage = new PlannerPage(isolatedPage);
  const isolatedHomePage = new HomePage(isolatedPage);

  try {
    await isolatedLoginPage.loginToUrl(
      planner.secondaryLoginUrl,
      planner.secondaryUsername,
      planner.secondaryPassword,
    );

    await isolatedHomePage.verifyHomePage();
    await isolatedHomePage.selectObjectFromDropdown(planner.objectName);
    await isolatedPlannerPage.runSecondaryAccountStepsPlaceholder();
    await isolatedLoginPage.logoutFromSalesforce();
  } finally {
    await isolatedContext.close();
  }

  await homePage.verifyHomePage();
});
