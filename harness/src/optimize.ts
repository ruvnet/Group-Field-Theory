// SPDX-License-Identifier: MIT
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gateFingerprint, meetsPromotionRule } from '@metaharness/flywheel';
import { assertReleaseGate, reportForStorage, runBenchmark } from './domain/runner.js';
import type { BenchmarkReport } from './domain/types.js';

function toScore(report: BenchmarkReport) {
  return {
    primary: (report.invariantPassRate + report.mutationKillRate + report.anchorTruthRate) / 3,
    noopRate: report.redundantWorkRate,
    costPerWin: report.edgeInspectionsPerPass,
    regressed: report.invariantPassRate < 1 || report.mutationKillRate < 1 || report.anchorTruthRate < 1 || !report.receiptChainVerified,
  };
}

const baseline = reportForStorage(await runBenchmark('naive', 40));
const candidate = reportForStorage(await runBenchmark('indexed', 40));
assertReleaseGate(candidate);
const evidence = {
  baseline: toScore(baseline),
  candidate: toScore(candidate),
  anchor: { baseline: baseline.anchorTruthRate, candidate: candidate.anchorTruthRate },
};
const decision = meetsPromotionRule(evidence);
const summarize = (report: BenchmarkReport) => ({
  engine: report.engine,
  projectionSeeds: report.projectionSeeds,
  invariantPassRate: report.invariantPassRate,
  mutationKillRate: report.mutationKillRate,
  anchorTruthRate: report.anchorTruthRate,
  receiptChainVerified: report.receiptChainVerified,
  p50LatencyMs: report.p50LatencyMs,
  p95LatencyMs: report.p95LatencyMs,
  edgeInspectionsPerPass: report.edgeInspectionsPerPass,
  redundantWorkRate: report.redundantWorkRate,
});
const artifact = {
  schema: 1,
  corpus: candidate.corpus,
  baselineEngine: baseline.engine,
  candidateEngine: candidate.engine,
  evidence,
  decision,
  gateFingerprint: gateFingerprint(meetsPromotionRule),
  deterministicWorkReduction: 1 - candidate.edgeInspectionsPerPass / baseline.edgeInspectionsPerPass,
  observedP50LatencyReduction: 1 - candidate.p50LatencyMs / baseline.p50LatencyMs,
  baseline: summarize(baseline),
  candidate: summarize(candidate),
  generatedAt: new Date().toISOString(),
};
if (!decision.promote) throw new Error(`Optimization candidate rejected: ${decision.reasons.join(', ')}`);
if (process.argv.includes('--write')) {
  const here = dirname(fileURLToPath(import.meta.url));
  const output = resolve(here, '../bench/results/optimized-policy.json');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${output}`);
}
console.log(JSON.stringify(artifact, null, 2));
