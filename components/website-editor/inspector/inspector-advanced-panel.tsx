"use client";

import { useId } from "react";
import { ANIMATION_OPTIONS, type InspectorProfile } from "@/lib/builder/inspector-config";
import type { DeviceMode } from "@/lib/builder/types";
import {
  DEVICE_LABELS,
  getDeviceStyles,
  updateDeviceStyle,
} from "@/lib/builder/responsive-styles";
import type { StoreSection } from "@/lib/sections/types";
import {
  InspectorFieldGroup,
  InspectorSelectField,
  InspectorTextField,
  InspectorToggleField,
} from "./inspector-fields";

interface InspectorAdvancedPanelProps {
  section: StoreSection;
  profile: InspectorProfile;
  settings: Record<string, unknown>;
  sectionLabel: string;
  device: DeviceMode;
  onChange: (updates: Record<string, unknown>) => void;
  onToggleVisible?: (visible: boolean) => void;
}

export function InspectorAdvancedPanel({
  section,
  profile,
  settings,
  sectionLabel,
  device,
  onChange,
  onToggleVisible,
}: InspectorAdvancedPanelProps) {
  const idPrefix = useId().replace(/:/g, "");
  const fid = (name: string) => `${idPrefix}-${name}`;
  const { advanced } = profile;
  const deviceStyles = getDeviceStyles(settings, device);
  const isVisibleOnDevice = deviceStyles.visible !== false;

  const patchDevice = (patch: Record<string, unknown>) => {
    onChange(updateDeviceStyle(settings, device, patch));
  };

  return (
    <div className="space-y-4">
      {advanced.visibility && onToggleVisible ? (
        <InspectorFieldGroup title="Visibility">
          <InspectorToggleField
            id={fid("section-visible")}
            label="Show on storefront"
            description="Hidden sections remain in the editor but not on the live store"
            checked={section.visible}
            onChange={onToggleVisible}
          />
        </InspectorFieldGroup>
      ) : null}

      {advanced.responsive ? (
        <InspectorFieldGroup
          title="Responsive"
          description={`Control visibility on ${DEVICE_LABELS[device].toLowerCase()}`}
        >
          <InspectorToggleField
            id={fid(`visible-${device}`)}
            label={`Visible on ${DEVICE_LABELS[device].toLowerCase()}`}
            checked={isVisibleOnDevice}
            onChange={(v) => {
              const next = updateDeviceStyle(settings, device, { visible: v });
              // Clear legacy flags when migrating to per-device visibility.
              if (device === "mobile" && settings.hideOnMobile === true) {
                onChange({ ...next, hideOnMobile: undefined });
              } else if (device === "desktop" && settings.hideOnDesktop === true) {
                onChange({ ...next, hideOnDesktop: undefined });
              } else {
                onChange(next);
              }
            }}
          />
          {device === "mobile" && settings.hideOnMobile === true ? (
            <p className="text-[11px] text-neutral-400">
              Legacy &quot;Hide on mobile&quot; is active. Toggle above to migrate to per-device
              styles.
            </p>
          ) : null}
          {device === "desktop" && settings.hideOnDesktop === true ? (
            <p className="text-[11px] text-neutral-400">
              Legacy &quot;Hide on desktop&quot; is active. Toggle above to migrate to per-device
              styles.
            </p>
          ) : null}
        </InspectorFieldGroup>
      ) : null}

      {advanced.animation ? (
        <InspectorFieldGroup title="Animation">
          <InspectorSelectField
            id={fid("animation")}
            label="Entrance animation"
            value={(settings.animation as string) ?? "none"}
            options={ANIMATION_OPTIONS}
            onChange={(v) => onChange({ animation: v === "none" ? undefined : v })}
          />
          <InspectorTextField
            id={fid("animation-delay")}
            label="Delay (ms)"
            value={settings.animationDelayMs != null ? String(settings.animationDelayMs) : ""}
            placeholder="0"
            onChange={(v) => {
              const n = parseInt(v, 10);
              onChange({ animationDelayMs: Number.isFinite(n) ? n : undefined });
            }}
          />
        </InspectorFieldGroup>
      ) : null}

      {advanced.customClass ? (
        <InspectorFieldGroup title="Custom classes">
          <InspectorTextField
            id={fid("custom-class")}
            label="CSS classes"
            value={(settings.customClass as string) ?? ""}
            placeholder="my-class another-class"
            onChange={(v) => onChange({ customClass: v || undefined })}
          />
        </InspectorFieldGroup>
      ) : null}

      <InspectorFieldGroup title="Section details">
        <dl className="space-y-2 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-400">Type</dt>
            <dd className="font-medium text-neutral-700">{sectionLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-400">Visibility</dt>
            <dd className="font-medium text-neutral-700">{section.visible ? "Visible" : "Hidden"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-400">Device</dt>
            <dd className="font-medium text-neutral-700">{DEVICE_LABELS[device]}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-400">Section ID</dt>
            <dd className="truncate font-mono text-[10px] text-neutral-500">{section.id}</dd>
          </div>
        </dl>
      </InspectorFieldGroup>
    </div>
  );
}
