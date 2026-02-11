import fs from 'fs';
import path from 'path';

export class TestDataHelper {
  static readJsonFile<T = unknown>(fileName: string): T {
    const filePath = path.join(process.cwd(), 'resources', 'testdata', fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Test data file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  }
}
