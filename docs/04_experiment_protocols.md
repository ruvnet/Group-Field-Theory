# Experiment protocols

## Protocol 1: Erase the stage

**Input:** Fixed nodes, fixed relations, randomized projection.

**Action:** Remove coordinate labels and randomize renderer positions.

**Invariant:** Relation fingerprint and graph observables remain unchanged.

**Failure condition:** A derived metric changes because a rendered position changed.

## Protocol 2: One quantum

**Input:** Discrete units with internal state and gluing ports.

**Action:** Add units without assigning background positions.

**Observation:** Individual state does not define extended geometry.

**Failure condition:** The model assigns a physical location before geometry is derived.

## Protocol 3: Cross the threshold

**Input:** Seeded graph ensemble and interaction strength.

**Action:** Increase coupling and measure connected component ratio, spectral gap, and boundary structure.

**Observation:** Collective order changes sharply near a threshold.

**Failure condition:** The interface labels a toy transition as a measured GFT result.

## Protocol 4: Recover distance

**Input:** Fixed graph and selected endpoints.

**Action:** Add or remove bridge relations.

**Observation:** Shortest path distance changes while renderer positions remain fixed.

**Failure condition:** Distance is read from screen pixels.

## Protocol 5: Ask for dimension

**Input:** Graph transition matrix and diffusion scale.

**Action:** Estimate return probability across multiple scales.

**Observation:** The slope of the return probability curve yields effective spectral dimension.

**Failure condition:** The model declares dimension before measuring diffusion.

## Protocol 6: Build a clock

**Input:** Two monotonic observables.

**Action:** Alternate which observable acts as the clock.

**Observation:** Relational event ordering remains consistent under reparameterization.

**Failure condition:** Browser frame time leaks into the physical model state.

## Protocol 7: Let geometry respond

**Input:** Triangulated structure and local excitation.

**Action:** Adjust the excitation and compute a curvature proxy.

**Observation:** Derived paths respond to changed geometric relations.

**Failure condition:** The illustration is described as a numerical solution of general relativity.

## Protocol 8: Begin without a point

**Input:** Relational clock `φ` and an effective volume function `V(φ)`.

**Action:** Scrub through contraction, minimum volume, and expansion.

**Observation:** The curve reaches a nonzero minimum in the chosen model.

**Failure condition:** The model result is presented as an observed history of the universe.

## Ensemble protocol

Run each experiment across at least one hundred deterministic seeds. Compare:

* Invariant preservation rate
* Sensitivity to graph size and density
* Stability under node relabeling
* Stability under projection randomization
* Parameter regions that produce similar macroscopic observables
* Counterexamples that break the intended derivation

MetaHarness should reject a run if any forbidden primitive field appears or any invariant changes solely because of rendering.

