import type { DeviceMode } from "@/lib/builder/types";
import type { ElementStyleValues } from "@/lib/builder/style-system";

export interface StyleEditorProps {
  device: DeviceMode;
  values: ElementStyleValues;
  settings: Record<string, unknown>;
  onPatch: (patch: Partial<ElementStyleValues>, options?: { responsive?: boolean }) => void;
  emphasized?: boolean;
  clearOverride?: (key: keyof ElementStyleValues) => void;
  /** Unique prefix so Style + Layout tabs (or dual inspectors) never collide. */
  idPrefix?: string;
}

export interface StyleEditorGroupProps extends StyleEditorProps {
  hasOverride?: (key: keyof ElementStyleValues) => boolean;
}

export function styleFieldId(
  idPrefix: string | undefined,
  name: string,
  device: DeviceMode
): string {
  return idPrefix ? `${idPrefix}-${name}-${device}` : `${name}-${device}`;
}

export function readString(values: ElementStyleValues, key: keyof ElementStyleValues): string {
  const v = values[key];
  return typeof v === "string" ? v : "";
}

export function readNumber(values: ElementStyleValues, key: keyof ElementStyleValues): string {
  const v = values[key];
  return typeof v === "number" && Number.isFinite(v) ? String(v) : "";
}
