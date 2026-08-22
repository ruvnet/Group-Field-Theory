// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { ReceiptLog, canonical } from '@metaharness/harness';
import { buildCorpus, assertPrimitiveSchema } from '../src/domain/corpus.js';
import { deriveObservables, GraphEngine, projectionDistance, relationalOrder, seededProjection } from '../src/domain/graph.js';
import { assertReleaseGate, runBenchmark } from '../src/domain/runner.js';

describe('Group Field Theory invariants', () => {
  it('keeps primitive state free of coordinates and global time', () => {
    for (const graph of buildCorpus()) expect(() => assertPrimitiveSchema(graph)).not.toThrow();
    const leaked = structuredClone(buildCorpus()[0]) as unknown as Record<string, unknown>;
    leaked.x = 1;
    expect(() => assertPrimitiveSchema(leaked as never)).toThrow(/Forbidden primitive field/);
  });

  it('preserves all relational observables under arbitrary projections', () => {
    for (const graph of buildCorpus()) {
      const baseline = deriveObservables(graph, new GraphEngine(graph, 'indexed'));
      for (let seed = 1; seed <= 10; seed += 1) {
        seededProjection(graph.nodes, seed);
        const candidate = deriveObservables(graph, new GraphEngine(graph, 'indexed'));
        expect(canonical(candidate)).toBe(canonical(baseline));
      }
    }
  });

  it('kills the coordinate distance substitution fault', () => {
    for (const graph of buildCorpus()) {
      const first = projectionDistance(seededProjection(graph.nodes, 1), graph.probes[0]);
      const second = projectionDistance(seededProjection(graph.nodes, 2), graph.probes[0]);
      expect(second).not.toBe(first);
    }
  });

  it('rejects cycles in relational event order', () => {
    const graph = structuredClone(buildCorpus()[0]);
    graph.events[0].before = ['compare'];
    expect(() => relationalOrder(graph)).toThrow(/cycle/);
  });

  it('passes the release benchmark gate at 100 percent', async () => {
    const report = await runBenchmark('indexed', 10);
    expect(() => assertReleaseGate(report)).not.toThrow();
    expect(report.invariantPassRate).toBe(1);
    expect(report.mutationKillRate).toBe(1);
    expect(report.anchorTruthRate).toBe(1);
  }, 30_000);
});

describe('receipt integrity', () => {
  it('detects a one byte mutation at the exact receipt', () => {
    const log = new ReceiptLog();
    log.append({ runId: 'test', step: 'one', input: { a: 1 }, output: { ok: true }, agent: 'test', model: 'deterministic', costUsd: 0, latencyMs: 0, verdict: 'pass' });
    log.append({ runId: 'test', step: 'two', input: { a: 2 }, output: { ok: true }, agent: 'test', model: 'deterministic', costUsd: 0, latencyMs: 0, verdict: 'pass' });
    const exported = log.toJSON();
    exported.receipts[1].step = 'tampered';
    expect(() => ReceiptLog.fromJSON(exported)).toThrow(/index 1/);
  });
});
