import { Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Logger } from '../../utils/Logger';
import { PlannerLocators } from '../locators/PlannerLocators';

export class PlannerPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickNewButton(): Promise<void> {
    Logger.step('Click New button in Planner page');
    const addBtn = this.page.locator('lightning-button-icon').filter({
      has: this.page.locator('[data-key="add"]')
    }).first();

    await addBtn.click();
    await this.page.waitForTimeout(10000); 
    Logger.pass('Clicked New button in Planner page');
  }

  async NewAppointment(username: string): Promise<void> {
    Logger.step('Fill New Appointment in Planner page');
    
    
    const participant = this.page.getByPlaceholder('Start typing to search or click the filter Icon for more options').first();
    await participant.fill(username);
    await this.page.getByRole('option').first().click();

    
    const resource = this.page.getByPlaceholder('Start typing to search or click the filter Icon for more options').nth(1);
    await resource.fill('Direct Care Resource QA');
    await this.page.getByRole('option').first().click();
    Logger.pass('Filled New Appointment in Planner page');
  }

  
}
