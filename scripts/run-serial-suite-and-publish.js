const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const nodeCmd = process.platform === 'win32' ? 'node.exe' : 'node';

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
const publish = runScript('scripts/publish-report-to-docs.js');
if (publish.status !== 0) {
  process.exit(publish.status || 1);
}

// 3) Keep suite result as final exit code
process.exit(suite.status || 0);
