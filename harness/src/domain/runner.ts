// SPDX-License-Identifier: MIT
import { performance } from 'node:perf_hooks';
import {
  ReceiptLog,
  VerifierRegistry,
  canonical,
  predicateVerifier,
} from '@metaharness/harness';
import { assertPrimitiveSchema, buildCorpus } from './corpus.js';
import { deriveObservables, GraphEngine, projectionDistance, seededProjection } from './graph.js';
import type { BenchmarkReport, CaseRun, EngineMode, RelationalObservables, WorkCounters } from './types.js';

function equalObservables(left: RelationalObservables, right: RelationalObservables): boolean {
  return canonical(left) === canonical(right);
}

function percentile(values: number[], quantile: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * quantile))];
}

function sumWork(total: WorkCounters, work: WorkCounters): void {
  total.neighborQueries += work.neighborQueries;
  total.edgeInspections += work.edgeInspections;
  total.usefulNeighborHits += work.usefulNeighborHits;
}

export async function runBenchmark(mode: EngineMode, projectionSeeds = 40): Promise<BenchmarkReport> {
  const results: CaseRun[] = [];
  for (const graph of buildCorpus()) {
    assertPrimitiveSchema(graph);
    const baselineEngine = new GraphEngine(graph, mode);
    const baseline = deriveObservables(graph, baselineEngine);
    const hasFrozenTruth = graph.expected.diameter > 0;
    const truthPassed = !hasFrozenTruth || (
      baseline.components === graph.expected.components &&
      baseline.diameter === graph.expected.diameter &&
      canonical(baseline.distances) === canonical(graph.expected.distances) &&
      canonical(baseline.relationalOrder) === canonical(graph.expected.relationalOrder)
    );
    const verifier = new VerifierRegistry().register(
      predicateVerifier('projection-invariance', 'regression', (output) => equalObservables(output as RelationalObservables, baseline), 'relational observables changed with screen coordinates'),
    );
    const receiptLog = new ReceiptLog();
    const work: WorkCounters = { neighborQueries: 0, edgeInspections: 0, usefulNeighborHits: 0 };
    sumWork(work, baselineEngine.counters);
    const latencies: number[] = [];
    let passed = 0;
    let mutationKills = 0;
    const baselineProjection = seededProjection(graph.nodes, 0);
    const baselinePixelDistance = projectionDistance(baselineProjection, graph.probes[0]);
    for (let seed = 1; seed <= projectionSeeds; seed += 1) {
      const projection = seededProjection(graph.nodes, seed);
      const started = performance.now();
      const engine = new GraphEngine(graph, mode);
      const observables = deriveObservables(graph, engine);
      const latencyMs = performance.now() - started;
      latencies.push(latencyMs);
      sumWork(work, engine.counters);
      const verdict = await verifier.run(observables);
      if (verdict.pass) passed += 1;
      const pixelDistance = projectionDistance(projection, graph.probes[0]);
      const coordinateSubstitutionMutant: RelationalObservables = {
        ...observables,
        distances: [pixelDistance, ...observables.distances.slice(1)],
      };
      const mutantVerdict = await verifier.run(coordinateSubstitutionMutant);
      if (pixelDistance !== baselinePixelDistance && !mutantVerdict.pass) mutationKills += 1;
      receiptLog.append({
        runId: `${graph.id}:${mode}`,
        step: `projection:${seed}`,
        input: { graph: graph.id, seed, relationFingerprint: baseline.relationFingerprint },
        output: observables,
        agent: 'gft-invariant-verifier',
        model: 'deterministic',
        costUsd: 0,
        latencyMs: 0,
        verdict: verdict.pass ? 'pass' : 'fail',
      });
    }
    const receiptVerdict = receiptLog.verify();
    const entries = receiptLog.entries();
    results.push({
      caseId: graph.id,
      trials: projectionSeeds,
      passed,
      mutationKills,
      anchorTruthPassed: truthPassed,
      work,
      latencyMs: latencies,
      receiptChainVerified: receiptVerdict.ok,
      receiptHead: entries.at(-1)?.thisHash ?? '',
    });
  }
  const trials = results.reduce((sum, row) => sum + row.trials, 0);
  const passes = results.reduce((sum, row) => sum + row.passed, 0);
  const kills = results.reduce((sum, row) => sum + row.mutationKills, 0);
  const allLatencies = results.flatMap((row) => row.latencyMs);
  const work = results.reduce<WorkCounters>((total, row) => {
    sumWork(total, row.work);
    return total;
  }, { neighborQueries: 0, edgeInspections: 0, usefulNeighborHits: 0 });
  return {
    schema: 1,
    corpus: 'gft-projection-invariance-v1',
    engine: mode,
    projectionSeeds,
    invariantPassRate: passes / trials,
    mutationKillRate: kills / trials,
    anchorTruthRate: results.filter((row) => row.anchorTruthPassed).length / results.length,
    receiptChainVerified: results.every((row) => row.receiptChainVerified),
    p50LatencyMs: percentile(allLatencies, 0.5),
    p95LatencyMs: percentile(allLatencies, 0.95),
    edgeInspectionsPerPass: work.edgeInspections / Math.max(1, passes),
    redundantWorkRate: Math.max(0, (work.edgeInspections - work.usefulNeighborHits) / Math.max(1, work.edgeInspections)),
    cases: results,
    generatedAt: new Date().toISOString(),
  };
}

export function assertReleaseGate(report: BenchmarkReport): void {
  const failures: string[] = [];
  if (report.invariantPassRate !== 1) failures.push(`invariantPassRate=${report.invariantPassRate}`);
  if (report.mutationKillRate !== 1) failures.push(`mutationKillRate=${report.mutationKillRate}`);
  if (report.anchorTruthRate !== 1) failures.push(`anchorTruthRate=${report.anchorTruthRate}`);
  if (!report.receiptChainVerified) failures.push('receiptChainVerified=false');
  if (failures.length) throw new Error(`Benchmark release gate failed: ${failures.join(', ')}`);
}

export function reportForStorage(report: BenchmarkReport): BenchmarkReport {
  return {
    ...report,
    p50LatencyMs: Math.round(report.p50LatencyMs * 1000) / 1000,
    p95LatencyMs: Math.round(report.p95LatencyMs * 1000) / 1000,
    generatedAt: report.generatedAt,
  };
}
