"use client";

import { LayoutGrid, Settings2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBlockBySectionType } from "@/lib/builder/block-registry";
import { getInspectorProfile, type InspectorElementFocus } from "@/lib/builder/inspector-config";
import { hasSchemaFields } from "@/lib/builder/schema-inspector-utils";
import type { ElementStyleValues } from "@/lib/builder/style-system";
import type { DeviceMode } from "@/lib/builder/types";
import type { StoreSection } from "@/lib/sections/types";
import { dashboardKicker, dashboardSubtitle } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import { SchemaDrivenInspector } from "@/components/website-editor/schema-inspector";
import { InspectorFocusPills } from "./inspector-focus-pills";
import { InspectorContentPanel } from "./inspector-content-panel";
import { InspectorStylePanel } from "./inspector-style-panel";
import { InspectorLayoutPanel } from "./inspector-layout-panel";
import { InspectorAdvancedPanel } from "./inspector-advanced-panel";

interface InspectorPanelProps {
  section: StoreSection;
  focus: InspectorElementFocus;
  device: DeviceMode;
  onFocusChange: (focus: InspectorElementFocus) => void;
  onChange: (settings: Record<string, unknown>) => void;
  onStylePatch?: (
    patch: Partial<ElementStyleValues>,
    options?: { responsive?: boolean }
  ) => void;
  onToggleVisible?: (visible: boolean) => void;
}

export function InspectorPanel({
  section,
  focus,
  device,
  onFocusChange,
  onChange,
  onStylePatch,
  onToggleVisible,
}: InspectorPanelProps) {
  const block = getBlockBySectionType(section.type);
  const profile = getInspectorProfile(section.type);
  const settings = section.settings as Record<string, unknown>;
  const useSchema = hasSchemaFields(block);

  if (useSchema && block) {
    return (
      <div className="space-y-4">
        <div>
          <p className={dashboardKicker}>{block.name}</p>
          <p className={cn("mt-0.5", dashboardSubtitle)}>{block.description}</p>
        </div>
        <SchemaDrivenInspector
          block={block}
          section={section}
          focus={focus}
          device={device}
          onFocusChange={onFocusChange}
          onChange={onChange}
          onStylePatch={onStylePatch}
          onToggleVisible={onToggleVisible}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className={dashboardKicker}>{profile.elementLabel}</p>
        <p className={cn("mt-0.5", dashboardSubtitle)}>
          Edit content, style, layout, and advanced options for this block.
        </p>
      </div>

      <InspectorFocusPills
        focuses={profile.focuses}
        value={focus}
        onChange={onFocusChange}
      />

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid h-9 w-full grid-cols-4 rounded-lg bg-neutral-100 p-0.5">
          <TabsTrigger value="content" className="rounded-md text-xs">
            Content
          </TabsTrigger>
          <TabsTrigger value="style" className="rounded-md text-xs">
            Style
          </TabsTrigger>
          <TabsTrigger value="layout" className="gap-1 rounded-md text-xs">
            <LayoutGrid className="h-3 w-3" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-1 rounded-md text-xs">
            <Settings2 className="h-3 w-3" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="editor-tab-content mt-4">
          <InspectorContentPanel
            sectionType={section.type}
            profile={profile}
            focus={focus}
            settings={settings}
            onChange={onChange}
          />
        </TabsContent>

        <TabsContent value="style" className="editor-tab-content mt-4">
          <InspectorStylePanel
            profile={profile}
            focus={focus}
            settings={settings}
            device={device}
            onChange={onChange}
            onStylePatch={onStylePatch}
          />
        </TabsContent>

        <TabsContent value="layout" className="editor-tab-content mt-4">
          <InspectorLayoutPanel
            profile={profile}
            focus={focus}
            settings={settings}
            device={device}
            onChange={onChange}
            onStylePatch={onStylePatch}
          />
        </TabsContent>

        <TabsContent value="advanced" className="editor-tab-content mt-4">
          <InspectorAdvancedPanel
            section={section}
            profile={profile}
            settings={settings}
            sectionLabel={profile.label}
            device={device}
            onChange={onChange}
            onToggleVisible={onToggleVisible}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
