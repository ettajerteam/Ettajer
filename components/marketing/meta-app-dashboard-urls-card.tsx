"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardSubtitle } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

type MetaUrlRow = {
  label: string;
  value: string;
  hint: string;
};

interface MetaAppDashboardUrlsCardProps {
  className?: string;
}

/** Copyable OAuth + data-deletion URLs for Meta App Dashboard. */
export function MetaAppDashboardUrlsCard({
  className,
}: MetaAppDashboardUrlsCardProps) {
  const [rows, setRows] = useState<MetaUrlRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/marketing/meta/oauth/status");
        const data = await res.json();
        if (!res.ok || cancelled) return;
        const urls = data.urls as {
          oauthRedirectUri?: string;
          productionOauthRedirectUri?: string;
          localOauthRedirectUri?: string;
          dataDeletionCallbackUrl?: string;
          dataDeletionInstructionsUrl?: string;
          usesProductionCallback?: boolean;
        };
        if (!urls) return;
        const next: MetaUrlRow[] = [
          {
            label: "OAuth redirect URI (this environment)",
            value: urls.oauthRedirectUri ?? "",
            hint: "Valid OAuth Redirect URIs in Facebook Login for Business",
          },
          {
            label: "Production OAuth redirect URI",
            value: urls.productionOauthRedirectUri ?? "",
            hint: "Required on the live Meta app for www.ettajer.com",
          },
          {
            label: "Local OAuth redirect URI",
            value: urls.localOauthRedirectUri ?? "",
            hint: "Add alongside production when developing on localhost",
          },
          {
            label: "Data deletion callback",
            value: urls.dataDeletionCallbackUrl ?? "",
            hint: "App Dashboard → App settings → Data deletion request URL",
          },
          {
            label: "Data deletion instructions",
            value: urls.dataDeletionInstructionsUrl ?? "",
            hint: "User-facing status page URL (optional but recommended)",
          },
        ].filter((row) => row.value);
        if (!cancelled) setRows(next);
      } catch {
        if (!cancelled) setRows(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy");
    }
  }

  if (!rows?.length) return null;

  return (
    <div
      className={cn(
        "rounded-[10px] border border-dashed border-black/[0.08] px-3 py-3 dark:border-white/10",
        className
      )}
    >
      <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
        Meta App Dashboard URLs
      </p>
      <p className={cn(dashboardSubtitle, "mt-0.5")}>
        Paste these into your Meta app settings so Connect with Meta and data
        deletion work in production.
      </p>
      <div className="mt-3 space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="space-y-1">
            <p className="text-[11px] font-medium text-neutral-500">{row.label}</p>
            <div className="flex gap-1.5">
              <Input
                readOnly
                value={row.value}
                className="h-8 rounded-md border-black/[0.06] bg-[#F5F5F7] font-mono text-[10px] dark:border-white/10 dark:bg-white/[0.05]"
                onFocus={(e) => e.target.select()}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-md border-black/[0.06] dark:border-white/10"
                onClick={() => void copy(row.value, row.label)}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-[10px] text-neutral-400">{row.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
