# Dr Sara V4 — Autonomous Platform Intelligence Loop

Version: `4.0.0`  
Extends V3. **No LLM. No ML. No `/admin/sara` redesign.**

## Control loop

```
OBSERVE → DETECT → DIAGNOSE → PREDICT → DECIDE
→ FILTER (conflicts) → RANK → INTERVENE (recommend)
→ MEASURE → LEARN → update future deterministic scores
```

Default autonomy: **LEVEL 1 (RECOMMEND)** — `AUTO_EXECUTE = false`.

## What V4 adds

| Layer | Module | Behavior |
|-------|--------|----------|
| Memory | `memory/` | Observations, interventions, outcomes, rule performance (AdminAuditLog `dr_sara.memory.snapshot`) |
| Measurement | `measurement/outcomes.ts` | Baseline → expected → observed; SUCCESS/PARTIAL/FAILED |
| Decision V4 | `decision/score-components.ts` | impact × urgency × confidence × reversibility × actionability × historicalEffectiveness × timeSensitivity × evidenceQuality |
| Conflicts | `decision/conflicts.ts` | Prerequisites, same-merchant blocks, dependency graph |
| Chains | `interventions/chains.ts` | Multi-step deterministic orchestration |
| Early warning | `warnings/early.ts` | WATCH → RISING → ESCALATING → CRITICAL → RECOVERING → RESOLVED |
| Transitions | `platform/transitions.ts` | IMPROVED / STABLE / DEGRADED across cycles |
| Secondary diagnosis | `diagnosis/secondary.ts` | Deepest supported bottleneck after failed primary |
| Quality V2 | `quality/firewall-v2.ts` | Freshness, sample size, INSUFFICIENT_EVIDENCE |
| Trace V4 | `trace/stages.ts` | Staged immutable cycle log |
| Autonomy | `cycle/autonomy.ts` | Levels 0–4; safe auto-execute gated off |

## Persistence strategy

No new Prisma models. Reuses `AdminAuditLog` with `dr_sara.*` actions.  
Empty memory ⇒ V3-equivalent recommend behavior (insufficient historical evidence).

## UI contract

`snapshotToBriefing()` unchanged. `/admin/sara` unchanged.  
V4 fields live on `DrSaraSnapshot` only.

## Testing

- `engine.test.ts` + `v3.test.ts` + `v4.test.ts` ≥ 100 tests
- Smoke: `npx tsx scripts/smoke-dr-sara-v4.ts`

## Rules

See `docs/dr-sara-rules.md` (V3 registry) — V4 adds early-warning, chain, secondary, and opportunity ruleIds without mutating immutable rule source files at runtime. Performance is stored separately in memory.
