// SPDX-License-Identifier: MIT
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { assertReleaseGate, reportForStorage, runBenchmark } from './domain/runner.js';

const args = new Set(process.argv.slice(2));
const report = reportForStorage(await runBenchmark('indexed', 40));
if (args.has('--strict')) assertReleaseGate(report);
if (args.has('--write')) {
  const here = dirname(fileURLToPath(import.meta.url));
  const output = resolve(here, '../bench/results/latest.json');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${output}`);
}
console.log(JSON.stringify(report, null, 2));
