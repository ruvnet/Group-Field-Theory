// SPDX-License-Identifier: MIT
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, '.harness', 'manifest.json');
const checksumPath = join(root, '.harness', 'manifest.sha256');
const excludedDirectories = new Set(['node_modules', 'dist', 'coverage', 'sessions']);
const excludedFiles = new Set(['.harness/manifest.json', '.harness/manifest.sha256']);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

async function collect(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const absolute = join(directory, entry.name);
    const rel = relative(root, absolute).replaceAll('\\', '/');
    if (entry.isDirectory()) paths.push(...await collect(absolute));
    else if (!excludedFiles.has(rel)) paths.push(rel);
  }
  return paths.sort();
}

async function fingerprints() {
  const output = {};
  for (const path of await collect(root)) output[path] = sha256(await readFile(join(root, path)));
  return output;
}

const currentBytes = await readFile(manifestPath);
const current = JSON.parse(currentBytes.toString('utf8'));
const actualFiles = await fingerprints();
const next = {
  ...current,
  generator: 'metaharness@0.4.7+reviewed-local',
  template_version: '0.4.7',
  files: actualFiles,
  meta: {
    ...current.meta,
    kernel_version: '0.1.3',
    benchmark: 'gft-projection-invariance-v1',
    attestation: 'reviewed local source and benchmark artifacts',
  },
};

if (process.argv.includes('--write')) {
  next.generated_at = new Date().toISOString();
  const body = `${JSON.stringify(next, null, 2)}\n`;
  await writeFile(manifestPath, body, 'utf8');
  await writeFile(checksumPath, `${sha256(body)}\n`, 'utf8');
  console.log(`Refreshed ${Object.keys(next.files).length} file fingerprints.`);
} else if (process.argv.includes('--check')) {
  const expectedChecksum = (await readFile(checksumPath, 'utf8')).trim();
  const mismatches = [];
  if (sha256(currentBytes) !== expectedChecksum) mismatches.push('manifest checksum');
  const currentFiles = current.files ?? {};
  for (const path of new Set([...Object.keys(currentFiles), ...Object.keys(actualFiles)])) {
    if (currentFiles[path] !== actualFiles[path]) mismatches.push(path);
  }
  if (mismatches.length) {
    console.error(`Manifest drift: ${mismatches.join(', ')}`);
    process.exitCode = 1;
  } else {
    console.log(`Manifest verified for ${Object.keys(actualFiles).length} files.`);
  }
} else {
  console.error('Use --write or --check.');
  process.exitCode = 2;
}
