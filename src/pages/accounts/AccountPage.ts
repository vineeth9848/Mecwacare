import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { AccountLocators } from '../locators/AccountLocators';
import PropertyReader from '../../utils/PropertyReader';

export class AccountPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickNewButton(): Promise<void> {
    Logger.step('Click New button in Accounts page');
    await expect(this.page.getByText('Accounts', { exact: true }).first()).toBeVisible();
    const newButton = this.page.getByRole('button', { name: 'New' }).first();
    await this.waitForVisible(newButton, 30000);
    await newButton.click({ force: true });
    Logger.pass('Clicked New button in Accounts page');
  }

  async selectPersonAccount(): Promise<void> {
    Logger.step('Select Person Account');
    await this.page.locator(AccountLocators.personaccount).click();
    Logger.pass('Person Account selected');
  }

  async clickOnNextButton(): Promise<void> {
    Logger.step('Click on Next button');
    await this.page.getByRole('button', { name: AccountLocators.button }).click();
    Logger.pass('Clicked on Next button');
  }

  async createAccount(firstName: string, lastName: string, phone: string, dob: string, category_option: string, service_delivery: string, email: string, success_msg: string): Promise<void> {
      Logger.step('Create account');
      await this.page.waitForTimeout(10000);
      await this.page.getByLabel(AccountLocators.first_name, { exact: true }).first().fill(firstName);
      
      await this.page.getByLabel(AccountLocators.last_name, { exact: true }).first().fill(lastName);

      const dobField = this.page.getByLabel(AccountLocators.dob, { exact: true }).first();
      await dobField.scrollIntoViewIfNeeded();
      await dobField.fill(dob);
      await dobField.press('Tab');
      
      const categoryDropdown = this.page.getByRole('combobox', {
      name: AccountLocators.customer_category
      });
      await categoryDropdown.scrollIntoViewIfNeeded();
      await categoryDropdown.click();

      const individualOption = this.page.getByRole('option', {
        name: category_option
      });
      await individualOption.click();
      
      const emailField = this.page.getByLabel(AccountLocators.email, { exact: true }).first();
      await emailField.scrollIntoViewIfNeeded();
      await emailField.fill(email);

      await this.page.getByLabel(AccountLocators.phone, { exact: true }).first()
        .scrollIntoViewIfNeeded();
      await this.page.getByLabel(AccountLocators.phone, { exact: true }).first()
        .fill(phone);
      await this.page.getByLabel(AccountLocators.dob, { exact: true }).first().fill(dob);

      await this.searchServiceDeliveryAddress(service_delivery);

      const copyAddress = await this.page.getByRole('link', { 
      name: AccountLocators.copy_address
      });
      await copyAddress.scrollIntoViewIfNeeded();
      await copyAddress.click();

      const save_button = await this.page.getByRole('button', { name: AccountLocators.saveButton });
      await save_button.scrollIntoViewIfNeeded();
      await save_button.click();

      await expect(this.page.getByRole('alert'))
      .toContainText(success_msg);

      Logger.pass('Account created successfully');
  }

  async searchServiceDeliveryAddress(serviceDelivery: string): Promise<void> {
    Logger.step(`Search service delivery address: ${serviceDelivery}`);
    const addressField = this.page.getByRole('combobox', {
      name: AccountLocators.Search_Service_address,
    });
    await addressField.scrollIntoViewIfNeeded();
    await addressField.fill(serviceDelivery);
    await addressField.press('ArrowDown');
    await addressField.press('Enter');
    Logger.pass('Service delivery address selected');
  }

  async selectAccountsListView(viewName: string): Promise<void> {
    Logger.step(`Select accounts list view: ${viewName}`);
    const listViewDropdown = this.page.locator(AccountLocators.listViewDropdown).first();
    await this.waitForVisible(listViewDropdown, 30000);
    await listViewDropdown.click({ force: true });

    await this.page.waitForSelector('[role="listbox"]', { timeout: 30000 });
    const listViewOption = this.page
      .locator(AccountLocators.listViewOption)
      .filter({ hasText: viewName })
      .first();
    await this.waitForVisible(listViewOption, 20000);
    await listViewOption.scrollIntoViewIfNeeded().catch(() => {});
    await listViewOption.click({ force: true });
    Logger.pass(`Accounts list view selected: ${viewName}`);
  }
   private buildEmailWithRunNumber(email: string): string {
      const runNumber = PropertyReader.getRunNumber(1);
      const parts = email.split('@');
      if (parts.length !== 2) {
        return email;
      }
      return `${parts[0]}${runNumber}@${parts[1]}`;
    }

    getEmailWithRunNumber(email: string): string {
    return this.buildEmailWithRunNumber(email);
  }

  async verifyEmailValue(expectedEmail: string): Promise<void> {
      Logger.step('Verify Account email in details page');
      await this.scrollToTop();
      const detailsTab = this.page.locator(AccountLocators.detailsTab).first();
      if (await detailsTab.isVisible().catch(() => false)) {
        await this.click(detailsTab);
      }
  
      const expected = expectedEmail.toLowerCase();
      const pageText = (await this.page.locator(AccountLocators.body).innerText()).toLowerCase();
      expect(pageText).toContain(expected);
  
      const emailMatch = pageText.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/);
      expect(emailMatch).not.toBeNull();
      const actual = (emailMatch ? emailMatch[0] : '').trim();
      expect(actual).not.toBe('');
      Logger.pass(`Account email verified: ${expectedEmail}`);
    }

    async verifyAgeValueFromYear(birthYear: number): Promise<void> {
        Logger.step('Verify Account age using Age field and birth year');
    
        try {
        await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
        await this.page.waitForTimeout(500);
    
        const launchVerifyLink = this.page.locator(AccountLocators.launchAddressVerifyLink).first();
        await launchVerifyLink.scrollIntoViewIfNeeded();
        await launchVerifyLink.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        const launchLinkVisible = await launchVerifyLink.isVisible().catch(() => false);
        } catch {
          Logger.info('Page might have reloaded, proceeding with age verification');
        }
    
        const ageValue = this.page.locator(AccountLocators.ageValue).last();
        await expect(ageValue).toBeVisible({ timeout: 5000 });
    
        const ageText = ((await ageValue.textContent()) || '').trim();
        Logger.info(`Age: ${ageText}`);
    
        const actualAge = Number(ageText);
        const currentYear = new Date().getFullYear();
        const expectedAge = currentYear - birthYear;
    
        expect(Number.isNaN(actualAge)).toBeFalsy();
        expect(actualAge).toBe(expectedAge);
        Logger.pass(`Account age verified. Expected: ${expectedAge}, Actual: ${actualAge}`);
      }
        

      async updateAddressFromLaunchVerify(searchAddress: string): Promise<boolean> {
          Logger.step(`Update address from Launch Address / Verify: ${searchAddress}`);
          if (this.page.isClosed()) {
            Logger.info('Page is already closed, skipping Launch Address / Verify update');
            return false;
          }

          try {
            await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
            await this.page.waitForTimeout(500);

            const launchVerifyLink = this.page.locator(AccountLocators.launchAddressVerifyLink).first();
            await launchVerifyLink.scrollIntoViewIfNeeded();
            await launchVerifyLink.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
            const launchLinkVisible = await launchVerifyLink.isVisible().catch(() => false);
            if (!launchLinkVisible) {
              Logger.info('Launch Address / Verify link is not visible on this record, skipping update');
              return false;
            }

            await launchVerifyLink.click();

            const addressToSearch = searchAddress?.trim() || '46 Epworth';

              // STEP 1: scroll to top
              await this.page.evaluate(() => window.scrollTo(0, 0));
              await this.page.waitForTimeout(1000);


              // STEP 2: locate correct input (based on label text)
              const searchInput = this.page
                .locator('text=Search Service Delivery Address Here')
                .locator('xpath=following::input[1]');

              await searchInput.waitFor({ state: 'visible', timeout: 30000 });
              await searchInput.click();


              // STEP 3: type (important for SF)
              await searchInput.type(addressToSearch, { delay: 100 });


              // STEP 4: wait for dropdown option with same text
              const option = this.page.getByRole('option', {
                name: new RegExp(addressToSearch, 'i')
              });

              await option.waitFor({ state: 'visible', timeout: 10000 });


              // STEP 5: click exact option
              await option.click();


              // STEP 6: wait for value to reflect in input
              await this.page.waitForTimeout(2000);

              // STEP 6: copy buttons
              const copyToHome = this.page.getByText('Copy to Home Address', { exact: true });
              const copyToBilling = this.page.getByText('Copy to Billing Address', { exact: true });
              const copyToPostal = this.page.getByText('Copy to Postal Address', { exact: true });

              await copyToHome.waitFor({ state: 'visible' });
              await copyToHome.click();

              await copyToBilling.waitFor({ state: 'visible' });
              await copyToBilling.click();

              await copyToPostal.waitFor({ state: 'visible' });
              await copyToPostal.click();

              Logger.info('Clicked all Copy buttons');

              Logger.info('Waiting for address to be updated after clicking Copy buttons');

                        
            const buttons = this.page.locator('button:has-text("Verify & Save")');

            let target;

            const count = await buttons.count();

            for (let i = 0; i < count; i++) {
              const btn = buttons.nth(i);
              const box = await btn.boundingBox();

              if (box && box.y > 0) {
                target = btn;
              }
            }

            if (!target) {
              target = buttons.last();
            }

            await target.scrollIntoViewIfNeeded();

            await this.page.waitForTimeout(1000);

            await target.waitFor({ state: 'visible' });

            await target.click({ force: true });
            await this.page.waitForTimeout(3000);

            Logger.pass('Address Updated and saved');

            
          }
           catch (error) {
            Logger.error(`Error during address update: ${(error as Error).message}`);
           }
          }

        async verifyAddressValue(expectedAddressText: string): Promise<void> {
            Logger.step('Verify Account address in details page');
            const addressLocator = this.page.locator(AccountLocators.addressValue).first();
            await this.scrollToBottom();
            await this.scrollIntoView(addressLocator);
            const addressText = (await addressLocator.innerText()).replace(/\s+/g, ' ').trim().toLowerCase();
            const normalizedExpected = expectedAddressText.replace(/\s+/g, ' ').trim().toLowerCase();
            expect(addressText).toContain(normalizedExpected);
            Logger.pass(`Account address contains: ${expectedAddressText}`);
          }

  async searchAndOpenAccountByEmail(email: string): Promise<void> {
    Logger.step(`Search and open account by email: ${email}`);
    const searchInput = this.page.locator(AccountLocators.listSearchInput).first();
    await this.waitForVisible(searchInput, 30000);
    await searchInput.fill(email);
    await searchInput.press('Enter');
    await this.staticWait(3000);

    const matchedRow = this.page.locator(AccountLocators.tableRows).filter({ hasText: email }).first();
    await this.waitForVisible(matchedRow, 30000);

    const accountLink = matchedRow.locator(AccountLocators.rowLink).first();
    await this.click(accountLink);

    await this.page.waitForTimeout(5000);
    Logger.pass(`Opened account record using email: ${email}`);
  }

  async createClientForm(): Promise<void> {
    Logger.step("Create Client form from account record");
    const moreTabs = await this.page.locator('button[title="More Tabs"]:visible');
    await expect(moreTabs).toBeVisible({ timeout: 10000 });
    await moreTabs.click();
    Logger.pass('Clicked More Tabs button');

    const carePlanOption = this.page.getByRole('menuitem', { name: 'Client Forms' }).first();
    await expect(carePlanOption).toBeVisible({ timeout: 10000 });
    await carePlanOption.click();
    Logger.pass('Selected Client Forms from More Tabs');

    const categoryDropdown = this.page.locator(AccountLocators.SelectClientFormCategory).first();
    await expect(categoryDropdown).toBeVisible({ timeout: 10000 });
    await categoryDropdown.click();
    
    const clientFormOption = this.page.getByRole('option', { name: 'Support at Home' }).first();
    await expect(clientFormOption).toBeVisible({ timeout: 10000 });
    await clientFormOption.click();

    await this.scrollToBottom();

    await this.page
    .locator('lightning-button[data-object="HACC_Linkage_Service_Request_Form__c"] button')
    .filter({ hasText: /Start|Resume/ })
    .click();

   const ReferralTo = await this.page.getByRole('button', {
      name: /Referral To/i
    });
    await ReferralTo.waitFor({ state: 'visible', timeout: 10000 });
    await ReferralTo.click();

    Logger.pass('Expanded Referral To option to start filling form');

    const ContactName = this.page.getByRole('textbox', {
      name: 'Contact Name'
    });

    await ContactName.clear();

    await ContactName.fill('John Doe');
    await expect(ContactName).toBeVisible({ timeout: 10000 });
    await ContactName.clear();
    await ContactName.fill('John Doe');
    await expect(ContactName).toHaveValue('John Doe');
    Logger.pass('Filled Contact Name field in client form');

    const referredTo = await this.page.getByRole('textbox', {
      name: 'Referred To'
    });
    await expect(referredTo).toBeVisible({ timeout: 10000 });
    await referredTo.clear();
    await referredTo.fill('Test Referral');
    await expect(referredTo).toHaveValue('Test Referral');
    Logger.pass('Filled Referred To field in client form');

    const email = await this.page.getByRole('textbox', {
      name: 'Email'
    });
    await email.waitFor({ state: 'visible', timeout: 10000 });
    await email.fill('john.doe@example.com');
    await expect(email).toHaveValue('john.doe@example.com');
    Logger.pass('Filled Email field in client form');

    const referredFrom = await this.page.getByRole('textbox', {
      name: 'Referred From'
    });
    await expect(referredFrom).toBeVisible({ timeout: 10000 });
    await referredFrom.clear();
    await referredFrom.fill('Test Referral Source');
    await expect(referredFrom).toHaveValue('Test Referral Source');
    Logger.pass('Filled Referred From field in client form');

    const ReferrerPhone = await this.page.getByRole('textbox', {
      name: 'Referrer Phone No'
    });
    await expect(ReferrerPhone).toBeVisible({ timeout: 10000 });
    await ReferrerPhone.clear();
    await ReferrerPhone.fill('123-456-7890');
    await expect(ReferrerPhone).toHaveValue('123-456-7890');
    Logger.pass('Filled Referrer Phone No field in client form');

    const AccountsForwardedTo = this.page
    .locator('text=Accounts forwarded to')
    .locator('xpath=following::input[1]');

    await AccountsForwardedTo.waitFor({ state: 'visible' });
    AccountsForwardedTo.scrollIntoViewIfNeeded();
    AccountsForwardedTo.clear();
    await AccountsForwardedTo.fill('Demo Account');
    await expect(AccountsForwardedTo).toHaveValue('Demo Account');
    Logger.pass('Filled Accounts Forwarded To field in client form');

    const ReferralToButton = await this.page.getByRole('button', {
      name: /Referral To/i
    });
    await ReferralToButton.waitFor({ state: 'visible', timeout: 10000 });
    await ReferralToButton.scrollIntoViewIfNeeded();
    await ReferralToButton.click();
    Logger.pass('Closed Referral To option to start filling form');

    //--------------------------

    const ClientDetails = await this.page.getByRole('button', {
      name: /Client Details/i
    });
    await ClientDetails.waitFor({ state: 'visible', timeout: 10000 });
    await ClientDetails.click();
    Logger.pass('Expanded Client Details option to fill more fields in form');

    const ClientName = await this.page.getByLabel('Client Name').first();
    await expect(ClientName).toBeVisible({ timeout: 10000 });
    await ClientName.scrollIntoViewIfNeeded();
    await expect(ClientName).toHaveValue(/John Doe/);
    Logger.pass('Verified Client Name field in client form');

    const DateOfBirth = await this.page.getByLabel('Date of Birth').first();
    await expect(DateOfBirth).toBeVisible({ timeout: 10000 });
    await DateOfBirth.scrollIntoViewIfNeeded();
    await expect(DateOfBirth).not.toHaveValue('');
    Logger.pass('Verified Date of Birth field in client form not empty');

    const Address = await this.page.getByLabel('Address').first();
    await expect(Address).toBeVisible({ timeout: 10000 });
    await Address.scrollIntoViewIfNeeded();
    await expect(Address).not.toBeEmpty();
    await expect(Address).toHaveValue(/46 Epworth/);
    Logger.pass('Verified Address field in client form not empty and contains expected text');

    const MainLanguage = await this.page.getByLabel('Main Language').first();
    await expect(MainLanguage).toBeVisible({ timeout: 10000 });
    await MainLanguage.scrollIntoViewIfNeeded();
    await MainLanguage.clear();
    await MainLanguage.fill('English');
    await expect(MainLanguage).toHaveValue('English');
    Logger.pass('Filled Main Language field in client form');

    const LivingArrangements = await this.page.getByLabel('Living Arrangements').first();
    await expect(LivingArrangements).toBeVisible({ timeout: 10000 });
    await LivingArrangements.scrollIntoViewIfNeeded();
    await LivingArrangements.clear();
    await LivingArrangements.fill('Living with family');
    await expect(LivingArrangements).toHaveValue('Living with family');
    Logger.pass('Filled Living Arrangements field in client form');

    const WhotoContactRegardingCare = this.page
    .locator('text=Who to Contact Regarding Care')
    .locator('xpath=following::input[1]');

    await WhotoContactRegardingCare.waitFor({ state: 'visible' });
    WhotoContactRegardingCare.scrollIntoViewIfNeeded();
    WhotoContactRegardingCare.clear();
    await WhotoContactRegardingCare.fill('Jane Doe');
    await expect(WhotoContactRegardingCare).toHaveValue('Jane Doe');
    Logger.pass('Filled Who to contact regarding care field in client form');

    const ClosedClientDetails = await this.page.getByRole('button', {
      name: /Client Details/i
    });
    await ClosedClientDetails.waitFor({ state: 'visible', timeout: 10000 });
    await ClosedClientDetails.scrollIntoViewIfNeeded();
    await ClosedClientDetails.click();
    Logger.pass('Closed Client Details option to fill more fields in form');

    //--------------------------------------------------

    const MedicalHealth = await this.page.getByRole('button', {
      name: /Medical and Health/i
    });
    await MedicalHealth.waitFor({ state: 'visible', timeout: 10000 });
    await MedicalHealth.scrollIntoViewIfNeeded();
    await MedicalHealth.click();
    Logger.pass('Expanded Medical and Health option to fill more fields in form');

    const medicalInfo = this.page
    .locator('text=Medical and Health Information')
    .locator('xpath=following::textarea[1]');
    await medicalInfo.waitFor({ state: 'visible', timeout: 10000 });
    await medicalInfo.scrollIntoViewIfNeeded();
    await medicalInfo.clear();

    await medicalInfo.fill('Patient has diabetes and requires regular monitoring');
    await expect(medicalInfo).toHaveValue('Patient has diabetes and requires regular monitoring');
    Logger.pass('Filled Medical and Health Information field in client form');

    const mobilityInfo = this.page
    .locator('text=Mobility Aids and Manual Handling')
    .locator('xpath=following::textarea[1]');
    await mobilityInfo.waitFor({ state: 'visible', timeout: 10000 });
    await mobilityInfo.scrollIntoViewIfNeeded();
    await mobilityInfo.clear();

    await mobilityInfo.fill('Uses wheelchair and requires assistance for transfer');
    await expect(mobilityInfo).toHaveValue('Uses wheelchair and requires assistance for transfer');
    Logger.pass('Filled Mobility Aids and Manual Handling field in client form');

     const ClosedMedicalHealth = await this.page.getByRole('button', {
      name: /Medical and Health/i
    });
    await ClosedMedicalHealth.waitFor({ state: 'visible', timeout: 10000 });
    await ClosedMedicalHealth.scrollIntoViewIfNeeded();
    await ClosedMedicalHealth.click();
    Logger.pass('Closed Medical and Health option after filling form');

    const HealthSafety = await this.page.getByRole('button', {
      name: /Health and Safety/i
    });
    await HealthSafety.waitFor({ state: 'visible', timeout: 10000 });
    await HealthSafety.scrollIntoViewIfNeeded();
    await HealthSafety.click();
    Logger.pass('Expanded Health and Safety option to fill more fields in form');

    const ohsDropdown = this.page.getByRole('combobox', {
      name: /OHS Assessment Conducted/i
    });
    await ohsDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await ohsDropdown.scrollIntoViewIfNeeded();

    await ohsDropdown.click();

    await this.page.locator('[role="option"]', { hasText: 'Yes' }).click();

    await expect(ohsDropdown).toHaveValue('Yes');
    Logger.pass('Selected Yes for OHS Assessment Conducted field in client form');

    const hazards = this.page
      .locator('text=Hazards Identified and Actions Taken')
      .locator('xpath=following::textarea[1]');

      await hazards.waitFor({ state: 'visible', timeout: 10000 });
      await hazards.scrollIntoViewIfNeeded();
      await hazards.clear();

      await hazards.fill('Hazards identified and mitigated properly');
      await expect(hazards).toHaveValue('Hazards identified and mitigated properly');
      Logger.pass('Filled Hazards Identified and Actions Taken field in client form');

      const keySafe = await this.page
      .locator('text=Key Safe in Use?')
      .locator('xpath=following::label[.//text()="Yes"][1]')
      await keySafe.waitFor({ state: 'visible', timeout: 10000 });
      await keySafe.scrollIntoViewIfNeeded();
      await keySafe.click();

      const PersonalAlarm = await this.page
      .locator('text=Personal Alarm in Use?')
      .locator('xpath=following::label[.//text()="Yes"][1]');

      await PersonalAlarm.waitFor({ state: 'visible', timeout: 10000 });
      await PersonalAlarm.scrollIntoViewIfNeeded();
      await PersonalAlarm.click();

      const CloseHealthSafety = await this.page.getByRole('button', {
      name: /Health and Safety/i
        });
      await CloseHealthSafety.waitFor({ state: 'visible', timeout: 10000 });
      await CloseHealthSafety.scrollIntoViewIfNeeded();
      await CloseHealthSafety.click();
      Logger.pass('Closed Health and Safety option to fill more fields in form');


      const CompleteFormButton = this.page.getByRole('button', { name: 'Complete' }).first();
      await CompleteFormButton.waitFor({ state: 'visible', timeout: 10000 });
      await CompleteFormButton.scrollIntoViewIfNeeded();
      await CompleteFormButton.click();
      Logger.pass('Clicked Complete Form button in client form');

      await this.page.waitForTimeout(10000);

      await expect(
        this.page.getByText(/Update Successful/i)
      ).toBeVisible({ timeout: 15000 });

      Logger.pass('Client form completed successfully with Update Successful message');

      await this.page.waitForTimeout(10000);
      Logger.pass("Client form created successfully from account record");
  }

   async createCarePlan(): Promise<void> {
    Logger.step('Create Care Plan from Planner page');
    const moreTabs = await this.page.locator('button[title="More Tabs"]:visible');
    await expect(moreTabs).toBeVisible({ timeout: 10000 });
    await moreTabs.click();
    Logger.pass('Clicked More Tabs button');

    const carePlanOption = this.page.getByRole('menuitem', { name: 'Care Plan' }).first();
    await expect(carePlanOption).toBeVisible({ timeout: 10000 });
    await carePlanOption.click();
    await this.page.waitForTimeout(5000);
    Logger.pass('Selected Care Plan from More Tabs');

    const newCarePlanButton = this.page.getByRole('button', { name: 'New Care Plan' }).last();
    await expect(newCarePlanButton).toBeVisible({ timeout: 10000 });
    await newCarePlanButton.click();
    await this.page.waitForTimeout(5000);
    Logger.pass('Clicked New Care Plan button');

    const StoryDescriptionField = this.page.locator(AccountLocators.StoryDescription).first();
    await expect(StoryDescriptionField).toBeVisible({ timeout: 10000 });
    await StoryDescriptionField.fill('Need medication reminders and daily check-ins');
    Logger.pass('Filled Story Description field');

    const Goals = this.page.locator(AccountLocators.Goals).first();
    await expect(Goals).toBeVisible({ timeout: 10000 });
    await Goals.fill('Improve medication adherence and overall health');
    Logger.pass('Filled Goals field');

    const addrowButton = this.page.getByRole('button', { name: 'Add Row' }).nth(1);
    await addrowButton.scrollIntoViewIfNeeded();
    Logger.pass('Clicked Add Row button to add Problem/Need');

    const currentSituation = this.page.locator(AccountLocators.currentSituation).first();
    await expect(currentSituation).toBeVisible({ timeout: 10000 });
    await currentSituation.fill('Patient often forgets to take medications on time');
    Logger.pass('Filled Current Situation field');

    const needstobeDone = this.page.locator(AccountLocators.needstobeDone).first();
    await expect(needstobeDone).toBeVisible({ timeout: 10000 });
    await needstobeDone.fill('Set up medication reminders and daily check-ins');
    Logger.pass('Filled Needs to be Done field');

    const whom = this.page.locator(AccountLocators.whom).first();
    await expect(whom).toBeVisible({ timeout: 10000 });
    await whom.fill('Direct Care Resource QA');
    Logger.pass('Filled By Whom field');

    const byWhen = this.page.locator(AccountLocators.byWhen).first();
    await expect(byWhen).toBeVisible({ timeout: 10000 });
    await byWhen.fill('2026-12-31');
    Logger.pass('Filled By When field');


    const progress = this.page.locator(AccountLocators.progress).first();
    await expect(progress).toBeVisible({ timeout: 10000 });
    await progress.fill('Not Started');
    Logger.pass('Filled Progress field');

    await this.scrollToBottom();

    const checkboxLabel = this.page.locator('label').filter({ hasText: 'Respite Care' }).first();   
    await checkboxLabel.click();
    await expect(this.page.getByRole('checkbox', { name: 'Respite Care' }).first()).toBeChecked();
    await this.page.waitForTimeout(5000);
    Logger.pass('Checked Respite Care checkbox');

    const selectdropdown = this.page.locator(AccountLocators.selectDropdown).first();
    await expect(selectdropdown).toBeVisible({ timeout: 10000 });
    await selectdropdown.click();
    const option = this.page.getByRole('option', { name: 'Respite Care Duties' });
    await option.waitFor({ state: 'visible' });
    await option.click();
    Logger.pass('Selected Respite Care Duties from dropdown');

    await this.page.waitForTimeout(5000);

    const secondselectdropdown = this.page.locator(AccountLocators.selectDropdown).first();
    await expect(secondselectdropdown).toBeVisible({ timeout: 10000 });
    await secondselectdropdown.click();

    const childcheckboxLabel = this.page.locator('label').filter({ hasText: 'Getting in or out of bed' }).first();
    await expect(childcheckboxLabel).toBeVisible({ timeout: 40000 });  
    await childcheckboxLabel.click();
    await expect(this.page.getByRole('checkbox', { name: 'Getting in or out of bed' }).first()).toBeChecked();
    Logger.pass('Checked Child checkbox Getting in or out of bed checkbox');


    const taskField = this.page.locator(AccountLocators.task).first();
    await taskField.evaluate((node) => node.scrollIntoView({ block: 'center' }));
    await taskField.fill('Arrange for respite care services');
    Logger.pass('Filled Task field');

    await this.scrollToBottom();

    const planProvided = this.page.locator(AccountLocators.planprovided).first();
    await planProvided.fill('Caregiver will arrange for respite care by end of month');
    Logger.pass('Filled Plan Provided field');

    const saveButton = this.page.getByRole('button', { name: 'Save' }).first();
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await saveButton.click();
    await this.page.waitForTimeout(10000);
    
    Logger.pass('Created Care Plan from Planner page');
  }

  async editAccountFields(): Promise<void> {
    Logger.step("Update account fields and verify updates");

    Logger.info("Clicking Edit button to update account");
    
    const editBtn = this.page.locator('.slds-page-header')
  .getByRole('button', { name: 'Edit' });

    await editBtn.waitFor({ state: 'visible', timeout: 30000 });
    await editBtn.click();

    Logger.pass("Opened account record for update");
  }

  async updateBasicInformationAccountDetails(label: string | RegExp, value: string) {
    Logger.step(`Update Basic Information section - ${label}: ${value}`);
      
      const field = this.page.getByRole('combobox', { name: label, exact: true }).first();

        await field.waitFor({ state: 'visible', timeout: 90000 });
        await field.scrollIntoViewIfNeeded();
        await field.click();

        let option = this.page.locator('lightning-base-combobox-item')
          .filter({ hasText: value })
          .first();

        if (!(await option.isVisible().catch(() => false))) {
          option = this.page.locator('[role="listbox"]')
            .getByText(value, { exact: false })
            .first();
        }

        await option.waitFor({ state: 'visible', timeout: 60000 });
        await option.scrollIntoViewIfNeeded();
        await option.click({timeout: 10000});
        await expect(option).toContainText(value, { timeout: 10000 });

      Logger.pass(`Updated Basic Information - ${label}: ${value}`);
}

async selectPrimaryLanguage(value: string) {
  Logger.step(`Select Primary Language: ${value} from dropdown`);
  
  const modal = this.page.locator('[role="dialog"]');

  const field = modal.getByRole('combobox', { name: /Primary Language/i }).last();

  await field.waitFor({ state: 'visible', timeout: 60000 });

  await field.evaluate(el => el.scrollIntoView({ block: 'center' }));

  await field.click({ force: true });

  const dropdown = this.page.locator('[role="listbox"]').filter({ has: this.page.locator(':visible') }).first();

  await dropdown.waitFor({ state: 'visible', timeout: 10000 });

  const option = dropdown.locator('lightning-base-combobox-item')
    .filter({ hasText: value })
    .first();

  await option.evaluate(el => el.scrollIntoView({ block: 'nearest' }));

  await option.click();

  await expect(field).toContainText(value);
    await this.page.waitForTimeout(5000);

  Logger.pass(`Selected Primary Language: ${value}`);
}

async selectGender(value: string) {
  Logger.step(`Select Gender: ${value} from dropdown`);
  
  const modal = this.page.locator('[role="dialog"]');

  const field = modal.getByRole('combobox', { name: /Gender/i }).last();

  await field.waitFor({ state: 'visible', timeout: 60000 });

  await field.evaluate(el => el.scrollIntoView({ block: 'center' }));

  await field.click({ force: true });

  const dropdown = this.page.locator('[role="listbox"]').filter({ has: this.page.locator(':visible') }).first();

  await dropdown.waitFor({ state: 'visible', timeout: 10000 });

  const option = dropdown.locator('lightning-base-combobox-item')
    .filter({ hasText: value })
    .first();

  await option.evaluate(el => el.scrollIntoView({ block: 'nearest' }));

  await option.click();

  await expect(field).toContainText(value);
    await this.page.waitForTimeout(5000);

  Logger.pass(`Selected Gender: ${value}`);
}

async selectImportantInformationDetails(label: string | RegExp, value: string) {
  Logger.step(`Select ${label}: ${value} from dropdown in bottom section`);

  const field = this.page
    .locator(`button[role="combobox"][aria-label="${label}"]`)
    .first();

  await field.waitFor({ state: 'visible', timeout: 60000 });

  await field.evaluate(el => el.scrollIntoView({ block: 'center' }));

  await field.click({ force: true });

  await this.page.keyboard.type(value, { delay: 50 });

  await this.page.waitForTimeout(500);

  await this.page.keyboard.press('Enter');
  await expect(field).toContainText(value, { timeout: 10000 });
  await this.page.waitForTimeout(5000);

  Logger.pass(`Selected ${label}: ${value} from dropdown in bottom section`);

  
}

async updateTextField(label: string | RegExp, value: string) {
  Logger.step(`Update text field: ${label} with value: ${value}`);

  const field = this.page.getByLabel(label);
  await field.waitFor({ state: 'visible' });
  await field.scrollIntoViewIfNeeded();
  await field.fill(value);

  Logger.pass(`Updated text field: ${label} with value: ${value}`);
}

async selectLivingArrangement(value: string) {
  Logger.step(`Select Living Arrangement: ${value}`);

  const field = this.page.getByRole('combobox', {
    name: 'Living Arrangements',
    exact: true
  }).first();

  await field.waitFor({ state: 'visible', timeout: 30000 });
  await field.scrollIntoViewIfNeeded();

  await field.locator('span').click({ force: true });

  await this.page.waitForTimeout(500);

  const option = this.page.locator('text=' + value).filter({ hasText: value }).first();

  await option.waitFor({ state: 'visible', timeout: 10000 });
  await option.scrollIntoViewIfNeeded();
  await option.click();
  await this.page.waitForTimeout(5000);
  Logger.pass(`Selected Living Arrangement: ${value}`);
}

async saveAccountDetails(): Promise<void> {
    Logger.step('Save Account details');
    const saveButton = this.page.getByRole('button', { name: 'Save' }).first();
    await this.waitForVisible(saveButton, 30000);
    await saveButton.scrollIntoViewIfNeeded();
    await saveButton.click();
    
    Logger.pass('Account details saved');
  }
}
