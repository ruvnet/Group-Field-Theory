# Computational model

## Design invariant

The primitive state must remain coordinate free:

```text
allowed = { id, internal_state, links, seed }
forbidden = { x, y, z, global_time }
```

Coordinates belong only to the renderer. They may be randomized without changing any graph invariant.

## Relational distance

For a weighted graph `G = (V, E)`, define distance using the minimum path cost:

```math
d_G(u,v) = min Σ w(e)
```

The minimum is taken over all paths connecting `u` and `v`. Adding a bridge relation can reduce distance without moving either endpoint. This demonstrates that operational nearness can be derived from connectivity.

## Connectivity and phase coherence

Useful toy order parameters include:

* Largest connected component ratio `C = |V_largest| / |V|`
* Algebraic connectivity given by the graph Laplacian eigenvalue `λ₂`
* Community boundary tension estimated through minimum cut
* Edge coherence derived from compatible internal states

A sharp change in these measures can identify a structural transition. It does not by itself establish a physical GFT phase transition.

## Spectral dimension

Release random walkers and measure the return probability `P(σ)` after diffusion scale `σ`. The spectral dimension is:

```math
d_s(σ) = -2 d ln P(σ) / d ln σ
```

This measures how information spreads through the structure. It can reveal scale dependent effective dimension without assigning a coordinate dimension in advance.

## Relational time

Choose a monotonic observable `φ` as a clock and express another observable relative to it:

```math
V = V(φ)
```

Changing the clock changes parameterization. Properly defined relational events should remain consistent.

## Curvature proxy

A triangulated toy surface can use the Regge angle deficit:

```math
K_i = 2π - Σ θ_ij
```

This is a discrete curvature proxy. The current visualization uses the idea illustratively and does not solve the Einstein field equations.

## RuVector mapping

| Capability | Research role |
| --- | --- |
| Graph storage | Primitive relational state |
| Shortest path and effective resistance | Derived distance |
| Laplacian and spectral analysis | Effective dimension and coherence |
| Dynamic minimum cut | Boundary formation and phase structure |
| WebAssembly execution | Deterministic browser computation |
| Retrieval receipts | Parameter, output, and provenance records |

## Related runtime roles

**Emergent Time** provides relational time models suitable for formalizing the clock experiments.

**MidStream** records ordered interaction events and supports deterministic forward and reverse replay.

**MetaHarness** can run seeded variants, compare output invariants, reject regressions, and supervise evidence labels.

**RVF** can package the primitive state, equations, WebAssembly modules, parameters, sources, outputs, and witness chain.

## Reproducibility receipt

Every experiment run should record:

```text
model_version
primitive_schema
seed
parameters
relation_fingerprint
derived_metrics
projection_seed
source_commit
evidence_class
limitations
```

