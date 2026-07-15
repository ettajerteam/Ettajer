# Builder V2 — Migration Strategy

This document describes how Ettajer migrates from **V1 (section-based)** to **V2 (element tree)** without breaking existing stores.

## Principles

1. **Coexistence** — V1 `HomeLayout` remains the production persistence format until an explicit cutover.
2. **No forced migration** — Existing `StoreSettings.homeLayout` JSON continues to work unchanged.
3. **Adapter bridge** — `lib/builder/v2/adapters/` converts V1 ↔ V2 in memory only.
4. **Render path unchanged** — Storefront still reads V1 sections via `section-renderer.tsx`.
5. **Opt-in V2** — New features (nested elements, AI generation, element-level history) use V2 internally and serialize down to V1 when publishing.

---

## Folder structure

```
lib/builder/v2/
├── index.ts                 # Public V2 API (namespaced export)
├── constants.ts
├── MIGRATION.md             # This file
├── types/
│   ├── index.ts
│   ├── element.ts           # BuilderElement
│   ├── section.ts           # BuilderSection
│   ├── page.ts              # BuilderPage
│   ├── document.ts          # BuilderDocumentV2
│   ├── styles.ts            # BuilderStyle, ResponsiveStyle
│   ├── selection.ts         # BuilderSelection
│   ├── history.ts           # BuilderHistory
│   └── clipboard.ts         # BuilderClipboard
├── adapters/
│   ├── index.ts
│   ├── v1-to-v2.ts          # HomeLayout → BuilderDocumentV2
│   ├── v2-to-v1.ts          # BuilderDocumentV2 → HomeLayout
│   └── compatibility.ts     # Aliases + round-trip validation
└── utils/
    ├── ids.ts
    └── validate.ts          # Structural tree validation
```

V1 code remains in `lib/builder/types.ts`, `legacy-adapter.ts`, `website-layout-store.ts`, and the existing editor UI.

---

## Data model comparison

| Concept | V1 | V2 |
|---------|----|----|
| Persistence | `HomeLayout.version: 1` | `BuilderDocumentV2.version: 2` (future) |
| Unit | `StoreSection` (flat) | `BuilderElement` tree + `BuilderSection` index |
| Content | `section.settings` blob | `element.content` + `element.styles` + `element.responsiveStyles` |
| Visibility | `section.visible` | `element.visibility` + per-device `responsiveStyles.*.visible` |
| Pages | Home only (+ StorePage table) | `BuilderPage[]` with ordered `sections` |
| Selection | `selectedSectionId` in layout store | `BuilderSelection` (page/section/element) |
| History | `HomeLayout` snapshots | `BuilderDocumentV2` snapshots |
| Clipboard | `clipboardSection` | `BuilderClipboard` with subtree support |

---

## Migration phases

### Phase 0 — Foundation (current)

- [x] V2 TypeScript interfaces (`BuilderElement`, `BuilderSection`, `BuilderPage`, `BuilderStyle`, `ResponsiveStyle`, `BuilderHistory`, `BuilderSelection`, `BuilderClipboard`)
- [x] V1 ↔ V2 adapters (lossless for flat sections)
- [x] Compatibility aliases (`homeLayoutToBuilderDocument`, `builderDocumentToHomeLayout`, `isV1V2Compatible`)
- [x] Structural validation utilities
- [x] History push/undo/redo helpers
- [x] Namespaced exports `BuilderCore` / `BuilderV2` from `@/lib/builder`
- [x] Architecture documentation (`ARCHITECTURE.md`)
- [ ] No UI changes
- [ ] No DB schema changes

### Phase 1 — Shadow mode

- Editor loads V1 layout as today.
- On load, compute `BuilderDocumentV2` via `homeLayoutToV2()` in memory.
- V2 used by AI generation and layers panel prototype.
- Publish still writes V1 only (`v2ToHomeLayout()` before PATCH).

**Gate:** `isV1V2Compatible(doc) === true` required before publish.

### Phase 2 — Dual write (optional flag)

- Add `StoreSettings.homeLayoutV2` JSON column (nullable).
- On publish: write both V1 (derived) and V2 (canonical).
- Read path prefers V2 when present, falls back to V1.

**Gate:** Round-trip tests + shadow diff monitoring.

### Phase 3 — V2 primary

- New stores default to V2 persistence.
- Existing stores lazy-migrate on first editor open (V1 → V2 stored, V1 kept as backup).
- Storefront renderer accepts V2 document via adapter.

### Phase 4 — Nested elements

- Enable child `BuilderElement` nodes inside sections.
- V1 publish produces best-effort flatten (section root only).
- Full fidelity requires V2-native storefront renderer.

---

## Compatibility rules

### V1 → V2 (`homeLayoutToV2`)

- Each `StoreSection` → one `BuilderSection` + one root `BuilderElement`.
- `settings` split into `content`, `styles`, `responsive` using existing `normalizeSectionSettings`.
- Section id preserved for selection continuity.

### V2 → V1 (`v2ToHomeLayout`)

- Only root elements of each section are exported.
- Nested `children` / `section.elements` are **dropped** (incompatible).
- Use `isV1V2Compatible()` before publish.

---

## Integration points (future)

| Module | V2 usage |
|--------|----------|
| `lib/builder/ai/serialize.ts` | Emit `BuilderDocumentV2`, derive V1 for apply |
| `website-layout-store.ts` | Optional parallel `v2Document` state |
| `lib/website-templates/apply.ts` | Apply to V2, serialize to V1 |
| Element-level inspector | Target `BuilderElement` by id |
| Layers panel | Traverse `elements` tree |

---

## What NOT to do yet

- Do not change `HomeLayout.version` in production data.
- Do not replace `useWebsiteLayoutStore` with V2 store.
- Do not modify `section-renderer.tsx` or editor UI.
- Do not add Prisma migrations for V2.

---

## Testing strategy (adapter round-trips)

1. **Structural** — `validateBuilderDocumentV2(doc)` returns no issues.
2. **Compatibility** — `isV1V2Compatible(doc)` is true (no nested elements).
3. **V1 round-trip** — `validateHomeLayoutRoundTrip(homeLayout)` for each fixture layout.
4. **V2 round-trip** — `validateDocumentRoundTrip(doc)` after V1 → V2 conversion.
5. **Regression** — existing storefront renders unchanged (V1 path only).

```ts
import { BuilderCore } from "@/lib/builder";

const doc = BuilderCore.homeLayoutToBuilderDocument(homeLayout);
expect(BuilderCore.isV1V2Compatible(doc)).toBe(true);
expect(BuilderCore.validateHomeLayoutRoundTrip(homeLayout)).toBe(true);
```

---

### Phase 1 — Components (current)

- [x] `BuilderComponent` types + V1 section-root storage
- [x] Component instance refs in `section.settings._componentRef`
- [x] Zustand component store + REST API (`/api/components`)
- [x] Prisma `BuilderComponent` model (requires migration)
- [x] Editor UI: save, library, detach, global edit banner
- [ ] Storefront auto-load of component definitions (republish resolves for preview)

See `lib/builder/components/README.md`.

---

## Usage (development)

```ts
import { BuilderCore } from "@/lib/builder";

// Convert existing layout to V2 in memory
const v2Doc = BuilderCore.homeLayoutToBuilderDocument(homeLayout);

// Validate structure
const issues = BuilderCore.validateBuilderDocumentV2(v2Doc);

// Publish-safe round trip
if (BuilderCore.isV1V2Compatible(v2Doc)) {
  const backToV1 = BuilderCore.builderDocumentToHomeLayout(v2Doc);
}
```
