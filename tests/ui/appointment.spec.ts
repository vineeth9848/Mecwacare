import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { HomePage } from '../../src/pages/homepage/HomePage';
import { AppointmentPage } from '../../src/pages/appointments/AppointmentPage';
import { TestDataHelper } from '../../src/utils/TestDataHelper';
import { OpportunityPage } from '../../src/pages/opportunities/OpportunityPage';

test('Open Appointment object and record scaffold', async ({ page }) => {
  test.setTimeout(120000);

  const homePage = new HomePage(page);
  const appointmentPage = new AppointmentPage(page);
  const opportunityPage = new OpportunityPage(page);
  const { appointmentData } = TestDataHelper.readJsonFile<{ appointmentData: Array<Record<string, string>> }>(
    'appointment.json',
  );
  const appointment = appointmentData[0];

  Logger.info(`Appointment Data: ${JSON.stringify(appointment)}`);

  await homePage.verifyHomePage();
  await homePage.selectObjectFromDropdown('Appointments');
  await appointmentPage.selectListView(appointment.listView);
  await appointmentPage.searchAndOpenFirstRecordByName(appointment.username);
  await appointmentPage.verifyRecordOpened();
  await appointmentPage.clickonConfirm();
  await appointmentPage.refreshPage();
  await homePage.selectObjectFromDropdown('Appointments');
  await appointmentPage.selectListView(appointment.listView);
  await appointmentPage.searchAndOpenFirstRecordByName(appointment.username);
  await appointmentPage.verifyCompletedClinicTravelBracketAndDeliveryActivities();

});

test('Run the Maica Billing', async ({ page }) => {
  test.setTimeout(120000);

  const homePage = new HomePage(page);
  const appointmentPage = new AppointmentPage(page);
  const opportunityPage = new OpportunityPage(page);
  const { appointmentData } = TestDataHelper.readJsonFile<{ appointmentData: Array<Record<string, string>> }>(
    'appointment.json',
  );
  const appointment = appointmentData[0];

  Logger.info(`Appointment Data: ${JSON.stringify(appointment)}`);

  await homePage.verifyHomePage();
  await homePage.refreshPage();
  await appointmentPage.openMaicaSettings();
  await appointmentPage.openBillingManagement();
  await appointmentPage.clickRunNowAndWait();

});

test.only('Verify the Invoice Line Items', async ({ page }) => {
  test.setTimeout(120000);

  const homePage = new HomePage(page);
  const appointmentPage = new AppointmentPage(page);
  const opportunityPage = new OpportunityPage(page);
  const { appointmentData } = TestDataHelper.readJsonFile<{ appointmentData: Array<Record<string, string>> }>(
    'appointment.json',
  );
  const appointment = appointmentData[0];

  Logger.info(`Appointment Data: ${JSON.stringify(appointment)}`);

  await homePage.verifyHomePage();
  await appointmentPage.refreshPage();
  await homePage.selectObjectFromDropdown('Appointments');
  await appointmentPage.selectListView(appointment.listView);
  await appointmentPage.searchAndOpenFirstRecordByName(appointment.username);
  await appointmentPage.verifyRecordOpened();
  await appointmentPage.verifyCompletedClinicTravelBracketAndDeliveryActivities();
  await appointmentPage.enterdeliveryActivityDetails();
  await appointmentPage.verifyDeliveryActivityFullDetails();

});
