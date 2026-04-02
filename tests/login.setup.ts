import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';
import globalSetup from '../global-setup';

test.describe.configure({ mode: 'serial' });

test('generate auth storage state', async () => {
  await globalSetup();
  expect(existsSync('auth.json')).toBeTruthy();
});
