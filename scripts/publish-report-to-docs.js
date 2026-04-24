const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(projectRoot, 'playwright-report');
const docsDir = path.join(projectRoot, 'docs');
const reportsDir = path.join(docsDir, 'reports');

function getTimestampFolderName() {
  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join('-') + '-' + [
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDirectory(source, target) {
  ensureDirectory(target);

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function clearDirectoryExcept(dirPath, keepNames = []) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (keepNames.includes(entry.name)) {
      continue;
    }

    fs.rmSync(path.join(dirPath, entry.name), { recursive: true, force: true });
  }
}

if (!fs.existsSync(sourceDir)) {
  throw new Error(`playwright-report not found at ${sourceDir}`);
}

const timestampFolder = process.env.REPORT_NAME || getTimestampFolderName();
const historicalTargetDir = path.join(reportsDir, timestampFolder);

ensureDirectory(docsDir);
clearDirectoryExcept(docsDir, ['reports']);
copyDirectory(sourceDir, docsDir);
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');

ensureDirectory(reportsDir);
fs.rmSync(historicalTargetDir, { recursive: true, force: true });
copyDirectory(sourceDir, historicalTargetDir);
fs.writeFileSync(path.join(historicalTargetDir, '.nojekyll'), '');

console.log(`Published latest Playwright report to ${docsDir}`);
console.log(`Published timestamped Playwright report to ${historicalTargetDir}`);
