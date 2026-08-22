# ADR 001: Evidence governed MetaHarness benchmark

Status: Accepted

Date: 2026-08-21

## Context

The interactive experience argues that geometry like observables can emerge from relations that contain no screen coordinates or universal clock. A visual demonstration is not sufficient evidence. The repository needs a deterministic harness that can reject coordinate leakage, reproduce results, expose optimization evidence, and preserve the distinction between a model result and an empirical claim about nature.

## Decision

Use a generated MetaHarness research scaffold with the Codex host adapter and recoverable sessions. Keep the physics semantics local and deterministic.

The benchmark uses six graph families and forty projection seeds per family, producing 240 invariant comparisons per full run. The primitive state contains nodes, internal states, links, and relational events. Projection coordinates are generated separately and are never accepted by the observable functions.

The benchmark derives graph distance, component count, diameter, mean degree, spectral dimension, relational event order, and a canonical relation fingerprint. Every projection must preserve every derived observable exactly. A deliberately faulty pixel distance metric must change, proving that the suite can detect the coordinate substitution failure it is designed to prevent.

MetaHarness provides three governance boundaries:

1. `@metaharness/harness` supplies independent verifiers and hash chained receipts.
2. `@metaharness/flywheel` supplies the frozen conjunctive promotion rule and gate fingerprint.
3. `@metaharness/darwin` remains an optional bounded proposer. It cannot change benchmark oracles, the anchor suite, or promotion conditions.

## Optimization decision

Compare two exact graph policies. The baseline scans the entire edge list on every neighbor query. The candidate builds a sorted adjacency index once and reuses it. Promotion requires equal correctness, a lower redundant work rate, no higher deterministic work per pass, no safety regression, and no frozen anchor regression.

Wall clock latency is reported but does not decide promotion because shared CI timing is noisy. Deterministic edge inspections are the cost signal.

## Security boundaries

The benchmark scoring path performs no model calls, network requests, shell execution, file writes, or dynamic code loading. Output files are written only by explicit commands. Receipt latency is fixed at zero so replay artifacts remain deterministic. Runtime timing is reported outside the receipt decision surface.

## Rejected alternatives

An animation screenshot test cannot detect hidden coordinate dependence. A language model judge is nondeterministic and could confuse persuasiveness with correctness. Optimizing against wall clock time alone is too noisy for a release gate. Allowing Darwin to mutate the oracle would make the benchmark self certifying.

## Acceptance criteria

The release gate requires 100 percent projection invariance, 100 percent coordinate fault detection, 100 percent frozen truth checks, and valid receipt chains. The indexed policy must reduce deterministic edge inspections without losing any acceptance condition.

## Residual risk

The largest uncertainty is synthetic suite overfitting. The mitigation is a frozen anchor using graph families and seeds outside the mutation surface. A future empirical physics claim still requires distinctive predictions and observational evidence. This harness proves only a computational construction and its invariants.
