import { defineConfig } from '@playwright/test';
import PropertyReader from './src/utils/PropertyReader';
import { serialTests, parallelTests } from './test-groups';

const rawBrowser = (PropertyReader.getProperty('browser') || 'chromium').toLowerCase();
const baseURL = process.env.BASE_URL || process.env.SF_LOGIN_URL || PropertyReader.getBaseUrl();
const isCI = process.env.CI === 'true';
const headless = (process.env.HEADLESS || '').toLowerCase() === 'true' ? true : false;
const traceMode = process.env.PW_TRACE_MODE || 'on-first-retry';

let browserName: 'chromium' | 'firefox' | 'webkit' = 'chromium';
let channel: 'chrome' | 'msedge' | undefined;
let projectName: 'chromium' | 'firefox' | 'webkit' | 'chrome' | 'edge' = 'chromium';

switch (rawBrowser) {
  case 'firefox':
  case 'webkit':
    browserName = rawBrowser;
    projectName = rawBrowser;
    break;
  case 'chrome':
    browserName = 'chromium';
    channel = 'chrome';
    projectName = 'chrome';
    break;
  case 'edge':
  case 'msedge':
    browserName = 'chromium';
    channel = 'msedge';
    projectName = 'edge';
    break;
  default:
    browserName = 'chromium';
    projectName = 'chromium';
}

export default defineConfig({
  globalSetup: undefined,
  testDir: './tests',
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  retries: 2,
  workers: 1,
  fullyParallel: false,
  outputDir: 'test-results',
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
  ],
  use: {
    baseURL,
    storageState: undefined,
    headless,
    screenshot: 'on',
    video: 'on',
    trace: traceMode as 'off' | 'on' | 'retain-on-failure' | 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*login\.setup\.ts/,
      workers: 1,
      fullyParallel: false,
      use: {
        browserName,
        ...(channel ? { channel } : {}),
        storageState: undefined,
      },
    },
    {
      name: `${projectName}-serial`,
      testMatch: serialTests,
      testIgnore: /.*login\.setup\.ts/,
      workers: 1,
      fullyParallel: false,
      use: {
        browserName,
        ...(channel ? { channel } : {}),
      },
    },
    ...(isCI
      ? [
          {
            name: 'ci-sequential',
            testIgnore: /.*login\.setup\.ts/,
            workers: 1,
            fullyParallel: false,
            use: {
              browserName,
              ...(channel ? { channel } : {}),
            },
          },
        ]
      : []),
    {
      name: `${projectName}-parallel`,
      testMatch: parallelTests,
      testIgnore: /.*login\.setup\.ts/,
      fullyParallel: true,
      use: {
        browserName,
        ...(channel ? { channel } : {}),
      },
    },
  ],
});
