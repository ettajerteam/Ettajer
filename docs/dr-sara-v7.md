# Dr Sara V7 — Memory & Outcome Intelligence

Version: `7.0.0`  
Extends V6. **No LLM. No ML. No execution. No UI redesign. No deploy.**

## What V7 answers

1. What did we recommend before?  
2. What actually happened afterward?  
3. Was the recommendation successful?  
4. How reliable was this intervention type historically?  
5. Should confidence increase, decrease, or stay unchanged?

"Learning" is **deterministic, rule-based**, from measured outcomes only.

## Pipeline

```
V6 TOP_DECISION
  → state fingerprints
  → success rates (outcome history / rulePerformance)
  → reliability band
  → confidence adjustment (bounded)
  → memory score bonuses (never bypass BLOCK)
  → LEARNING_TRACE
  → snapshot.memory + snapshot.learning
```

## Safety

- No Prisma writes from V7 memory modules  
- `mode: RECOMMENDED` / `autoExecute: false`  
- Empty history → `INSUFFICIENT` / `memoryImpact: NONE`  
- Max confidence **0.98** (never auto 1.0)

## Modules

See `docs/dr-sara-memory.md`.

## Testing

`npx vitest run lib/intelligence/__tests__/`  
Smoke: `npx tsx scripts/smoke-dr-sara-v7.ts`
