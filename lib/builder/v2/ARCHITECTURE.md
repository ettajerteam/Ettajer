# Builder Core V2 — Architecture

This document describes the **Builder Core V2** module (`lib/builder/v2/`, exported as `BuilderCore` and `BuilderV2` from `@/lib/builder`). It is the scalable foundation for nested element trees, element-level styling, and future editor features — without replacing V1 today.

## Design goals

1. **Coexistence** — V1 `HomeLayout` remains the production persistence format.
2. **Non-breaking** — Existing stores (`useCentralBuilderStore`, `useWebsiteLayoutStore`, `useThemeStore`), themes, and sections continue unchanged.
3. **Pure adapters** — V1 ↔ V2 conversion is side-effect free (no UI, no rendering, no DB writes).
4. **Uniform element model** — Sections, blocks, and primitives share `BuilderElement` for tree traversal.
5. **Opt-in adoption** — New features consume V2 internally and serialize to V1 when publishing.

---

## V1 vs V2 relationship

```
┌─────────────────────────────────────────────────────────────┐
│  Production today (V1)                                      │
│  HomeLayout.version: 1  →  StoreSection[]  →  section-renderer│
└───────────────────────────────┬─────────────────────────────┘
                                │
                    homeLayoutToBuilderDocument()
                    builderDocumentToHomeLayout()
                                │
┌───────────────────────────────▼─────────────────────────────┐
│  Builder Core V2 (in-memory)                                │
│  BuilderDocumentV2  →  pages, sections, elements maps       │
└───────────────────────────────┬─────────────────────────────┘
                                │
              Future: nested elements, element inspector,
              V2-native renderer, dual-write persistence
```

| Layer | V1 | V2 |
|-------|----|----|
| Persistence | `StoreSettings.homeLayout` JSON | `BuilderDocumentV2` (future column) |
| Editor state | `useWebsiteLayoutStore` | `BuilderSelection`, `BuilderHistory` (future store) |
| Render | `section-renderer.tsx` | Unchanged until Phase 3+ |
| Unit of edit | `StoreSection` (flat) | `BuilderElement` tree |

V1 types in `lib/builder/types.ts` and `lib/sections/types.ts` are **not removed**. V2 types live in `lib/builder/v2/types/` and are namespaced to avoid collisions.

---

## Folder structure

```
lib/builder/
├── index.ts                    # V1 exports + BuilderCore / BuilderV2 namespaces
├── core/
│   └── index.ts                # Canonical alias → re-exports v2
├── v2/
│   ├── index.ts                # Public V2 API
│   ├── ARCHITECTURE.md         # This file
│   ├── MIGRATION.md            # Phased rollout plan
│   ├── constants.ts
│   ├── types/
│   │   ├── element.ts          # BuilderElement
│   │   ├── section.ts          # BuilderSection
│   │   ├── page.ts             # BuilderPage
│   │   ├── document.ts         # BuilderDocumentV2
│   │   ├── styles.ts           # BuilderStyle, ResponsiveStyle
│   │   ├── selection.ts        # BuilderSelection
│   │   ├── history.ts          # BuilderHistory + push/undo/redo
│   │   ├── clipboard.ts        # BuilderClipboard
│   │   └── index.ts
│   ├── adapters/
│   │   ├── v1-to-v2.ts
│   │   ├── v2-to-v1.ts
│   │   ├── compatibility.ts    # Aliases + round-trip validation
│   │   └── index.ts
│   └── utils/
│       ├── ids.ts
│       └── validate.ts
```

---

## Element tree model

`BuilderDocumentV2` is a normalized graph:

- **`pages`** — logical pages with ordered `sections` (section ids).
- **`sections`** — section index with V1-compat `settings`, `type`, `visible`.
- **`elements`** — flat map of `BuilderElement` nodes linked via `parentId` / `children`.

### BuilderElement

Every element carries:

| Field | Purpose |
|-------|---------|
| `id` | Stable unique id |
| `type` | Block catalog id or primitive kind |
| `parentId` | Parent element id (`null` for section roots) |
| `children` | Ordered child element ids |
| `content` | Block content fields (headline, CTA, etc.) |
| `styles` | Desktop-base `BuilderStyle` |
| `responsiveStyles` | `{ desktop?, tablet?, mobile? }` overrides |
| `animation` | Entrance animation config |
| `visibility` | Element-level visibility |
| `metadata` | Labels, locks, migration trace |

In **V1 parity mode**, each section has exactly one root element (id = section id), empty `children`, and empty `section.elements`.

### BuilderSection

Section index for ordering and V1 adapter round-trips:

- `type` — V1 `SectionType` (required for storefront)
- `settings` — full V1 settings blob preserved
- `elements` — child element ids (empty in parity mode)
- `rootElementId` — pointer into the elements map

### BuilderPage

- `sections` — ordered section ids on the page
- `metadata` — page-level extensibility

---

## Style system integration

`BuilderStyle` extends `ElementStyleValues` from `lib/builder/style-system/types.ts`, covering typography, spacing, padding, margin, background, borders, radius, size, alignment, display, shadow, opacity, and layout.

`ResponsiveStyle` maps breakpoints:

```ts
{
  desktop?: ResponsiveStyleValue;  // base
  tablet?: ResponsiveStyleValue;  // overrides
  mobile?: ResponsiveStyleValue;  // overrides
}
```

**Adapter bridge:** V1 `section.settings.styles` ↔ V2 `element.responsiveStyles`. Flat legacy fields on settings are split into `content` + `styles` on import and merged back on export.

**Future hooks:**

- Element inspector reads/writes `styles` + `responsiveStyles` per selected element.
- CSS emission reuses `lib/builder/style-system/css.ts` (`deviceStyleToCss`, `buildResponsiveCss`).
- Block registry `defaultStyles` seeds new element shells.

---

## Runtime editor state (not persisted)

| Type | Role |
|------|------|
| `BuilderSelection` | `selectedElementId`, `selectedSectionId`, `hoveredElementId`, `inspectorFocus` |
| `BuilderHistory` | `past` / `future` stacks with `pushHistory`, `undoHistory`, `redoHistory` |
| `BuilderClipboard` | Section/element/subtree snapshots for copy-paste |

These mirror V1 layout-store concerns but target V2 documents. They are **not wired** to existing stores yet.

---

## Store migration path (future)

| Phase | Store change |
|-------|--------------|
| 0 (now) | V1 stores only; V2 computed in memory via adapters |
| 1 | Shadow `v2Document` alongside `homeLayout` in editor load |
| 2 | Optional `homeLayoutV2` persistence column |
| 3 | V2-primary store with V1 derive-on-publish |
| 4 | Unified selection/history on V2 document |

`useCentralBuilderStore` canvas/zoom/panel state remains independent. `useWebsiteLayoutStore` continues owning V1 layout until Phase 2+.

---

## Component system hooks (future)

| Hook point | V2 usage |
|------------|----------|
| Block registry | `BuilderElement.type` ↔ `BlockDefinition.id` |
| Layers panel | Traverse `elements` tree via `children` |
| Inspector | Bind to `BuilderSelection.selectedElementId` |
| AI generate | Emit `BuilderDocumentV2`, validate, derive V1 |
| Canvas renderer | Walk page → sections → element subtrees |

No rendering changes in Phase 0.

---

## Adapter API

```ts
import { BuilderCore } from "@/lib/builder";

// V1 → V2
const doc = BuilderCore.homeLayoutToBuilderDocument(homeLayout);

// V2 → V1 (publish path)
const layout = BuilderCore.builderDocumentToHomeLayout(doc);

// Gates
BuilderCore.isV1V2Compatible(doc);       // structural + no nested loss
BuilderCore.validateHomeLayoutRoundTrip(layout);
BuilderCore.validateDocumentRoundTrip(doc);
```

Legacy aliases `homeLayoutToV2`, `v2ToHomeLayout`, `isV2V1Compatible` remain exported.

---

## Breaking change policy

**None for Phase 0.** V1 JSON shape, stores, renderer, and editor UI are untouched. V2 is additive and opt-in.

Nested elements (Phase 4) will be lossy on V1 publish until a V2-native renderer ships. `isV1V2Compatible()` enforces the gate.

---

## Import conventions

```ts
// Namespaced (recommended)
import { BuilderCore } from "@/lib/builder";
type El = BuilderCore.BuilderElement;

// Direct path
import type { BuilderElement } from "@/lib/builder/v2";

// Alias path
import { homeLayoutToBuilderDocument } from "@/lib/builder/core";
```
