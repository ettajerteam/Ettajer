"use client";

import type { InspectorElementFocus, InspectorProfile } from "@/lib/builder/inspector-config";
import type { ElementStyleValues } from "@/lib/builder/style-system";
import type { DeviceMode } from "@/lib/builder/types";
import {
  SharedStylePanel,
  emphasizedGroupsForFocus,
  filterGroupsForFocus,
  profileToStyleGroups,
} from "@/components/website-editor/style-editors";

interface InspectorStylePanelProps {
  profile: InspectorProfile;
  focus: InspectorElementFocus;
  settings: Record<string, unknown>;
  device: DeviceMode;
  onChange: (updates: Record<string, unknown>) => void;
  onStylePatch?: (
    patch: Partial<ElementStyleValues>,
    options?: { responsive?: boolean }
  ) => void;
}

const STYLE_ONLY_GROUPS = ["typography", "background", "radius", "shadow", "opacity", "borders"] as const;

export function InspectorStylePanel({
  profile,
  focus,
  settings,
  device,
  onChange,
  onStylePatch,
}: InspectorStylePanelProps) {
  const baseGroups = profileToStyleGroups(profile).filter((g) =>
    (STYLE_ONLY_GROUPS as readonly string[]).includes(g)
  );
  const groups = filterGroupsForFocus(baseGroups, focus);
  const emphasized = emphasizedGroupsForFocus(focus);

  if (groups.length === 0) {
    return <p className="text-sm text-neutral-500">No style options for this section type.</p>;
  }

  return (
    <SharedStylePanel
      settings={settings}
      device={device}
      onChange={onChange}
      onStylePatch={onStylePatch}
      config={{ groups }}
      emphasizedGroups={emphasized}
    />
  );
}
