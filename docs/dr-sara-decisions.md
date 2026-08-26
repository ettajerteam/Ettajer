# Dr Sara — Decision model (V6)

## Lifecycle

1. **Candidates** from signals / diagnoses / recommended actions / state  
2. **Constraints** → PASS | WARN | BLOCK  
3. **Scenario support** from V5 outcomes (baseline / expectedAfter ranges)  
4. **Score** with `DECISION_WEIGHTS`  
5. **Select** TOP_DECISION (or NO_ACTION)  
6. **Rationale** structured why / why-not  
7. **Trace** reproducible stages  

## Scoring formula

```
DecisionScore =
  impact        * DECISION_WEIGHTS.impact
+ urgency       * DECISION_WEIGHTS.urgency
+ confidence    * DECISION_WEIGHTS.confidence
+ reversibility * DECISION_WEIGHTS.reversibility
+ actionability * DECISION_WEIGHTS.actionability
+ scenarioSupportPoints * DECISION_WEIGHTS.scenarioSupport
- risk          * DECISION_WEIGHTS.riskPenalty
- cost          * DECISION_WEIGHTS.costPenalty
- delayBand     * DECISION_WEIGHTS.delayPenalty
```

All inputs normalized to ~[0,1] before weighting.  
Config: `lib/intelligence/decisions/config.ts` (`DECISION_WEIGHTS`, `DECISION_THRESHOLDS`).

## Constraints (examples)

| Id | Typical status |
|----|----------------|
| DATA_QUALITY_OK | PASS |
| DEGRADED_DATA_QUALITY | WARN (confidence cap) |
| INSUFFICIENT_EVIDENCE | BLOCK (non–NO_ACTION) → force NO_ACTION |
| MISSING_OR_INVALID_ROUTE | BLOCK |
| UNKNOWN_TARGET | BLOCK |
| FINANCIAL_ACTION_REQUIRES_APPROVAL | WARN (human approval; no execute) |
| SCENARIO_SIMULATION_UNAVAILABLE | WARN |

## Scenario support strengths

STRONG / MODERATE / WEAK / NONE / UNAVAILABLE  
Derived from matched V5 scenario confidence × impact. Never invents point forecasts.

## TOP_ACTION vs TOP_SCENARIO vs TOP_DECISION

- **TOP_ACTION** — nav CTA from prioritized signals  
- **TOP_SCENARIO** — best simulated intervention path  
- **TOP_DECISION** — scored choice among candidates with constraints + rationale  

## Determinism

Identical `PlatformState` (+ same scenarios/signals) → identical candidates, scores, ranking, selected decision, rationale structure.  
`createdAt` uses `state.now` only.

## Why V6 does not execute

Execution requires human approval and a future V7 executor. V6 only emits `mode: "RECOMMENDED"` with an existing admin `route`.
