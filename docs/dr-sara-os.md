# Dr Sara OS Architecture

V10 composes existing engines:

1. Platform observation (`PlatformState`)
2. Digital twin / scenarios (V5)
3. Decisions (V6) + memory (V7)
4. Intervention plans (V8)
5. Execution governance (V9)
6. Portfolio / strategy / learning / autonomy (V10)

## Modules

`lib/intelligence/os/` — types, config, compose, cycle-id, graph, portfolio,
dependencies, conflicts, budgets, strategies, health, warnings, learning,
adaptation, autonomy, governor, explainability, trace, engine.

## Failure modes

Statuses: `SUCCESS | DEGRADED | BLOCKED | FAILED | PARTIAL | ROLLED_BACK`

Bad data → degrade confidence or block. Never fabricate statistics.
