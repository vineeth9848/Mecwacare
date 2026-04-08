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

fs.rmSync(aggregateBlobDir, { recursive: true, force: true });
fs.mkdirSync(aggregateBlobDir, { recursive: true });

let hadFailure = false;

for (const [index, file] of filesToRun.entries()) {
  console.log(`\n=== Running ${file} (${index + 1}/${filesToRun.length}) ===`);
  fs.rmSync(tempBlobDir, { recursive: true, force: true });

  const result = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['playwright', 'test', file, '--project=chrome-serial', '--workers=1', '--reporter=blob'],
    {
      cwd: projectRoot,
      stdio: 'inherit',
      env: { ...process.env },
    },
  );

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
