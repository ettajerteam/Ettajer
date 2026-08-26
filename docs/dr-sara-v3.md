# Dr Sara V3 — Intelligence OS

Deterministic platform intelligence layer for Ettajer.  
**Not a dashboard. Not an LLM. Not ML.**

Version: `3.0.0`

## Pipeline

```
getPlatformOverview()          ← DATA LAYER (existing Prisma aggregates)
        ↓
toPlatformState()              ← NORMALIZATION
        ↓
quality firewall
        ↓
signals → correlations → diagnoses → bottlenecks
        ↓
temporal → anomalies → forecasts V2
        ↓
causal hypotheses (soft language)
        ↓
merchant intelligence profiles + segments
        ↓
interventions → adaptive ranking → TOP_INTERVENTION
        ↓
action lifecycle events → outcome measurement → memory
        ↓
explainability (why-first) + execution trace
        ↓
getDrSaraSnapshot() → snapshotToBriefing() → /admin/sara
```

V2 behavior (TOP_ACTION, journeys, bottlenecks, registry, closed-loop) is preserved and extended.

## Architecture modules

| Module | Role |
|--------|------|
| `config/scoring.ts` | Central weights (`INTELLIGENCE_SCORING_CONFIG`) |
| `thresholds.ts` | Operational thresholds |
| `causal/` | Soft causal hypotheses |
| `merchants/` | Journey + MerchantIntelligenceProfile + scores |
| `interventions/` | WHO / WHY / WHAT / WHEN / IMPACT |
| `outcomes/` | Lifecycle + classification + historical memory |
| `forecasts/` | Forecast V2 with `FORECAST_UNAVAILABLE` |
| `anomalies/` | Threshold / velocity anomalies |
| `segments/` | Analytical segments (non-exclusive) |
| `graph/` | In-memory reasoning graph |
| `quality/` | Data-quality firewall |
| `registry/v3.ts` | Expanded rule registry |
| `snapshot.ts` | Assembles V3 snapshot + execution trace |

## Scoring formulas

### Intent (0–100)

```
intent =
  recentActivity + productReadiness + checkoutReadiness
  + storefrontReadiness + trafficSignals
```

Weights: `INTELLIGENCE_SCORING_CONFIG.intent`.

### Intervention live score

```
score = clamp(
  (impact/100 × urgency/100 × confidence/100
   × reversibility/100 × actionability/100) × 100
   × productScale
)
```

### Adaptive action score

```
adaptive =
  liveScore × liveEvidenceFloor
  + liveScore × historicalMaxBoost × historicalSuccessRate
```

- Historical success **never** overrides live urgency (`liveEvidenceFloor = 0.85`).
- If fewer than 3 decided outcomes: use live score only → *"Insufficient historical evidence."*

### Causal confidence

```
confidence = clamp(
  baseTwoSignals + (extraSignals × perExtraSignal) − smallSamplePenalty?
)
```

Capped at `causal.max`. Soft language only: *may contribute / consistent with / likely contributing factor*.

## Causal reasoning

Hypotheses are **heuristic corroborations**, never stated as facts. Example:

`NO_CUSTOM_DOMAIN + ZERO_FIRST_ORDER + RECENT_ACTIVITY + LIVE_PRODUCTS`  
→ `CAUSAL_FIRST_SALE_DOMAIN_FRICTION`

## Merchant intelligence

Lifecycle (evidence-driven, not forced sequential):

`CREATED → EMPTY → CATALOG_READY → CHECKOUT_READY → FIRST_SALE_PENDING → FIRST_SALE → REPEAT_SALES → GROWING → POWER`  
(+ `DORMANT`, `AT_RISK`)

Each profile exposes intent / activation / commerce / first-sale proxy / churn scores with formula, inputs, evidence, confidence.

## Intervention engine

Answers: WHO, WHY, WHAT, WHEN, EXPECTED IMPACT, CONFIDENCE.

Types include `FIRST_SALE_ASSIST`, `DOMAIN_SETUP_ASSIST`, `COD_VERIFICATION`, `GROWTH_REINFORCEMENT`, …  
Routes always map to existing `/admin/*` paths.

Platform → segment → merchant → intervention → outcome is assembled in `snapshot.ts`.

## Outcome measurement

Lifecycle: `DETECTED → RECOMMENDED → ACCEPTED → EXECUTED → OBSERVING → SUCCESS | PARTIAL_SUCCESS | FAILED | EXPIRED | NO_EFFECT | NEGATIVE | INCONCLUSIVE`

History is **append-only**. Classification refuses `SUCCESS` without sufficient data (`INCONCLUSIVE`).

## Forecasting & anomalies

Forecasts expose: confidence, horizon, baseline, velocity, acceleration, trend, data quality.  
Insufficient history → `FORECAST_UNAVAILABLE` + reason.

Anomalies use temporal primitives + threshold deviation (no ML).

## Data quality firewall

Before forecast / causal / ranking: validate negatives, impossible shares, stale/missing patterns.  
Blocked ops return structured warnings — never silent nonsense.

## Observability

`executionTrace`: snapshotId, rulesEvaluated, rulesFired, signals, diagnoses, interventions, topAction, warnings, executionTimeMs.

## UI contract

`/admin/sara` is **unchanged visually**. `snapshotToBriefing()` projects snapshot → existing `SaraBriefing`.

## Testing strategy

- Deterministic fixtures only (`emptyPlatformState` + partial overrides)
- V2 suite (`engine.test.ts`) + V3 suite (`v3.test.ts`) ≥ 60 tests
- Live smoke: `npx tsx scripts/smoke-dr-sara.ts`
- No randomness, no LLM, no network in unit tests

## Rules

See [dr-sara-rules.md](./dr-sara-rules.md).
