"use client";

import { LayoutGrid, Settings2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBlockBySectionType } from "@/lib/builder/block-registry";
import type { InspectorElementFocus } from "@/lib/builder/inspector-config";
import { getInspectorProfile } from "@/lib/builder/inspector-config";
import { hasSchemaFields } from "@/lib/builder/schema-inspector-utils";
import type { ElementStyleValues } from "@/lib/builder/style-system";
import type { DeviceMode } from "@/lib/builder/types";
import type { StoreSection } from "@/lib/sections/types";
import { SchemaDrivenInspector } from "@/components/website-editor/schema-inspector";
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
    );
  }

  return (
    <Tabs defaultValue="content" className="flex w-full flex-col gap-0">
      <TabsList className="grid h-8 w-full shrink-0 grid-cols-3 rounded-lg bg-neutral-100 p-0.5">
        <TabsTrigger value="content" className="rounded-md text-xs">
          Content
        </TabsTrigger>
        <TabsTrigger value="style" className="rounded-md text-xs">
          Style
        </TabsTrigger>
        <TabsTrigger value="more" className="gap-1 rounded-md text-xs">
          <Settings2 className="h-3 w-3" />
          More
        </TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="!mt-2 space-y-0 outline-none">
        <InspectorContentPanel
          sectionType={section.type}
          profile={profile}
          focus="section"
          settings={settings}
          onChange={onChange}
          showAll
        />
      </TabsContent>

      <TabsContent value="style" className="!mt-2 outline-none">
        <InspectorStylePanel
          profile={profile}
          focus={focus === "section" ? "section" : focus}
          settings={settings}
          device={device}
          onChange={onChange}
          onStylePatch={onStylePatch}
        />
      </TabsContent>

      <TabsContent value="more" className="!mt-2 space-y-4 outline-none">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            <LayoutGrid className="h-3 w-3" />
            Layout
          </p>
          <InspectorLayoutPanel
            profile={profile}
            focus="section"
            settings={settings}
            device={device}
            onChange={onChange}
            onStylePatch={onStylePatch}
          />
        </div>
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
  );
}
