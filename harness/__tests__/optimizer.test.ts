// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { meetsPromotionRule } from '@metaharness/flywheel';
import { runBenchmark } from '../src/domain/runner.js';

describe('frozen promotion gate', () => {
  it('promotes indexed traversal only when correctness and anchor survive', async () => {
    const baseline = await runBenchmark('naive', 4);
    const candidate = await runBenchmark('indexed', 4);
    const decision = meetsPromotionRule({
      baseline: { primary: 1, noopRate: baseline.redundantWorkRate, costPerWin: baseline.edgeInspectionsPerPass, regressed: false },
      candidate: { primary: 1, noopRate: candidate.redundantWorkRate, costPerWin: candidate.edgeInspectionsPerPass, regressed: false },
      anchor: { baseline: baseline.anchorTruthRate, candidate: candidate.anchorTruthRate },
    });
    expect(decision).toEqual({ promote: true, reasons: [] });
    expect(candidate.edgeInspectionsPerPass).toBeLessThan(baseline.edgeInspectionsPerPass);
  }, 30_000);

  it('rejects a faster candidate with a safety regression', () => {
    const decision = meetsPromotionRule({
      baseline: { primary: 1, noopRate: 0.5, costPerWin: 100, regressed: false },
      candidate: { primary: 1, noopRate: 0.1, costPerWin: 10, regressed: true },
      anchor: { baseline: 1, candidate: 1 },
    });
    expect(decision.promote).toBe(false);
    expect(decision.reasons).toContain('safety_regressed');
  });
});
