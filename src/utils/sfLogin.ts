import { promises as fs } from 'fs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { Page } from '@playwright/test';

type SalesforceTokenResponse = {
  access_token: string;
  instance_url: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

async function getSalesforceToken(): Promise<SalesforceTokenResponse> {
  const consumerKey = requireEnv('SF_CONSUMER_KEY');
  const username = requireEnv('SF_USERNAME');
  const loginUrl = requireEnv('SF_LOGIN_URL').replace(/\/$/, '');
  const privateKeyPath = requireEnv('SF_PRIVATE_KEY_PATH');

  const privateKey = await fs.readFile(privateKeyPath, 'utf8');
  const assertion = jwt.sign(
    {
      iss: consumerKey,
      sub: username,
      aud: loginUrl,
      exp: Math.floor(Date.now() / 1000) + 5 * 60,
    },
    privateKey,
    { algorithm: 'RS256' },
  );

  const formData = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });

  const response = await axios.post<SalesforceTokenResponse>(
    `${loginUrl}/services/oauth2/token`,
    formData.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  return response.data;
}

export async function loginToSalesforce(page: Page): Promise<void> {
  const { access_token, instance_url } = await getSalesforceToken();
  const frontdoorUrl = `${instance_url}/secur/frontdoor.jsp?sid=${encodeURIComponent(access_token)}`;

  await page.goto(frontdoorUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForURL(/(lightning\.force\.com|\/one\/one\.app)/, { timeout: 60000 });
}

export async function logoutFromSalesforce(page: Page): Promise<void> {
  const profileMenu = page.locator("//span[text()='View profile']").first();
  await profileMenu.click();

  const logout = page.locator("//a[text()='Log out']").first();
  await logout.click();

  await page.waitForURL(/(login\.salesforce\.com|test\.salesforce\.com|\/secur\/login_portal)/, {
    timeout: 60000,
  });
}
