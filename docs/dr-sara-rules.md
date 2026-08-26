# Dr Sara Intelligence Rules Registry

Central registry: `lib/intelligence/registry/rules.ts` (V2 base) + `lib/intelligence/registry/v3.ts` (expanded).

Every important rule has: `ruleId`, `category`, `description`, `inputs`, `thresholds`, `evaluate`, `confidence`, `affectedDimensions`, `recommendedActions`.

Categories: `TEMPORAL`, `EVENT`, `JOURNEY`, `BOTTLENECK`, `CAUSAL`, `RISK`, `OPPORTUNITY`, `FORECAST`, `ANOMALY`, `INTERVENTION`, `OUTCOME`, plus domain categories (`OPERATIONS`, `ACTIVATION`, …).

---

## Base / bottleneck / operational (V2)

| ruleId | Category | Description | Recommended |
|--------|----------|-------------|-------------|
| `pending-cod` / COD ops rules | OPERATIONS | Pending real COD orders require verification | `/admin/payments?focus=pending` |
| First-sale pool | ACTIVATION | Merchants with products + zero real orders | `/admin/activation?stage=listed` |
| Hot empty | ACTIVATION | Recently active empty stores | `/admin/activation?stage=empty&temp=hot` |
| DNS failing | TECHNICAL | Custom domains failing live DNS | `/admin/domains` |
| Support backlog | SUPPORT | Unanswered support threads | `/admin/messages` |
| Revenue concentration | REVENUE | Top-2 GMV share elevated | `/admin/analytics?range=7` |
| Failed logins | TECHNICAL | Elevated failed login count | `/admin/security` (if mapped) |

Exact V2 ids live in `INTELLIGENCE_RULES` — evaluate via `evaluateRegistry(state)`.

---

## Causal (V3)

| ruleId | Description | Language |
|--------|-------------|----------|
| `CAUSAL_FIRST_SALE_DOMAIN_FRICTION` | Missing healthy custom domains **may contribute** to first-sale friction | Soft / heuristic |
| `CAUSAL_FIRST_SALE_COD_FRICTION` | Incomplete COD **may contribute** to checkout friction | Soft |
| `CAUSAL_OPERATIONAL_TRUST_RISK` | COD backlog + support load **consistent with** trust risk | Soft |
| `CAUSAL_GROWTH_CONCENTRATION_RISK` | Strong GMV + high top-2 share **consistent with** concentrated growth | Soft |

Confidence: `INTELLIGENCE_SCORING_CONFIG.causal` (deterministic). Never claim absolute causation.

---

## Anomaly (V3)

| ruleId | Trigger |
|--------|---------|
| `ANOMALY_SPIKE` / `ANOMALY_DROP` | Temporal `deltaPct` ≥ `anomaly.pctChangeThreshold` (default 50) |
| `ANOMALY_COD_BACKLOG_ACCEL` | `pendingRealOrders ≥ pendingOrdersCritical` (10) |
| `ANOMALY_DNS_FAILURE_SPIKE` | `domainFailing ≥ 3` |

Each anomaly carries: baseline, observed, delta, threshold, ruleId, confidence.

---

## Intervention (V3)

| ruleId / type | When | Route |
|---------------|------|-------|
| `COD_VERIFICATION` | `pendingRealOrders > 0` | `/admin/payments?focus=pending` |
| `DNS_DIAGNOSIS` | `domainFailing > 0` | `/admin/domains` |
| `SUPPORT_ESCALATION` | `openSupport > 0` | `/admin/messages` |
| `FIRST_SALE_ASSIST` | Merchant bottleneck `NO_FIRST_ORDER` | `/admin/activation?stage=listed` |
| `DOMAIN_SETUP_ASSIST` | Bottleneck `NO_DOMAIN` | `/admin/activation?stage=listed` |
| `COD_CONFIGURATION_ASSIST` | Bottleneck `NO_COD` | `/admin/activation?stage=listed` |
| `ACTIVATION_OUTREACH` | Hot empty (`NO_PRODUCTS` + hot) | `/admin/activation?stage=empty&temp=hot` |
| `DORMANCY_REACTIVATION` | Elevated churn heuristic | `/admin/activation?temp=cold` |
| `GROWTH_REINFORCEMENT` | Growing / POWER commerce | store or analytics |

Ranking:

```
live = impact × urgency × confidence × reversibility × actionability
adaptive = live × 0.85 + live × 0.15 × historicalSuccessRate
```

---

## Forecast (V3)

| ruleId | Metric | Notes |
|--------|--------|-------|
| `FORECAST_GMV_TRAJECTORY` | `real_gmv_7d` | Returns `FORECAST_UNAVAILABLE` if insufficient history |
| Orders / COD / activation forecasts | deterministic velocity | Exposed with confidence + horizon + DQ |

---

## Segment / journey (V3)

| ruleId | Definition |
|--------|------------|
| `SEGMENT_HIGH_INTENT` | `loggedInEmpty7d + firstSaleHighIntent > 0` |
| `SEGMENT_LOW_INTENT` | Empty without recent login |
| `SEGMENT_TECHNICAL_BLOCK` | DNS failing |
| `SEGMENT_OPERATIONAL_BLOCK` | Pending COD |
| Base HOT / FIRST_SALE / GROWING / POWER / AT_RISK / DORMANT | From `getMerchantSegmentSummary` |

Segments are **not mutually exclusive** unless required.

---

## Outcome classification

| Class | Rule |
|-------|------|
| `SUCCESS` | Clear improvement with sufficient data |
| `PARTIAL_SUCCESS` | Improvement ≥ `partialSuccessRatio` (0.25) |
| `NO_EFFECT` | No material change |
| `NEGATIVE` | Metric worsened |
| `INCONCLUSIVE` | Insufficient data — **never** called SUCCESS |

Backlog metrics use `classifyBacklogOutcome` (decrease = success).

---

## Data quality

Firewall (`quality/firewall.ts`) may block: `forecast`, `causal`, `ranking`.  
Warnings surface on the snapshot as `dataQualityWarnings`.

---

## Adding a rule

1. Prefer adding to `INTELLIGENCE_RULES_V3` with full metadata.
2. Put weights/thresholds in `INTELLIGENCE_SCORING_CONFIG` / `INTELLIGENCE_THRESHOLDS`.
3. Add a deterministic fixture test.
4. Never invent routes — only existing `/admin/*` paths.
5. Soft language for causal rules.


## V5 Scenario Rules

| ruleId | Notes |
|--------|-------|
| TWIN_EDGE_* | State graph edges with relationship labels + strength + evidence |
| SCENARIO_REGISTRY | Explicit scenario definitions (COD/DNS/activation/support/onboarding/…) |
| INTELLIGENCE_ASSUMPTIONS | A-COD-001 … A-ISO-001 (ACTIVE/WEAK/…) |
| SCENARIO_SIM_V5 | Deterministic historical-range simulation (read-only) |
| NO_ACTION baseline | Required every cycle |
| CHAIN_DOMAIN_TO_ACTIVATION | Multi-step scenario |
| OVERLAPPING_EFFECT | Prevents double-counting |
| EXPECTED_OPPORTUNITY | Cascade language — never guaranteed orders |
| compareScenarios | Trade-off + transparent ranking |
| simulateCounterfactual | COUNTERFACTUAL labeled; evidence-gated |
| comparePredictedVsObserved | Scenario outcome feedback (no ML) |
