const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const nodeCmd = process.platform === 'win32' ? 'node.exe' : 'node';
const reportDir = path.join(root, 'playwright-report');

function runScript(scriptPath) {
  return spawnSync(nodeCmd, [scriptPath], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env },
  });
}

// 1) Run suite (can pass or fail)
const suite = runScript('scripts/run-serial-suite.js');

// 2) Always publish report, even if tests failed
if (fs.existsSync(reportDir)) {
  const publish = runScript('scripts/publish-report-to-docs.js');
  if (publish.status !== 0) {
    process.exit(publish.status || 1);
  }
} else {
  console.log(`Skipping publish: playwright-report not found at ${reportDir}`);
}

// 3) Keep suite result as final exit code
process.exit(suite.status || 0);
