# Dr Sara V5 — Platform Digital Twin & Scenario Intelligence

Version: `5.0.0`  
Extends V4. **No LLM. No ML. No deployment. No UI redesign.**

## Architecture

```
LIVE PLATFORM DATA
        ↓
NORMALIZED PLATFORM STATE (toPlatformState)
        ↓
DIGITAL TWIN (buildPlatformDigitalTwin)
        ↓
SCENARIO ENGINE (SCENARIO_REGISTRY + generateScenarios)
        ↓
SIMULATION (read-only historical deterministic ranges)
        ↓
IMPACT + COMPARISON (compareScenarios)
        ↓
DECISION (TOP_SCENARIO + existing TOP_ACTION)
        ↓
HUMAN APPROVAL → existing intervention system
        ↓
REAL OUTCOME → comparePredictedVsObserved → twin refresh
```

`AUTO_EXECUTE = false` always in V5. Simulation never mutates production.

## Digital Twin

Computed from `PlatformState` via `buildPlatformDigitalTwin()` — not a DB copy.

Contains: metrics, provenanced values, health vector, dimension snapshot, dependencies
(`dependency` / `correlation` / `inferred causal relationship` / `observed relationship`),
capacity constraints, data quality, twinHash, `version: "5.0.0"`.

Contract helper: `toDigitalTwinState(twin)`.

## Scenario registry

`SCENARIO_REGISTRY` defines:

| scenarioId | Horizon | Notes |
|------------|---------|-------|
| NO_ACTION | SHORT | Required baseline |
| COD_VERIFICATION_CLEARANCE | SHORT | Clearance bands |
| DNS_FAILURE_REMEDIATION | SHORT | Does not invent traffic |
| FIRST_SALE_ACTIVATION | MEDIUM | Opportunity only |
| ACTIVATION_OUTREACH | MEDIUM | Blocked if DNS unhealthy |
| SUPPORT_BACKLOG_REDUCTION | SHORT | Support bands |
| MERCHANT_ONBOARDING | LONG | Capacity-aware; GMV INSUFFICIENT without history |
| REVENUE_CONCENTRATION_REDUCTION | LONG | Risk framing only |

Each scenario declares assumptions, timeToImpact, reversibility, actionability, limitations.

## Assumptions

`INTELLIGENCE_ASSUMPTIONS` (`A-COD-001`, `A-DNS-001`, `A-ACT-001`, `A-GROWTH-001`, `A-SUP-001`, `A-ISO-001`).

Statuses: ACTIVE | WEAK | UNSUPPORTED | INVALIDATED.

## Counterfactuals

`simulateCounterfactual()` and `buildCounterfactuals()` always label results
`COUNTERFACTUAL` / `SIMULATED`. Withheld or low-confidence when history is insufficient.

## Comparison & trade-offs

`compareScenarios()` returns expected impact, risk, reversibility, actionability,
confidence, timeToImpact, SHORT/MEDIUM/LONG trade-offs, whySelected / whyNot.

## Decision

TOP_SCENARIO ranked with transparent score (impact × advantage × confidence ×
reversibility × actionability − risk). Does **not** replace TOP_ACTION.

## Outcome loop

`comparePredictedVsObserved()` → SUCCESS | PARTIAL | FAILURE | INCONCLUSIVE
(deterministic calibration, not ML).

## Safety

- Simulation is read-only (in-memory)
- No Prisma writes on simulate path
- Human approval required for real interventions
- Data quality firewall can mark DEGRADED / INSUFFICIENT EVIDENCE

## APIs

- `getDrSaraSnapshot()` → `metadata.version = "5.0.0"` (+ additive V5 fields)
- `simulateDrSaraScenario({ intervention })` → what-if (`autoExecute: false`)
- `compareScenarios` / `simulateCounterfactual` / `comparePredictedVsObserved`
- `snapshotToBriefing()` unchanged → `/admin/sara` unchanged

## Modules

| Path | Role |
|------|------|
| `twin/` | Digital twin, graph, provenance, state contract |
| `scenarios/` | registry, simulate, rank, compare, outcome, API |
| `assumptions/` | INTELLIGENCE_ASSUMPTIONS |
| `counterfactual/` | Evidence-gated + formal CF API |
| `merchants/twin.ts` | Merchant twins |
| `portfolio/` | Capacity-aware portfolios |
| `trajectory/` | State trajectory + escalation/recovery |
| `stability/` | Decision stability |
| `cache/` | Deterministic scenario cache |

## Testing

`engine` + `v3` + `v4` + `v5` (incl. adversarial).  
Smoke: `npx tsx scripts/smoke-dr-sara-v5.ts`
