import { BookOpen, CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { dashboardCard, dashboardCardPad } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import {
  getPlatformStatus,
  type MarketingPlatformConfig,
  type MarketingPlatformLink,
} from "@/lib/marketing-integrations";

interface MarketingPlatformSidebarProps {
  platform: MarketingPlatformConfig;
  link: MarketingPlatformLink;
}

export function MarketingPlatformSidebar({ platform, link }: MarketingPlatformSidebarProps) {
  const status = getPlatformStatus(link);
  const stepChecks = [
    link.enabled,
    Boolean(link.pixelId),
    link.trackPageViews || link.trackPurchases,
    status === "live",
  ];

  return (
    <div className="space-y-4">
      <section className={dashboardCard}>
        <div className={`${dashboardCardPad} border-b border-border/70`}>
          <h3 className="text-sm font-semibold tracking-[-0.01em]">Setup checklist</h3>
        </div>
        <ol className={`${dashboardCardPad} space-y-4`}>
          {platform.setupSteps.map((step, index) => {
            const done = stepChecks[index];
            return (
              <li key={step.title} className="flex gap-3">
                <div className="mt-0.5 shrink-0">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className={cn("text-sm font-medium", done && "text-emerald-700 dark:text-emerald-400")}>
                    {index + 1}. {step.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={dashboardCard}>
        <div className={`${dashboardCardPad} border-b border-border/70 flex items-center gap-2`}>
          <BookOpen className="h-4 w-4 text-[#007AFF]" />
          <h3 className="text-sm font-semibold tracking-[-0.01em]">Resources</h3>
        </div>
        <ul className={`${dashboardCardPad} space-y-2`}>
          {platform.resources.map((resource) => (
            <li key={resource.url}>
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <span>{resource.label}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            </li>
          ))}
          <li>
            <a
              href={platform.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-[#007AFF] transition-colors hover:bg-[#007AFF]/5"
            >
              <span>Official setup guide</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </li>
        </ul>
      </section>

      <section className={cn(dashboardCard, dashboardCardPad)}>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Tip</p>
        <p className="mt-1 text-sm text-muted-foreground">
          After saving, open your storefront in a private window and complete a test order. Then check{" "}
          {platform.name}&apos;s events dashboard for live hits within a few minutes.
        </p>
      </section>
    </div>
  );
}
