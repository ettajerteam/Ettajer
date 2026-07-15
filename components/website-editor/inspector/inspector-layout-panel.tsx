"use client";

import type { InspectorElementFocus, InspectorProfile } from "@/lib/builder/inspector-config";
import type { ElementStyleValues } from "@/lib/builder/style-system";
import type { DeviceMode } from "@/lib/builder/types";
import {
  SharedStylePanel,
  emphasizedGroupsForFocus,
  filterGroupsForFocus,
  profileToLayoutGroups,
} from "@/components/website-editor/style-editors";

interface InspectorLayoutPanelProps {
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

export function InspectorLayoutPanel({
  profile,
  focus,
  settings,
  device,
  onChange,
  onStylePatch,
}: InspectorLayoutPanelProps) {
  const groups = filterGroupsForFocus(profileToLayoutGroups(profile), focus);

  if (groups.length === 0) {
    return <p className="text-sm text-neutral-500">No layout options for this section type.</p>;
  }

  return (
    <SharedStylePanel
      settings={settings}
      device={device}
      onChange={onChange}
      onStylePatch={onStylePatch}
      config={{ groups }}
      emphasizedGroups={emphasizedGroupsForFocus(focus)}
    />
  );
}
