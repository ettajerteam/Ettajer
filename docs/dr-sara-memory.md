# Dr Sara — Memory model (V7)

## Fingerprints

Deterministic tags from platform state (no timestamps / random IDs):

- `COD_BACKLOG_HIGH|MEDIUM|LOW`
- `FIRST_SALE_HIGH_INTENT` / `FIRST_SALE_POOL`
- `DNS_FAILURE_CLUSTER` / `DNS_FAILURE`
- `SUPPORT_BACKLOG` / `SUPPORT_OPEN`
- `REVENUE_CONCENTRATION`
- `EMPTY_STORE_ACTIVITY`
- `PLATFORM_QUIET`

## Outcomes

Statuses: PENDING | SUCCESS | PARTIAL | FAILED | UNKNOWN | NOT_MEASURED  

Accuracy: ACCURATE | ACCEPTABLE | DRIFT | MISS | NOT_MEASURED  

`compareOutcome(predicted, observed)` uses ranges — never invents observations.

## Success rates

Require `MEMORY_THRESHOLDS.minSampleForReliability` (default 5).  
Below threshold → `successRate = null`, `evidenceStrength = INSUFFICIENT`.

## Reliability bands

HIGH / MEDIUM / LOW / INSUFFICIENT from success rate + sample size + prediction accuracy share.

## Confidence adjustment

```
IF evidence INSUFFICIENT → no change
ELSE IF reliability HIGH → +boost (capped)
ELSE IF LOW / failures → −penalty
clamp to [minConfidence, maxConfidence] = [0.20, 0.98]
round to 2 decimals
```

## Memory vs V6 score

Bonuses: historicalReliability, predictionAccuracy  
Penalties: recentFailure, weak evidence  

**BLOCK constraints always win** — memory net forced to 0 when blocked.

## LEARNING_TRACE stages

INPUT → HISTORICAL_EVIDENCE → RELIABILITY → PREDICTION_ACCURACY → CONFIDENCE_ADJUSTMENT → FINAL_DECISION
