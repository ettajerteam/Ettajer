"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { OnlineStorePageShell } from "@/components/online-store/online-store-page-shell";
import { ThemesWebsiteGallery } from "@/components/themes/themes-website-gallery";
import { Button } from "@/components/ui/button";
import type { WebsiteTemplate, WebsiteTemplateId } from "@/lib/website-templates/types";
import { dashboardStack, dashboardSubtitle, dashboardTitle } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface ThemesLibraryClientProps {
  activeTemplateId: WebsiteTemplateId | null;
}

export function ThemesLibraryClient({ activeTemplateId }: ThemesLibraryClientProps) {
  const router = useRouter();
  const [active, setActive] = useState(activeTemplateId);
  const [applyingId, setApplyingId] = useState<WebsiteTemplateId | null>(null);

  const handleApply = async (template: WebsiteTemplate) => {
    setApplyingId(template.id);
    try {
      const res = await fetch("/api/store/website-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to apply template");
      }
      setActive(template.id);
      toast.success(`${template.name} is live on your store`);
      router.refresh();
      router.push("/dashboard/themes");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply template");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <OnlineStorePageShell>
      <div className={dashboardStack}>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            className="h-7 rounded-md px-2 text-[11px] text-neutral-500"
            asChild
          >
            <Link href="/dashboard/themes">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Themes
            </Link>
          </Button>
        </div>

        <div>
          <h2 className={dashboardTitle}>Theme library</h2>
          <p className={cn(dashboardSubtitle, "mt-0.5")}>
            Apply a layout — goes live immediately. Customize anytime in the editor.
          </p>
        </div>

        <ThemesWebsiteGallery
          activeTemplateId={active}
          applyingId={applyingId}
          onApply={handleApply}
        />
      </div>
    </OnlineStorePageShell>
  );
}
