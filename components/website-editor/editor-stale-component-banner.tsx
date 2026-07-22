"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  bumpPinnedVersions,
  findStaleComponentInstances,
} from "@/lib/builder/components";
import type { BuilderComponent } from "@/lib/builder/components";
import type { HomeLayout } from "@/lib/sections/types";

export interface EditorStaleComponentBannerProps {
  draftLayout: HomeLayout;
  components: Record<string, BuilderComponent>;
  onReplaceDraftLayout: (layout: HomeLayout) => void;
}

export function EditorStaleComponentBanner({
  draftLayout,
  components,
  onReplaceDraftLayout,
}: EditorStaleComponentBannerProps) {
  const stale = findStaleComponentInstances(draftLayout.sections, components);
  if (stale.length === 0) return null;
  const first = stale[0]!;
  const name = components[first.componentId]?.name ?? "Component";

  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950">
      <p>
        Linked component <strong>{name}</strong> has a newer definition (v{first.liveVersion}
        ). {stale.length} instance{stale.length === 1 ? "" : "s"} still on v{first.pinnedVersion}.
      </p>
      <div className="flex shrink-0 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-amber-300 bg-white"
          onClick={() => {
            const next = bumpPinnedVersions(
              draftLayout.sections,
              first.componentId,
              first.liveVersion
            );
            onReplaceDraftLayout({ version: 1, sections: next });
            toast.success("Instances updated to latest component version");
          }}
        >
          Update instances
        </Button>
      </div>
    </div>
  );
}
