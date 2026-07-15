"use client";

import type { StyleGroupId, ElementStyleValues } from "@/lib/builder/style-system";
import {
  clearStyleOverride,
  getStyleForDevice,
  hasDeviceOverride,
  patchElementStyle,
} from "@/lib/builder/style-system";
import type { DeviceMode } from "@/lib/builder/types";
import { AnimationEditor } from "./animation-editor";
import { BackgroundEditor } from "./background-editor";
import { BorderEditor } from "./border-editor";
import { DeviceBadge } from "./device-badge";
import { DisplayEditor } from "./display-editor";
import { LayoutEditor } from "./layout-editor";
import { MarginEditor, PaddingEditor, SpacingEditor } from "./spacing-editor";
import { OpacityEditor } from "./opacity-editor";
import { RadiusEditor } from "./radius-editor";
import { ShadowEditor } from "./shadow-editor";
import { SizeEditor } from "./size-editor";
import { TypographyEditor } from "./typography-editor";
import { VisibilityEditor } from "./visibility-editor";
import { AlignmentEditor } from "./alignment-editor";

export interface SharedStylePanelConfig {
  groups: StyleGroupId[];
}

export interface SharedStylePanelProps {
  settings: Record<string, unknown>;
  device: DeviceMode;
  onChange: (settings: Record<string, unknown>) => void;
  /** When set, style patches route through the builder store instead of full settings replacement. */
  onStylePatch?: (
    patch: Partial<ElementStyleValues>,
    options?: { responsive?: boolean }
  ) => void;
  config: SharedStylePanelConfig;
  emphasizedGroups?: StyleGroupId[];
}

const DEFAULT_GROUPS: StyleGroupId[] = [
  "typography",
  "spacing",
  "background",
  "size",
  "radius",
  "shadow",
];

export function SharedStylePanel({
  settings,
  device,
  onChange,
  onStylePatch,
  config,
  emphasizedGroups = [],
}: SharedStylePanelProps) {
  const values = getStyleForDevice(settings, device);
  const groups = config.groups.length > 0 ? config.groups : DEFAULT_GROUPS;

  const hasOverride = (key: keyof ElementStyleValues) =>
    hasDeviceOverride(settings, device, key);

  const clearOverride = (key: keyof ElementStyleValues) => {
    if (onStylePatch) {
      onStylePatch({ [key]: undefined }, { responsive: true });
      return;
    }
    onChange(clearStyleOverride(settings, device, key));
  };

  const onPatch = (
    patch: Partial<ElementStyleValues>,
    options?: { responsive?: boolean }
  ) => {
    if (onStylePatch) {
      onStylePatch(patch, options);
      return;
    }
    onChange(
      patchElementStyle(settings, device, patch, {
        forceResponsive: options?.responsive,
      })
    );
  };

  const editorProps = {
    device,
    values,
    settings,
    onPatch,
    hasOverride,
    clearOverride,
  };

  const isEmphasized = (id: StyleGroupId) => emphasizedGroups.includes(id);

  const editors: Partial<Record<StyleGroupId, React.ReactNode>> = {
    typography: (
      <TypographyEditor
        key="typography"
        {...editorProps}
        emphasized={isEmphasized("typography")}
        hasOverride={hasOverride}
      />
    ),
    spacing: <SpacingEditor key="spacing" {...editorProps} mode="both" hasOverride={hasOverride} />,
    padding: <PaddingEditor key="padding" {...editorProps} hasOverride={hasOverride} />,
    margin: <MarginEditor key="margin" {...editorProps} hasOverride={hasOverride} />,
    background: (
      <BackgroundEditor key="background" {...editorProps} hasOverride={hasOverride} />
    ),
    borders: <BorderEditor key="borders" {...editorProps} />,
    radius: (
      <RadiusEditor
        key="radius"
        {...editorProps}
        emphasized={isEmphasized("radius")}
        hasOverride={hasOverride}
      />
    ),
    size: (
      <SizeEditor
        key="size"
        {...editorProps}
        emphasized={isEmphasized("size")}
        hasOverride={hasOverride}
      />
    ),
    alignment: <AlignmentEditor key="alignment" {...editorProps} hasOverride={hasOverride} />,
    display: <DisplayEditor key="display" {...editorProps} hasOverride={hasOverride} />,
    shadow: <ShadowEditor key="shadow" {...editorProps} hasOverride={hasOverride} />,
    opacity: <OpacityEditor key="opacity" {...editorProps} hasOverride={hasOverride} />,
    animation: <AnimationEditor key="animation" {...editorProps} />,
    visibility: <VisibilityEditor key="visibility" {...editorProps} />,
    layout: <LayoutEditor key="layout" {...editorProps} hasOverride={hasOverride} />,
  };

  const rendered = groups
    .map((group) => editors[group])
    .filter(Boolean);

  if (rendered.length === 0) {
    return <p className="text-sm text-neutral-500">No style options configured.</p>;
  }

  return (
    <div className="space-y-4">
      <DeviceBadge device={device} />
      {rendered}
    </div>
  );
}

/** Maps legacy inspector profile styleGroups to StyleGroupId[] */
export function profileToStyleGroups(profile: {
  styleGroups: {
    typography: boolean;
    colors: boolean;
    background: boolean;
    spacing: boolean;
    size: boolean;
    borderRadius: boolean;
    shadows: boolean;
  };
  advanced?: { animation?: boolean; responsive?: boolean };
  sectionType?: string;
}): StyleGroupId[] {
  const groups: StyleGroupId[] = [];
  if (profile.styleGroups.typography) groups.push("typography");
  if (profile.styleGroups.spacing) groups.push("spacing");
  if (profile.styleGroups.background) groups.push("background");
  if (profile.styleGroups.size) groups.push("size");
  if (profile.styleGroups.borderRadius) groups.push("radius");
  if (profile.styleGroups.shadows) groups.push("shadow");
  if (profile.sectionType === "product-grid") groups.push("layout");
  return groups;
}

/** Layout-focused groups: spacing, sizing, alignment, columns, visibility. */
export function profileToLayoutGroups(profile: {
  styleGroups: {
    spacing: boolean;
    size: boolean;
  };
  advanced?: { visibility?: boolean; responsive?: boolean };
  sectionType?: string;
}): StyleGroupId[] {
  const groups: StyleGroupId[] = [];
  if (profile.styleGroups.spacing) groups.push("spacing");
  if (profile.styleGroups.size) groups.push("size");
  groups.push("alignment", "display");
  if (profile.sectionType === "product-grid") groups.push("layout");
  if (profile.advanced?.visibility !== false) groups.push("visibility");
  return groups;
}

/** Focus-aware group filtering */
export function filterGroupsForFocus(
  groups: StyleGroupId[],
  focus: import("@/lib/builder/inspector-config").InspectorElementFocus
): StyleGroupId[] {
  const emphasizeTypography = focus === "text" || focus === "section";
  const emphasizeImage = focus === "image";
  const emphasizeButton = focus === "button";

  return groups.filter((group) => {
    if (emphasizeImage) {
      return ["background", "spacing", "size", "radius", "shadow", "opacity"].includes(group);
    }
    if (emphasizeButton) {
      return ["typography", "spacing", "radius", "shadow", "background"].includes(group);
    }
    if (focus === "link") {
      return ["typography", "spacing"].includes(group);
    }
    if (!emphasizeTypography && focus !== "section") {
      return !["typography", "alignment"].includes(group);
    }
    return true;
  });
}

export function emphasizedGroupsForFocus(
  focus: import("@/lib/builder/inspector-config").InspectorElementFocus
): StyleGroupId[] {
  if (focus === "text") return ["typography"];
  if (focus === "image") return ["size", "radius"];
  if (focus === "button") return ["typography", "radius"];
  return [];
}
