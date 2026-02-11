import { test, expect } from '../../src/fixtures/testFixtures';
import { TestDataHelper } from '../../src/utils/TestDataHelper';
import { Logger } from '../../src/utils/Logger';

test('lead convert data is available', async () => {
  const { leadConvert } = TestDataHelper.readJsonFile<{ leadConvert: Array<Record<string, string>> }>('leads.json');
  const lead = leadConvert[0];

  Logger.info(`Lead Convert Data: ${JSON.stringify(lead)}`);
  expect(lead).toBeTruthy();
});
