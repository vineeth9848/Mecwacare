import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { PlannerPage } from '../../src/pages/planner/PlannerPage';
import { TestDataHelper } from '../../src/utils/TestDataHelper';
import { LoginPage } from '../../src/pages/login/LoginPage';

test('Create New Appointment', async ({ page }) => {
  test.setTimeout(180000);

  const homePage = new HomePage(page);
  const plannerPage = new PlannerPage(page);
  const { plannerData } = TestDataHelper.readJsonFile<{ plannerData: Array<Record<string, string>> }>('planner.json');
  const planner = plannerData[0];

  Logger.info(`Planner Data: ${JSON.stringify(planner)}`);

  await homePage.verifyHomePage();
  await plannerPage.hardRefreshPageWithRetry();
  await plannerPage.hardRefreshPageWithRetry();
  await homePage.selectObjectFromDropdown(planner.objectName);
  await plannerPage.clickNewButton();
  await plannerPage.createNewAppointment(planner.username, planner.resourceName);
  await plannerPage.setStartTimePlusTenMinutes();

  await plannerPage.selectAppointmentServiceAndClickNext(planner.NDISappointmentService);
  await plannerPage.navigationToNextPages(
    planner.appointmentType,
    planner.appointmentStatus,
    planner.titlePrefix,
  );
});

test('Planner secondary account isolated login flow', async ({ browser }) => {
  test.setTimeout(180000);

  const { plannerData } = TestDataHelper.readJsonFile<{ plannerData: Array<Record<string, string>> }>('planner.json');
  const planner = plannerData[0];

  Logger.info('Starting secondary account isolated login flow');

  const isolatedContext = await browser.newContext({
    baseURL: planner.secondaryLoginUrl,
    // Always start fresh for secondary account flow and login with JSON credentials.
    storageState: undefined,
  });
  const isolatedPage = await isolatedContext.newPage();
  const isolatedLoginPage = new LoginPage(isolatedPage);
  const isolatedPlannerPage = new PlannerPage(isolatedPage);
  const isolatedHomePage = new HomePage(isolatedPage);

  try {
    Logger.info('Logging into secondary account with planner JSON credentials');
    await isolatedLoginPage.loginToUrl(
      planner.secondaryLoginUrl,
      planner.secondaryUsername,
      planner.secondaryPassword,
    );
    await isolatedLoginPage.waitForSalesforceHome(120000);

    await isolatedPlannerPage.verifyHomePage();
    await isolatedHomePage.selectObjectFromDropdown(planner.objectName);
    await isolatedPlannerPage.clickAgendaEventByAccountName(planner.resourceName);
    await isolatedPlannerPage.performCheckInAndCheckOut();
    await isolatedPlannerPage.runSecondaryAccountStepsPlaceholder();
  } finally {
    await isolatedContext.close();
  }
});
