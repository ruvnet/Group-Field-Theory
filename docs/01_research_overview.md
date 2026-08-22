# Research overview

## Research question

Can familiar spacetime arise from a more fundamental system whose primitive description contains neither spatial coordinates nor a universal time parameter?

## Working hypothesis

Fundamental quantum degrees of freedom may organize into collective states that admit an effective geometric description. In Group Field Theory, the microscopic variables are fields on abstract group configuration spaces. Their quanta encode discrete geometric data and combinatorial gluing rules. They are not particles located inside a background spacetime.

The transition from a nongeometric regime to a geometric continuum regime is commonly called geometrogenesis.

## Why this matters

General relativity treats spacetime geometry as dynamical. Quantum field theory normally assumes a spacetime background on which fields evolve. Quantum gravity must reconcile these different roles. Emergent spacetime programs attempt to replace the background with relational quantum structure and recover geometry only in an appropriate collective regime.

## Scope

This package focuses on five constructive questions:

1. Can relational state exist without coordinates?
2. Can distance be derived from graph connectivity?
3. Can effective dimension be inferred from diffusion?
4. Can change be described using a relational clock?
5. Can collective organization support a geometry like phase?

## What the project demonstrates

The interactive model stores a primitive graph:

```text
PrimitiveState = {
  node_identity,
  internal_state,
  relation_set,
  experiment_seed
}
```

It deliberately excludes:

```text
x, y, z, global_time
```

Renderer coordinates are maintained in a separate projection layer. Randomizing the projection must not alter relational observables.

## What remains unresolved

* The browser experiments do not implement complete GFT dynamics.
* The graph transition is a toy model, not a numerical phase diagram.
* The curvature visualization is not a solution of Einstein's equations.
* The bounce visualization summarizes a family of model results under simplifying assumptions.
* No unique empirical signature is established.

## Research outcome

The defensible result is a possibility proof: spacetime like observables can be derived from coordinate free relational state. The stronger ontological claim, that physical spacetime is actually emergent from GFT quanta, remains unconfirmed.

