# Theme / Website Editor — V1 status

**Status: V1 shippable.** Merchants edit and publish via the website editor. Builder V2 and AI are parked.

## Live surface

| Entry | Path |
|-------|------|
| Themes hub | `/dashboard/themes` |
| Website editor | `/dashboard/themes/editor` (desktop only) |

Persistence is **V1 JSON** (`HomeLayout.version: 1`, page content layouts, theme PATCH, navigation PUT). See `lib/builder/ARCHITECTURE.md`.

## Done for V1 wrap-up

- Single editor entry (`WebsiteEditorDesktopOnly` → `WebsiteEditorClient`); legacy `ThemeEditorClient` removed
- Add panel lists **implemented blocks only**; future stubs stay in `lib/builder/blocks/stub-blocks.ts` (unregistered)
- AI “Generate section/page” **hidden** until a real provider ships (`lib/builder/ai/` remains stub)
- Desktop-only gate points to Themes hub + storefront preview
- Revision conflict: **Overwrite & go live** retries publish immediately (no second manual confirm)
- Theme customizer (logo / colors / fonts) publishes via `/api/store/theme` with layouts

## Parked (do not block shipping)

1. **Builder V2** — types/adapters under `lib/builder/v2/`; not the production persistence path
2. **AI generate** — stub provider only; restore UI when LLM is wired
3. **Phone editing** — preview device frames only; editing stays desktop
4. **Deferred blocks** — `container`, `custom-html` in stub-blocks

## Smoke checklist (manual)

1. Open `/dashboard/themes` → Customize / Edit website
2. Change accent color + font → Go live → confirm live storefront
3. Add a section → draft autosave → Preview → Discard
4. Edit home, product, collection, blog templates → publish each
5. Desktop / tablet / mobile preview frames match live store
6. On a phone-width viewport, editor shows Themes gate (not a broken shell)

## Verify before release

```bash
npx tsx lib/builder/verify.ts
npx tsc --noEmit
```
