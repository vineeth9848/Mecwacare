import fs from 'fs';
import path from 'path';

class PropertyReader {
  private properties: Record<string, string> = {};

  constructor() {
    const baseDir = process.cwd();
    const commonConfigPath = path.join(baseDir, 'resources', 'config.properties');
    this.loadFromFile(commonConfigPath);

    const envName = (process.env.TEST_ENV || process.env.ENV || '').trim().toLowerCase();
    if (envName) {
      const envConfigPath = path.join(baseDir, 'resources', 'configfiles', `${envName}.properties`);
      this.loadFromFile(envConfigPath);
    }

    if (!this.properties.baseurl) {
      this.properties.baseurl = 'https://www.login.salesforce.com';
    }
  }

  private loadFromFile(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();

      if (key) {
        this.properties[key] = value;
      }
    }
  }

  getProperty(key: string): string {
    return this.properties[key] || '';
  }

  getBaseUrl(): string {
    return this.getProperty('baseurl') || 'https://www.login.salesforce.com';
  }

  getRunNumber(defaultValue = 1): number {
    const value = Number(this.getProperty('runNumber'));
    return Number.isNaN(value) ? defaultValue : value;
  }
}

export default new PropertyReader();
