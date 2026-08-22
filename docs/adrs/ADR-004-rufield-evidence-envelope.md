# ADR 004: Evaluate RuField as an external evidence envelope

Status: Proposed

Date: 2026-08-21

## Context

RuField MFS defines typed field tensors, privacy classes, calibration receipts, signed provenance, fusion rules, confidence, and expiry. Its provenance invariant rejects a fused inference unless every contributing event has a valid receipt or is explicitly synthetic.

That governance model is relevant to future laboratory data and sensor based comparisons. The current Group Field Theory project, however, produces synthetic relational experiments rather than camera free physical sensing. Rebranding mathematical observables as sensor events would blur simulation and measurement.

RuField version `0.1.0` is a reference stack. Its own documentation states that benchmark accuracy is synthetic, real WiFi CSI support is replay based and unlabeled, and several modalities remain synthetic. Its public `FieldEvent` also requires Unix time and a sensor descriptor.

## Decision

Do not wrap current simulation outputs as ordinary RuField measurements. Evaluate RuField only at the boundary where external evidence enters the project.

Two evidence paths are allowed:

1. Synthetic path. Keep MetaHarness receipts canonical. If exported to RuField for interoperability, mark the modality and provenance explicitly synthetic, set `evidence_class` to `computational_model`, and prohibit fusion with empirical evidence by default.
2. Empirical path. A future laboratory or observational adapter may translate a real instrument record into a signed RuField event, apply privacy policy, then derive a comparison artifact. The kernel consumes only the comparison artifact and receipt reference, never the sensor timestamp or spatial cell.

RuField does not replace RVF or MetaHarness. RVF packages the research artifact. MetaHarness decides deterministic benchmark validity. RuField governs external sensing and fusion lineage.

## Evidence class policy

| Evidence class | RuField use | Fusion policy |
| --- | --- | --- |
| `illustration` | No event | Never scored |
| `computational_model` | Optional synthetic export | Separate synthetic partition |
| `laboratory_measurement` | Signed event required | Fuse only with compatible calibration and consent |
| `observational_dataset` | Signed or content addressed import required | Preserve source and selection function |
| `physical_claim` | No direct event | Requires an explicit inference protocol and review |

No confidence score may promote one evidence class into another. A confidence of 0.99 on synthetic data remains synthetic evidence.

## Privacy and provenance

External events must pass RuField receipt verification and the applicable privacy guard before transformation. P0 raw waveforms remain outside repository artifacts. P4 biometric and P5 identity linked data are out of scope. The first eligible integration is P2 or P3 anonymous aggregate laboratory data.

Event timestamps are metadata at the adapter boundary. They cannot act as the relational clock used by the model unless a separately reviewed protocol establishes that mapping.

## Version and delivery strategy

Evaluate against RuField workspace version `0.1.0` at commit [`43b1df3`](https://github.com/ruvnet/rufield/tree/43b1df3dc3c436a21e3fc85dc34475458a1eca9d). The crates are currently consumed as a pinned source workspace for a spike, not as an unpinned branch dependency.

The first spike should ingest a tiny synthetic fixture and a tampered fixture. It should emit a normalized evidence receipt and demonstrate that the tampered event and any mislabeled synthetic event are rejected.

## Risks

The largest uncertainty is use case validity. No current experiment needs ambient sensing. Adding RuField now could create terminology without research value. The mitigation is a demand gate: no production dependency until a named empirical dataset or instrument protocol exists.

The second risk is trust confusion. Signatures prove origin and integrity, not measurement accuracy or physical truth. Documentation and UI must state that distinction.

## Acceptance criteria

1. A signed eligible event verifies and produces a content addressed comparison artifact.
2. A tampered receipt, expired calibration, disallowed privacy class, or synthetic event labeled empirical is rejected.
3. Synthetic and empirical partitions cannot be fused without an explicit allow policy and recorded rationale.
4. Unix timestamps and spatial cells never enter primitive state or relational clock calculations.
5. The integration identifies a real dataset or instrument protocol before production promotion.
6. Promotion requires a followup ADR and a benchmark that includes provenance coverage and privacy violation count.

## Promotion decision

Proposed for an evidence boundary spike. Not approved as a dependency for the present browser experiment or deterministic kernel.

