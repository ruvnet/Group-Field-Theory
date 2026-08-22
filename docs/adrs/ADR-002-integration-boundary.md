# ADR 002: Protect the coordinate free research kernel

Status: Accepted

Date: 2026-08-21

## Context

The research kernel starts from identities, internal states, relations, and relational events. It forbids spatial coordinates and a universal clock. WorldGraph and RuField offer useful graph, provenance, and policy capabilities, but both were designed for sensed physical environments. WorldGraph is geospatially grounded in East, North, Up coordinates. RuField events carry Unix timestamps, sensor placement, spatial cells, and modality specific tensors.

Using either schema as the primitive Group Field Theory state would quietly insert the spacetime structure the project is meant to derive. Similar vocabulary such as graph, field, event, and provenance does not imply semantic equivalence.

## Decision

Keep the existing coordinate free primitive schema as the only research truth. Integrations must use one way adapters after an observable has been derived.

The permitted flow is:

```text
coordinate free primitive state
  -> deterministic relational observables
  -> evidence receipt
  -> optional WorldGraph projection or RuField envelope
  -> renderer and research interface
```

The reverse flow is prohibited. WorldGraph coordinates, RuField timestamps, sensor locations, and renderer positions cannot influence primitive state, relation fingerprints, invariant oracles, or promotion decisions.

WorldGraph and RuField remain optional sidecars. A missing sidecar must not change a benchmark result.

## Interface contract

Every adapter input must include `model_version`, `primitive_schema`, `relation_fingerprint`, `projection_seed`, `source_commit`, `evidence_class`, and the derived observable payload. Every output must preserve those values or fail closed.

Integration code must be isolated under an adapter boundary. It may serialize or visualize a derived result, but it may not expose coordinate or wall clock fields to the kernel module.

## Security and scientific boundaries

External schemas are untrusted inputs. Adapters must validate schema versions, bound collection sizes, reject nonfinite numeric values, and reject unknown evidence classes. Network access is outside the deterministic scoring path.

An integration receipt proves lineage and integrity. It does not prove that a computational model describes nature.

## Rejected alternatives

Replacing the primitive graph with WorldGraph was rejected because its closed node model describes rooms, zones, sensors, people, and geospatial bounds.

Replacing relational events with RuField `FieldEvent` was rejected because that record requires a Unix timestamp and physical sensor semantics.

A shared generic graph abstraction was deferred because it would either weaken the useful invariants of all three projects or introduce a large compatibility surface before a measured use case exists.

## Consequences

The project can reuse downstream capabilities without contaminating the experiment oracle. The cost is duplicate adapter code and explicit mapping tests. This is preferable to an elegant but scientifically invalid shared model.

## Acceptance criteria

1. The kernel compiles and passes all tests without WorldGraph or RuField installed.
2. Randomizing every adapter coordinate and timestamp leaves all primitive fingerprints and derived observables unchanged.
3. Removing either sidecar leaves MetaHarness verdicts and receipt hashes unchanged.
4. A static contract test rejects `x`, `y`, `z`, East, North, Up, Unix time, and renderer coordinates in primitive state.

## Evidence

The decision was evaluated against WorldGraph commit [`360ef48`](https://github.com/ruvnet/worldgraph/tree/360ef48a2536d45033cdbe0c40c0f522b8f75ae7) and RuField commit [`43b1df3`](https://github.com/ruvnet/rufield/tree/43b1df3dc3c436a21e3fc85dc34475458a1eca9d).

