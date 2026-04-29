import { defineConfig } from '@playwright/test';
import PropertyReader from './src/utils/PropertyReader';

const rawBrowser = (PropertyReader.getProperty('browser') || 'chromium').toLowerCase();
const baseURL = process.env.BASE_URL || process.env.SF_LOGIN_URL || PropertyReader.getBaseUrl();
const headless = (process.env.HEADLESS || '').toLowerCase() === 'true' ? true : false;
const traceMode = process.env.PW_TRACE_MODE || 'on-first-retry';

let browserName: 'chromium' | 'firefox' | 'webkit' = 'chromium';
let channel: 'chrome' | 'msedge' | undefined;

switch (rawBrowser) {
  case 'firefox':
  case 'webkit':
    browserName = rawBrowser;
    break;
  case 'chrome':
    browserName = 'chromium';
    channel = 'chrome';
    break;
  case 'edge':
  case 'msedge':
    browserName = 'chromium';
    channel = 'msedge';
    break;
  default:
    browserName = 'chromium';
}

export default defineConfig({
  globalSetup: undefined,
  testDir: './tests',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  retries: 1,
  workers: 1,
  fullyParallel: false,
  outputDir: 'test-results',
  reporter: [['line']],
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
      name: 'bulk-runner',
      testIgnore: /.*login\.setup\.ts/,
      workers: 1,
      fullyParallel: false,
      use: {
        browserName,
        ...(channel ? { channel } : {}),
      },
    },
  ],
});
