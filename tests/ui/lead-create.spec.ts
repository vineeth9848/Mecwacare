import { test, expect } from '../../src/fixtures/testFixtures';
import { TestDataHelper } from '../../src/utils/TestDataHelper';
import { Logger } from '../../src/utils/Logger';
import PropertyReader from '../../src/utils/PropertyReader';

test('lead create data is available', async () => {
  const runNumber = PropertyReader.getRunNumber();
  Logger.info(`Run Number: ${runNumber}`);

  const { leadCreate } = TestDataHelper.readJsonFile<{ leadCreate: Array<Record<string, string>> }>('leads.json');
  const lead = leadCreate[0];

  Logger.info(`Lead Create Data: ${JSON.stringify(lead)}`);
  expect(lead).toBeTruthy();
});

test('use run number', async () => {
  const runNumber = PropertyReader.getRunNumber();
  Logger.info(`Run Number: ${runNumber}`);
});
