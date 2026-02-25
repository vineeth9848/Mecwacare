import { defineConfig } from '@playwright/test';
import PropertyReader from './src/utils/PropertyReader';

const rawBrowser = (PropertyReader.getProperty('browser') || 'chromium').toLowerCase();

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
  globalSetup: './global-setup.ts',
  testDir: './tests',
  timeout: 60000,
  retries: 0,
  maxFailures: 1,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
  ],
  use: {
    baseURL: PropertyReader.getBaseUrl(),
    storageState: 'auth.json',
    headless: false,
    screenshot: 'on',
    video: 'on',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: projectName,
      use: {
        browserName,
        ...(channel ? { channel } : {}),
      },
    },
  ],
});
