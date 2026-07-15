"use client";

import { LayoutGrid, Settings2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SettingFieldSchema, InspectorTab } from "@/lib/builder/block-schema";
import type { InspectorElementFocus } from "@/lib/builder/inspector-config";
import type { StyleGroupId, ElementStyleValues } from "@/lib/builder/style-system";
import {
  filterFieldsByFocus,
  getSchemaFieldsForTab,
  getSchemaInspectorFocuses,
  hasSchemaFields,
  schemaHasTab,
} from "@/lib/builder/schema-inspector-utils";
import type { DeviceMode } from "@/lib/builder/types";
import { DEVICE_LABELS } from "@/lib/builder/responsive-styles";
import type { BlockDefinition } from "@/lib/builder/types";
import type { StoreSection } from "@/lib/sections/types";
import { InspectorFocusPills } from "./inspector/inspector-focus-pills";
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

  const groups = groupFields(fields);

  return (
    <div className="space-y-4">
      {showDeviceBadge ? (
        <div className="inline-flex items-center rounded-full border border-[#007AFF]/20 bg-[#007AFF]/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#007AFF]">
          Editing: {DEVICE_LABELS[device]}
        </div>
      ) : null}
      {Array.from(groups.entries()).map(([group, groupFields]) => (
        <InspectorFieldGroup
          key={group}
          title={formatGroupLabel(group)}
          description={
            groupFields.some((f) => f.responsive || f.deviceAware)
              ? `Per-device overrides apply on ${DEVICE_LABELS[device].toLowerCase()}`
              : groupFields[0]?.description
          }
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
          showDeviceBadge={groups.length === 0}
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
          showDeviceBadge={groups.length === 0}
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
  focus,
  device,
  onFocusChange,
  onChange,
  onStylePatch,
  onToggleVisible,
}: SchemaDrivenInspectorProps) {
  const settings = section.settings as Record<string, unknown>;
  const schema = block.settingsSchema;
  const focuses = getSchemaInspectorFocuses(block);

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

  const fieldsForTab = (tab: InspectorTab) =>
    filterFieldsByFocus(getSchemaFieldsForTab(schema, tab), tab, focus);

  return (
    <div className="space-y-4">
      <InspectorFocusPills focuses={focuses} value={focus} onChange={onFocusChange} />

      <Tabs defaultValue="content" className="w-full">
        <TabsList className={`grid h-9 w-full rounded-lg bg-neutral-100 p-0.5 ${gridClass}`}>
          {visibleTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-1 rounded-md text-xs">
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {visibleTabs.some((t) => t.id === "content") ? (
          <TabsContent value="content" className="editor-tab-content mt-4">
            <SchemaFieldGroups
              fields={fieldsForTab("content")}
              settings={settings}
              device={device}
              onChange={onChange}
              emptyMessage="No content fields for this focus. Try another element tab above."
            />
          </TabsContent>
        ) : null}

        {visibleTabs.some((t) => t.id === "style") ? (
          <TabsContent value="style" className="editor-tab-content mt-4">
            <SchemaStyleTab
              styleFields={fieldsForTab("style")}
              settings={settings}
              device={device}
              focus={focus}
              onChange={onChange}
              onStylePatch={onStylePatch}
            />
          </TabsContent>
        ) : null}

        {visibleTabs.some((t) => t.id === "layout") ? (
          <TabsContent value="layout" className="editor-tab-content mt-4">
            <SchemaLayoutTab
              layoutFields={fieldsForTab("layout")}
              settings={settings}
              device={device}
              focus={focus}
              onChange={onChange}
              onStylePatch={onStylePatch}
            />
          </TabsContent>
        ) : null}

        {visibleTabs.some((t) => t.id === "advanced") ? (
          <TabsContent value="advanced" className="editor-tab-content mt-4">
            <div className="space-y-4">
              {onToggleVisible ? (
                <InspectorFieldGroup title="Visibility">
                  <InspectorToggleField
                    id="section-visible"
                    label="Show on storefront"
                    description="Hidden sections remain in the editor but not on the live store"
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

              <InspectorFieldGroup title="Section details" collapsible={false}>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-400">Block</dt>
                    <dd className="font-medium text-neutral-700">{block.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-400">Focus</dt>
                    <dd className="font-medium capitalize text-neutral-700">{focus}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-400">Device</dt>
                    <dd className="font-medium text-neutral-700">{DEVICE_LABELS[device]}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-400">Section ID</dt>
                    <dd className="truncate font-mono text-[10px] text-neutral-500">
                      {section.id}
                    </dd>
                  </div>
                </dl>
              </InspectorFieldGroup>
            </div>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
