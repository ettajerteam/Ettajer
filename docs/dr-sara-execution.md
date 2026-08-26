# Dr Sara — Controlled Execution (V9)

## Invariants

1. No approval → no execution  
2. Expired approval → no execution  
3. Invalid authorization → no execution  
4. State mismatch → no execution  
5. Kill switch DISABLED → no EXECUTE  
6. Unregistered intervention → no execution  
7. Duplicate idempotency key → replay, no second mutation  
8. DRY_RUN → zero production mutation  
9. Failed safety / precondition → no execution  
10. Failure → rollback when reversible  
11. Every execution → immutable audit trace  
12. Every execution → measured outcome  
13. Outcome → V7 `OutcomeMemoryRecord` compatible  
14. No mutation outside execution registry  
15. `autoExecute` remains `false`

## Modes

| Mode | Mutations | Requires |
|------|-----------|----------|
| `DRY_RUN` | None | Approval + governor validations |
| `EXECUTE` | Sandbox only | Kill switch ENABLED + APPROVED + PASS |

## API

```ts
requestApproval({ plan, decisionId, stateFingerprint, twinHash, actor, nowIso })
approve({ approvalId, actor, nowIso })
executeIntervention({ interventionId, approvalId, idempotencyKey, mode, ... })
runGovernedExecution({ plan, mode: "DRY_RUN" | "EXECUTE", enableKillSwitch, ... })
```

## Production mutation

V9 smoke and handlers prove `productionMutation = NONE`.  
Commerce Prisma writes are **out of scope** for V9 — handlers operate on in-memory `PlatformState` clones only.
