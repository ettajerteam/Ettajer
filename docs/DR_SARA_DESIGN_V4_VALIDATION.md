# Dr Sara Design V4 — Glass / Academy validation

## Scope
Presentation-only upgrade of the Intelligence Room UI.

- Experience model: `11.0.0` (unchanged)
- Design version: `4.0.0`
- Engine V1–V10: untouched
- `productionMutation=NONE`, `autoExecute=false`
- CTA remains review-only (never Execute)
- No LLM / ML / avatar / chatbot

## Design intent
Quiet AI atmosphere aligned with Ettajer Academy:

- Academy rhythm: Inter, soft kickers, `tracking-tight` headlines, `rounded-full` CTAs
- Brand accent `#007AFF` / `#5AC8FA`
- Glass morphism panels (`sara-glass`, `sara-glass-nav`, `sara-glass-chip`)
- Immersive dark canvas `#0B0D10` with soft radial AI glow (no neon, no purple)

## Surfaces updated
- `sara-ui.tsx` — glass primitives + Academy typography + brand CTA
- Arrival, NOW, decision, system, why, timeline, scenarios, governance, learning, risks, opportunities, network
- Floating nav + command palette glass treatment
- Canvas ambient layers in `intelligence-room-v3.tsx`
- CSS utilities in `styles/globals.css`

## Checks
```bash
npx vitest run lib/intelligence/presentation/__tests__/v11.test.ts
npx tsx scripts/smoke-dr-sara-design-v4.ts
```
