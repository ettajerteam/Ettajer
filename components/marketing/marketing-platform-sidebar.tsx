import { BookOpen, CheckCircle2, Circle, ExternalLink } from "lucide-react";
import {
  dashboardCard,
  dashboardKicker,
  dashboardStack,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import {
  countEnabledTrackingEvents,
  getPlatformStatus,
  type MarketingPlatformConfig,
  type MarketingPlatformLink,
} from "@/lib/marketing-integrations";

interface MarketingPlatformSidebarProps {
  platform: MarketingPlatformConfig;
  link: MarketingPlatformLink;
}

export function MarketingPlatformSidebar({
  platform,
  link,
}: MarketingPlatformSidebarProps) {
  const status = getPlatformStatus(link);
  const eventsOn = countEnabledTrackingEvents(link);
  const stepChecks =
    platform.id === "meta"
      ? [
          Boolean(link.pixelId),
          Boolean(link.accessToken) && eventsOn > 0,
          Boolean(link.catalogId),
          status === "live",
        ]
      : [
          link.enabled,
          Boolean(link.pixelId),
          link.trackPageViews || link.trackPurchases,
          status === "live",
        ];

  return (
    <div className={dashboardStack}>
      <section className={cn(dashboardCard, "overflow-hidden")}>
        <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
          <h3 className={dashboardTitle}>Setup checklist</h3>
        </div>
        <ol className="space-y-3 p-4">
          {platform.setupSteps.map((step, index) => {
            const done = stepChecks[index];
            return (
              <li key={step.title} className="flex gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-neutral-300" />
                  )}
                </div>
                <div>
                  <p
                    className={cn(
                      "text-[12px] font-medium",
                      done
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-neutral-900 dark:text-white"
                    )}
                  >
                    {index + 1}. {step.title}
                  </p>
                  <p className={cn(dashboardSubtitle, "mt-0.5 leading-relaxed")}>
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={cn(dashboardCard, "overflow-hidden")}>
        <div className="flex items-center gap-1.5 border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
          <BookOpen className="h-3.5 w-3.5 text-neutral-400" />
          <h3 className={dashboardTitle}>Resources</h3>
        </div>
        <ul className="p-2">
          {platform.resources.map((resource) => (
            <li key={resource.url}>
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-md px-2 py-2 text-[12px] text-neutral-700 transition-colors hover:bg-[#F5F5F7] dark:text-neutral-300 dark:hover:bg-white/[0.04]"
              >
                <span>{resource.label}</span>
                <ExternalLink className="h-3 w-3 text-neutral-300" />
              </a>
            </li>
          ))}
          <li>
            <a
              href={platform.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-md px-2 py-2 text-[12px] font-medium text-[#007AFF] transition-colors hover:bg-[#007AFF]/[0.06]"
            >
              <span>Official setup guide</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </li>
        </ul>
      </section>

      <section className={cn(dashboardCard, "p-4")}>
        <p className={dashboardKicker}>Tip</p>
        <p className={cn(dashboardSubtitle, "mt-1 leading-relaxed")}>
          {platform.id === "meta" ? (
            <>
              After saving, open Events Manager → Test events (or live). For Dynamic Ads,
              schedule the Catalog feed URL so product IDs match Pixel{" "}
              <span className="font-mono">content_ids</span>.
            </>
          ) : (
            <>
              After saving, open your storefront in a private window and complete a test order.
              Then check {platform.name}&apos;s events dashboard for live hits within a few
              minutes.
            </>
          )}
        </p>
      </section>
    </div>
  );
}
