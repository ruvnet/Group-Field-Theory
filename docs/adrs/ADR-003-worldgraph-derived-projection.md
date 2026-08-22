# ADR 003: Evaluate WorldGraph only as a derived projection

Status: Proposed

Date: 2026-08-21

## Context

WorldGraph provides a deterministic Rust graph, stable identities, typed relations, schema versioned JSON snapshots, privacy rollups, and mandatory provenance on semantic beliefs. Those are attractive for an inspectable visualization of derived relational observables.

Its present domain is an environmental digital twin. The public node schema is a closed enum for rooms, zones, walls, doorways, sensors, RF links, person tracks, object anchors, events, and semantic states. Several nodes require East, North, Up geometry or physical placement. This is not the project primitive schema.

## Decision

Run a bounded adapter spike that maps only derived experiment output into a WorldGraph semantic projection. Do not add WorldGraph as a production dependency until the spike passes the gates below.

The first use case is an audit view, not simulation. Each accepted relational observable becomes a semantic belief with evidence references to the MetaHarness receipt, model version, calibration field repurposed as adapter contract version, and an explicit `research_projection` privacy decision.

Primitive nodes and relations remain in the existing kernel. Screen layout remains renderer owned. WorldGraph geospatial nodes, the predictive occupancy model, stream server, and person tracking are out of scope.

## Mapping

| Group Field Theory artifact | WorldGraph target | Rule |
| --- | --- | --- |
| Experiment run | Event or semantic state | Derived output only |
| Observable value | Semantic state payload | Must cite receipt hash |
| Supporting relation | Supports or DerivedFrom edge | Never replaces primitive edge |
| Counterexample | Contradicts edge | Preserve failing seed |
| Projection position | No persisted target | Renderer only |
| Primitive node | No mapping | Remains in kernel |

The current closed `WorldNode` schema may not express a generic research belief without upstream extension. If the spike requires pretending a quantum unit is a room, sensor, person, or physical object, the spike fails.

## Options considered

1. Direct kernel replacement has high reuse but violates coordinate isolation and domain semantics.
2. Forking WorldGraph to add quantum research node types creates long term schema divergence.
3. A derived projection adapter provides audit and visualization value while preserving the kernel. This is the selected experiment.
4. No integration remains the fallback if a clean semantic state mapping is unavailable.

## Version and delivery strategy

Evaluate against `wifi-densepose-worldgraph` workspace version `0.3.1` at commit [`360ef48`](https://github.com/ruvnet/worldgraph/tree/360ef48a2536d45033cdbe0c40c0f522b8f75ae7). Pin the exact commit during the spike. Do not consume the `main` branch or a mutable package range.

Implement the adapter as a separate Rust fixture or command. It must accept a benchmark result file and emit deterministic JSON. It must not be imported by the JavaScript scoring path.

## Risks

The largest uncertainty is schema fit. WorldGraph is purposefully spatial and its closed enum is valuable in its own domain. The quickest resolution is a one day contract spike with one accepted observable, one counterexample, and a round trip test.

Another risk is misleading visual authority. The interface must label the view `derived research projection` and must not call it a universe state or digital twin of reality.

## Acceptance criteria

1. The adapter represents one accepted observable and one contradiction without using a physical node as a metaphor.
2. JSON output round trips byte identically for a fixed input and adapter version.
3. Every semantic belief includes a valid MetaHarness receipt reference.
4. Changing East, North, Up values or renderer layout changes no benchmark observable or verdict.
5. The adapter adds less than 10 percent to full validation time on the reference runner.
6. If any criterion fails, retain WorldGraph as an architectural reference only and add no runtime dependency.

## Promotion decision

Proposed, not approved for production. Promotion requires measured spike evidence and a followup ADR changing this status to Accepted.

