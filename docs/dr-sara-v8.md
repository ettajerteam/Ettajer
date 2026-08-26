# Dr Sara V8 — Intervention Orchestration

Version: `8.0.0`  
Extends V7. **No LLM. No ML. No execution. No UI redesign. No deploy.**

## What V8 answers

Transforms TOP_DECISION into a structured, safe, auditable **intervention plan**.

V8 produces plans (`READY_FOR_APPROVAL` / `EXECUTION_READY` / `BLOCKED`).  
V8 does **not** execute.

## Pipeline

```
V5 Twin/Scenario → V6 Decision → V7 Memory
  → planIntervention / orchestrateIntervention
  → prerequisites → safety → risk → approval
  → execution plan (boundary) → rollback → measurement
  → INTERVENTION_TRACE
```

## Safety

- `autoExecute = false`
- `executionMode`: SIMULATION_ONLY | RECOMMENDATION_ONLY | READY_FOR_APPROVAL
- Step labeled `execution_boundary` is never performed by V8
- No Prisma writes in V8 modules

## Docs

See `docs/dr-sara-interventions.md`.

## Testing

`npx vitest run lib/intelligence/__tests__/`  
Smoke: `npx tsx scripts/smoke-dr-sara-v8.ts`
