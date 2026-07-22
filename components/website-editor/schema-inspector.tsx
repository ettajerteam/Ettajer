"use client";

import { useId } from "react";
import { LayoutGrid, Settings2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SettingFieldSchema, InspectorTab } from "@/lib/builder/block-schema";
import { fieldMatchesShowWhen } from "@/lib/builder/block-schema";
import type { InspectorElementFocus } from "@/lib/builder/inspector-config";
import type { StyleGroupId, ElementStyleValues } from "@/lib/builder/style-system";
import {
  getSchemaFieldsForTab,
  hasSchemaFields,
  schemaHasTab,
} from "@/lib/builder/schema-inspector-utils";
import type { DeviceMode } from "@/lib/builder/types";
import { DEVICE_LABELS } from "@/lib/builder/responsive-styles";
import type { BlockDefinition } from "@/lib/builder/types";
import type { StoreSection } from "@/lib/sections/types";
import { InspectorFieldGroup, InspectorToggleField } from "./inspector/inspector-fields";
import { SchemaField, SchemaFieldRenderer } from "./inspector/field-renderer";
import {
  SharedStylePanel,
  emphasizedGroupsForFocus,
} from "./style-editors";

export { hasSchemaFields, SchemaFieldRenderer };

interface SchemaDrivenInspectorProps {
  block: BlockDefinition;
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

function groupFields(fields: SettingFieldSchema[]): Map<string, SettingFieldSchema[]> {
  const groups = new Map<string, SettingFieldSchema[]>();
  for (const field of fields) {
    const group = field.group ?? "general";
    const list = groups.get(group) ?? [];
    list.push(field);
    groups.set(group, list);
  }
  return groups;
}

function formatGroupLabel(group: string): string {
  return group.charAt(0).toUpperCase() + group.slice(1).replace(/-/g, " ");
}

function SchemaFieldGroups({
  fields,
  settings,
  device,
  onChange,
  showDeviceBadge,
  emptyMessage = "No fields for this focus.",
  collapsible = true,
}: {
  fields: SettingFieldSchema[];
  settings: Record<string, unknown>;
  device: DeviceMode;
  onChange: (settings: Record<string, unknown>) => void;
  showDeviceBadge?: boolean;
  emptyMessage?: string;
  collapsible?: boolean;
}) {
  if (fields.length === 0) {
    return emptyMessage ? (
      <p className="text-sm text-neutral-500">{emptyMessage}</p>
    ) : null;
  }

  const groups = groupFields(
    fields.filter((field) => fieldMatchesShowWhen(field, settings))
  );

  return (
    <div className="space-y-3">
      {showDeviceBadge ? (
        <div className="inline-flex items-center rounded-full border border-[#007AFF]/20 bg-[#007AFF]/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#007AFF]">
          Editing: {DEVICE_LABELS[device]}
        </div>
      ) : null}
      {Array.from(groups.entries()).map(([group, groupFields]) => (
        <InspectorFieldGroup
          key={group}
          title={formatGroupLabel(group)}
          collapsible={collapsible}
          defaultOpen
        >
          {groupFields.map((field) => (
            <SchemaField
              key={field.key}
              field={field}
              settings={settings}
              device={device}
              onChange={onChange}
            />
          ))}
        </InspectorFieldGroup>
      ))}
    </div>
  );
}

function SchemaStyleTab({
  styleFields,
  settings,
  device,
  focus,
  onChange,
  onStylePatch,
}: {
  styleFields: SettingFieldSchema[];
  settings: Record<string, unknown>;
  device: DeviceMode;
  focus: InspectorElementFocus;
  onChange: (settings: Record<string, unknown>) => void;
  onStylePatch?: (
    patch: Partial<ElementStyleValues>,
    options?: { responsive?: boolean }
  ) => void;
}) {
  const styleGroupFields = styleFields.filter((f) => f.type === "styleGroup" && f.styleGroup);
  const legacyFields = styleFields.filter((f) => f.type !== "styleGroup");

  const groups = styleGroupFields
    .map((f) => f.styleGroup)
    .filter(Boolean) as StyleGroupId[];

  if (groups.length === 0 && legacyFields.length === 0) {
    return <p className="text-sm text-neutral-500">No style options for this focus.</p>;
  }

  return (
    <div className="space-y-4">
      {groups.length > 0 ? (
        <SharedStylePanel
          settings={settings}
          device={device}
          onChange={onChange}
          onStylePatch={onStylePatch}
          config={{ groups }}
          emphasizedGroups={emphasizedGroupsForFocus(focus)}
        />
      ) : null}
      {legacyFields.length > 0 ? (
        <SchemaFieldGroups
          fields={legacyFields}
          settings={settings}
          device={device}
          onChange={onChange}
          showDeviceBadge
          emptyMessage=""
        />
      ) : null}
    </div>
  );
}

function SchemaLayoutTab({
  layoutFields,
  settings,
  device,
  focus,
  onChange,
  onStylePatch,
}: {
  layoutFields: SettingFieldSchema[];
  settings: Record<string, unknown>;
  device: DeviceMode;
  focus: InspectorElementFocus;
  onChange: (settings: Record<string, unknown>) => void;
  onStylePatch?: (
    patch: Partial<ElementStyleValues>,
    options?: { responsive?: boolean }
  ) => void;
}) {
  const styleGroupFields = layoutFields.filter((f) => f.type === "styleGroup" && f.styleGroup);
  const legacyFields = layoutFields.filter((f) => f.type !== "styleGroup");

  const groups = styleGroupFields
    .map((f) => f.styleGroup)
    .filter(Boolean) as StyleGroupId[];

  if (groups.length === 0 && legacyFields.length === 0) {
    return <p className="text-sm text-neutral-500">No layout options for this focus.</p>;
  }

  return (
    <div className="space-y-4">
      {groups.length > 0 ? (
        <SharedStylePanel
          settings={settings}
          device={device}
          onChange={onChange}
          onStylePatch={onStylePatch}
          config={{ groups }}
          emphasizedGroups={emphasizedGroupsForFocus(focus)}
        />
      ) : null}
      {legacyFields.length > 0 ? (
        <SchemaFieldGroups
          fields={legacyFields}
          settings={settings}
          device={device}
          onChange={onChange}
          showDeviceBadge
          emptyMessage=""
        />
      ) : null}
    </div>
  );
}

const INSPECTOR_TABS: { id: InspectorTab; label: string; icon?: React.ReactNode }[] = [
  { id: "content", label: "Content" },
  { id: "style", label: "Style" },
  { id: "layout", label: "Layout", icon: <LayoutGrid className="h-3 w-3" /> },
  { id: "advanced", label: "Advanced", icon: <Settings2 className="h-3 w-3" /> },
];

export function SchemaDrivenInspector({
  block,
  section,
  device,
  onChange,
  onStylePatch,
  onToggleVisible,
}: SchemaDrivenInspectorProps) {
  const settings = section.settings as Record<string, unknown>;
  const schema = block.settingsSchema;
  const sectionVisibleId = `section-visible-${useId().replace(/:/g, "")}`;

  const visibleTabs = INSPECTOR_TABS.filter((tab) => {
    if (tab.id === "advanced") {
      return schemaHasTab(schema, "advanced") || Boolean(onToggleVisible);
    }
    return schemaHasTab(schema, tab.id);
  });

  const tabCount = visibleTabs.length;
  const gridClass =
    tabCount >= 4
      ? "grid-cols-4"
      : tabCount === 3
        ? "grid-cols-3"
        : tabCount === 2
          ? "grid-cols-2"
          : "grid-cols-1";

  // Always show full field sets — don't hide controls behind Edit Focus.
  const fieldsForTab = (tab: InspectorTab) => getSchemaFieldsForTab(schema, tab);

  return (
    <Tabs defaultValue="content" className="flex w-full flex-col gap-0">
      <TabsList className={`grid h-8 w-full shrink-0 rounded-lg bg-neutral-100 p-0.5 ${gridClass}`}>
        {visibleTabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="gap-1 rounded-md text-xs">
            {tab.icon}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {visibleTabs.some((t) => t.id === "content") ? (
        <TabsContent value="content" className="!mt-2 space-y-0 outline-none">
          <SchemaFieldGroups
            fields={fieldsForTab("content")}
            settings={settings}
            device={device}
            onChange={onChange}
            emptyMessage="No content fields for this section."
            collapsible={false}
          />
        </TabsContent>
      ) : null}

      {visibleTabs.some((t) => t.id === "style") ? (
        <TabsContent value="style" className="!mt-2 outline-none">
          <SchemaStyleTab
            styleFields={fieldsForTab("style")}
            settings={settings}
            device={device}
            focus="section"
            onChange={onChange}
            onStylePatch={onStylePatch}
          />
        </TabsContent>
      ) : null}

      {visibleTabs.some((t) => t.id === "layout") ? (
        <TabsContent value="layout" className="!mt-2 outline-none">
          <SchemaLayoutTab
            layoutFields={fieldsForTab("layout")}
            settings={settings}
            device={device}
            focus="section"
            onChange={onChange}
            onStylePatch={onStylePatch}
          />
        </TabsContent>
      ) : null}

      {visibleTabs.some((t) => t.id === "advanced") ? (
        <TabsContent value="advanced" className="!mt-2 outline-none">
          <div className="space-y-3">
            {onToggleVisible ? (
              <InspectorFieldGroup title="Visibility">
                <InspectorToggleField
                  id={sectionVisibleId}
                  label="Show on storefront"
                  description="Hidden sections stay in the editor but not on the live store"
                  checked={section.visible}
                  onChange={onToggleVisible}
                />
              </InspectorFieldGroup>
            ) : null}

            <SchemaFieldGroups
              fields={fieldsForTab("advanced")}
              settings={settings}
              device={device}
              onChange={onChange}
              emptyMessage=""
              collapsible={false}
            />
          </div>
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
