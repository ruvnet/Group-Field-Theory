# group-field-theory-harness

Evidence governed research and invariant benchmark harness for emergent spacetime experiments.

> Generated with [`create-agent-harness`](https://github.com/ruvnet/agent-harness-generator) — `vertical:research` template.

## Run from this repository

```bash
npm ci
npm run validate
npm run optimize
node harness/bin/cli.js doctor
node harness/bin/cli.js benchmark
node harness/bin/cli.js optimize
```

## What it verifies

The committed benchmark starts with relational graphs that contain no spatial coordinates and no universal clock. It derives graph distance, component count, diameter, mean degree, spectral dimension, relational event order, and a canonical relation fingerprint.

Six graph families are tested across forty independent screen projections each. All 240 comparisons must preserve the relational observables. A deliberately faulty implementation substitutes pixel distance for graph distance. The verifier must reject every one of those 240 mutants.

Every trial emits a hash chained MetaHarness receipt. The release gate also checks frozen graph truths so an optimization cannot win by changing the expected answers.

## Commands

```bash
npm test
npm run benchmark
npm run optimize
npm run validate
```

`benchmark` is deterministic in its scored inputs and decisions. Wall clock latency is reported as operational evidence but does not control promotion. `optimize` compares full edge scans with a compiled adjacency index and applies the frozen `@metaharness/flywheel` promotion rule.

## Package provenance

The harness was generated with `metaharness@0.4.7` using the `vertical:research` template, Codex host, and recoverable sessions. Runtime packages are pinned exactly:

* `@metaharness/kernel@0.1.3`
* `@metaharness/host-codex@0.1.2`
* `@metaharness/harness@0.2.0`
* `@metaharness/flywheel@0.1.10`
* `@metaharness/darwin@0.9.3`

The current kernel uses its JavaScript fallback because optional native packages were not available during validation. No native performance claim is made.

## Scientific boundary

Passing this benchmark shows that this implementation can construct geometry like observables without using rendered coordinates. It does not prove that nature uses Group Field Theory or that spacetime is nonfundamental.

## License

MIT

## Recoverable sessions (ADR-246 §2.3)

This harness includes `src/sessions/log.ts` — a crash-recoverable, forkable
JSONL session log (append-only events, deterministic replay, integrity state
hash). Session state lives where you point the log (suggested:
`.harness/sessions/<id>.jsonl`); prune by deleting old files.
