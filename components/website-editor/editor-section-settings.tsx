"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  LayoutTemplate,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorBlockDesignGallery } from "@/components/website-editor/editor-block-design-gallery";
import { getSectionDefinition, getSectionLabel } from "@/lib/sections/registry";
import type { StoreSection } from "@/lib/sections/types";
import type { InspectorElementFocus } from "@/lib/builder/inspector-config";
import type { ElementStyleValues } from "@/lib/builder/style-system";
import type { DeviceMode } from "@/lib/builder/types";
import { getBlockBySectionType } from "@/lib/builder/block-registry";
import {
  blockHasDesignGallery,
  type BlockDesignPreset,
} from "@/lib/builder/block-design-presets";
import {
  applyDesignPresetSettings,
  type ApplyDesignMode,
} from "@/lib/builder/apply-design-preset";
import { EditorPanelCloseButton } from "@/components/website-editor/editor-collapsible-panel";
import { InspectorPanel } from "./inspector/inspector-panel";
import { toast } from "sonner";

interface EditorSectionSettingsProps {
  section: StoreSection | null;
  sectionIndex?: number;
  device?: DeviceMode;
  inspectorFocus?: InspectorElementFocus;
  onFocusChange?: (focus: InspectorElementFocus) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onChange: (settings: Record<string, unknown>) => void;
  onStylePatch?: (
    patch: Partial<ElementStyleValues>,
    options?: { responsive?: boolean }
  ) => void;
  onToggleVisible?: (visible: boolean) => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onClose?: () => void;
  onOpenBrand?: () => void;
}

function EmptyInspector({
  onClose,
  onOpenBrand,
}: {
  onClose?: () => void;
  onOpenBrand?: () => void;
}) {
  return (
    <div className="space-y-2">
      {onClose ? (
        <div className="flex justify-end">
          <EditorPanelCloseButton side="right" onClick={onClose} />
        </div>
      ) : null}
      <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-5 text-center">
        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-neutral-200">
          <MousePointerClick className="h-4 w-4 text-neutral-400" />
        </div>
        <p className="text-sm font-semibold text-neutral-900">No section selected</p>
        <p className="mt-1 text-xs text-neutral-500">
          Click a section in the preview to edit its content and style.
        </p>
        {onOpenBrand ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 h-9 rounded-lg text-xs"
            onClick={onOpenBrand}
          >
            Edit brand & colors
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function EditorSectionSettings({
  section,
  device = "desktop",
  inspectorFocus = "section",
  onFocusChange,
  canMoveUp = false,
  canMoveDown = false,
  onChange,
  onStylePatch,
  onToggleVisible,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onClose,
  onOpenBrand,
}: EditorSectionSettingsProps) {
  const [designGalleryOpen, setDesignGalleryOpen] = useState(false);

  if (!section) return <EmptyInspector onClose={onClose} onOpenBrand={onOpenBrand} />;

  const def = getSectionDefinition(section.type);
  const block = getBlockBySectionType(section.type);
  const canBrowseDesigns = block ? blockHasDesignGallery(block.id) : false;
  const showQuickActions = onDuplicate || onMoveUp || onMoveDown;

  const handleApplyDesign = (
    preset: BlockDesignPreset,
    options?: { applyMode?: ApplyDesignMode }
  ) => {
    const mode = options?.applyMode ?? "keep-content";
    const current = (section.settings ?? {}) as Record<string, unknown>;
    const next = applyDesignPresetSettings(current, preset.settings, mode);
    onChange(next);
    setDesignGalleryOpen(false);
    toast.success(
      mode === "keep-content"
        ? "Design updated — your text and images were kept"
        : "Design and template copy applied"
    );
  };

  return (
    <div className="space-y-2.5 pb-1">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900">
            {def?.label ?? getSectionLabel(section.type)}
          </p>
          {!section.visible ? (
            <span className="mt-0.5 inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-neutral-500">
              Hidden
            </span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {canBrowseDesigns ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-[#007AFF]"
              onClick={() => setDesignGalleryOpen(true)}
              title="Browse designs"
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
            </Button>
          ) : null}
          {showQuickActions ? (
            <>
              {onDuplicate ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md"
                  onClick={onDuplicate}
                  title="Duplicate"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              ) : null}
              {onMoveUp ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md"
                  onClick={onMoveUp}
                  disabled={!canMoveUp}
                  title="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
              ) : null}
              {onMoveDown ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md"
                  onClick={onMoveDown}
                  disabled={!canMoveDown}
                  title="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </>
          ) : null}
          {onClose ? (
            <EditorPanelCloseButton side="right" onClick={onClose} className="h-7 w-7" />
          ) : null}
        </div>
      </div>

      {canBrowseDesigns ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-full justify-start gap-1.5 rounded-lg text-xs"
          onClick={() => setDesignGalleryOpen(true)}
        >
          <LayoutTemplate className="h-3.5 w-3.5 text-[#007AFF]" />
          {section.type === "product-grid"
            ? "Change design (grid, carousel, list…)"
            : section.type === "features"
              ? "Change design (cards, strip, steps…)"
              : section.type === "featured-collections"
                ? "Change design (grid, carousel, editorial…)"
                : section.type === "cta"
                  ? "Change design (banner, split, card…)"
                  : section.type === "testimonials"
                    ? "Change design (cards, carousel, spotlight…)"
                      : section.type === "faq"
                      ? "Change design (accordion, columns…)"
                      : section.type === "columns"
                        ? "Change design (text, image+text, CTA…)"
                        : section.type.startsWith("product-")
                        ? "Change design (PDP layouts…)"
                        : section.type.startsWith("collection-")
                          ? "Change design (collection layouts…)"
                          : "Browse designs"}
        </Button>
      ) : null}

      <InspectorPanel
        section={section}
        focus={inspectorFocus}
        device={device}
        onFocusChange={onFocusChange ?? (() => {})}
        onChange={onChange}
        onStylePatch={onStylePatch}
        onToggleVisible={onToggleVisible}
      />

      {block ? (
        <EditorBlockDesignGallery
          open={designGalleryOpen}
          blockId={block.id}
          mode="replace"
          onOpenChange={setDesignGalleryOpen}
          onPick={handleApplyDesign}
        />
      ) : null}
    </div>
  );
}
