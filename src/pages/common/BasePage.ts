import { Page, Locator, expect } from '@playwright/test';
import PropertyReader from '../../utils/PropertyReader';
import { Logger } from '../../utils/Logger';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoBaseUrl(): Promise<void> {
    const baseUrl = PropertyReader.getBaseUrl();
    Logger.step(`Navigate to base URL: ${baseUrl}`);
    await this.safeAction(async () => {
      await this.page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    });
    await this.waitForPageReady();
    const escaped = baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(this.page).toHaveURL(new RegExp(escaped));
    Logger.pass('Base URL loaded');
  }

  async refreshPage(): Promise<void> {
    Logger.step('Refresh page');
    await this.safeAction(async () => {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
    });
    await this.waitForPageReady();
    Logger.pass('Page refreshed');
  }

  async safeAction<T>(action: () => Promise<T>): Promise<T> {
    if (this.page.isClosed()) {
      throw new Error('Page is already closed');
    }

    try {
      return await action();
    } catch (error) {
      if (this.page.isClosed()) {
        throw error;
      }

      await this.waitForPageReady().catch(() => {});
      return await action();
    }
  }

  async waitForPageReady(): Promise<void> {
    if (this.page.isClosed()) {
      throw new Error('Page is already closed');
    }

    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      Logger.info('Network did not become idle within 10s; continuing after DOM content loaded');
    });
  }

  async staticWait(milliseconds: number): Promise<void> {
    Logger.step(`Static wait for ${milliseconds} ms`);
    await this.page.waitForTimeout(milliseconds);
  }

  async verifyPageTitle(expectedTitle: string): Promise<void> {
    Logger.step(`Verify page title: ${expectedTitle}`);
    await expect(this.page).toHaveTitle(expectedTitle);
    Logger.pass('Page title verified');
  }

  async waitForVisible(target: Locator, timeout = 20000): Promise<void> {
    if (this.page.isClosed()) {
      throw new Error('Page is already closed before waiting for element visibility');
    }
    try {
      await expect(target).toBeVisible({ timeout });
    } catch (error) {
      const message = String(error);
      if (message.includes('Target page, context or browser has been closed')) {
        throw new Error('Page got closed while waiting for element visibility');
      }
      throw error;
    }
  }

  async click(target: Locator): Promise<void> {
    Logger.step('Click element');
    await this.waitForVisible(target);
    await this.safeAction(async () => {
      await target.click();
    });
    Logger.pass('Clicked element');
  }

  async fill(target: Locator, value: string): Promise<void> {
    Logger.step('Fill input field');
    await this.waitForVisible(target);
    await target.fill(value);
    Logger.pass('Input value entered');
  }

  async getInputValue(target: Locator): Promise<string> {
    Logger.step('Get input value');
    await this.waitForVisible(target);
    return target.inputValue();
  }

  async selectDropdownByValue(target: Locator, value: string): Promise<void> {
    Logger.step(`Select dropdown by value: ${value}`);
    await this.waitForVisible(target);
    await this.safeAction(async () => {
      await target.selectOption({ value });
    });
    await this.waitForPageReady();
    Logger.pass('Dropdown value selected');
  }

  async selectDropdownByLabel(target: Locator, label: string): Promise<void> {
    Logger.step(`Select dropdown by label: ${label}`);
    await this.waitForVisible(target);
    await this.safeAction(async () => {
      await target.selectOption({ label });
    });
    await this.waitForPageReady();
    Logger.pass('Dropdown label selected');
  }

  async selectDropdownByIndex(target: Locator, index: number): Promise<void> {
    Logger.step(`Select dropdown by index: ${index}`);
    await this.waitForVisible(target);
    await this.safeAction(async () => {
      await target.selectOption({ index });
    });
    await this.waitForPageReady();
    Logger.pass('Dropdown index selected');
  }

  async selectDropdown(label: string, value: string): Promise<void> {
    Logger.step(`Select dropdown ${label}: ${value}`);

    const dropdown = this.page.locator(`[role="combobox"][aria-label="${label}"]`).first();
    await dropdown.waitFor({ state: 'visible', timeout: 30000 });

    await this.safeAction(async () => {
      await dropdown.click();
    });

    const option = this.page
      .locator(`lightning-base-combobox-item[role="option"]:has-text("${value}"), [role="option"]:has-text("${value}")`)
      .first();

    try {
      await option.waitFor({ state: 'visible', timeout: 5000 });
      await this.safeAction(async () => {
        await option.click();
      });
    } catch {
      const inputValue = await dropdown.getAttribute('readonly').catch(() => null);
      if (inputValue === null) {
        await dropdown.fill(value).catch(() => {});
      }
      await this.page.keyboard.press('ArrowDown');
      await this.page.keyboard.press('Enter');
    }

    await this.waitForPageReady();
    await expect
      .poll(async () =>
        (
          (await dropdown.textContent().catch(() => '')) ||
          (await dropdown.inputValue().catch(() => '')) ||
          (await dropdown.getAttribute('data-value').catch(() => '')) ||
          ''
        ).trim(),
      )
      .toContain(value);

    Logger.pass(`Selected dropdown ${label}: ${value}`);
  }

  async getSelectedDropdownValue(target: Locator): Promise<string> {
    Logger.step('Get selected dropdown value');
    await this.waitForVisible(target);
    return target.inputValue();
  }

  async getSelectedDropdownText(target: Locator): Promise<string> {
    Logger.step('Get selected dropdown text');
    await this.waitForVisible(target);
    const option = target.locator('option:checked');
    return option.innerText();
  }

  async check(target: Locator): Promise<void> {
    Logger.step('Check checkbox');
    await this.waitForVisible(target);
    await target.check();
    Logger.pass('Checkbox checked');
  }

  async uncheck(target: Locator): Promise<void> {
    Logger.step('Uncheck checkbox');
    await this.waitForVisible(target);
    await target.uncheck();
    Logger.pass('Checkbox unchecked');
  }

  async setChecked(target: Locator, shouldBeChecked: boolean): Promise<void> {
    Logger.step(`Set checkbox to ${shouldBeChecked ? 'checked' : 'unchecked'}`);
    await this.waitForVisible(target);
    if (shouldBeChecked) {
      await target.check();
    } else {
      await target.uncheck();
    }
    Logger.pass('Checkbox state updated');
  }

  async isChecked(target: Locator): Promise<boolean> {
    Logger.step('Verify checkbox state');
    await this.waitForVisible(target);
    return target.isChecked();
  }

  async getText(target: Locator): Promise<string> {
    Logger.step('Get text from element');
    await this.waitForVisible(target);
    return target.innerText();
  }

  async isVisible(target: Locator): Promise<boolean> {
    return target.isVisible();
  }

  async scrollIntoView(target: Locator): Promise<void> {
    Logger.step('Scroll element into view');
    if (this.page.isClosed()) {
      Logger.info('Page is closed. Skipping scroll into view');
      return;
    }
    await this.waitForVisible(target, 10000);
    try {
      await target.scrollIntoViewIfNeeded();
    } catch {
      const handle = await target.elementHandle().catch(() => null);
      if (!handle) {
        throw new Error('Element not found while scrolling into view');
      }
      await handle.evaluate((el) => {
        (el as HTMLElement).scrollIntoView({ block: 'center', inline: 'nearest' });
      });
    }
    Logger.pass('Element is in view');
  }

  async scrollToTop(): Promise<void> {
    Logger.step('Scroll to top');
    await this.page.evaluate(() => window.scrollTo(0, 0));
    Logger.pass('Scrolled to top');
  }

  async scrollToBottom(): Promise<void> {
    Logger.step('Scroll to bottom');
    if (this.page.isClosed()) {
      Logger.info('Page is closed. Skipping scroll to bottom');
      return;
    }
    try {
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      Logger.pass('Scrolled to bottom');
    } catch (error) {
      const message = String(error);
      if (message.includes('Target page, context or browser has been closed')) {
        Logger.info('Page/context closed while scrolling to bottom. Skipping scroll');
        return;
      }
      throw error;
    }
  }
}
