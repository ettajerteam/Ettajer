"use client";

import type { LucideIcon } from "lucide-react";
import { SettingsPanel } from "@/components/settings/settings-panel";
import {
  SettingsRelatedCard,
  SettingsRelatedLink,
} from "@/components/settings/settings-related-link";
import type { SettingsTab } from "@/components/settings/settings-nav";

type ComingSoonConfig = {
  title: string;
  description: string;
  body: string;
  bullets: string[];
  related?: {
    tab: SettingsTab;
    label: string;
  };
  icon: LucideIcon;
};

export function SettingsComingSoonPanel({ config }: { config: ComingSoonConfig }) {
  const Icon = config.icon;

  return (
    <SettingsPanel title={config.title} description={config.description}>
      <div className="overflow-hidden rounded-[10px] border border-dashed border-black/[0.08] bg-[#FAFAFA]/80 dark:border-white/15 dark:bg-white/[0.02]">
        <div className="flex items-start gap-3 px-3.5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#007AFF]/10 text-[#007AFF]">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
              Coming soon
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-neutral-500">
              {config.body}
            </p>
            <ul className="mt-3 space-y-1.5">
              {config.bullets.map((b) => (
                <li
                  key={b}
                  className="flex gap-2 text-[12px] text-neutral-600 dark:text-neutral-400"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {config.related ? (
        <SettingsRelatedCard className="rounded-[10px] px-3.5 py-3 text-[12px]">
          Meanwhile, configure{" "}
          <SettingsRelatedLink tab={config.related.tab}>
            {config.related.label}
          </SettingsRelatedLink>
          .
        </SettingsRelatedCard>
      ) : null}
    </SettingsPanel>
  );
}
