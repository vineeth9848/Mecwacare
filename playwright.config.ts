import { defineConfig } from '@playwright/test';
import PropertyReader from './src/utils/PropertyReader';

const rawBrowser = (PropertyReader.getProperty('browser') || 'chromium').toLowerCase();

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
  testDir: './tests',
  timeout: 60000,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
  ],
  use: {
    baseURL: PropertyReader.getBaseUrl(),
    headless: false,
    screenshot: 'on',
    video: 'on',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: rawBrowser,
      use: {
        browserName,
        ...(channel ? { channel } : {}),
      },
    },
  ],
});
