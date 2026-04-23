import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { PlannerPage } from '../../src/pages/planner/PlannerPage';
import { TestDataHelper } from '../../src/utils/TestDataHelper';
import { LoginPage } from '../../src/pages/login/LoginPage';
import { existsSync } from 'fs';

const secondaryAuthPath = 'auth-uat.json';

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
  await plannerPage.setStartTimePlusTenMinutes();

  await plannerPage.selectAppointmentServiceAndClickNext(planner.HACCappointmentService);
  await plannerPage.navigationToNextPages(
    planner.appointmentType,
    planner.appointmentStatus,
    planner.titlePrefix,
  );
});

test('Planner secondary account isolated login flow', async ({ page, browser }) => {
  test.setTimeout(180000);

  const { plannerData } = TestDataHelper.readJsonFile<{ plannerData: Array<Record<string, string>> }>('planner.json');
  const planner = plannerData[0];

  Logger.info('Starting secondary account isolated login flow');

  const isolatedContext = await browser.newContext({
    baseURL: planner.secondaryLoginUrl,
    storageState: existsSync(secondaryAuthPath) ? secondaryAuthPath : undefined,
  });
  const isolatedPage = await isolatedContext.newPage();
  const isolatedLoginPage = new LoginPage(isolatedPage);
  const isolatedPlannerPage = new PlannerPage(isolatedPage);
  const isolatedHomePage = new HomePage(isolatedPage);

  try {
    if (existsSync(secondaryAuthPath)) {
      Logger.info(`Reusing saved secondary session from ${secondaryAuthPath}`);
      await isolatedPage.goto(planner.secondaryLoginUrl, { waitUntil: 'domcontentloaded' });
      await isolatedLoginPage.waitForSalesforceHome();
    } else {
      Logger.info(`No saved secondary session found. Logging in and saving ${secondaryAuthPath}`);
      await isolatedLoginPage.loginToUrl(
        planner.secondaryLoginUrl,
        planner.secondaryUsername,
        planner.secondaryPassword,
      );
      await isolatedPlannerPage.verifyHomePage();
      await isolatedLoginPage.saveSessionStorageState(secondaryAuthPath);
      Logger.info(`Secondary session saved to ${secondaryAuthPath}`);
    }

    await isolatedPlannerPage.verifyHomePage();
    await isolatedHomePage.selectObjectFromDropdown(planner.objectName);
    await isolatedPlannerPage.clickAgendaEventByAccountName(planner.username);
    await isolatedPlannerPage.performCheckInAndCheckOut();
    await isolatedPlannerPage.runSecondaryAccountStepsPlaceholder();
  } finally {
    await isolatedContext.close();
  }
});
