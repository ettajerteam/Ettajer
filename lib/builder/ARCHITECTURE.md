# Ettajer Website Builder — Architecture (V1 + V2)

The builder lives under `lib/builder/` and coexists with the production V1 editor. Merchants continue editing and publishing via **V1 JSON** (`HomeLayout.version: 1`). V2 adds scalable types, registry-driven blocks, and improved canvas interactions **without** a rewrite.

## Module map

| Module | Path | Role |
|--------|------|------|
| **Types** | `types.ts`, `editor-types.ts`, `block-schema.ts` | V1 editor + block schema types |
| **Builder Core V2** | `v2/` (`BuilderCore` export) | Element tree, styles, selection, history — future-native |
| **Block Registry** | `block-registry-service.ts`, `blocks/` | `register()`, `get()`, `getAll()`, `getByCategory()` |
| **Builder Store** | `central-builder-store.ts` | Single Zustand store (layout, selection, canvas, drag, history) |
| **Builder Renderer** | `renderer.ts` → `resolve-block.ts` + `RegistryBlockRenderer` | Registry lookup; no hardcoded section switches |
| **Builder Adapter** | `adapter.ts`, `legacy-adapter.ts`, `v2/adapters/` | V1 ↔ V2 ↔ builder document conversion |
| **Bridge events** | `events.ts` | Typed `postMessage` protocol (editor ↔ preview iframe) |
| **Canvas utils** | `canvas-interactions.ts`, `layer-tree.ts` | Snap guides, spacing, pan/zoom helpers |
| **Compat** | `compat.ts`, `verify.ts` | Round-trip + core block verification |

## UI integration (unchanged features)

| Surface | Component | Store / API |
|---------|-----------|-------------|
| Website editor shell | `website-editor-client.tsx` | `useCentralBuilderStore`, `useThemeStore` |
| Canvas | `builder-canvas.tsx`, `builder-canvas-overlay.tsx` | zoom, pan, drag ghost, auto-scroll |
| Add panel | `builder-add-panel.tsx` | `blockRegistry.getAll()`, categories, favorites |
| Layers | `editor-layers-panel.tsx` | `selectLayer`, `reorderSections` |
| Inspector | `schema-inspector.tsx` | block `settingsSchema` |
| Preview iframe | `builder-section-bridge.tsx` | `events.ts` message types |
| Storefront render | `section-renderer.tsx` | `RegistryBlockRenderer` |
| Pages / Theme / Publish | existing panels + APIs | unchanged |

## Block Registry (five core blocks)

Registered at module init via `registerAllBlocks(blockRegistry)`:

- **Hero** (`hero`)
- **Featured Collections** (`collection-banner`)
- **Product Grid** (`product-grid`)
- **Rich Text** (`rich-text`)
- **Footer** (`footer`)

Each block defines: `id`, `name`, `category`, `icon`, `thumbnail`, `description`, `defaultContent`, `defaultStyles`, `settingsSchema`, `component`, `legacySectionType`.

Extension blocks (image, marketing stubs, product/collection templates) register the same way without touching core renderer logic.

## V1 persistence (production)

```
StoreSettings.homeLayout  →  HomeLayout { version: 1, sections[] }
StorePage.content         →  embedded layout JSON for custom pages
```

Publish APIs write the same JSON shape. V2 adapters run **in memory only** until a future persistence phase.

## V2 foundation (opt-in)

See `v2/ARCHITECTURE.md` and `v2/MIGRATION.md` for:

- `BuilderElement`, `BuilderSection`, `BuilderPage`, `BuilderStyle`, `ResponsiveStyle`
- `homeLayoutToV2` / `v2ToHomeLayout` round-trip gates
- Phased rollout (types → adapters → store → renderer → UI)

## Event-driven iframe bridge

**Parent → iframe:** `ettajer:preview-device`, `ettajer:focus-section`, `ettajer:drag-block`

**Iframe → parent:** `ettajer:select-section`, `ettajer:hover-section`, `ettajer:drag-insert`, `ettajer:drop-block`, snap/spacing overlays (DOM in iframe)

Typed definitions: `lib/builder/events.ts`

## Backward compatibility rules

1. Never remove V1 types or `SECTION_REGISTRY` fallbacks.
2. Prefer `legacy-adapter` + `createSectionFromBlock` for insertion.
3. Renderer always tries `resolveSectionBlock()` before placeholders.
4. Run `npx tsx lib/builder/verify.ts` before release.

## Public API

```ts
import {
  blockRegistry,
  useCentralBuilderStore,
  resolveSectionBlock,
  BuilderCore,
} from "@/lib/builder";

import { runBuilderCompatChecks } from "@/lib/builder/compat";
```

## Adding a new block (future)

1. Add `my-block.block.ts` metadata + `my-block.tsx` component.
2. Register in `blocks/register.ts`.
3. Optionally add `legacySectionType` for V1 layout storage.
4. No changes to `section-renderer.tsx` switch logic (there is none).
