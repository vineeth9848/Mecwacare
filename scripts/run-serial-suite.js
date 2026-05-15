const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const suitePath = path.join(__dirname, 'serial-suite-files.json');
const blobRoot = path.join(root, 'blob-report-temp');
const mergedBlobDir = path.join(root, 'blob-report-sequential');

const runCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

// Read test order/grouping from serial-suite-files.json
function readSuite() {
  return JSON.parse(fs.readFileSync(suitePath, 'utf-8'));
}

function normalizeSingle(entry) {
  if (typeof entry === 'string') {
    return { file: entry, mode: 'serial', workers: 1 };
  }
  return {
    file: entry.file,
    mode: entry.mode || 'serial',
    workers: Number(entry.workers || 1),
  };
}

function normalizeStep(step) {
  if (step && Array.isArray(step.parallel)) {
    return { kind: 'parallel', entries: step.parallel.map(normalizeSingle) };
  }
  return { kind: 'single', entry: normalizeSingle(step) };
}

// Decide which Playwright serial project to use from config.properties/browser env
function resolveSerialProject() {
  if (process.env.CI === 'true') return 'ci-sequential';

  const configFile = path.join(root, 'resources', 'config.properties');
  const text = fs.existsSync(configFile) ? fs.readFileSync(configFile, 'utf-8') : '';
  const match = text.match(/^\s*browser\s*=\s*(.+)\s*$/m);
  const browser = (process.env.BROWSER || (match ? match[1] : 'chromium')).trim().toLowerCase();

  if (browser === 'chrome') return 'chrome-serial';
  if (browser === 'edge' || browser === 'msedge') return 'edge-serial';
  if (browser === 'firefox') return 'firefox-serial';
  if (browser === 'webkit') return 'webkit-serial';
  return 'chromium-serial';
}

function resolveProject(serialProject, mode) {
  if (mode !== 'parallel') return serialProject;
  if (serialProject === 'ci-sequential') return serialProject;
  return serialProject.replace(/-serial$/, '-parallel');
}

function runPlaywrightTest(file, project, workers, blobDir) {
  return new Promise(resolve => {
    const child = spawn(
      runCmd,
      ['playwright', 'test', file, `--project=${project}`, `--workers=${workers}`, '--reporter=blob'],
      {
        cwd: root,
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, PLAYWRIGHT_BLOB_OUTPUT_DIR: blobDir },
      },
    );

    child.on('close', code => resolve(code === 0 ? 0 : 1));
    child.on('error', () => resolve(1));
  });
}

function copyBlob(stepNo, file, fromDir) {
  if (!fs.existsSync(fromDir)) return;
  const zips = fs.readdirSync(fromDir).filter(name => name.endsWith('.zip'));
  for (const zip of zips) {
    const source = path.join(fromDir, zip);
    const target = path.join(
      mergedBlobDir,
      `${String(stepNo).padStart(2, '0')}-${path.basename(file, '.spec.ts')}-${zip}`,
    );
    fs.copyFileSync(source, target);
  }
}

async function runEntry(stepNo, idxInGroup, totalInGroup, entry, serialProject) {
  const project = resolveProject(serialProject, entry.mode);
  const workers = Number.isInteger(entry.workers) && entry.workers > 0 ? entry.workers : 1;
  const blobDir = path.join(blobRoot, `${stepNo}-${idxInGroup}`);

  fs.rmSync(blobDir, { recursive: true, force: true });
  fs.mkdirSync(blobDir, { recursive: true });

  const header =
    totalInGroup > 1
      ? `Starting ${entry.file} [project=${project}, workers=${workers}]`
      : `\n=== Running ${entry.file} (${stepNo}) [project=${project}, workers=${workers}] ===`;
  console.log(header);

  const status = await runPlaywrightTest(entry.file, project, workers, blobDir);
  copyBlob(stepNo, entry.file, blobDir);
  return status;
}

async function mergeReport() {
  return new Promise(resolve => {
    const child = spawn(runCmd, ['playwright', 'merge-reports', '--reporter=html', mergedBlobDir], {
      cwd: root,
      stdio: 'inherit',
      shell: true,
      env: { ...process.env },
    });
    child.on('close', code => resolve(code === 0 ? 0 : 1));
    child.on('error', () => resolve(1));
  });
}

function resetReportFolders() {
  fs.rmSync(mergedBlobDir, { recursive: true, force: true });
  fs.mkdirSync(mergedBlobDir, { recursive: true });
  fs.rmSync(blobRoot, { recursive: true, force: true });
  fs.mkdirSync(blobRoot, { recursive: true });
}

async function main() {
  const serialProject = resolveSerialProject();
  const cliFiles = process.argv.slice(2);
  const rawSteps = cliFiles.length ? cliFiles : readSuite();
  const steps = rawSteps.map(normalizeStep);

  resetReportFolders();

  let failed = false;

  for (let i = 0; i < steps.length; i += 1) {
    const stepNo = i + 1;
    const step = steps[i];

    if (step.kind === 'parallel') {
      console.log(`\n=== Running parallel group (${stepNo}/${steps.length}) ===`);
      const results = await Promise.all(
        step.entries.map((entry, idx) => runEntry(stepNo, idx + 1, step.entries.length, entry, serialProject)),
      );
      if (results.some(code => code !== 0)) failed = true;
      continue;
    }

    const code = await runEntry(stepNo, 1, 1, step.entry, serialProject);
    if (code !== 0) failed = true;
  }

  console.log('\n=== Merging ordered HTML report ===');
  const mergeCode = await mergeReport();
  if (mergeCode !== 0) process.exit(mergeCode);
  process.exit(failed ? 1 : 0);
}

main();
