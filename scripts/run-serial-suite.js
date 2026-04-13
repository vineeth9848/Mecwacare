const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const orderedFiles = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'serial-suite-files.json'), 'utf-8'),
);

const selectedFiles = process.argv.slice(2);
const filesToRun = selectedFiles.length ? selectedFiles : orderedFiles;
const aggregateBlobDir = path.join(projectRoot, 'blob-report-sequential');
const tempBlobDir = path.join(projectRoot, 'blob-report');

function resolveSerialProject() {
  if (process.env.CI === 'true') {
    return 'ci-sequential';
  }

  const configPath = path.join(projectRoot, 'resources', 'config.properties');
  const configText = fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf-8') : '';
  const browserMatch = configText.match(/^\s*browser\s*=\s*(.+)\s*$/m);
  const rawBrowser = (process.env.BROWSER || (browserMatch ? browserMatch[1] : 'chromium')).trim().toLowerCase();

  switch (rawBrowser) {
    case 'chrome':
      return 'chrome-serial';
    case 'edge':
    case 'msedge':
      return 'edge-serial';
    case 'firefox':
      return 'firefox-serial';
    case 'webkit':
      return 'webkit-serial';
    default:
      return 'chromium-serial';
  }
}

const serialProject = resolveSerialProject();

// console.log(`Using serial project: ${serialProject}`);
// console.log(`Project root: ${projectRoot}`);
// console.log(`Files to run: ${filesToRun.join(', ')}`);

fs.rmSync(aggregateBlobDir, { recursive: true, force: true });
fs.mkdirSync(aggregateBlobDir, { recursive: true });

let hadFailure = false;

for (const [index, file] of filesToRun.entries()) {
  console.log(`\n=== Running ${file} (${index + 1}/${filesToRun.length}) ===`);
  fs.rmSync(tempBlobDir, { recursive: true, force: true });

  //console.log(`Command: npx playwright test ${file} --project=${serialProject} --workers=1 --reporter=blob`);

  const result = spawnSync(
    
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['playwright', 'test', file, `--project=${serialProject}`, '--workers=1', '--reporter=blob'],
    {
      cwd: projectRoot,
      stdio: 'inherit',
      env: { ...process.env },
      shell: true,
    },
  );

  // console.log(`Exit code for ${file}: ${result.status}`);
  // console.log(`Signal for ${file}: ${result.signal}`);
  // console.log(`Error for ${file}:`, result.error);

  const blobFiles = fs.existsSync(tempBlobDir)
    ? fs.readdirSync(tempBlobDir).filter(name => name.endsWith('.zip'))
    : [];

  for (const blobFile of blobFiles) {
    const source = path.join(tempBlobDir, blobFile);
    const target = path.join(
      aggregateBlobDir,
      `${String(index + 1).padStart(2, '0')}-${path.basename(file, '.spec.ts')}-${blobFile}`,
    );
    fs.copyFileSync(source, target);
  }

  if (result.status !== 0) {
    hadFailure = true;
  }
}

console.log('\n=== Merging ordered HTML report ===');
const merge = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['playwright', 'merge-reports', '--reporter=html', aggregateBlobDir],
  {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env },
  },
);

if (merge.status !== 0) {
  process.exit(merge.status || 1);
}

process.exit(hadFailure ? 1 : 0);
