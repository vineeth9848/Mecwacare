const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(projectRoot, 'playwright-report');
const targetDir = path.join(projectRoot, 'docs');

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

if (!fs.existsSync(sourceDir)) {
  throw new Error(`playwright-report not found at ${sourceDir}`);
}

fs.rmSync(targetDir, { recursive: true, force: true });
ensureDirectory(targetDir);
copyDirectory(sourceDir, targetDir);
fs.writeFileSync(path.join(targetDir, '.nojekyll'), '');

console.log(`Published local Playwright report to ${targetDir}`);
