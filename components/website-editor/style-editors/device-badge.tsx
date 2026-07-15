import { DEVICE_LABELS } from "@/lib/builder/style-system";
import type { DeviceMode } from "@/lib/builder/types";

export function DeviceBadge({ device }: { device: DeviceMode }) {
  return (
    <div className="inline-flex items-center rounded-full border border-[#007AFF]/20 bg-[#007AFF]/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#007AFF]">
      Editing: {DEVICE_LABELS[device]}
    </div>
  );
}
