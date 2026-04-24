import { test } from '../../src/fixtures/testFixtures';
import { Logger } from '../../src/utils/Logger';
import { Page } from '@playwright/test';
import PropertyReader from '../../src/utils/PropertyReader';

test.describe('Salesforce Password Update - Batch Users 4-500', () => {
  const BASE_EMAIL = 'msouser';
  const DOMAIN = '@mecwacare.org.au.nft';
  const CURRENT_PASSWORD = 'Nft@2026_Test!';
  const NEW_PASSWORD = 'Ptexecution1';
  const SECURITY_ANSWER = 'hyderabad';
  const LOGIN_URL = PropertyReader.getBaseUrl();

  async function updatePasswordForUser(page: Page, userNumber: number): Promise<void> {
    const username = `${BASE_EMAIL}${userNumber}${DOMAIN}`;
    
    Logger.info(`\n========== Updating password for user ${userNumber}/${500} ==========`);
    Logger.step(`Username: ${username}`);

    try {
      // Navigate to login page
      await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
      Logger.step('Navigated to login page');

      // Fill username (same locator as global-setup.ts)
      await page.locator('#username').fill(username);
      Logger.step('Entered username');

      // Fill password (same locator as global-setup.ts)
      await page.locator('#password').fill(CURRENT_PASSWORD);
      Logger.step('Entered password');

      // Click login button (same locator as global-setup.ts)
      await page.locator('#Login').click();
      Logger.step('Clicked login button');

      // Wait for login to complete (same pattern as global-setup.ts)
      const isLoggedIn = await page
        .waitForURL(/(lightning\.force\.com|\/one\/one\.app)/, { timeout: 120000 })
        .then(() => true)
        .catch(() => false);

      if (!isLoggedIn) {
        Logger.warn(`User ${username} login timed out or did not reach expected page`);
        return;
      }

      Logger.step('Login successful - waiting for page load');

      // Verify page title/heading to confirm we're on change password page
    //   const changePasswordHeading = page.locator('text=Change Your Password');
    //   const headingVisible = await changePasswordHeading.isVisible({ timeout: 15000 }).catch(() => false);

    //   if (!headingVisible) {
    //     Logger.warn(`User ${username} - "Change Your Password" heading not found`);
    //   } else {
    //     Logger.step('Verified: Change Your Password page heading is visible');
    //   }

      // Check if we're on password change page
      const currentPasswordField = page.locator('input[name="currentpassword"]').first();
      const isPasswordChangePage = await currentPasswordField.isVisible({ timeout: 15000 }).catch(() => false);

      if (isPasswordChangePage) {
        Logger.step('On password change page - filling fields');

        // Wait for page to be fully loaded
        await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
        await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
        
        // Extra wait for page stability
        await page.waitForTimeout(2000);
        Logger.step('Waited 2 seconds for page stability');

        // Fill current password
        try {
          const currentPasswordField = page.locator('input[name="currentpassword"]');
          const currentPasswordCount = await currentPasswordField.count();
          Logger.step(`Found ${currentPasswordCount} current password field(s)`);
          
          await currentPasswordField.scrollIntoViewIfNeeded();
          await currentPasswordField.waitFor({ state: 'visible', timeout: 20000 });
          await page.waitForTimeout(1000);
          await currentPasswordField.fill(CURRENT_PASSWORD);
          Logger.step('Entered current password');
        } catch (error) {
          Logger.error(`Error filling current password: ${error}`);
          throw error;
        }

        await page.waitForTimeout(1000);

        // Fill new password
        try {
          const newPasswordField = page.locator('input[name="newpassword"]');
          const newPasswordCount = await newPasswordField.count();
          Logger.step(`Found ${newPasswordCount} new password field(s)`);
          
          await newPasswordField.scrollIntoViewIfNeeded();
          await newPasswordField.waitFor({ state: 'visible', timeout: 20000 });
          await page.waitForTimeout(1000);
          await newPasswordField.fill(NEW_PASSWORD);
          Logger.step('Entered new password');
        } catch (error) {
          Logger.error(`Error filling new password: ${error}`);
          throw error;
        }

        await page.waitForTimeout(1000);

        // Fill confirm password
        try {
          const confirmPasswordField = page.locator('input[name="confirmpassword"]');
          const confirmPasswordCount = await confirmPasswordField.count();
          Logger.step(`Found ${confirmPasswordCount} confirm password field(s)`);
          
          await confirmPasswordField.scrollIntoViewIfNeeded();
          await confirmPasswordField.waitFor({ state: 'visible', timeout: 20000 });
          await page.waitForTimeout(1000);
          await confirmPasswordField.fill(NEW_PASSWORD);
          Logger.step('Entered confirm password');
        } catch (error) {
          Logger.error(`Error filling confirm password: ${error}`);
          throw error;
        }

        await page.waitForTimeout(1000);

        // Fill security answer
        try {
          const answerField = page.locator('input[name="answer"]');
          const answerCount = await answerField.count();
          Logger.step(`Found ${answerCount} answer field(s)`);
          
          await answerField.scrollIntoViewIfNeeded();
          await answerField.waitFor({ state: 'visible', timeout: 20000 });
          await page.waitForTimeout(1000);
          await answerField.fill(SECURITY_ANSWER);
          Logger.step('Entered security answer');
        } catch (error) {
          Logger.error(`Error filling security answer: ${error}`);
          throw error;
        }

        // Wait before clicking save
        await page.waitForTimeout(2000);
        Logger.step('Waited 2 seconds before clicking save button');

        // Click change password button
        try {
          const changePasswordButton = page.locator('button[name="save"]');
          const saveButtonCount = await changePasswordButton.count();
          Logger.step(`Found ${saveButtonCount} save button(s)`);
          
          await changePasswordButton.scrollIntoViewIfNeeded();
          await changePasswordButton.waitFor({ state: 'visible', timeout: 20000 });
          await page.waitForTimeout(500);
          await changePasswordButton.click();
          Logger.step('Clicked change password button');
        } catch (error) {
          Logger.error(`Error clicking save button: ${error}`);
          throw error;
        }

        // Wait for password change to complete
        await page.waitForTimeout(3000);
        Logger.step('Waited 3 seconds for password change to process');
        await page.waitForLoadState('load', { timeout: 120000 });
        Logger.step('Password change completed');

        // Refresh page
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
        Logger.step('Page refreshed');
        await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
        await page.waitForTimeout(3000);
        Logger.step('Waited 3 seconds after page refresh');

        // Find and click logout button
        // Try multiple logout button selectors
        let logoutClicked = false;

        // Attempt 1: Direct logout button with target="_self"
        try {
          const logoutButton = page.locator('a[target="_self"]');
          const logoutCount = await logoutButton.count();
          Logger.step(`Found ${logoutCount} logout button(s)`);
          
          if (await logoutButton.isVisible({ timeout: 10000 }).catch(() => false)) {
            await logoutButton.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            await logoutButton.waitFor({ state: 'visible', timeout: 20000 });
            await page.waitForTimeout(500);
            await logoutButton.click();
            Logger.step('Clicked logout button');
            logoutClicked = true;
            await page.waitForTimeout(2000);
            Logger.step('Waited 2 seconds after logout click');
          }
        } catch (e) {
          Logger.warn(`Attempt 1 (direct logout) failed: ${e}`);
        }

        // Attempt 2: User profile menu
        if (!logoutClicked) {
          try {
            const userMenu = page.locator('button[aria-label*="User"], button[aria-label*="Profile"]').first();
            if (await userMenu.isVisible({ timeout: 10000 }).catch(() => false)) {
              await userMenu.scrollIntoViewIfNeeded();
              await page.waitForTimeout(500);
              await userMenu.click();
              Logger.step('Opened user menu');
              await page.waitForTimeout(1000);
              const logoutOption = page.locator('a[target="_self"]').first();
              if (await logoutOption.isVisible({ timeout: 20000 }).catch(() => false)) {
                await logoutOption.scrollIntoViewIfNeeded();
                await page.waitForTimeout(500);
                await logoutOption.click();
                Logger.step('Clicked logout from menu');
                logoutClicked = true;
                await page.waitForTimeout(2000);
                Logger.step('Waited 2 seconds after logout from menu');
              }
            }
          } catch (e) {
            Logger.warn(`Attempt 2 (menu logout) failed: ${e}`);
          }
        }

        // Attempt 3: Navigate to logout URL directly
        if (!logoutClicked) {
          try {
            await page.goto(`${LOGIN_URL.split('?')[0].replace(/\/lightning.*/, '')}/secur/logout.jsp`, { 
              waitUntil: 'domcontentloaded', 
              timeout: 60000 
            }).catch(() => {});
            Logger.step('Navigated to logout URL');
            await page.waitForTimeout(2000);
            Logger.step('Waited 2 seconds after logout URL navigation');
            logoutClicked = true;
          } catch (e) {
            Logger.warn(`Attempt 3 (logout URL) failed: ${e}`);
          }
        }

        if (!logoutClicked) {
          Logger.warn('Logout may not have completed successfully, but password change was successful');
        }

        await page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => {});
        await page.waitForTimeout(1000);
        Logger.step('Final wait and page stability check completed');

        Logger.pass(`Successfully updated password for user ${userNumber}`);
      } else {
        Logger.warn(`User ${username} did not show password change page - may already have updated password`);
        
        // Try to logout anyway
        try {
          const logoutButton = page.locator('a[target="_self"]');
          if (await logoutButton.isVisible({ timeout: 10000 }).catch(() => false)) {
            await logoutButton.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            await logoutButton.click();
            Logger.step('Clicked logout button (from no password change page)');
            await page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => {});
            await page.waitForTimeout(2000);
            Logger.step('Waited 2 seconds after logout');
          }
        } catch (e) {
          Logger.warn(`Could not logout after skipping password change: ${e}`);
        }
      }
    } catch (error) {
      Logger.error(`Failed to update password for user ${userNumber}: ${error}`);
      throw error;
    }
  }

  test('Update password for users 4 to 500', async ({ browser }) => {
    Logger.info('Starting batch password update process');
    
    const START_USER = 8;
    const END_USER = 8;
    let successCount = 0;
    let failureCount = 0;
    const failedUsers: number[] = [];

    for (let userNumber = START_USER; userNumber <= END_USER; userNumber++) {
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        await updatePasswordForUser(page, userNumber);
        successCount++;
      } catch (error) {
        Logger.error(`Error updating user ${userNumber}: ${error}`);
        failureCount++;
        failedUsers.push(userNumber);
      } finally {
        await context.close();
      }

      // Progress update every 50 users
      if (userNumber % 50 === 0) {
        Logger.info(`Progress: Completed ${userNumber - START_USER + 1}/${END_USER - START_USER + 1} users. Success: ${successCount}, Failed: ${failureCount}`);
      }
    }

    // Final summary
    Logger.info('\n========== Password Update Summary ==========');
    Logger.info(`Total Users: ${END_USER - START_USER + 1}`);
    Logger.pass(`Successful: ${successCount}`);
    Logger.error(`Failed: ${failureCount}`);

    if (failedUsers.length > 0) {
      Logger.warn(`Failed user numbers: ${failedUsers.join(', ')}`);
    }

    Logger.info('Password update batch process completed');
  });
});
