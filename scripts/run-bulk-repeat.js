const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const suitePath = path.join(__dirname, 'bulk-repeat-suite.json');
const steps = JSON.parse(fs.readFileSync(suitePath, 'utf-8'));

const iterations = Number(process.argv[2] || '100');
const startRunNumber = Number(process.argv[3] || process.env.RUN_NUMBER || '1');

if (!Number.isInteger(iterations) || iterations <= 0) {
  throw new Error(`Invalid iteration count: ${process.argv[2] || iterations}`);
}

if (!Number.isInteger(startRunNumber) || startRunNumber <= 0) {
  throw new Error(`Invalid start run number: ${process.argv[3] || startRunNumber}`);
}

let hadFailure = false;
const failures = [];

for (let index = 0; index < iterations; index += 1) {
  const runNumber = startRunNumber + index;
  console.log(`\n==============================`);
  console.log(`Starting bulk iteration ${index + 1}/${iterations} with RUN_NUMBER=${runNumber}`);
  console.log(`==============================`);

  for (const step of steps) {
    const args = [
      'playwright',
      'test',
      step.file,
      '--config=playwright.bulk.config.ts',
      '--project=bulk-runner',
      '--workers=1',
    ];

    if (step.grep) {
      args.push('-g', step.grep);
    }

    console.log(`\nRunning ${step.file}${step.grep ? ` [${step.grep}]` : ''}`);

    const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, {
      cwd: projectRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        RUN_NUMBER: String(runNumber),
      },
    });

    if (result.status !== 0) {
      hadFailure = true;
      const failureMessage = `Failed iteration ${index + 1} with RUN_NUMBER=${runNumber} for ${step.file}${step.grep ? ` [${step.grep}]` : ''}`;
      failures.push(failureMessage);
      console.error(failureMessage);
    }
  }
}

if (failures.length > 0) {
  console.error('\nBulk repeat completed with failures:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
}

process.exit(hadFailure ? 1 : 0);
