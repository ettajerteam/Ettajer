"use client";

import type { DeviceSale } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";
import { homeCard, homeCardPad, homeSubtitle, homeTitle } from "./home-ui";

interface HomeSalesByDeviceProps {
  devices: DeviceSale[];
  currency: string;
}

const DEVICE_COLORS = {
  desktop: "#007AFF",
  mobile: "#34C759",
  tablet: "#FF9500",
} as const;

export function HomeSalesByDevice({ devices, currency }: HomeSalesByDeviceProps) {
  const maxValue = Math.max(...devices.map((device) => device.value), 1);

  return (
    <section className={`${homeCard} ${homeCardPad}`}>
      <h2 className={homeTitle}>Devices</h2>
      <p className={homeSubtitle}>Sales by device type</p>

      <div className="mt-3 space-y-3">
        {devices.map((device) => {
          const color = DEVICE_COLORS[device.id as keyof typeof DEVICE_COLORS] ?? "#007AFF";
          const width = `${(device.value / maxValue) * 100}%`;

          return (
            <div key={device.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-700 dark:text-neutral-200">{device.label}</span>
                <span className="text-neutral-500">
                  {formatCurrency(device.value, currency)} · {device.percentage}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 dark:bg-white/5">
                <div className="h-full rounded-full transition-all" style={{ width, backgroundColor: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
