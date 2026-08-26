# Dr Sara V5 — Platform Digital Twin & Scenario Intelligence

Version: `5.0.0`  
Extends V4. **No LLM. No ML. No deployment. No UI redesign.**

## Architecture

```
OBSERVE → DETECT → DIAGNOSE → MODEL STATE → BUILD DIGITAL TWIN
→ GENERATE SCENARIOS → SIMULATE → COMPARE → DECIDE
→ INTERVENE (recommend only) → MEASURE → LEARN
```

`AUTO_EXECUTE = false` always in V5.

## Digital Twin

Computed from `PlatformState` via `buildPlatformDigitalTwin()` — not a DB copy.

Contains: metrics, health vector, dimension snapshot, dependencies (CAUSAL_SUPPORTED / CORRELATION_ONLY / UNKNOWN), capacity constraints, data quality, twinHash.

## Scenario engine

`generateScenarios()` produces:

- `NO_ACTION` (required baseline)
- `INTERVENTION` / `ALTERNATIVE_INTERVENTION`
- `CHAINED_INTERVENTION`
- `RECOVERY_SCENARIO`

Simulations emit **historical deterministic ranges**, never “AI predictions”.

## Intervention advantage

```
advantage = scenario.expectedImpact − noAction.expectedImpact
```

TOP_SCENARIO ranked with V4 score components + advantage + riskReduction.

## APIs

- `getDrSaraSnapshot()` → `metadata.version = "5.0.0"` (+ additive twin/scenario fields)
- `simulateDrSaraScenario({ intervention })` → what-if result (`autoExecute: false`)
- `snapshotToBriefing()` unchanged → `/admin/sara` unchanged

## Modules

| Path | Role |
|------|------|
| `twin/` | Digital twin + state graph |
| `scenarios/` | generate, simulate, rank, API |
| `counterfactual/` | Evidence-gated counterfactuals |
| `merchants/twin.ts` | Merchant twins |
| `portfolio/` | Capacity-aware portfolios |
| `trajectory/` | State trajectory + escalation/recovery sim |
| `stability/` | Decision stability / change reasons |
| `cache/` | Deterministic scenario cache |

## Testing

`engine` + `v3` + `v4` + `v5` tests. Smoke: `npx tsx scripts/smoke-dr-sara-v5.ts`
