# Builder Components

Reusable user-composite components for the Ettajer website builder. Components are **separate from BlockRegistry** (primitives vs user composites).

## Data model

```ts
interface BuilderComponent {
  id: string;
  storeId: string;
  name: string;
  root: ComponentRoot; // { kind: "sections", sections: StoreSection[] }
  version: number;
  metadata?: { author?, tags?, isPublic?, marketplaceId?, price? };
}
```

**Layout references** — linked instances store metadata in `section.settings._componentRef`:

```ts
interface ComponentInstanceRef {
  componentId: string;
  instanceId: string;
  sectionIndex: number;
  detached?: boolean;
  overrides?: Record<string, unknown>;
}
```

Multi-section components share one `instanceId` across sibling sections.

## Store APIs (`useComponentStore`)

| Action | Description |
|--------|-------------|
| `saveSelectionAsComponent(name, selectionIds, layout)` | Capture section(s) as component root |
| `insertComponent(componentId, layout, index?)` | Place linked instance(s) on page |
| `detachComponent(instanceId, layout)` | Inline resolved content, remove link |
| `updateComponent(componentId, patch)` | Global edit — propagates on next resolve |
| `getComponentInstances(componentId, layout)` | List instance IDs in layout |
| `syncComponentSectionFromLayout(...)` | Push master edit from layout section |

## Rendering

`resolveLayoutSections(sections, components)` expands linked instances before render. Detached instances use local settings only. Nested components resolve recursively with cycle detection.

## Persistence

- **Prisma**: `BuilderComponent` table (`root` JSON, store-scoped)
- **API**: `GET/POST /api/components`, `GET/PATCH/DELETE /api/components/[id]`
- **Editor**: Zustand `useComponentStore` synced via API

## UI entry points

- **Save as component**: Layers panel section context menu
- **Component library**: Add panel → Components tab
- **Detach**: Layers panel dropdown on linked instances
- **Global edit banner**: Shown when `editingComponentId` is set

## Marketplace hooks

- `BuilderComponent.metadata` — author, tags, isPublic, marketplaceId, price
- `exportComponent` / `importComponent` — JSON bundle format (`ettajer-component` v1)
- `ComponentRegistry` interface — future marketplace catalog separate from blocks

## Limitations (Phase 1)

- Component root is V1 `StoreSection[]` only (element-tree roots reserved for V2)
- Live storefront does not auto-load component definitions; republish after global edits
- No Prisma migration bundled — run `npx prisma migrate dev` to enable API persistence
- Overrides are shallow merges on section settings

## V1 compatibility

Existing layouts unchanged. `_componentRef` is an optional settings key ignored by parse/serialize. Component instances use standard section types for fallback rendering.
