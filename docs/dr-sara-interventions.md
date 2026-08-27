# Dr Sara — Intervention model (V8)

## Registry types

COD_VERIFICATION · DNS_DIAGNOSIS · SUPPORT_ESCALATION · FIRST_SALE_ASSISTANCE · ACTIVATION_OUTREACH · MERCHANT_ONBOARDING · REVENUE_CONCENTRATION_REVIEW · NO_ACTION

## Statuses

PROPOSED → READY_FOR_APPROVAL → (human) → EXECUTION_READY  

V8 stops before EXECUTED. Also: BLOCKED, DUPLICATE, ALREADY_IN_PROGRESS.

## Gates

1. **Prerequisites** — target exists / evidence present  
2. **Safety** — SAFE | CAUTION | BLOCKED  
3. **Blast radius** — LOW | MEDIUM | HIGH | CRITICAL  
4. **Risk** — multi-dimension overall risk  
5. **Approval** — NONE | RECOMMENDED | REQUIRED | BLOCKED  

Mutable, merchant-facing, high blast, low reversibility → REQUIRED.

## Idempotency

`idempotencyKey = hash(type | fingerprint | decisionId | targetCount)` — deterministic, no UUIDs.

## Trace

DECISION → INTERVENTION_SELECTED → PREREQUISITES → SAFETY → RISK → APPROVAL → EXECUTION_PLAN → ROLLBACK → MEASUREMENT

## Mapping from V6 decisions

| Decision | Intervention |
|----------|--------------|
| REVIEW_PENDING_COD | COD_VERIFICATION |
| DIAGNOSE_DNS | DNS_DIAGNOSIS |
| ANSWER_SUPPORT | SUPPORT_ESCALATION |
| PRIORITIZE_FIRST_SALE | FIRST_SALE_ASSISTANCE |
| ACTIVATE_MID_TIER_MERCHANTS | ACTIVATION_OUTREACH |
| REVIEW_REVENUE_CONCENTRATION | REVENUE_CONCENTRATION_REVIEW |
| NO_ACTION | NO_ACTION |
