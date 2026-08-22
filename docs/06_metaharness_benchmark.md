# MetaHarness benchmark report

Run date: 2026-08-21

## Objective

Test the repository's central computational claim: relational observables must remain unchanged when rendered coordinates are randomized. Then optimize the implementation without allowing the optimizer to redefine correctness.

## Inputs

The versioned corpus contains six connected graph families:

1. A 64 node chain
2. A 64 node cycle
3. An 8 by 8 grid
4. A 64 node star
5. Two 32 node clusters joined by one bridge
6. A seeded sparse graph with 128 nodes

Each graph is evaluated under forty deterministic projection seeds. This produces 240 projection comparisons. Frozen truths cover component count, diameter, selected shortest paths, and relational event order.

## Outputs

| Metric | Result | Release requirement |
| --- | ---: | ---: |
| Projection invariant pass rate | 240 of 240, 100 percent | 100 percent |
| Coordinate substitution mutants rejected | 240 of 240, 100 percent | 100 percent |
| Frozen graph truths passed | 6 of 6, 100 percent | 100 percent |
| Receipt chains verified | 6 of 6 | All |
| Indexed p50 latency | 1.406 ms | Report only |
| Indexed p95 latency | 10.196 ms | Report only |

Latency comes from one local run and is not a scientific or release claim. Shared runner timing is noisy.

## Optimization

The baseline scans the entire edge list for every neighbor query. The candidate builds a sorted adjacency index once.

| Measure | Baseline | Candidate | Change |
| --- | ---: | ---: | ---: |
| Edge inspections per passing trial | 3,942,586.99 | 74,322.24 | 98.1 percent lower |
| Redundant work rate | 98.1 percent | 0 percent | 98.1 points lower |
| Invariant pass rate | 100 percent | 100 percent | No regression |
| Mutation kill rate | 100 percent | 100 percent | No regression |
| Frozen truth rate | 100 percent | 100 percent | No regression |

The frozen `@metaharness/flywheel` gate promoted the indexed candidate. Its gate fingerprint is recorded in `harness/bench/results/optimized-policy.json`.

## MetaHarness scorecard

Repository scoring before domain implementation and after implementation:

| Dimension | Before | After | Change |
| --- | ---: | ---: | ---: |
| Harness fit | 39 | 60 | plus 21 |
| Compile confidence | 12 | 100 | plus 88 |
| Task coverage | 66 | 100 | plus 34 |
| Tool safety | 100 | 100 | unchanged |
| Memory usefulness | 29 | 38 | plus 9 |
| Hard constraints | 5 of 6 | 6 of 6 | complete |

The scorecard estimates cost per research run at 0.048 USD, up from 0.036 USD. This is a static estimate, not measured spend. The deterministic benchmark itself performs no model calls and reports zero model cost.

## Package versions

The following published versions were verified through npm and pinned exactly:

| Package | Version | Role |
| --- | ---: | --- |
| `metaharness` | 0.4.7 | Scaffold and repository scorecard |
| `@metaharness/kernel` | 0.1.3 | Harness kernel using JavaScript fallback |
| `@metaharness/host-codex` | 0.1.2 | Codex host adapter |
| `@metaharness/harness` | 0.2.0 | Verifiers, canonical hashing, and receipts |
| `@metaharness/flywheel` | 0.1.10 | Promotion rule and gate fingerprint |
| `@metaharness/darwin` | 0.9.3 | Optional bounded evolution |

## Security evidence

The deep Ruflo scan reported zero findings. The secret scan covered 28 files and reported no secrets. `npm audit` reported zero known vulnerabilities across 117 dependencies. CI dependencies are pinned to full commit hashes and production dependency audit failures block validation.

These results indicate no detected issue within tool coverage. They do not prove the absence of vulnerabilities. The live research prompts treat retrieved content as untrusted data, but host level URL resolution and egress controls remain mandatory before live web execution.

## Reproduce

```bash
npm ci
npm run validate
npm run optimize
npx metaharness@0.4.7 score . --json
```

## Largest uncertainty

The corpus is synthetic. A perfect score can establish implementation invariants but cannot show that the universe follows Group Field Theory. The next fix path is a frozen external anchor suite containing independently authored graph fixtures and a physics facing benchmark that tests a distinctive prediction against observational data.
