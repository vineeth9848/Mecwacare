const { spawnSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

const suiteRun = spawnSync(process.platform === 'win32' ? 'node.exe' : 'node', ['scripts/run-serial-suite.js'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env },
});

const publishRun = spawnSync(process.platform === 'win32' ? 'node.exe' : 'node', ['scripts/publish-report-to-docs.js'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env },
});

if (publishRun.status !== 0) {
  process.exit(publishRun.status || 1);
}

process.exit(suiteRun.status || 0);
