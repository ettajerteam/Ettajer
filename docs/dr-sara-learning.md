# Dr Sara Learning

Rule-based learning only.

## Rules

- Minimum sample size required (configurable, default 5)
- Below minimum → `INSUFFICIENT_EVIDENCE` (no fake rates)
- Confidence bounded: `[0.01, 0.98]`
- Adaptation deltas bounded
- Prediction accuracy from measured outcomes only
- Causal claims require explicit evidence levels: NONE → STRONG
- Never claim causation from correlation alone

Outcomes feed V7 memory-compatible records via V9 execution path.
