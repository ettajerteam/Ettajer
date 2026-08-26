# Dr Sara V6 — Decision Intelligence

Version: `6.0.0`  
Extends V5. **No LLM. No ML. No execution. No UI redesign. No deploy.**

## What V6 answers

V5: *What happens if we do X?*  
V6: *Given state, risks, constraints and scenarios, which action should Ettajer take now — and why?*

V6 **decides**. Execution is V7.

## Pipeline

```
getPlatformOverview → V5 twin/scenarios/compare
  → generateDecisionCandidates
  → evaluateConstraints
  → attachScenarioSupport
  → scoreDecisionCandidate
  → select TOP_DECISION
  → rationale + DECISION_TRACE
  → getDrSaraSnapshot().decision
```

## Separation of concepts

| Concept | Meaning |
|---------|---------|
| TOP_ACTION | Most actionable operational CTA (V2+) |
| TOP_SCENARIO | Best simulated scenario (V5) |
| TOP_DECISION | Chosen recommended decision (V6) |

They may agree (e.g. COD) but remain separate fields.

## Safety

- `mode: "RECOMMENDED"` only
- No Prisma writes in `lib/intelligence/decisions/`
- No messages, DNS changes, payment mutations
- `autoExecute` remains `false`

## Modules

See `docs/dr-sara-decisions.md` for scoring, constraints, and weights.

## Testing

`npx vitest run lib/intelligence/__tests__/`  
Smoke: `npx tsx scripts/smoke-dr-sara-v6.ts`
