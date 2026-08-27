# Dr Sara V9 — Controlled Execution & Governance

Version: `9.0.0`  
Extends V8. **No LLM. No ML. No UI redesign. No deploy. No push.**

## What V9 adds

Transforms a V8 `READY_FOR_APPROVAL` plan into a **human-gated execution** path:

```
PLAN → REQUEST APPROVAL → HUMAN APPROVAL → RE-CHECK
  → GOVERNOR → EXECUTE (sandbox) → VERIFY → MEASURE
  → OUTCOME → V7 memory-compatible record
```

V9 does **not** auto-execute. Default: `autoExecute = false`.

## Safety

- Kill switch default: `DISABLED` (blocks EXECUTE)
- All handlers are **sandbox-only** (`productionMutationAllowed: false`)
- No arbitrary Prisma / SQL / function execution
- Approval bound to `stateFingerprint` + `twinHash`
- Idempotent replay — same key does not double-mutate
- DRY_RUN performs zero mutations

## Modules

`lib/intelligence/execution/` — registry, approval, authorization, preconditions,
governor, kill-switch, transaction, idempotency, rollback, verification, audit,
outcome, executor, engine.

## Docs

See `docs/dr-sara-execution.md`.

## Testing

`npx vitest run lib/intelligence/__tests__/`  
Smoke: `npx tsx scripts/smoke-dr-sara-v9.ts`
